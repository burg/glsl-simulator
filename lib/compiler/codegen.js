// Check semantic properties local to a vertex or fragment shader.

CodeGenerator = function(shader) {
    this._shader = shader;
};

CodeGenerator.prototype = {
    constructor: CodeGenerator,

    translateShader: function() {
        return function() { console.log("STUB: evaluated shader", this.shader) }.bind(this);
    }
}

module.exports = CodeGenerator;
