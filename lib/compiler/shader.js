var parser = require("./parser");
var ASTVisitor = require("./visitor");
var ASTNode = require("./ast");

var Shader = function(text, type)
{
    this.sourceText = text;
    this.ast = parser.parse(text);
    this.type = type;

    console.assert(type === Shader.Type.Vertex || type === Shader.Type.Fragment);

    this._uniforms = [];
    this._attributes = [];
    this._errors = [];

    this._extractVariables();
    console.log(this);
};

Shader.Type = {
    Vertex: "shader-type-vertex",
    Fragment: "shader-type-fragment"
};

Shader.prototype = {
    constructor: Shader,

    // Public

    uniforms: function() {
        return this._uniforms.slice();
    },

    attributes: function() {
        return this._attributes.slice();
    },

    // Private

    _extractVariables: function()
    {
        var extractor = new VariableExtractor();
        extractor.extract(this);

        if (extractor.errors.length) {
            this.errors = this.errors.concat(extractor.errors);
            for (var i = 0; i < this.errors.length; ++i)
                console.error(this.errors[i]);

            return;
        }

        this._uniforms = this._uniforms.concat(extractor.uniforms);
        this._attributes = this._attributes.concat(extractor.attributes);
    }
};

VariableExtractor = function() {
    ASTVisitor.call(this, VariableExtractor.Functions);

    this.uniforms = [];
    this.attributes = [];
    this.errors = [];
};

VariableExtractor.prototype = {
    __proto__: ASTVisitor.prototype,
    constructor: VariableExtractor,

    extract: function(shader)
    {
        this.shader = shader;
        this.visitNode(shader.ast);
        this.shader = null;
    },

    defaultVisitor: function(node)
    {
        // Do nothing.
    }
};

VariableExtractor.Functions = {};

VariableExtractor.Functions[ASTNode.Types.Program] = function(node)
{
    this.visitList(node.statements);
}

VariableExtractor.Functions[ASTNode.Types.DeclaratorItem] = function(node)
{
    return this.visitNode(node.name);
}

VariableExtractor.Functions[ASTNode.Types.Identifier] = function(node)
{
    return node.name;
}

VariableExtractor.Functions[ASTNode.Types.Declarator] = function(node)
{
    var typeAttribute = node.typeAttribute;
    var itemNames = this.visitList(node.declarators);

    if (this.shader.type === Shader.Type.Vertex && typeAttribute.qualifier === "varying") {
        this.errors.push({node: node, message: "'varying' attribute not allowed in vertex shader."});
        return;
    }
    var list = (typeAttribute.qualifier === "varying") ? this.attributes : this.uniforms;
    for (var i = 0; i < itemNames.length; ++i) {
        list.push({
            type: typeAttribute.name,
            name: itemNames[i],
        })
    }
}

module.exports = Shader;
