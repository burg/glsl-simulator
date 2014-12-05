var ASTVisitor = require("./visitor");

var CodeGenerator = function(shader)
{
    ASTVisitor.call(this);
    this._shader = shader;
    this._currentIndent = "";

    this._withinFunctionScope = null;
};

CodeGenerator.prototype = {
    constructor: CodeGenerator,
    __proto__: ASTVisitor.prototype,

    translateShader: function() {
        this._lines = [""]; // Induce an initial newline.
        this.visitNode(this._shader.ast);

        var executable = {};
        try {
            executable.code = new Function("GLSL", "env", this._lines.join("\n"));
        } catch (e) {
            executable.source = "function(GLSL, env) {\n" + this._lines.join("\n") + "}";
            executable.error = e.message;
        }

        return executable;
    },

    // Overrides for ASTVisitor

    visitorForType: function(type)
    {
        if (type in CodeGenerator.Callbacks)
            return CodeGenerator.Callbacks[type];

        return ASTVisitor.prototype.visitorForType.call(this, type);
    },

    // Private

    _varName: function(name)
    {
        return "$" + name;
    },

    _addLine: function(line)
    {
        this._lines.push([this._currentIndent, line].join(""));
    },

    _increaseIndent: function()
    {
        var oldIndent = this._currentIndent;
        this._currentIndent = [this._currentIndent, CodeGenerator.IndentString].join("");
        return oldIndent;
    },
};

CodeGenerator.IndentString = "    ";

CodeGenerator.Callbacks = {};

CodeGenerator.Callbacks[ASTNode.Types.Program] = function(node)
{
    // {statements: [Node.$statement]*}
    this.visitList(node.statements);
}

CodeGenerator.Callbacks[ASTNode.Types.Preprocessor] = function(node)
{
    // {directive: string, identifier: string?, parameters: [string]?, value: string?, guarded_statements: [Node.$statement]*}
}

CodeGenerator.Callbacks[ASTNode.Types.MacroCall] = function(node)
{
    // {macro_name: string, parameters: [string]+}
}

CodeGenerator.Callbacks[ASTNode.Types.FunctionCall] = function(node)
{
    // {function_name: string, parameters: [Node.$expression]*}
}

CodeGenerator.Callbacks[ASTNode.Types.FunctionPrototype] = function(node)
{
    // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*}
}

CodeGenerator.Callbacks[ASTNode.Types.FunctionDeclaration] = function(node)
{
    // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*, body: Node.Scope}

    var parameters = this.visitList(node.parameters);
    var paramNames = parameters.map(function(p) { return p.name; });

    // TODO: emit code that asserts argument types for debugging purposes.
    // This is unnecessary if the shader is statically typechecked (and there are no bugs in the checker).

    this._withinFunctionScope = node;
    this._addLine("var " + this._varName(node.name) + " = function(" + paramNames.join() + ") {");
    this.visitNode(node.body);
    this._addLine("};")
    delete this._withinFunctionScope;
}

CodeGenerator.Callbacks[ASTNode.Types.Scope] = function(node)
{
    // {statements: [Node.$statement]*}
}

CodeGenerator.Callbacks[ASTNode.Types.IfStatement] = function(node)
{
    // {condition: Node.$expression, body: Node.Scope, elseBody: Node.Scope?}
}

CodeGenerator.Callbacks[ASTNode.Types.ForStatement] = function(node)
{
    // {initializer: Node.$initializer, condition: Node.$expression, increment: Node.$expression, body: Node.Scope}}
}

CodeGenerator.Callbacks[ASTNode.Types.WhileStatement] = function(node)
{
    // {condition: Node.$expression, body: Node.Scope}
}

CodeGenerator.Callbacks[ASTNode.Types.DoStatement] = function(node)
{
    // {condition: Node.$expression, body: Node.Scope}
}

CodeGenerator.Callbacks[ASTNode.Types.ReturnStatement] = function(node)
{
    // {value: Node.$expression}
}

CodeGenerator.Callbacks[ASTNode.Types.ContinueStatement] = function(node)
{
    // {}
}

CodeGenerator.Callbacks[ASTNode.Types.BreakStatement] = function(node)
{
    // {}
}

CodeGenerator.Callbacks[ASTNode.Types.DiscardStatement] = function(node)
{
    // {}
}

CodeGenerator.Callbacks[ASTNode.Types.ExpressionStatement] = function(node)
{
    // {expression: Node.$expression?}
}

CodeGenerator.Callbacks[ASTNode.Types.Declarator] = function(node)
{
    // {typeAttribute: Node.Type, declarators: [Node.DeclaratorItem]+}

    // TODO: register type information here to ensure assignments are type-compatible
    this.visitList(node.declarators);
}

CodeGenerator.Callbacks[ASTNode.Types.DeclaratorItem] = function(node)
{
    // {name: string, initializer: Node.$expression}
    var name = this._varName(node.name);
    if (node.initializer)
        this._addLine("var " + name + " = " + this.visitNode(node.initializer) + ";");
    else
        this._addLine("var " + name + ";");
}

CodeGenerator.Callbacks[ASTNode.Types.Invariant] = function(node)
{
    // {identifiers: [Node.Identifier]*}
}

CodeGenerator.Callbacks[ASTNode.Types.Precision] = function(node)
{
    // {precision: string, typeName: string}
}

CodeGenerator.Callbacks[ASTNode.Types.Parameter] = function(node)
{
    // {type_name: string, name: string, typeQualifier: string?, parameterQualifier: string?, precision: string?, arraySize: Node.$expression}
}

CodeGenerator.Callbacks[ASTNode.Types.StructDefinition] = function(node)
{
    // {qualifier: string?, name: string?, members: [Node.Declarator]+, declarators: [Node.Declarator]?}
}

CodeGenerator.Callbacks[ASTNode.Types.Type] = function(node)
{
    // {name: string, precision: string?, qualifier: string?}
}

CodeGenerator.Callbacks[ASTNode.Types.IntegerLiteral] = function(node)
{
    // {value: number}
}

CodeGenerator.Callbacks[ASTNode.Types.FloatLiteral] = function(node)
{
    // {value: number}
}

CodeGenerator.Callbacks[ASTNode.Types.BooleanLiteral] = function(node)
{
    // {value: boolean}
}

CodeGenerator.Callbacks[ASTNode.Types.Identifier] = function(node)
{
    // {name: string}
}

CodeGenerator.Callbacks[ASTNode.Types.Operator] = function(node)
{
    // {operator: string}
}

CodeGenerator.Callbacks[ASTNode.Types.PostfixExpression] = function(node)
{
    // {operator: Node.Operator, expression: Node.$expression}
}

CodeGenerator.Callbacks[ASTNode.Types.UnaryExpression] = function(node)
{
    // {operator: Node.Operator, expression: Node.$expression}
}

CodeGenerator.Callbacks[ASTNode.Types.BinaryExpression] = function(node)
{
    // {operator: Node.Operator, left: Node.$expression, right:}Node.$expression}
}

CodeGenerator.Callbacks[ASTNode.Types.TernaryExpression] = function(node)
{
    // {condition: Node.$expression, is_true: Node.$expression, is_false: Node.$expression}
}

CodeGenerator.Callbacks[ASTNode.Types.IndexSelector] = function(node)
{
    // {index: Node.$expression}
}

CodeGenerator.Callbacks[ASTNode.Types.FieldSelector] = function(node)
{
    // {selection: string}
}

module.exports = CodeGenerator;
