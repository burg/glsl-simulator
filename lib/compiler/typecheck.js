var GLSL = {};

// Check semantic properties local to a vertex or fragment shader.

GLSL.Typechecker = function(shader) {
    // TODO: implement
};

GLSL.Typechecker.prototype = {
    constructor: GLSL.Typechecker,

    // Public:

    typecheck: function()
    {
        return true;
    }

}

module.exports = GLSL.Typechecker;
