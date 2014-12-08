var GLSL = {};
GLSL.Error = require("../error");
GLSL.Object = require("../events").Object;

var Parser = require("./parser");
var ASTVisitor = require("./visitor");
var ASTNode = require("./ast");
var Typechecker = require("./typecheck");
var CodeGenerator = require("./codegen");

var Shader = function(text, type)
{
    GLSL.Object.call(this);

    this.sourceText = text;
    try {
        this.ast = Parser.parse(text);
    } catch (e) {
        if (type === Shader.Type.Vertex)
            e.type = GLSL.Error.Type.VertexShaderParsing;
        if (type === Shader.Type.Fragment)
            e.type = GLSL.Error.Type.FragmentShaderParsing;
    }

    this.type = type;

    this._typecheckResult = null;
    this._executable = null;

    this._shouldEmitDebuggerStatement = false;

    console.assert(type === Shader.Type.Vertex || type === Shader.Type.Fragment);

    this._uniforms = [];
    this._varyings = [];
    this._attributes = [];

    this._errors = [];

    this._extractVariables();
};

Shader.Event = {
    ExecutableChanged: "shader-executable-changed"
};

Shader.Type = {
    Vertex: "shader-type-vertex",
    Fragment: "shader-type-fragment"
};

Shader.prototype = {
    constructor: Shader,
    __proto__: GLSL.Object.prototype,

    // Public

    get uniforms() {
        return this._uniforms.slice();
    },

    get attributes() {
        return this._attributes.slice();
    },

    get varyings() {
        return this._varyings.slice();
    },

    get executable() {
        if (!this._executable)
            this._executable = new CodeGenerator(this).translateShader();

        return this._executable;
    },

    get shouldEmitDebuggerStatement()
    {
        return this._shouldEmitDebuggerStatement;
    },

    set shouldEmitDebuggerStatement(value)
    {
        if (this._shouldEmitDebuggerStatement === value)
            return;

        this._shouldEmitDebuggerStatement = value;
        this._clearExecutable();
    },

    typecheck: function()
    {
        if (this._typecheckResult !== null)
            return this._typecheckResult;

        this._typecheckResult = new Typechecker(this).typecheck();
        return this._typecheckResult;
    },

    // Private

    _extractVariables: function()
    {
        var extractor = new VariableExtractor();
        extractor.extract(this);

        if (extractor.errors.length) {
            this._errors = this._errors.concat(extractor.errors);
            for (var i = 0; i < this._errors.length; ++i)
                console.error("Error extracting variables: " + JSON.stringify(this._errors[i]));

            throw new Error(this._errors[0].message);
        }

        this._uniforms = this._uniforms.concat(extractor.uniforms);
        this._attributes = this._attributes.concat(extractor.attributes);
        this._varyings = this._varyings.concat(extractor.varyings);
    },

    _clearExecutable: function()
    {
        this._executable = null;
        this.dispatchEventToListeners(Shader.Event.ExecutableChanged);
    }
};

VariableExtractor = function() {
    ASTVisitor.call(this, VariableExtractor.Functions);

    this.uniforms = [];
    this.attributes = [];
    this.varyings = [];
    this.errors = [];
};

VariableExtractor.prototype = {
    __proto__: ASTVisitor.prototype,
    constructor: VariableExtractor,

    extract: function(shader)
    {
        this.shader = shader;
        this.visitNode(shader.ast);

        // GLSL ES 1.0, Section 7.1
        if (this.shader.type === Shader.Type.Vertex) {
            this.varyings.push({
                name: "gl_Position",
                type: "vec4",
                qualifier: "varying",
                usage: "out",
                builtin: true
            });

            this.varyings.push({
                name: "gl_PointSize",
                type: "float",
                qualifier: "varying",
                usage: "out",
                builtin: true
            });
        }

        // GLSL ES 1.0, Section 7.2
        if (this.shader.type === Shader.Type.Fragment) {
            this.varyings.push({
                name: "gl_FragCoord",
                type: "vec4",
                qualifier: "varying",
                usage: "in",
                builtin: true,
            });

            this.varyings.push({
                name: "gl_FrontFacing",
                type: "bool",
                qualifier: "varying",
                usage: "in",
                builtin: true,
            });

            this.varyings.push({
                name: "gl_PointCoord",
                type: "vec2",
                qualifier: "varying",
                usage: "in",
                builtin: true,
            });

            this.varyings.push({
                name: "gl_FragColor",
                type: "vec4",
                qualifier: "varying",
                usage: "out",
                builtin: true,
            });

            this.varyings.push({
                name: "gl_FragData",
                type: "vec4[]",
                qualifier: "varying",
                usage: "out",
                builtin: true,
            });
        }

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

    if (this.shader.type === Shader.Type.Fragment && typeAttribute.qualifier === "attribute") {
        this.errors.push({node: node, message: "'attribute' variable not allowed in fragment shader."});
        return;
    }
    var list = null;
    if (typeAttribute.qualifier === "varying") list = this.varyings;
    if (typeAttribute.qualifier === "uniform") list = this.uniforms;
    if (typeAttribute.qualifier === "attribute") list = this.attributes;

    var isInputVariable = true;
    if (this.shader.type === Shader.Type.Vertex && typeAttribute.qualifier === "varying")
        isInputVariable = false;
    if (this.shader.type === Shader.Type.Fragment && typeAttribute.name == "gl_FragColor")
        isInputVariable = false;

    for (var i = 0; i < itemNames.length; ++i) {
        list.push({
            type: typeAttribute.name,
            name: itemNames[i],
            qualifier: typeAttribute.qualifier,
            usage: isInputVariable ? "in" : "out"
        })
    }
}

module.exports = Shader;
