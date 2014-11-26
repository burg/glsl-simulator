ASTNode = function(type, position, properties)
{
    this.type = type;
    this.position = position;

    for (var prop in properties)
        if (properties.hasOwnProperty(prop))
          this[prop] = properties[prop];
};

ASTNode.__nextId = 1;

// Map of our node type names to values of the PEG parser's "type" property.
// Expected properties are documented here per-node.
//
// Some aliases used in the comments:
// Node.$initializer == Node.{FunctionPrototype, FunctionDeclaration, Invariant, Precision, Declarator}
// Node.$expression == Node.{Operator, PostfixExpression, UnaryExpression, BinaryExpression, TernaryExpression, IndexSelector, FieldSelector, Identifier, IntegerLiteral, FloatLiteral, BooleanLiteral}
// Node.$statement == Node.{IfStatement, ForStatement, WhileStatement, DoStatement, ReturnStatement, ContinueStatement, BreakStatement, DiscardStatement, ExpressionStatement, Preprocessor, MacroCall}
ASTNode.Types = {
    Program: 'root', // {statements: [Node.$statement]*}
    Preprocessor: 'preprocessor', // {directive: string, identifier: string?, parameters: [string]?, value: string?, guarded_statements: [Node.$statement]*}
    MacroCall: 'macro_call', // {macro_name: string, parameters: [string]+}
    FunctionCall: 'function_call', // {function_name: string, parameters: [Node.$expression]*}
    FunctionPrototype: 'function_prototype', // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*}
    FunctionDeclaration: 'function_declaration', // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*, body: Node.Scope}
    Scope: 'scope', // {statements: [Node.$statement]*}

    IfStatement: 'if_statement', // {condition: Node.$expression, body: Node.Scope, elseBody: Node.Scope?}
    ForStatement: 'for_statement', // {initializer: Node.$initializer, condition: Node.$expression, increment: Node.$expression, body: Node.Scope}}
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
    StructDefinition: 'struct_definition', // {qualifier: string?, name: string?, members: [Node.Declarator]+, declarators: [Node.Declarator]?}
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

module.exports = ASTNode;
