var ASTVisitor = require("./visitor");

PrettyPrinter = function()
{
    ASTVisitor.call(this);

    this._scopes = [];
    this._currentIndent = "";
}

PrettyPrinter.prototype = {
    constructor: PrettyPrinter,
    __proto__: ASTVisitor.prototype,

    // Public

    formattedText: function(tree)
    {
        this._lines = [];
        this.visitNode(tree);
        return this._lines.join("\n");
    },

    // Overrides for ASTVisitor

    visitorForType: function(type)
    {
        if (type in PrettyPrinter.Callbacks)
            return PrettyPrinter.Callbacks[type];

        return ASTVisitor.prototype.visitorForType(type);
    },

    // Private

    _addLine: function(line)
    {
        this._lines.push([this._currentIndent, line].join(""));
    },

    _increaseIndent: function()
    {
        var oldIndent = this._currentIndent;
        this._currentIndent = [this._currentIndent, PrettyPrinter.IndentString].join("");
        return oldIndent;
    },
};

PrettyPrinter.IndentString = "    ";

PrettyPrinter.Callbacks = {};

PrettyPrinter.Callbacks[ASTNode.Types.Identifier] = function(node)
{
    return node.name;
}

PrettyPrinter.Callbacks[ASTNode.Types.Program] = function(node)
{
    this.visitList(node.statements);
}

PrettyPrinter.Callbacks[ASTNode.Types.Preprocessor] = function(node)
{
    if (node.directive === "#define") {
        var pieces = [node.directive, " ", node.identifier];

        if (node.parameters)
            pieces.push("(" + node.parameters.join(", ") +")");

        if (node.token_string) {
            pieces.push(" ");
            pieces.push(node.token_string);
        }

        this._addLine(pieces.join(""));
    } else {
        // Deduplicate any trailing #endif. We always add #endif, since we
        // don't have matched preprocessor directive in the AST itself.
        var shouldPairWithPrevious = node.directive === "#elif" || node.directive === "#else";
        if (shouldPairWithPrevious && this._lines[this._lines.length - 1] === "#endif")
            this._lines.pop();

        this._addLine(node.directive + " " + node.value);
        this.visitList(node.guarded_statements);
        this._addLine("#endif");
    }
}

PrettyPrinter.Callbacks[ASTNode.Types.MacroCall] = function(node)
{
    return node.macro_name + "(" + node.paremeters.join(", ") + ")";
}

PrettyPrinter.Callbacks[ASTNode.Types.FunctionCall] = function(node)
{
    var argList = this.visitList(node.parameters) || [];
    return node.function_name + "(" + argList.join(", ") + ")";
}

PrettyPrinter.Callbacks[ASTNode.Types.FunctionDeclaration] = function(node)
{
    var returnType = this.visitNode(node.returnType);
    var argList = this.visitList(node.parameters) || ["void"];

    this._addLine(""); // Induce a newline before function declaration.
    this._addLine(returnType + " " + node.name + "(" + argList.join(", ") + ") {");
    var oldIndent = this._increaseIndent();
    this.visitNode(node.body);
    this._currentIndent = oldIndent;
    this._addLine("}");
}

PrettyPrinter.Callbacks[ASTNode.Types.FunctionPrototype] = function(node)
{
    var returnType = this.visitNode(node.returnType);
    var argList = this.visitList(node.parameters) || ["void"];

    this._addLine(""); // Induce a newline before function declaration.
    this._addLine(returnType + " " + node.name + "(" + argList.join(", ") + ");");
}

PrettyPrinter.Callbacks[ASTNode.Types.Scope] = function(node)
{
    this._scopes.push(node);
    this.visitList(node.statements);
    this._scopes.pop(node);
}

PrettyPrinter.Callbacks[ASTNode.Types.IfStatement] = function(node)
{
    this._addLine("if (" + this.visitNode(node.condition) + ") {");
    var oldIndent = this._increaseIndent();
    this.visitNode(node.body);
    this._currentIndent = oldIndent;

    if (node.elseBody) {
        this._addLine("} else {")
        var oldIndent = this._increaseIndent();
        this.visitNode(node.elseBody);
        this._currentIndent = oldIndent;
    }

    this._addLine("}");
}

PrettyPrinter.Callbacks[ASTNode.Types.ForStatement] = function(node)
{
    // The declarator node is normally a statement on its own line.
    // So, pop it off the end if it exists.
    var initializer = "";
    if (node.initializer) {
        this.visitNode(node.initializer);
        initializer = this._lines.pop().trim();
        initializer = initializer.substr(0, initializer.length - 1);
    }

    var condition = this.visitNode(node.condition) || "";
    var increment = this.visitNode(node.increment) || "";

    this._addLine("for (" + [initializer, condition, increment].join("; ") + ") {");
    var oldIndent = this._increaseIndent();
    this.visitNode(node.body);
    this._currentIndent = oldIndent;
    this._addLine("}");
}

PrettyPrinter.Callbacks[ASTNode.Types.WhileStatement] = function(node)
{
    this._addLine("while (" + this.visitNode(node.condition) + ") {");
    var oldIndent = this._increaseIndent();
    this.visitNode(node.body);
    this._currentIndent = oldIndent;
    this._addLine("}");
}

PrettyPrinter.Callbacks[ASTNode.Types.DoStatement] = function(node)
{
    this._addLine("do {");
    var oldIndent = this._increaseIndent();
    this.visitNode(node.body);
    this._currentIndent = oldIndent;
    this._addLine("} while (" + this.visitNode(node.condition) + ");");
}

PrettyPrinter.Callbacks[ASTNode.Types.ReturnStatement] = function(node)
{
    if (node.value)
        this._addLine("return " + this.visitNode(node.value) + ";");
    else
        this._addLine("return;");
}

PrettyPrinter.Callbacks[ASTNode.Types.ContinueStatement] = function(node)
{
    this._addLine("continue;");
}

PrettyPrinter.Callbacks[ASTNode.Types.BreakStatement] = function(node)
{
    this._addLine("break;");
}

PrettyPrinter.Callbacks[ASTNode.Types.DiscardStatement] = function(node)
{
    this._addLine("discard;");
}

PrettyPrinter.Callbacks[ASTNode.Types.ExpressionStatement] = function(node)
{
    this._addLine(this.visitNode(node.expression) + ";");
}

PrettyPrinter.Callbacks[ASTNode.Types.Declarator] = function(node)
{
    var type = this.visitNode(node.typeAttribute);
    var items = this.visitList(node.declarators);

    this._addLine(type + " " + items.join(", ") + ";");
}

PrettyPrinter.Callbacks[ASTNode.Types.DeclaratorItem] = function(node)
{
    var tokens = [this.visitNode(node.name)];
    if (node.initializer) {
        tokens.push("=");
        tokens.push(this.visitNode(node.initializer));
    }

    return tokens.join(" ");
}

PrettyPrinter.Callbacks[ASTNode.Types.Invariant] = function(node)
{
    this._addLine("invariant " + this.visitList(node.identifiers).join(", ") + ";");
}

PrettyPrinter.Callbacks[ASTNode.Types.Precision] = function(node)
{
    return this._addLine(["precision", node.precision, node.typeName].join(" ") + ";");
}

PrettyPrinter.Callbacks[ASTNode.Types.Parameter] = function(node)
{
    var tokens = [node.type_name, node.name];

    if (node.precision)
        tokens.unshift(node.precision);
    if (node.parameterQualifier)
        tokens.unshift(node.parameterQualifier);
    if (node.typeQualifier)
        tokens.unshift(node.typeQualifier);

    var result = tokens.join(" ");
    if (node.arraySize)
        result = result + "[" + this.visit(node.arraySize) + "]";

    return result;
}

PrettyPrinter.Callbacks[ASTNode.Types.StructDefinition] = function(node)
{
    var tokens = ["struct"];
    if (node.qualifier)
        tokens.unshift(node.qualifier);

    if (node.name)
        tokens.push(node.name);

    tokens.push("{")
    this._addLine(tokens.join(" "));
    var oldIndent = this._increaseIndent();
    this.visitList(node.members);
    this._currentIndent = oldIndent;

    if (!node.declarators) {
        this._addLine("};");
        return;
    }

    var declarators = this.visitList(node.declarators);
    this._addLine("} " + declarators.join(", ") + ";");
}

PrettyPrinter.Callbacks[ASTNode.Types.Type] = function(node)
{
    var tokens = [node.name];

    if (node.precision)
        tokens.unshift(node.precision);
    if (node.qualifier)
        tokens.unshift(node.qualifier);

    return tokens.join(" ");
}

PrettyPrinter.Callbacks[ASTNode.Types.IntegerLiteral] = function(node)
{
    return node.value;
}

PrettyPrinter.Callbacks[ASTNode.Types.FloatLiteral] = function(node)
{
    return node.value;
}

PrettyPrinter.Callbacks[ASTNode.Types.BooleanLiteral] = function(node)
{
    return node.value;
}

PrettyPrinter.Callbacks[ASTNode.Types.Operator] = function(node)
{
    return node.operator;
}

PrettyPrinter.Callbacks[ASTNode.Types.PostfixExpression] = function(node)
{
    return this.visitNode(node.expression) + this.visitNode(node.operator);
}

PrettyPrinter.Callbacks[ASTNode.Types.UnaryExpression] = function(node)
{
    return this.visitNode(node.operator) + this.visitNode(node.expression);
}

PrettyPrinter.Callbacks[ASTNode.Types.BinaryExpression] = function(node)
{
    var expr = [this.visitNode(node.left), this.visitNode(node.operator), this.visitNode(node.right)].join(" ")
    var op = node.operator.operator;
    if (op.indexOf("==") === -1 && op.indexOf("=") !== -1)
        return expr;
    else
        return "(" + expr + ")";
}

PrettyPrinter.Callbacks[ASTNode.Types.TernaryExpression] = function(node)
{
    return [this.visitNode(node.condition), "?", this.visitNode(node.is_true), ":", this.visitNode(node.is_false)].join(" ");
}

PrettyPrinter.Callbacks[ASTNode.Types.IndexSelector] = function(node)
{
    return "[" + this.visitNode(node.index) + "]";
}

PrettyPrinter.Callbacks[ASTNode.Types.FieldSelector] = function(node)
{
    return "." + node.selection;
}

module.exports = PrettyPrinter;
