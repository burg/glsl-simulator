// Check semantic properties local to a vertex or fragment shader.

CodeGenerator = function(shader) {
    this._shader = shader;
};

CodeGenerator.prototype = {
    constructor: CodeGenerator,

    translateShader: function() {
        return function(GLSL, env) { env["gl_FragColor"] = env["color"] || GLSL.Vec4(0, 0, 0, 1); };
    }
}

module.exports = CodeGenerator;
