GLSL = {};
GLSL.Object = require("../events").Object;

GLSL.Environment = function() {
    GLSL.Object.call(this);

    this._data = {};
    this._debugHooks = [];

    this._editScopeLevel = 0;
    this._runScopeLevel = 0;
};

GLSL.Environment.Event = {
    InputChanged: "environment-input-changed",
    ResultChanged: "environment-result-changed",
};

GLSL.Environment.prototype = {
    constructor: GLSL.Environment,
    __proto__: GLSL.Object.prototype,

    // Public

    get: function(name)
    {
        return this._data[name];
    },

    set: function(name, value)
    {
        console.assert(this._editScopeLevel || this._runScopeLevel, this);
        if (!this._editScopeLevel && !this._runScopeLevel)
            throw new Error("Tried to set variable " + name + " while not in a edit or run scope!");

        this._data[name] = value;
    },

    reset: function()
    {
        this._data = {};
    },

    // This is a mechanism used to delimit the scope of variable editing.
    // In the future, it could be used to keep track of historical changes.
    enterEditScope: function()
    {
        console.assert(!this._editScopeLevel, this._editScopeLevel);

        ++this._editScopeLevel;
    },

    exitEditScope: function()
    {
        console.assert(!this._runScopeLevel, this._runScopeLevel);
        console.assert(this._editScopeLevel > 0, this._editScopeLevel);

        --this._editScopeLevel;
        this.dispatchEventToListeners(GLSL.Environment.Event.InputChanged);
    },

    // This is a mechanism used to delimit the scope of a shader execution.
    // In the future, it could be used to keep track of historical changes.
    enterRunScope: function()
    {
        console.assert(!this._editScopeLevel, this._editScopeLevel);

        ++this._runScopeLevel;
    },

    exitRunScope: function()
    {
        console.assert(!this._editScopeLevel, this._editScopeLevel);
        console.assert(this._runScopeLevel > 0, this._runScopeLevel);

        --this._runScopeLevel;
        this.dispatchEventToListeners(GLSL.Environment.Event.ResultChanged);
    },

    get debugHooks()
    {
        return this._debugHooks.slice();
    },

    clearDebugHooks: function()
    {
        this._debugHooks = [];
    },

    addDebugHook: function(shaderType, position, hookId, expression)
    {
        // TODO: implement this once the basic generator exists.

        // Each hook consists of a program point and an expression to be evaluated
        // at that point for its result. These results will be saved as program
        // outputs with a name that is correlated back to the specific hook.

        // This will be implemented in the generated code in a manner that's
        // conceptually similar to JS breakpoints. After each statement, see if
        // any hooks apply to the current line and evaluate if necessary. Unlike JS
        // breakpoints, simulator execution does not pause and resume; instead
        // the client will rerun the shader every time different info is needed.

        // A stepping debugger could be implemented by a client as follows:
        // - for the current debugger step, add a hook for each live variable at that program point.
        // - show the UI as "paused" at that location, getting runtime data from hook outputs.

        // We don't plan to support it now, but "edit and continue" could be implemented as
        // a new hook type that reapplies user modifications to the simulator state.
    },

    validateForShader: function(shader)
    {
        // TODO: check for required shader inputs.
        return true;
    },

    setDefaultValuesForShader: function(shader, suggestedVariableValueCallback)
    {
        function setDefaultValue(env, variable) {
            var value = null;
            if (suggestedVariableValueCallback instanceof Function)
                value = suggestedVariableValueCallback(variable);

            if (!value) {
                switch (variable.type) {
                case "float": value = 1.0; break;
                case "bool": value = true; break;
                case "vec2": value = GLSL.Runtime.Vec2(1, 1); break;
                case "vec3": value = GLSL.Runtime.Vec3(1, 1, 1); break;
                case "vec4": value = GLSL.Runtime.Vec4(1, 1, 1, 1); break;
                case "mat2": value = GLSL.Runtime.Mat2(1, 1,
                                                       1 ,1); break;
                case "mat3": value = GLSL.Runtime.Mat3(1, 1, 1,
                                                       1, 1, 1,
                                                       1, 1, 1); break;
                case "mat4": value = GLSL.Runtime.Mat4(1, 1, 1, 1,
                                                       1, 1, 1, 1,
                                                       1, 1, 1, 1,
                                                       1, 1, 1, 1); break;
                }
            }
            env.set(variable.name, value);
        }

        if (!shader)
            return;

        console.assert(shader instanceof GLSL.Shader, shader);

        this.enterEditScope();

        shader.uniforms.map(setDefaultValue.bind(null, env));
        shader.attributes.map(setDefaultValue.bind(null, env));
        if (shader.type === GLSL.Shader.Type.Fragment)
            shader.varyings.map(setDefaultValue.bind(null, env));

        this.exitEditScope();
    }
};

module.exports = GLSL.Environment;
