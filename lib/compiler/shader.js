var GLSL = {};
GLSL.Error         = require("../error");
GLSL.Object        = require("../events").Object;
GLSL.ASTNode       = require("./ast");
GLSL.ASTVisitor    = require("./visitor");
GLSL.Parser        = require("./parser");
GLSL.Typechecker   = require("./typecheck");
GLSL.CodeGenerator = require("./codegen");

GLSL.Shader = function(text, type)
{
    GLSL.Object.call(this);

    this.sourceText = text;
    try {
        this.ast = GLSL.Parser.parse(text);
    } catch (e) {
        if (type === GLSL.Shader.Type.Vertex)
            e.type = GLSL.Error.Type.VertexShaderParsing;
        if (type === GLSL.Shader.Type.Fragment)
            e.type = GLSL.Error.Type.FragmentShaderParsing;

        throw e;
    }

    this.type = type;

    this._typecheckResult = null;
    this._executable = null;

    this._shouldEmitDebuggerStatement = false;

    console.assert(type === GLSL.Shader.Type.Vertex || type === GLSL.Shader.Type.Fragment);

    this._uniforms = [];
    this._varyings = [];
    this._attributes = [];

    this._errors = [];

    this._extractVariables();
};

GLSL.Object.addConstructorFunctions(GLSL.Shader);

GLSL.Shader.Event = {
    ExecutableChanged: "shader-executable-changed"
};

GLSL.Shader.Type = {
    Vertex: "shader-type-vertex",
    Fragment: "shader-type-fragment"
};

GLSL.Shader.prototype = {
    constructor: GLSL.Shader,
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
            this._executable = new GLSL.CodeGenerator(this).translateShader();

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

        this._typecheckResult = new GLSL.Typechecker(this).typecheck();
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
        this.dispatchEventToListeners(GLSL.Shader.Event.ExecutableChanged);
    }
};

VariableExtractor = function() {
    GLSL.ASTVisitor.call(this, VariableExtractor.Functions);

    this.uniforms = [];
    this.attributes = [];
    this.varyings = [];
    this.errors = [];
};

VariableExtractor.prototype = {
    __proto__: GLSL.ASTVisitor.prototype,
    constructor: VariableExtractor,

    extract: function(shader)
    {
        this.shader = shader;
        this.visitNode(shader.ast);

        // GLSL ES 1.0, Section 7.1
        if (this.shader.type === GLSL.Shader.Type.Vertex) {
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
        if (this.shader.type === GLSL.Shader.Type.Fragment) {
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

VariableExtractor.Functions[GLSL.ASTNode.Types.Program] = function(node)
{
    this.visitList(node.statements);
}

VariableExtractor.Functions[GLSL.ASTNode.Types.DeclaratorItem] = function(node)
{
    return this.visitNode(node.name);
}

VariableExtractor.Functions[GLSL.ASTNode.Types.Identifier] = function(node)
{
    return node.name;
}

VariableExtractor.Functions[GLSL.ASTNode.Types.Declarator] = function(node)
{
    var typeAttribute = node.typeAttribute;
    var itemNames = this.visitList(node.declarators);

    if (this.shader.type === GLSL.Shader.Type.Fragment && typeAttribute.qualifier === "attribute") {
        this.errors.push({node: node, message: "'attribute' variable not allowed in fragment shader."});
        return;
    }
    var list = null;
    if (typeAttribute.qualifier === "varying") list = this.varyings;
    if (typeAttribute.qualifier === "uniform") list = this.uniforms;
    if (typeAttribute.qualifier === "attribute") list = this.attributes;

    var isInputVariable = true;
    if (this.shader.type === GLSL.Shader.Type.Vertex && typeAttribute.qualifier === "varying")
        isInputVariable = false;
    if (this.shader.type === GLSL.Shader.Type.Fragment && typeAttribute.name == "gl_FragColor")
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

module.exports = GLSL.Shader;
