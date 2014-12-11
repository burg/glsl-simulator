// This is the GLSL reference passed to translated shader programs.
// It should only require access to the Runtime library.
var GLSL_RT = {};
GLSL_RT.Runtime  = require("../runtime");

var GLSL = {}; // Internal GLSL handle.
GLSL.Shader      = require("./shader");
GLSL.Typechecker = require("./typecheck");
GLSL.Error       = require("../error");
GLSL.Object      = require("../events").Object;
GLSL.Builtins    = require("../runtime/builtins");
GLSL.Environment = require("../runtime/environment");


GLSL.Program = function() {
    GLSL.Object.call(this);

    this.vertexShader = null;
    this.fragmentShader = null;

    this._linkerResult = null;
    this._programCode = null;
}

GLSL.Program.Event = {
    ShaderChanged: "program-shader-changed",
    Error: "program-error"
};

GLSL.Program.prototype = {
    constructor: GLSL.Program,
    __proto__: GLSL.Object.prototype,

    // Public

    shaderWithType: function(type)
    {
        if (type === GLSL.Shader.Type.Vertex)
            return this.vertexShader;

        if (type === GLSL.Shader.Type.Fragment)
            return this.fragmentShader;

        console.error("Unknown shader type requested: ", type);
    },

    // This will replace the existing vertex or fragment shader with a new shader.
    updateShaderWithType: function(shaderType, text)
    {
        this._linkerResult = false;
        this._programCode = null;

        try {
            var oldShader = this.shaderWithType(shaderType);
            var newShader = new GLSL.Shader(text, shaderType);
        } catch (e) {
            var errorType = null;
            if (shaderType === GLSL.Shader.Type.Vertex)
                errorType = GLSL.Error.Type.VertexShaderParsing;
            if (shaderType === GLSL.Shader.Type.Fragment)
                errorType = GLSL.Error.Type.FragmentShaderParsing;

            this.dispatchEventToListeners(GLSL.Program.Event.Error, {type: errorType, message: e.message});
            return;
        }
        if (shaderType === GLSL.Shader.Type.Fragment)
            this.fragmentShader = newShader;
        else if (shaderType === GLSL.Shader.Type.Vertex)
            this.vertexShader = newShader;

        this.dispatchEventToListeners(GLSL.Program.Event.ShaderChanged, {oldShader: oldShader, newShader: newShader});
    },

    // Run the combined shader program (vertex shader + rasterization + fragment shader).
    renderToBuffer: function(env, buffer)
    {
        if (!this.vertexShader)
            throw new Error("Couldn't run shader program: no vertex shader specified.");

        if (!this.vertexShader.typecheck())
            throw new Error("Couldn't run shader program: typechecking failed for vertex shader program.");

        if (!this.fragmentShader)
            throw new Error("Couldn't run shader program: no fragment shader specified.");

        if (!this.fragmentShader.typecheck())
            throw new Error("Couldn't run shader program: typechecking failed for fragment shader program.");

        if (!this._linkerResult)
            this._linkerResult = this._linkShaders();

        if (!this._linkerResult)
            throw new Error("Couldn't run shader program: linking failed.");

        if (!env.validateForShader(this.vertexShader))
            throw new Error("Couldn't run shader program: vertex shader environment validation failed.");

        if (!env.validateForShader(this.fragmentShader))
            throw new Error("Couldn't run shader program: vertex shader environment validation failed.");

        // TODO: these should be glued together with a "program" executable, which
        // handles rasterization etc.
        // TODO: Maybe we want a different entry point to run only one shader, or provide a dummy.

        try {
            env.enterRunScope();
            for (var y = 0; y < buffer.height; ++y) {
                env.get('gl_FragCoord').set('y', y);
                for (var x = 0; x < buffer.width; ++x) {
                    env.get('gl_FragCoord').set('x', x);
                    this.fragmentShader.executable.code.call(null, GLSL_RT, env);
                    var color = env.get('gl_FragColor');
                    color = GLSL.Builtins.clamp(color, 0.0, 1.0);
                    buffer.data[(buffer.width * y + x) * 4 + 0] = color.d[0] * 255.0;
                    buffer.data[(buffer.width * y + x) * 4 + 1] = color.d[1] * 255.0;
                    buffer.data[(buffer.width * y + x) * 4 + 2] = color.d[2] * 255.0;
                    buffer.data[(buffer.width * y + x) * 4 + 3] = color.d[3] * 255.0;
                }
            }
            env.exitRunScope();
        } catch (e) {
            env.exitRunScope();
        }
    },

    runShaderWithType: function(shaderType, env)
    {
        var shader = this.shaderWithType(shaderType);
        if (!shader)
            return;

        this._runSingleShader(shader, env);
    },

    // Run both vertex and fragment shaders in isolation, if they exist.
    // Do not connect them with interpolated varying variables.
    runShaders: function(env)
    {
        if (!this.vertexShader && !this.fragmentShader)
            return;

        // TODO: this doesn't actually enforce isolation, it just makes it more likely.
        // We assume that fragment shader will try to read the output of the vertex shader.
        if (this.fragmentShader)
            this._runSingleShader(this.fragmentShader, env);

        if (this.vertexShader)
            this._runSingleShader(this.vertexShader, env);
    },

    // Private

    _runSingleShader: function(shader, env)
    {
        console.assert(shader instanceof GLSL.Shader, shader);
        console.assert(env instanceof GLSL.Environment, env);

        if (!shader)
            throw new Error("Couldn't run single shader: the shader was empty.");

        if (!shader.typecheck())
            throw new Error("Couldn't run single shader: typechecking failed.");

        if (!env.validateForShader(shader))
            throw new Error("Couldn't run single shader: environment validation failed.");

        if (shader.executable.error) {
            var errorType = (shader.type === GLSL.Shader.Type.Vertex) ? GLSL.Error.Type.VertexShaderTranslation : GLSL.Error.Type.FragmentShaderTranslation;
            var data = {type: errorType, message: shader.executable.error};
            this.dispatchEventToListeners(GLSL.Program.Event.Error, data);
            return;
        }

        env.enterRunScope();

        try {
            shader.executable.code.call(null, GLSL_RT, env);
        } catch (e) {
            var errorType = (shader.type === GLSL.Shader.Type.Vertex) ? GLSL.Error.Type.VertexShaderExecution : GLSL.Error.Type.FragmentShaderExecution;
            env.exitRunScope();
            this.dispatchEventToListeners(GLSL.Program.Event.Error, {type: errorType, message: e.message});
            return;
        }

        env.exitRunScope();
    },

    _linkShaders: function()
    {
        // TODO: check that inputs and outputs match between vertex and fragment shader

        return true;
    }
};

module.exports = GLSL.Program;
