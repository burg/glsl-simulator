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
    Preprocessor: 'preprocessor', // {directive: string, value: string?}
    MacroCall: 'macro_call', // {macro_name: string, parameters: [string]+}
    FunctionCall: 'function_call', // {function_name: string, parameters: [Node.$expression]*}
    FunctionPrototype: 'function_prototype', // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*}
    FunctionDeclaration: 'function_declaration', // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*, body: Node.Scope}
    Scope: 'scope', // {statements: [Node.$statement]*}

    IfStatement: 'if_statement', // {condition: Node.$expression, if_body: Node.Scope, else_body: Node.Scope}
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
    Parameter: 'parameter', // {type_name: string, name: string}
    StructDefinition: 'struct_definition', // {qualifier: string?, identifier: string?, members: [Node.Declarator]+, declarators: [Node.Declarator]?}
    Type: 'type', // {name: string, precision: string?}

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
    this._depth = 0;
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
        callback.call(this, node);
    },

    visitList: function(nodeList)
    {
        for (var node of nodeList)
            this.visitNode(node);
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

    this._depth = 0;
}

GLSL.PrettyPrinter.prototype = {
    constructor: GLSL.PrettyPrinter,
    __proto__: GLSL.ASTVisitor.prototype,

    visitNode: function(node)
    {
        ++this._depth;

        GLSL.ASTVisitor.prototype.visitNode.call(this, node);

        --this._depth;
    },

        // Subclasses should override this to plug in their overridden visit methods.
    visitorForType: function(type)
    {
        if (type in GLSL.PrettyPrinter.Callbacks)
            return GLSL.PrettyPrinter.Callbacks[type];

        return GLSL.ASTVisitor.prototype.visitorForType(type);
    },
};

GLSL.PrettyPrinter.Callbacks = {};

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Identifier] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Program] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Preprocessor] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.MacroCall] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.FunctionCall] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.FunctionDeclaration] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.FunctionPrototype] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Scope] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.IfStatement] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.ForStatement] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.WhileStatement] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.DoStatement] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.ReturnStatement] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.ContinueStatement] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.BreakStatement] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.DiscardStatement] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.ExpressionStatement] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Declarator] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.DeclaratorItem] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Invariant] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Precision] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Parameter] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.StructDefinition] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Type] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.IntegerLiteral] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.FloatLiteral] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.BooleanLiteral] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.Operator] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.PostfixExpression] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.UnaryExpression] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.BinaryExpression] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.TernaryExpression] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.IndexSelector] = function(node)
{

}

GLSL.PrettyPrinter.Callbacks[GLSL.NodeTypes.FieldSelector] = function(node)
{

}

return GLSL;
})();
