var ASTVisitor  = require("./visitor");
var Builtins    = require("../runtime/builtins");
var Operations  = require("../runtime/ops");

var CodeGenerator = function(shader)
{
    ASTVisitor.call(this);
    this._shader = shader;
    this._currentIndent = "";

    this._withinFunctionScope = null;

    this._globalVariableNames = new Set;

    for (var list = shader.uniforms, i = 0; i < list.length; ++i)
        this._globalVariableNames.add(list[i].name);

    for (var list = shader.varyings, i = 0; i < list.length; ++i)
        this._globalVariableNames.add(list[i].name);

    for (var list = shader.attributes, i = 0; i < list.length; ++i)
        this._globalVariableNames.add(list[i].name);
};

CodeGenerator.ConstructorMap = {
    "vec2": "Vec2",
    "vec3": "Vec3",
    "vec4": "Vec4",
    "mat2": "Mat2",
    "mat3": "Mat3",
    "mat4": "Mat4",
};

CodeGenerator.prototype = {
    constructor: CodeGenerator,
    __proto__: ASTVisitor.prototype,

    translateShader: function() {
        this._lines = [];
        this._addLine("");
        this._addLine("var RT = GLSL.Runtime;");
        this._addLine("");
        this.visitNode(this._shader.ast);
        this._addLine("");
        if (this._shader.shouldEmitDebuggerStatement)
            this._addLine("debugger;")
        this._addLine(this._resolveFunction("main") + "();");
        this._addLine("");
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

    _resolveGetLocal: function(name)
    {
        console.assert(typeof name === "string", name);

        return this._resolveGetName(name);
    },

    _resolveFunction: function(name)
    {
        console.assert(typeof name === "string", name);

        if (name in Builtins)
            return "RT." + name;

        if (name in Operations)
            return "RT." + name;

        if (name in CodeGenerator.ConstructorMap)
            return "RT." + CodeGenerator.ConstructorMap[name];

        return this._resolveGetName(name);
    },

    _resolveGetName: function(name)
    {
        console.assert(typeof name === "string", name);

        if (this._globalVariableNames.has(name))
            return "env.get('" + name + "')";

        return "$" + name;
    },

    _resolveSetName: function(name, valueExpr)
    {
        console.assert(typeof name === "string", name);

        if (this._globalVariableNames.has(name))
            return "env.set('" + name + "', " + valueExpr +  ")";

        return "$" + name + " = " + valueExpr;
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
    var params = this.visitList(node.parameters) || [];
    return this._resolveFunction(node.function_name) + "(" + params.join(", ") + ")";
}

CodeGenerator.Callbacks[ASTNode.Types.FunctionPrototype] = function(node)
{
    // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*}
}

CodeGenerator.Callbacks[ASTNode.Types.FunctionDeclaration] = function(node)
{
    // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*, body: Node.Scope}

    var parameters = this.visitList(node.parameters) || [];
    var paramNames = parameters.map(function(p) { return p.name; });

    // TODO: emit code that asserts argument types for debugging purposes.
    // This is unnecessary if the shader is statically typechecked (and there are no bugs in the checker).

    this._withinFunctionScope = node;
    this._addLine("var " + this._resolveGetLocal(node.name) + " = function(" + paramNames.join() + ") {");
    var oldIndent = this._increaseIndent();
    this.visitNode(node.body);
    this._currentIndent = oldIndent;
    this._addLine("};")
    delete this._withinFunctionScope;
}

CodeGenerator.Callbacks[ASTNode.Types.Scope] = function(node)
{
    // {statements: [Node.$statement]*}
    this.visitList(node.statements);
}

CodeGenerator.Callbacks[ASTNode.Types.IfStatement] = function(node)
{
    // {condition: Node.$expression, body: Node.Scope, elseBody: Node.Scope?}
    var expr = this.visitNode(node.condition);
    this._addLine("if (" + expr + ") {");
    var oldIndent = this._increaseIndent();
    this.visitNode(node.body);
    this._currentIndent = oldIndent;

    if (node.elseBody) {
        this._addLine("} else {");
        var oldIndent = this._increaseIndent();
        this.visitNode(node.elseBody);
        this._currentIndent = oldIndent;
    }

    this._addLine("}");
}

CodeGenerator.Callbacks[ASTNode.Types.ForStatement] = function(node)
{
    // {initializer: Node.$initializer, condition: Node.$expression, increment: Node.$expression, body: Node.Scope}}
}

CodeGenerator.Callbacks[ASTNode.Types.WhileStatement] = function(node)
{
    // {condition: Node.$expression, body: Node.Scope}
    var expr = this.visitNode(node.condition);
    this._addLine("while (" + expr + ") {");
    var oldIndent = this._increaseIndent();
    this.visitNode(node.body);
    this._currentIndent = oldIndent;
    this._addLine("}")
}

CodeGenerator.Callbacks[ASTNode.Types.DoStatement] = function(node)
{
    // {condition: Node.$expression, body: Node.Scope}
    var expr = this.visitNode(node.condition);
    this._addLine("do {");
    var oldIndent = this._increaseIndent();
    this.visitNode(node.body);
    this._currentIndent = oldIndent;
    this._addLine("} while (" + expr + ");");
}

CodeGenerator.Callbacks[ASTNode.Types.ReturnStatement] = function(node)
{
    // {value: Node.$expression}
    if (node.value)
        this._addLine("return " + this.visitNode(node.value) + ";");
    else
        this._addLine("return;");
}

CodeGenerator.Callbacks[ASTNode.Types.ContinueStatement] = function(node)
{
    // {}
    this._addLine("continue;");
}

CodeGenerator.Callbacks[ASTNode.Types.BreakStatement] = function(node)
{
    // {}
    this._addLine("break;");
}

CodeGenerator.Callbacks[ASTNode.Types.DiscardStatement] = function(node)
{
    // {}
    this._addLine("discard;");
}

CodeGenerator.Callbacks[ASTNode.Types.ExpressionStatement] = function(node)
{
    // {expression: Node.$expression?}
    this._addLine(this.visitNode(node.expression) + ";");
}

CodeGenerator.Callbacks[ASTNode.Types.Declarator] = function(node)
{
    // {typeAttribute: Node.Type, declarators: [Node.DeclaratorItem]+}

    // If outside a function, then this is a uniform, attribute, or varying and passed through env.
    if (!this._withinFunctionScope)
        return;

    // TODO: register type information here to ensure assignments are type-compatible
    this.visitList(node.declarators);
}

CodeGenerator.Callbacks[ASTNode.Types.DeclaratorItem] = function(node)
{
    // {name: Node.Identifier, initializer: Node.$expression}
    var name = this.visitNode(node.name);
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
    return node.name;
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
    return Number(node.value);
}

CodeGenerator.Callbacks[ASTNode.Types.FloatLiteral] = function(node)
{
    // {value: number}
    return Number(node.value);
}

CodeGenerator.Callbacks[ASTNode.Types.BooleanLiteral] = function(node)
{
    // {value: boolean}
    return node.value ? "true" : "false";
}

CodeGenerator.Callbacks[ASTNode.Types.Identifier] = function(node)
{
    // {name: string}
    return this._resolveGetName(node.name);
}

CodeGenerator.Callbacks[ASTNode.Types.Operator] = function(node)
{
    // {operator: string}
    return node.operator;
}

CodeGenerator.Callbacks[ASTNode.Types.PostfixExpression] = function(node)
{
    // {operator: Node.Operator, expression: Node.$expression}
    var op = node.operator;

    if (op instanceof ASTNode) {
        var builder = new SelectorBuilder(node);
        return "RT.get(" + this._resolveGetName(builder.operand) + ", " + builder.params.join(", ") + ")";
    }

    // TODO: implement, desugaring to |RT.set(a, op_sub(a, 1.0))| and rebinding with this._resolveSetName.

    switch (op) {
    case '++':
    case '--':
    default:
        return null;
    }
}

CodeGenerator.Callbacks[ASTNode.Types.UnaryExpression] = function(node)
{
    // {operator: Node.Operator, expression: Node.$expression}
    var op = this.visitNode(node.operator);
    var expr = this.visitNode(node.expression);

    // TODO: implement.

    switch (op) {

    default:
    case '+':
    case '-':
    case '~':
    case '!':
        return "/* " + op + " */" + expr;
    }
}

CodeGenerator.Callbacks[ASTNode.Types.BinaryExpression] = function(node)
{
    // {operator: Node.Operator, left: Node.$expression, right:}Node.$expression}
    var op = this.visitNode(node.operator);
    var left = this.visitNode(node.left);
    var right = this.visitNode(node.right);

    var func = null;
    var do_assign = false;

    switch (op) {
    case '==': func = "op_eq"; break;
    case '!=': func = "op_neq"; break;
    case '*': func = "op_mul"; break;
    case '/': func = "op_div"; break;
    case '%': func = "op_mod"; break;
    case '+': func = "op_add"; break;
    case '-': func = "op_sub"; break;
    case '<<': func = "op_shl"; break;
    case '>>': func = "op_shr"; break;
    case '<': func = "op_lt"; break;
    case '>': func = "op_gt"; break;
    case '<=': func = "op_le"; break;
    case '>=': func = "op_ge"; break;
    case '&': func = "op_band"; break;
    case '^': func = "op_bxor"; break;
    case '|': func = "op_bor"; break;
    case '&&': func = "op_land"; break;
    case '^^': func = "op_lxor"; break;
    case '||': func = "op_lor"; break;

    /* TODO: we need a strategy for extracting and assigning to l-values.
     Current idea: hard-code l-vlaue cases and synthesize the correct setter.
     Cases are listed in section 5.8 of the specification (reproduced here):

     - variables of builtin type
     - entire structures or arrays
     - single fields of structs
     - arrays dereferenced with the subscript operator '[]'
     - components or swizzles chosen with the field selector '.''

     Note that subscript and swizzle can be chained up to two times, in the case
     of code like |m[1].yxz = vec3(1,0,0);|
    */
    case '=': do_assign = true; break;
    case '+=': func = "op_add"; do_assign = true; break;
    case '-=': func = "op_sub"; do_assign = true; break;
    case '*=': func = "op_mul"; do_assign = true; break;
    case '/=': func = "op_div"; do_assign = true; break;
    case '%=': func = "op_mod"; do_assign = true; break;
    case '<<=': func = "op_shl"; do_assign = true; break;
    case '>>=': func = "op_shr"; do_assign = true; break;
    case '&=': func = "op_band"; do_assign = true; break;
    case '^=': func = "op_bxor"; do_assign = true; break;
    case "|=": func = "op_bor"; do_assign = true; break;
    default:
        return left + " /* " + op + " */ " + right;
    }

    var result = (func) ? (this._resolveFunction(func) + "(" + left + ", " + right + ")") : right;
    // TODO: assert that LHS is an lvalue, or figure this out in typechecking
    if (do_assign) {
        var builder = new SelectorBuilder(node.left);
        if (builder.params.length)
            return this._resolveSetName(builder.operand, "RT.set(" + this._resolveGetLocal(builder.operand) + builder.params.join(", ") + ", " + result + ")");
        else
            return this._resolveSetName(builder.operand, result);
    }
    else
        return result;

}

CodeGenerator.Callbacks[ASTNode.Types.TernaryExpression] = function(node)
{
    // {condition: Node.$expression, is_true: Node.$expression, is_false: Node.$expression}
    return "(" + this.visitNode(node.condition) + ") " + this.visitNode(node.is_true) + " : " + this.visitNode(node.is_false);
}

CodeGenerator.Callbacks[ASTNode.Types.IndexSelector] = function(node)
{
    // {index: Node.$expression}
}

CodeGenerator.Callbacks[ASTNode.Types.FieldSelector] = function(node)
{
    // {selection: string}
}

SelectorBuilder = function(expr) {
    ASTVisitor.call(this);

    this.operand = null;
    this.params = [];
    this.visitNode(expr);
}

SelectorBuilder.prototype = {
    constructor: SelectorBuilder,
    __proto__: ASTVisitor.prototype,

    // Overrides for ASTVisitor

    visitorForType: function(type)
    {
        if (type in SelectorBuilder.Callbacks)
            return SelectorBuilder.Callbacks[type];

        throw new Error("Unexpected AST node encountered by selector builder.");
    },
}

SelectorBuilder.Callbacks = {};

SelectorBuilder.Callbacks[ASTNode.Types.IntegerLiteral] = function(node)
{
    return this.params.push(node.value);
}

SelectorBuilder.Callbacks[ASTNode.Types.FloatLiteral] = function(node)
{
    return this.params.push(node.value);
}

SelectorBuilder.Callbacks[ASTNode.Types.Identifier] = function(node)
{
    return this.operand = node.name;
}

SelectorBuilder.Callbacks[ASTNode.Types.Operator] = function(node)
{
    if (node.operator instanceof ASTNode)
        this.visitNode(node.operator);
}

SelectorBuilder.Callbacks[ASTNode.Types.PostfixExpression] = function(node)
{
    // {operator: Node.Operator, expression: Node.$expression}
    this.visitNode(node.expression);
    this.visitNode(node.operator);
}

SelectorBuilder.Callbacks[ASTNode.Types.IndexSelector] = function(node)
{
    // {index: Node.$expression}
    this.visitNode(node.index);
}

SelectorBuilder.Callbacks[ASTNode.Types.FieldSelector] = function(node)
{
    // {selection: string}
    this.params.push("'" + node.selection + "'");
}


module.exports = CodeGenerator;
