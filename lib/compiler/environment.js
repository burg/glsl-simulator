Environment = function() {
    this.data = {};
    this._debugHooks = [];
};

Environment.prototype = {
    constructor: Environment,

    // TODO: flesh out Environment class, which contains client-specified shader inputs
    // such uniforms, attribute arrays, textures, etc.

    // Public

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

};

module.exports = Environment;
