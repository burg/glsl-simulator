/* Copyright (c) 2014, Brian Burg.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Allow use as CJS or AMD module or in the browser.
GLSL = (function() {

function GLSL() {
}

GLSL.prototype = {
    constructor: GLSL,
};

GLSL.SourceCode = function(text) {
    this._rawText = text;
}

GLSL.SourceCode.prototype = {
    constructor: GLSL.SourceCode,

    get text() { return this._rawText; },
};

GLSL.Node = function(type, position, properties)
{
    this.type = type;
    this.position = position;

    for (var prop in properties)
        if (properties.hasOwnProperty(prop))
          this[prop] = properties[prop];
};

GLSL.Node.__nextId = 1;

// Map of our node type names to values of the PEG parser's "type" property.
// Expected properties are documented here per-node.
//
// Some aliases used in the comments:
// Node.$initializer == Node.{FunctionPrototype, FunctionDeclaration, Invariant, Precision, Declarator}
// Node.$expression == Node.{Operator, PostfixExpression, UnaryExpression, BinaryExpression, TernaryExpression, IndexSelector, FieldSelector, Identifier, IntegerLiteral, FloatLiteral, BooleanLiteral}
// Node.$statement == Node.{IfStatement, ForStatement, WhileStatement, DoStatement, ReturnStatement, ContinueStatement, BreakStatement, DiscardStatement, ExpressionStatement, Preprocessor, MacroCall}
GLSL.NodeTypes = {
    Program: 'root', // {statements: [Node.$statement]*}
    Preprocessor: 'preprocessor', // {directive: string, identifier: string?, parameters: [string]?, value: string?, guarded_statements: [Node.$statement]*}
    MacroCall: 'macro_call', // {macro_name: string, parameters: [string]+}
    FunctionCall: 'function_call', // {function_name: string, parameters: [Node.$expression]*}
    FunctionPrototype: 'function_prototype', // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*}
    FunctionDeclaration: 'function_declaration', // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*, body: Node.Scope}
    Scope: 'scope', // {statements: [Node.$statement]*}

    IfStatement: 'if_statement', // {condition: Node.$expression, body: Node.Scope, elseBody: Node.Scope?}
    ForStatement: 'for_statement', // {initializer: Node.$initializer, condition: Node.$expression, increment: Node.$expression}}
    WhileStatement: 'while_statement', // {condition: Node.$expression, body: Node.Scope}
    DoStatement: 'do_statement', // {condition: Node.$expression, body: Node.Scope}
    ReturnStatement: 'return', // {value: Node.$expression}
    ContinueStatement: 'continue', // {}
    BreakStatement: 'break', // {}
    DiscardStatement: 'discard', // {}
    ExpressionStatement: 'expression', // {expression: Node.$expression?}

    Declarator: 'declarator', // {typeAttribute: Node.Type, declarators: [Node.DeclaratorItem]+}
    DeclaratorItem: 'declarator_item', // {name: string, initializer: Node.$expression}
    Invariant: 'invariant', // {identifiers: [Node.Identifier]*}
    Precision: 'precision', // {precision: string, typeName: string}
    Parameter: 'parameter', // {type_name: string, name: string, typeQualifier: string?, parameterQualifier: string?, precision: string?, arraySize: Node.$expression}
    StructDefinition: 'struct_definition', // {qualifier: string?, identifier: string?, members: [Node.Declarator]+, declarators: [Node.Declarator]?}
    Type: 'type', // {name: string, precision: string?, qualifier: string?}

    IntegerLiteral: 'int', // {value: number}
    FloatLiteral: 'float', // {value: number}
    BooleanLiteral: 'bool', // {value: boolean}
    Identifier: 'identifier', // {name: string}

    Operator: 'operator', // {operator: string}
    PostfixExpression: 'postfix', // {operator: Node.Operator, expression: Node.$expression}
    UnaryExpression: 'unary', // {operator: Node.Operator, expression: Node.$expression}
    BinaryExpression: 'binary', // {operator: Node.Operator, left: Node.$expression, right:}Node.$expression}
    TernaryExpression: 'ternary', // {condition: Node.$expression, is_true: Node.$expression, is_false: Node.$expression}
    IndexSelector: 'accessor', // {index: Node.$expression}
    FieldSelector: 'field_selector', // {selection: string}
};

GLSL.parse = function() {
    if (!GLSL.__parser)
        throw new Error("No GLSL parser detected, make sure to include glsl-parser.js.");

    return GLSL.__parser.parse.apply(GLSL.__parser, Array.prototype.slice.call(arguments));
}

GLSL.ASTVisitor = function()
{
}

GLSL.ASTVisitor.prototype = {
    constructor: GLSL.ASTVisitor,

    // Public

    // Subclasses should override this to plug in their overridden visit methods.
    visitorForType: function(type)
    {
        if (type in GLSL.ASTVisitor.DefaultCallbacks)
            return GLSL.ASTVisitor.DefaultCallbacks[type];

        return this.defaultVisitor;
    },

    visitNode: function(node)
    {
        if (!node || !node.type)
            return;

        var callback = this.visitorForType(node.type);
        return callback.call(this, node);
    },

    visitList: function(nodeList)
    {
        if (!(nodeList instanceof Array) || !nodeList.length)
            return;

        var result = [];
        for (var node of nodeList)
            result.push(this.visitNode(node));

        return result;
    },

    defaultVisitor: function(node)
    {
        for (var key in node) {
            var val = node[key];
            if (val instanceof Array)
                this.visitList(val);
            else if (val instanceof Object && val.type)
                this.visitNode(val);
        }
    }
};

GLSL.ASTVisitor.DefaultCallbacks = {
}

GLSL.PrettyPrinter = function()
{
    GLSL.ASTVisitor.call(this);

    this._scopes = [];
    this._currentIndent = "";
}

GLSL.PrettyPrinter.prototype = {
    constructor: GLSL.PrettyPrinter,
    __proto__: GLSL.ASTVisitor.prototype,

    // Public

    formattedText: function(tree)
    {
        this._lines = [];
        this.visitNode(tree);
        return this._lines.join("\n");
    },

    // Overrides for GLSL.ASTVisitor

    visitorForType: function(type)
    {
        if (type in GLSL.PrettyPrinter.Callbacks)
            return GLSL.PrettyPrinter.Callbacks[type];

        return GLSL.ASTVisitor.prototype.visitorForType(type);
    },

    // Private

    _addLine: function(line)
    {
        this._lines.push([this._currentIndent, line].join(""));
    },

    _increaseIndent: function()
    {
        var oldIndent = this._currentIndent;
        this._currentIndent = [this._currentIndent, GLSL.PrettyPrinter.IndentString].join("");
        return oldIndent;
    },

    _unimplemented: function(node)
    {
        this._addLine(jsDump.parse(node));
    }
};

GLSL.PrettyPrinter.IndentString = "  ";

GLSL.PrettyPrinter.Callbacks = {};

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Identifier] = function(node)
{
    return node.name;
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Program] = function(node)
{
    this.visitList(node.statements);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Preprocessor] = function(node)
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

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.MacroCall] = function(node)
{
    this._unimplemented(node);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.FunctionCall] = function(node)
{
    var argList = this.visitList(node.parameters) || [];
    return node.function_name + "(" + argList.join(", ") + ")";
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.FunctionDeclaration] = function(node)
{
    var returnType = this.visitNode(node.returnType);
    var argList = this.visitList(node.parameters) || ["void"];

    this._addLine(""); // Induce a newline before function declaration.
    this._addLine(returnType + " " + node.name + "(" + argList.join(", ") + ") {");
    this.visitNode(node.body);
    this._addLine("}")
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.FunctionPrototype] = function(node)
{
    this._unimplemented(node);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Scope] = function(node)
{
    this._scopes.push(node);
    var oldIndent = this._increaseIndent();
    this.visitList(node.statements);
    this._currentIndent = oldIndent;
    this._scopes.pop(node);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.IfStatement] = function(node)
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

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.ForStatement] = function(node)
{
    this._unimplemented(node);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.WhileStatement] = function(node)
{
    this._unimplemented(node);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.DoStatement] = function(node)
{
    this._unimplemented(node);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.ReturnStatement] = function(node)
{
    if (node.value)
        this.lines.push("return " + this.visitNode(node.value) + ";");
    else
        this._addLine("return;");
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.ContinueStatement] = function(node)
{
    this._addLine("continue;");
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.BreakStatement] = function(node)
{
    this._addLine("break;");
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.DiscardStatement] = function(node)
{
    this._addLine("discard;");
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.ExpressionStatement] = function(node)
{
    this._addLine(this.visitNode(node.expression) + ";");
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Declarator] = function(node)
{
    var type = this.visitNode(node.typeAttribute);
    var items = this.visitList(node.declarators);

    this._addLine(type + " " + items.join(", ") + ";");
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.DeclaratorItem] = function(node)
{
    var tokens = [this.visitNode(node.name)];
    if (node.initializer) {
        tokens.push("=");
        tokens.push(this.visitNode(node.initializer));
    }

    return tokens.join(" ");
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Invariant] = function(node)
{
    this._unimplemented(node);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Precision] = function(node)
{
    return this._addLine(["precision", node.precision, node.typeName].join(" ") + ";");
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Parameter] = function(node)
{
    this._unimplemented(node);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.StructDefinition] = function(node)
{
    this._unimplemented(node);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Type] = function(node)
{
    var tokens = [node.name];

    if (node.precision)
        tokens.unshift(node.precision);
    if (node.qualifier)
        tokens.unshift(node.qualifier);

    return tokens.join(" ");
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.IntegerLiteral] = function(node)
{
    return node.value;
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.FloatLiteral] = function(node)
{
    return node.value;
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.BooleanLiteral] = function(node)
{
    return node.value;
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Operator] = function(node)
{
    return node.operator;
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.PostfixExpression] = function(node)
{
    return this.visitNode(node.expression) + this.visitNode(node.operator);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.UnaryExpression] = function(node)
{
    return this.visitNode(node.operator) + this.visitNode(node.expression);
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.BinaryExpression] = function(node)
{
    var expr = [this.visitNode(node.left), this.visitNode(node.operator), this.visitNode(node.right)].join(" ")
    var op = node.operator.operator;
    if (op.indexOf("==") === -1 && op.indexOf("=") !== -1)
        return expr;
    else
        return "(" + expr + ")";
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.TernaryExpression] = function(node)
{
    return [this.visitNode(node.condition), "?", this.visitNode(node.is_true), ":", this.visitNode(node.is_false)].join(" ");
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.IndexSelector] = function(node)
{
    return "[" + this.visitNode(node.index) + "]";
}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.FieldSelector] = function(node)
{
    return "." + node.selection;
}

return GLSL;
})();
