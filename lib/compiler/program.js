// This is the GLSL reference passed to translated shader programs.
// It should only require access to the Runtime library.
var GLSL_RT = {};
GLSL_RT.Runtime = require("../runtime");

// Used by the API
var GLSL = {};
GLSL.Shader = require("./shader");
GLSL.Environment = require("../runtime/environment");
GLSL.Object = require("../events").Object;


var Program = function() {
    GLSL.Object.call(this);

    this.vertexShader = null;
    this.fragmentShader = null;

    this._linkerResult = null;
    this._programCode = null;
}

Program.Event = {
    ShaderChanged: "program-shader-changed",
    Error: "program-error"
};

Program.prototype = {
    constructor: Program,
    __proto__: GLSL.Object.prototype,

    // Public

    shaderWithType: function(type)
    {
        if (type === GLSL.Shader.Type.Vertex)
            return this.vertexShader;

        if (type === GLSL.Shader.Type.Fragment)
            return this.fragmentShader;

        console.assert("Unknown shader type requested: ", type);
    },

    // This will replace the existing vertex or fragment shader with a new shader.
    updateShaderWithType: function(shaderType, text)
    {
        try {
            var oldShader = this.shaderWithType(shaderType);
            var shader = new GLSL.Shader(text, shaderType);
        } catch (e) {
            this.dispatchEventToListeners(Program.Event.Error, {type: e.type, message: e.message});
        }
        if (shaderType === GLSL.Shader.Type.Fragment)
            this.fragmentShader = shader;
        else if (shaderType === GLSL.Shader.Type.Vertex)
            this.vertexShader = shader;

        this._linkerResult = false;
        this._programCode = null;

        this.dispatchEventToListeners(Program.Event.ShaderChanged, {oldShader: oldShader, newShader: shader});
    },

    runWithEnvironment: function(env)
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
            this._linkShaders();

        if (!this._linkerResult)
            throw new Error("Couldn't run shader program: linking failed.");

        if (!this._validateEnvironment(env))
            throw new Error("Couldn't run shader program: environment validation failed.");

        // TODO: these should be glued together with a "program" executable, which
        // handles rasterization etc.
        // TODO: Maybe we want a different entry point to run only one shader, or provide a dummy.

        var vertexExecutable = this.vertexShader.executable;
        vertexExecutable.call(null, GLSL, env);

        var fragmentExecutable = this.fragmentShader.executable;
        fragmentExecutable.call(null, GLSL, env);
    },

    // Private

    _validateEnvironment: function(env)
    {
        console.assert(env instanceof Environment, env);
        // TODO: check environment for necessary shader inputs

        return true;
    },

    _linkShaders: function()
    {
        // TODO: check that inputs and outputs match between vertex and fragment shader

        return true;
    }
};

module.exports = Program;
