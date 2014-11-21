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
(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        module.exports = mod();
    else if (typeof define == "function" && define.amd) // AMD
        return define([], mod);
    else // Plain browser env
        this.GLSL = mod();
})(function() {

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

(function defineTokenizer() {
var NORMAL = 999          // <-- never emitted
  , TOKEN = 9999          // <-- never emitted
  , BLOCK_COMMENT = 0
  , LINE_COMMENT = 1
  , PREPROCESSOR = 2
  , OPERATOR = 3
  , INTEGER = 4
  , FLOAT = 5
  , IDENT = 6
  , BUILTIN = 7
  , KEYWORD = 8
  , WHITESPACE = 9
  , EOF = 10
  , HEX = 11

var map = [
    'block-comment'
  , 'line-comment'
  , 'preprocessor'
  , 'operator'
  , 'integer'
  , 'float'
  , 'ident'
  , 'builtin'
  , 'keyword'
  , 'whitespace'
  , 'eof'
  , 'integer'
]

var operators = [
    '<<=', '>>=', '++', '--', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||', '+=', '-=', '*=', '/=', '%=', '&=', '^^', '^=', '|=', '(', ')', '[', ']', '.', '!', '~', '*', '/', '%', '+', '-', '<', '>', '&', '^', '|', '?', ':', '=', ',', ';', '{', '}'
];

var builtins = [
    'abs', 'acos', 'all', 'any', 'asin', 'atan',
    'ceil', 'clamp', 'cos', 'cross',
    'degrees', 'distance', 'dot',
    'equal', 'exp', 'exp2',
    'faceforward', 'floor', 'fract',
    'gl_BackColor', 'gl_BackLightModelProduct', 'gl_BackLightProduct', 'gl_BackMaterial', 'gl_BackSecondaryColor',
    'gl_ClipPlane', 'gl_ClipVertex', 'gl_Color', 'gl_Color',
    'gl_DepthRange', 'gl_DepthRangeParameters',
    'gl_EyePlaneQ', 'gl_EyePlaneR', 'gl_EyePlaneS', 'gl_EyePlaneT',
    'gl_Fog', 'gl_FogCoord', 'gl_FogFragCoord', 'gl_FogFragCoord', 'gl_FogParameters',
    'gl_FragColor', 'gl_FragCoord', 'gl_FragData', 'gl_FragDepth',
    'gl_FrontColor', 'gl_FrontFacing', 'gl_FrontLightModelProduct', 'gl_FrontLightProduct', 'gl_FrontMaterial', 'gl_FrontSecondaryColor',
    'gl_LightModel', 'gl_LightModelParameters', 'gl_LightModelProducts', 'gl_LightProducts', 'gl_LightSource', 'gl_LightSourceParameters',
    'gl_MaterialParameters',
    'gl_MaxClipPlanes', 'gl_MaxCombinedTextureImageUnits', 'gl_MaxDrawBuffers', 'gl_MaxFragmentUniformComponents', 'gl_MaxLights', 'gl_MaxTextureCoords', 'gl_MaxTextureImageUnits', 'gl_MaxTextureUnits', 'gl_MaxVaryingFloats', 'gl_MaxVertexAttribs', 'gl_MaxVertexTextureImageUnits', 'gl_MaxVertexUniformComponents',
    'gl_ModelViewMatrix', 'gl_ModelViewMatrixInverse', 'gl_ModelViewMatrixInverseTranspose', 'gl_ModelViewMatrixTranspose', 'gl_ModelViewProjectionMatrix', 'gl_ModelViewProjectionMatrixInverse', 'gl_ModelViewProjectionMatrixInverseTranspose', 'gl_ModelViewProjectionMatrixTranspose',
    'gl_MultiTexCoord0', 'gl_MultiTexCoord1', 'gl_MultiTexCoord2', 'gl_MultiTexCoord3', 'gl_MultiTexCoord4', 'gl_MultiTexCoord5', 'gl_MultiTexCoord6', 'gl_MultiTexCoord7',
    'gl_Normal', 'gl_NormalMatrix', 'gl_NormalScale',
    'gl_ObjectPlaneQ', 'gl_ObjectPlaneR', 'gl_ObjectPlaneS', 'gl_ObjectPlaneT',
    'gl_Point', 'gl_PointCoord', 'gl_PointParameters', 'gl_PointSize',
    'gl_Position',
    'gl_ProjectionMatrix', 'gl_ProjectionMatrixInverse', 'gl_ProjectionMatrixInverseTranspose', 'gl_ProjectionMatrixTranspose',
    'gl_SecondaryColor',
    'gl_TexCoord', 'gl_TexCoord', 'gl_TextureEnvColor', 'gl_TextureMatrix', 'gl_TextureMatrixInverse', 'gl_TextureMatrixInverseTranspose', 'gl_TextureMatrixTranspose',
    'gl_Vertex',
    'greaterThan', 'greaterThanEqual',
    'inversesqrt',
    'length', 'lessThan', 'lessThanEqual', 'log', 'log2',
    'matrixCompMult', 'max', 'min', 'mix', 'mod',
    'normalize', 'not', 'notEqual', 'pow', 'radians', 'reflect', 'refract',
    'sign', 'sin', 'smoothstep', 'sqrt', 'step',
    'tan',
    'texture2D', 'texture2DLod', 'texture2DProj', 'texture2DProjLod', 'textureCube', 'textureCubeLod' ];

var literals = [
    // current
    'attribute', 'bool', 'break', 'bvec2', 'bvec3', 'bvec4', 'const', 'continue', 'discard', 'do', 'else', 'false', 'float', 'for', 'highp', 'if', 'in', 'inout', 'int', 'ivec2', 'ivec3', 'ivec4', 'lowp', 'mat2', 'mat3', 'mat4', 'mediump', 'out', 'precision', 'return', 'sampler1D', 'sampler1DShadow', 'sampler2D', 'sampler2DShadow', 'sampler3D', 'samplerCube', 'struct', 'true', 'uniform', 'varying', 'vec2', 'vec3', 'vec4', 'void', 'while',
    // future
    'asm', 'cast', 'class', 'default', 'double', 'dvec2', 'dvec3', 'dvec4', 'enum', 'extern', 'external', 'fixed', 'fvec2', 'fvec3', 'fvec4', 'goto', 'half', 'hvec2', 'hvec3', 'hvec4', 'inline', 'input', 'interface', 'long', 'namespace', 'noinline', 'output', 'packed', 'public', 'sampler2DRect', 'sampler2DRectShadow', 'sampler3DRect', 'short', 'sizeof', 'static', 'switch', 'template', 'this', 'typedef', 'union', 'unsigned', 'using', 'volatile',
];

GLSL.Token = function(type, data, position, line, column)
{
    this.type = type;
    this.data = data;
    this.position = position;
    this.line = line || 1;
    this.column = column || 0;
};

GLSL.Token.prototype = {
    constructor: GLSL.Token,

    is_storage: function()
    {
        return this.data === 'const' ||
            this.data === 'attribute' ||
            this.data === 'uniform' ||
            this.data === 'varying';
    },

    is_parameter: function()
    {
        return this.data === 'in' ||
            this.data === 'inout' ||
            this.data === 'out';
    },

    is_precision: function()
    {
        return this.data === 'highp' ||
            this.data === 'mediump' ||
            this.data === 'lowp';
    }
};

GLSL.tokenize = function(input) {
    var mode = NORMAL;
    var len = input.length;
    var tokens = [];
    var content = [];
    var c, last;

    var i = 0;
    var line = 1;
    var col = 0;
    var start = 0;
    var total = 0;

    while (c = input[i], i < len) {
        switch (mode) {
        case BLOCK_COMMENT: i = block_comment(); break;
        case LINE_COMMENT: i = line_comment(); break;
        case PREPROCESSOR: i = preprocessor(); break;
        case OPERATOR: i = operator(); break;
        case INTEGER: i = integer(); break;
        case HEX: i = hex(); break;
        case FLOAT: i = decimal(); break;
        case TOKEN: i = readtoken(); break;
        case WHITESPACE: i = whitespace(); break;
        case NORMAL: i = normal(); break;
        }

        // (line,col) management.
        if (last !== i) {
            switch (input[last]) {
            case '\n': col = 0; ++line; break
            default: ++col; break
            }
        }
    }

    if (content.length)
        tokens.push(new GLSL.Token(content.join('')));

    mode = EOF
    token('(eof)')

    return tokens;

    function token(data) {
        if (!data.length)
            throw new Error("Token had zero-length data.");

        tokens.push(new GLSL.Token(map[mode], data, start, line, col));
    }

    function normal() {
        content = content.length ? [] : content

        if (input[last] === '/' && c === '*') {
            start = total + i - 1;
            mode = BLOCK_COMMENT;
            last = i;
            return i + 1;
        }

        if (input[last] === '/' && c === '/') {
            start = total + i - 1;
            mode = LINE_COMMENT;
            last = i;
            return i + 1;
        }

        if (c === '#') {
            mode = PREPROCESSOR;
            start = total + i;
            return i;
        }

        if (/\s/.test(c)) {
            mode = WHITESPACE;
            start = total + i;
            return i;
        }

        isnum = /\d/.test(c);
        isoperator = /[^\w_]/.test(c);

        start = total + i;
        mode = isnum ? INTEGER : isoperator ? OPERATOR : TOKEN;
        return i;
    }

    function whitespace() {
        if (/[^\s]/g.test(c)) {
            token(content.join(''));
            mode = NORMAL;
            return i;
        }
        content.push(c);
        last = i;
        return i + 1;
    }

    function preprocessor() {
        if (c === '\n' && input[last] !== '\\') {
            token(content.join(''));
            mode = NORMAL;
            return i;
        }
        content.push(c);
        last = i;
        return i + 1;
    }

    function line_comment() {
        return preprocessor();
    }

    function block_comment() {
        if (input[last] === '*' && c === '/') {
            content.push(c)
            token(content.join(''))
            mode = NORMAL
            return i + 1
        }

        content.push(c);
        last = i;
        return i + 1;
    }

    function operator() {
        if (input[last] === '.' && /\d/.test(c)) {
            mode = FLOAT;
            return i;
        }

        if (input[last] === '/' && c === '*') {
            mode = BLOCK_COMMENT;
            return i;
        }

        if (input[last] === '/' && c === '/') {
            mode = LINE_COMMENT;
            return i;
        }

        if (c === '.' && content.length) {
            while (determine_operator(content));

            mode = FLOAT;
            return i;
        }

        if (c === ';' || c === ')' || c === '(') {
            if (content.length)
                while (determine_operator(content));

            token(c);
            mode = NORMAL;
            return i + 1;
        }

        var is_composite_operator = content.length === 2 && c !== '=';
        if (/[\w_\d\s]/.test(c) || is_composite_operator) {
            while (determine_operator(content));
            mode = NORMAL;
            return i;
        }

        content.push(c);
        last = i;
        return i + 1;
    }

    function determine_operator(buf) {
        var j = 0, idx;

        do {
            idx = operators.indexOf(buf.slice(0, buf.length + j).join(''));
            if (idx === -1) {
                j -= 1;
                continue;
            }

            token(operators[idx]);
            start += operators[idx].length;
            content = content.slice(operators[idx].length);
            return content.length;
        } while (true);
    }

    function hex() {
        if (/[^a-fA-F0-9]/.test(c)) {
            token(content.join(''));
            mode = NORMAL;
            return i;
        }

        content.push(c);
        last = i;
        return i + 1;
    }

    function integer() {
        if (c === '.') {
            content.push(c);
            mode = FLOAT;
            last = i;
            return i + 1;
        }

        if (/[eE]/.test(c)) {
            content.push(c);
            mode = FLOAT;
            last = i;
            return i + 1;
        }

        if (c === 'x' && content.length === 1 && content[0] === '0') {
            mode = HEX;
            content.push(c);
            last = i;
            return i + 1;
        }

        if (/[^\d]/.test(c)) {
            token(content.join(''));
            mode = NORMAL;
            return i;
        }

        content.push(c)
        last = i;
        return i + 1;
    }

    function decimal() {
        if (c === 'f') {
            content.push(c);
            last = i;
            i += 1;
        }

        if (/[eE]/.test(c)) {
            content.push(c);
            last = i;
            return i + 1;
        }

        if (/[^\d]/.test(c)) {
            token(content.join(''));
            mode = NORMAL;
            return i;
        }

        content.push(c)
        last = i;
        return i + 1;
    }

    function readtoken() {
        if (/[^\d\w_]/.test(c)) {
            var contentstr = content.join('');
            if (literals.indexOf(contentstr) > -1)
                mode = KEYWORD;
            else if (builtins.indexOf(contentstr) > -1)
                mode = BUILTIN;
            else
                mode = IDENT;

            token(content.join(''));
            mode = NORMAL;
            return i;
        }
        content.push(c);
        last = i;
        return i + 1;
    }
}

})(); // define tokenizer.

(function defineParser() {

var state, token, tokens, idx;

var original_symbol = {
    nud: function() {
        return this.children && this.children.length ? this : fail('unexpected')()
    },
    led: fail('missing operator')
}

var symbol_table = {}

function itself() {
    return this
}

symbol('(ident)').nud = itself
symbol('(keyword)').nud = itself
symbol('(builtin)').nud = itself
symbol('(literal)').nud = itself
symbol('(end)')

symbol(':')
symbol(';')
symbol(',')
symbol(')')
symbol(']')
symbol('}')

infixr('&&', 30)
infixr('||', 30)
infix('|', 43)
infix('^', 44)
infix('&', 45)
infix('==', 46)
infix('!=', 46)
infix('<', 47)
infix('<=', 47)
infix('>', 47)
infix('>=', 47)
infix('>>', 48)
infix('<<', 48)
infix('+', 50)
infix('-', 50)
infix('*', 60)
infix('/', 60)
infix('%', 60)
infix('?', 20, function(left) {
    this.children = [left, expression(0), (advance(':'), expression(0))]
    this.type = 'ternary'
    return this
})
infix('.', 80, function(left) {
    token.type = 'literal'
    state.fake(token)
    this.children = [left, token]
    advance()
    return this
})
infix('[', 80, function(left) {
    this.children = [left, expression(0)]
    this.type = 'binary'
    advance(']')
    return this
})
infix('(', 80, function(left) {
    this.children = [left]
    this.type = 'call'

    if (token.data !== ')')
        while (1) {
            this.children.push(expression(0))
            if (token.data !== ',') break
            advance(',')
        }
    advance(')')
    return this
})

prefix('-')
prefix('+')
prefix('!')
prefix('~')
prefix('defined')
prefix('(', function() {
    this.type = 'group'
    this.children = [expression(0)]
    advance(')')
    return this
})
prefix('++')
prefix('--')
suffix('++')
suffix('--')

assignment('=')
assignment('+=')
assignment('-=')
assignment('*=')
assignment('/=')
assignment('%=')
assignment('&=')
assignment('|=')
assignment('^=')
assignment('>>=')
assignment('<<=')

module_exports = function(incoming_state, incoming_tokens) {
    state = incoming_state
    tokens = incoming_tokens
    idx = 0
    var result

    if (!tokens.length) return

    advance()
    result = expression(0)
    result.parent = state[0]
    emit(result)

    if (idx < tokens.length) {
        throw new Error('did not use all tokens')
    }

    result.parent.children = [result]

    function emit(node) {
        state.unshift(node, false)
        for (var i = 0, len = node.children.length; i < len; ++i) {
            emit(node.children[i])
        }
        state.shift()
    }

}

function symbol(id, binding_power) {
    var sym = symbol_table[id]
    binding_power = binding_power || 0
    if (sym) {
        if (binding_power > sym.lbp) {
            sym.lbp = binding_power
        }
    } else {
        sym = Object.create(original_symbol)
        sym.id = id
        sym.lbp = binding_power
        symbol_table[id] = sym
    }
    return sym
}

function expression(rbp) {
    var left, t = token
    advance()

    left = t.nud()
    while (rbp < token.lbp) {
        t = token
        advance()
        left = t.led(left)
    }
    return left
}

function infix(id, bp, led) {
    var sym = symbol(id, bp)
    sym.led = led || function(left) {
        this.children = [left, expression(bp)]
        this.type = 'binary'
        return this
    }
}

function infixr(id, bp, led) {
    var sym = symbol(id, bp)
    sym.led = led || function(left) {
        this.children = [left, expression(bp - 1)]
        this.type = 'binary'
        return this
    }
    return sym
}

function prefix(id, nud) {
    var sym = symbol(id)
    sym.nud = nud || function() {
        this.children = [expression(70)]
        this.type = 'unary'
        return this
    }
    return sym
}

function suffix(id) {
    var sym = symbol(id, 150)
    sym.led = function(left) {
        this.children = [left]
        this.type = 'suffix'
        return this
    }
}

function assignment(id) {
    return infixr(id, 10, function(left) {
        this.children = [left, expression(9)]
        this.assignment = true
        this.type = 'assign'
        return this
    })
}

function advance(id) {
    var next, value, type, output

    if (id && token.data !== id) {
        return state.unexpected('expected `' + id + '`, got `' + token.data + '`')
    }

    if (idx >= tokens.length) {
        token = symbol_table['(end)']
        return
    }

    next = tokens[idx++]
    value = next.data
    type = next.type

    if (type === 'ident') {
        output = state.scope.find(value) || state.create_node()
        type = output.type
    } else if (type === 'builtin') {
        output = symbol_table['(builtin)']
    } else if (type === 'keyword') {
        output = symbol_table['(keyword)']
    } else if (type === 'operator') {
        output = symbol_table[value]
        if (!output) {
            return state.unexpected('unknown operator `' + value + '`')
        }
    } else if (type === 'float' || type === 'integer') {
        type = 'literal'
        output = symbol_table['(literal)']
    } else {
        return state.unexpected('unexpected token.')
    }

    if (output) {
        if (!output.nud) {
            output.nud = itself
        }
        if (!output.children) {
            output.children = []
        }
    }

    output = Object.create(output)
    output.token = next
    output.type = type
    if (!output.data) output.data = value

    return token = output
}

function fail(message) {
    return function() {
        return state.unexpected(message)
    }
}

GLSL.Scope = function(state) {
    if (this.constructor !== GLSL.Scope)
        return new GLSL.Scope(state);

    this.state = state;
    this.scopes = [];
    this.current = null;
}

GLSL.Scope.prototype = {
    constructor: GLSL.Scope,
    enter: function(s)
    {
        this.current = this.state[0] = s || {};
        this.scopes.push(this.current);
    },

    exit: function()
    {
        this.scopes.pop();
        this.current = this.scopes[this.scopes.length - 1];
    },

    define: function(str)
    {
        this.current[str] = this.state[0];
    },

    find: function(name, fail)
    {
        for (var i = this.scopes.length - 1; i > -1; --i) {
            if (this.scopes[i].hasOwnProperty(name)) {
                return this.scopes[i][name];
            }
        }

        return null
    }
};

// singleton!
var Advance = new Object

var DEBUG = false

var _ = 0
  , IDENT = _++
  , STMT = _++
  , STMTLIST = _++
  , STRUCT = _++
  , FUNCTION = _++
  , FUNCTIONARGS = _++
  , DECL = _++
  , DECLLIST = _++
  , FORLOOP = _++
  , WHILELOOP = _++
  , IF = _++
  , EXPR = _++
  , PRECISION = _++
  , COMMENT = _++
  , PREPROCESSOR = _++
  , KEYWORD = _++
  , KEYWORD_OR_IDENT = _++
  , RETURN = _++
  , BREAK = _++
  , CONTINUE = _++
  , DISCARD = _++
  , DOWHILELOOP = _++
  , PLACEHOLDER = _++
  , QUANTIFIER = _++;

var DECL_ALLOW_ASSIGN = 0x1
  , DECL_ALLOW_COMMA = 0x2
  , DECL_REQUIRE_NAME = 0x4
  , DECL_ALLOW_INVARIANT = 0x8
  , DECL_ALLOW_STORAGE = 0x10
  , DECL_NO_INOUT = 0x20
  , DECL_ALLOW_STRUCT = 0x40
  , DECL_STATEMENT = 0xFF
  , DECL_FUNCTION = DECL_STATEMENT & ~(DECL_ALLOW_ASSIGN | DECL_ALLOW_COMMA | DECL_NO_INOUT | DECL_ALLOW_INVARIANT | DECL_REQUIRE_NAME)
  , DECL_STRUCT = DECL_STATEMENT & ~(DECL_ALLOW_ASSIGN | DECL_ALLOW_INVARIANT | DECL_ALLOW_STORAGE | DECL_ALLOW_STRUCT);

var QUALIFIERS = ['const', 'attribute', 'uniform', 'varying'];

var NO_ASSIGN_ALLOWED = false
  , NO_COMMA_ALLOWED = false;

// map of tokens to stmt types
var token_map = {
    'block-comment': COMMENT,
    'line-comment': COMMENT,
    'preprocessor': PREPROCESSOR
}

// map of stmt types to human
var stmt_type = [
    'ident', 'stmt', 'stmtlist', 'struct', 'function', 'functionargs', 'decl', 'decllist', 'forloop', 'whileloop', 'if', 'expr', 'precision', 'comment', 'preprocessor', 'keyword', 'keyword_or_ident', 'return', 'break', 'continue', 'discard', 'do-while', 'placeholder', 'quantifier'
];

function parser() {
    var stmtlist = n(STMTLIST),
        stmt = n(STMT),
        decllist = n(DECLLIST),
        precision = n(PRECISION),
        ident = n(IDENT),
        keyword_or_ident = n(KEYWORD_OR_IDENT),
        fn = n(FUNCTION),
        fnargs = n(FUNCTIONARGS),
        forstmt = n(FORLOOP),
        ifstmt = n(IF),
        whilestmt = n(WHILELOOP),
        returnstmt = n(RETURN),
        dowhilestmt = n(DOWHILELOOP),
        quantifier = n(QUANTIFIER)

    var parse_struct, parse_precision, parse_quantifier, parse_forloop, parse_if, parse_return, parse_whileloop, parse_dowhileloop, parse_function, parse_function_args

    var stream = through(write, end),
        check = arguments.length ? [].slice.call(arguments) : [],
        ended = false,
        depth = 0,
        state = [],
        tokens = [],
        whitespace = [],
        errored = false,
        program, token, node

    // setup state
    state.shift = special_shift
    state.unshift = special_unshift
    state.fake = special_fake
    state.unexpected = unexpected
    state.scope = new GLSL.Scope(state)
    state.create_node = function() {
        var n = mknode(IDENT, token)
        n.parent = stream.program
        return n
    }

    setup_stative_parsers()

    // setup root node
    node = stmtlist()
    node.expecting = '(eof)'
    node.mode = STMTLIST
    node.token = {
        type: '(program)',
        data: '(program)'
    }
    program = node

    stream.program = program
    stream.scope = function(scope) {
        if (arguments.length === 1)
            state.scope = scope;

        return state.scope;
    }

    state.unshift(node)
    return stream

    // stream functions ---------------------------------------------

    function write(input) {
        if (input.type === 'whitespace' || input.type === 'line-comment' || input.type === 'block-comment') {

            whitespace.push(input)
            return
        }
        tokens.push(input)
        token = token || tokens[0]

        if (token && whitespace.length) {
            token.preceding = token.preceding || []
            token.preceding = token.preceding.concat(whitespace)
            whitespace = []
        }

        while (take()) switch (state[0].mode) {
            case STMT:
                parse_stmt();
                break
            case STMTLIST:
                parse_stmtlist();
                break
            case DECL:
                parse_decl();
                break
            case DECLLIST:
                parse_decllist();
                break
            case EXPR:
                parse_expr();
                break
            case STRUCT:
                parse_struct(true, true);
                break
            case PRECISION:
                parse_precision();
                break
            case IDENT:
                parse_ident();
                break
            case KEYWORD:
                parse_keyword();
                break
            case KEYWORD_OR_IDENT:
                parse_keyword_or_ident();
                break
            case FUNCTION:
                parse_function();
                break
            case FUNCTIONARGS:
                parse_function_args();
                break
            case FORLOOP:
                parse_forloop();
                break
            case WHILELOOP:
                parse_whileloop();
                break
            case DOWHILELOOP:
                parse_dowhileloop();
                break
            case RETURN:
                parse_return();
                break
            case IF:
                parse_if();
                break
            case QUANTIFIER:
                parse_quantifier();
                break
        }
    }

    function end(tokens) {
        if (arguments.length) {
            write(tokens)
        }

        if (state.length > 1) {
            unexpected('unexpected EOF')
            return
        }

        stream.emit('end')
    }

    function take() {
        if (errored || !state.length)
            return false

        return (token = tokens[0]) && !stream.paused
    }

    // ----- state manipulation --------

    function special_fake(x) {
        state.unshift(x)
        state.shift()
    }

    function special_unshift(_node, add_child) {
        _node.parent = state[0]

        var ret = [].unshift.call(this, _node)

        add_child = add_child === undefined ? true : add_child

        if (DEBUG) {
            var pad = ''
            for (var i = 0, len = this.length - 1; i < len; ++i) {
                pad += ' |'
            }
            console.log(pad, '\\' + _node.type, _node.token.data)
        }

        if (add_child && node !== _node) node.children.push(_node)
        node = _node

        return ret
    }

    function special_shift() {
        var _node = [].shift.call(this),
            okay = check[this.length],
            emit = false

        if (DEBUG) {
            var pad = ''
            for (var i = 0, len = this.length; i < len; ++i) {
                pad += ' |'
            }
            console.log(pad, '/' + _node.type)
        }

        if (check.length) {
            if (typeof check[0] === 'function') {
                emit = check[0](_node)
            } else if (okay !== undefined) {
                emit = okay.test ? okay.test(_node.type) : okay === _node.type
            }
        } else {
            emit = true
        }

        if (emit && !errored) stream.emit('data', _node)

        node = _node.parent
        return _node
    }

    // parse states ---------------

    function parse_stmtlist() {
        // determine the type of the statement
        // and then start parsing
        return stative(
            function() {
                state.scope.enter();
                return Advance
            }, normal_mode
        )()

        function normal_mode() {
            if (token.data === state[0].expecting) {
                return state.scope.exit(), state.shift()
            }
            switch (token.type) {
                case 'preprocessor':
                    state.fake(adhoc())
                    tokens.shift()
                    return
                default:
                    state.unshift(stmt())
                    return
            }
        }
    }

    function parse_stmt() {
        if (state[0].brace) {
            if (token.data !== '}') {
                return unexpected('expected `}`, got ' + token.data)
            }
            state[0].brace = false
            return tokens.shift(), state.shift()
        }
        switch (token.type) {
            case 'eof':
                return got_eof()
            case 'keyword':
                switch (token.data) {
                    case 'for':
                        return state.unshift(forstmt());
                    case 'if':
                        return state.unshift(ifstmt());
                    case 'while':
                        return state.unshift(whilestmt());
                    case 'do':
                        return state.unshift(dowhilestmt());
                    case 'break':
                        return state.fake(mknode(BREAK, token)), tokens.shift()
                    case 'continue':
                        return state.fake(mknode(CONTINUE, token)), tokens.shift()
                    case 'discard':
                        return state.fake(mknode(DISCARD, token)), tokens.shift()
                    case 'return':
                        return state.unshift(returnstmt());
                    case 'precision':
                        return state.unshift(precision());
                }
                return state.unshift(decl(DECL_STATEMENT))
            case 'ident':
                var lookup
                if (lookup = state.scope.find(token.data)) {
                    if (lookup.parent.type === 'struct') {
                        // this is strictly untrue, you could have an
                        // expr that starts with a struct constructor.
                        //      ... sigh
                        return state.unshift(decl(DECL_STATEMENT))
                    }
                    return state.unshift(expr(';'))
                }
            case 'operator':
                if (token.data === '{') {
                    state[0].brace = true
                    var n = stmtlist()
                    n.expecting = '}'
                    return tokens.shift(), state.unshift(n)
                }
                if (token.data === ';') {
                    return tokens.shift(), state.shift()
                }
            default:
                return state.unshift(expr(';'))
        }
    }

    function got_eof() {
        if (ended) errored = true
        ended = true
        return state.shift()
    }

    function parse_decl() {
        var stmt = state[0]

        return stative(
            invariant_or_not,
            storage_or_not,
            parameter_or_not,
            precision_or_not,
            struct_or_type,
            maybe_name,
            maybe_lparen, // lparen means we're a function
            is_decllist,
            done
        )()

        function invariant_or_not() {
            if (token.data === 'invariant') {
                if (stmt.flags & DECL_ALLOW_INVARIANT) {
                    state.unshift(keyword())
                    return Advance
                } else {
                    return unexpected('`invariant` is not allowed here')
                }
            } else {
                state.fake(mknode(PLACEHOLDER, {
                    data: '',
                    position: token.position
                }))
                return Advance
            }
        }

        function storage_or_not() {
            if (token.is_storage()) {
                if (stmt.flags & DECL_ALLOW_STORAGE) {
                    state.unshift(keyword())
                    return Advance
                } else {
                    return unexpected('storage is not allowed here')
                }
            } else {
                state.fake(mknode(PLACEHOLDER, {
                    data: '',
                    position: token.position
                }))
                return Advance
            }
        }

        function parameter_or_not() {
            if (token.is_parameter()) {
                if (!(stmt.flags & DECL_NO_INOUT)) {
                    state.unshift(keyword())
                    return Advance
                } else {
                    return unexpected('parameter is not allowed here')
                }
            } else {
                state.fake(mknode(PLACEHOLDER, {
                    data: '',
                    position: token.position
                }))
                return Advance
            }
        }

        function precision_or_not() {
            if (token.is_precision()) {
                state.unshift(keyword())
                return Advance
            } else {
                state.fake(mknode(PLACEHOLDER, {
                    data: '',
                    position: token.position
                }))
                return Advance
            }
        }

        function struct_or_type() {
            if (token.data === 'struct') {
                if (!(stmt.flags & DECL_ALLOW_STRUCT)) {
                    return unexpected('cannot nest structs')
                }
                state.unshift(struct())
                return Advance
            }

            if (token.type === 'keyword') {
                state.unshift(keyword())
                return Advance
            }

            var lookup = state.scope.find(token.data)

            if (lookup) {
                state.fake(Object.create(lookup))
                tokens.shift()
                return Advance
            }
            return unexpected('expected user defined type, struct or keyword, got ' + token.data)
        }

        function maybe_name() {
            if (token.data === ',' && !(stmt.flags & DECL_ALLOW_COMMA)) {
                return state.shift()
            }

            if (token.data === '[') {
                // oh lord.
                state.unshift(quantifier())
                return
            }

            if (token.data === ')') return state.shift()

            if (token.data === ';') {
                return stmt.stage + 3
            }

            if (token.type !== 'ident' && token.type !== 'builtin') {
                return unexpected('expected identifier, got ' + token.data)
            }

            stmt.collected_name = tokens.shift()
            return Advance
        }

        function maybe_lparen() {
            if (token.data === '(') {
                tokens.unshift(stmt.collected_name)
                delete stmt.collected_name
                state.unshift(fn())
                return stmt.stage + 2
            }
            return Advance
        }

        function is_decllist() {
            tokens.unshift(stmt.collected_name)
            delete stmt.collected_name
            state.unshift(decllist())
            return Advance
        }

        function done() {
            return state.shift()
        }
    }

    function parse_decllist() {
        // grab ident

        if (token.type === 'ident') {
            var name = token.data
            state.unshift(ident())
            state.scope.define(name)
            return
        }

        if (token.type === 'operator') {

            if (token.data === ',') {
                // multi-decl!
                if (!(state[1].flags & DECL_ALLOW_COMMA)) {
                    return state.shift()
                }

                return tokens.shift()
            } else if (token.data === '=') {
                if (!(state[1].flags & DECL_ALLOW_ASSIGN)) return unexpected('`=` is not allowed here.')

                tokens.shift()

                state.unshift(expr(',', ';'))
                return
            } else if (token.data === '[') {
                state.unshift(quantifier())
                return
            }
        }
        return state.shift()
    }

    function parse_keyword_or_ident() {
        if (token.type === 'keyword') {
            state[0].type = 'keyword'
            state[0].mode = KEYWORD
            return
        }

        if (token.type === 'ident') {
            state[0].type = 'ident'
            state[0].mode = IDENT
            return
        }

        return unexpected('expected keyword or user-defined name, got ' + token.data)
    }

    function parse_keyword() {
        if (token.type !== 'keyword') {
            return unexpected('expected keyword, got ' + token.data)
        }

        return state.shift(), tokens.shift()
    }

    function parse_ident() {
        if (token.type !== 'ident') {
            return unexpected('expected user-defined name, got ' + token.data)
        }

        state[0].data = token.data
        return state.shift(), tokens.shift()
    }


    function parse_expr() {
        var expecting = state[0].expecting

        state[0].tokens = state[0].tokens || []

        if (state[0].parenlevel === undefined) {
            state[0].parenlevel = 0
            state[0].bracelevel = 0
        }
        if (state[0].parenlevel < 1 && expecting.indexOf(token.data) > -1) {
            return parseexpr(state[0].tokens)
        }
        if (token.data === '(') {
            ++state[0].parenlevel
        } else if (token.data === ')') {
            --state[0].parenlevel
        }

        switch (token.data) {
            case '{':
                ++state[0].bracelevel;
                break
            case '}':
                --state[0].bracelevel;
                break
            case '(':
                ++state[0].parenlevel;
                break
            case ')':
                --state[0].parenlevel;
                break
        }

        if (state[0].parenlevel < 0) return unexpected('unexpected `)`')
        if (state[0].bracelevel < 0) return unexpected('unexpected `}`')

        state[0].tokens.push(tokens.shift())
        return

        function parseexpr(tokens) {
            try {
                full_parse_expr(state, tokens)
            } catch (err) {
                stream.emit('error', err)
                errored = true
            }

            return state.shift()
        }
    }

    // node types ---------------

    function n(type) {
        // this is a function factory that suffices for most kinds of expressions and statements
        return function() {
            return mknode(type, token)
        }
    }

    function adhoc() {
        return mknode(token_map[token.type], token, node)
    }

    function decl(flags) {
        var _ = mknode(DECL, token, node)
        _.flags = flags

        return _
    }

    function struct(allow_assign, allow_comma) {
        var _ = mknode(STRUCT, token, node)
        _.allow_assign = allow_assign === undefined ? true : allow_assign
        _.allow_comma = allow_comma === undefined ? true : allow_comma
        return _
    }

    function expr() {
        var n = mknode(EXPR, token, node)

        n.expecting = [].slice.call(arguments)
        return n
    }

    function keyword(default_value) {
        var t = token
        if (default_value) {
            t = {
                'type': '(implied)',
                data: '(default)',
                position: t.position
            }
        }
        return mknode(KEYWORD, t, node)
    }

    // utils ----------------------------

    function unexpected(str) {
        errored = true
        stream.emit('error', new Error(
            (str || 'unexpected ' + state) +
            ' at line ' + state[0].token.line
        ))
    }

    function assert(type, data) {
        return 1,
            assert_null_string_or_array(type, token.type) &&
            assert_null_string_or_array(data, token.data)
    }

    function assert_null_string_or_array(x, y) {
        switch (typeof x) {
            case 'string':
                if (y !== x) {
                    unexpected('expected `' + x + '`, got ' + y + '\n' + token.data);
                }
                return !errored

            case 'object':
                if (x && x.indexOf(y) === -1) {
                    unexpected('expected one of `' + x.join('`, `') + '`, got ' + y);
                }
                return !errored
        }
        return true
    }

    // stative ----------------------------

    function stative() {
        var steps = [].slice.call(arguments),
            step, result

        return function() {
            var current = state[0]

            current.stage || (current.stage = 0)

            step = steps[current.stage]
            if (!step) return unexpected('parser in undefined state!')

            result = step()

            if (result === Advance) return ++current.stage
            if (result === undefined) return
            current.stage = result
        }
    }

    function advance(op, t) {
        t = t || 'operator'
        return function() {
            if (!assert(t, op)) return

            var last = tokens.shift(),
                children = state[0].children,
                last_node = children[children.length - 1]

            if (last_node && last_node.token && last.preceding) {
                last_node.token.succeeding = last_node.token.succeeding || []
                last_node.token.succeeding = last_node.token.succeeding.concat(last.preceding)
            }
            return Advance
        }
    }

    function advance_expr(until) {
        return function() {
            return state.unshift(expr(until)), Advance
        }
    }

    function advance_ident(declare) {
        return declare ? function() {
            var name = token.data
            return assert('ident') && (state.unshift(ident()), state.scope.define(name), Advance)
        } : function() {
            if (!assert('ident')) return

            var s = Object.create(state.scope.find(token.data))
            s.token = token

            return (tokens.shift(), Advance)
        }
    }

    function advance_stmtlist() {
        return function() {
            var n = stmtlist()
            n.expecting = '}'
            return state.unshift(n), Advance
        }
    }

    function maybe_stmtlist(skip) {
        return function() {
            var current = state[0].stage
            if (token.data !== '{') {
                return state.unshift(stmt()), current + skip
            }
            return tokens.shift(), Advance
        }
    }

    function popstmt() {
        return function() {
            return state.shift(), state.shift()
        }
    }


    function setup_stative_parsers() {

        // could also be
        // struct { } decllist
        parse_struct =
            stative(
                advance('struct', 'keyword'),
                function() {
                    if (token.data === '{') {
                        state.fake(mknode(IDENT, {
                            data: '',
                            position: token.position,
                            type: 'ident'
                        }))
                        return Advance
                    }

                    return advance_ident(true)()
                },
                function() {
                    state.scope.enter();
                    return Advance
                }, advance('{'),
                function() {
                    if (token.type === 'preprocessor') {
                        state.fake(adhoc())
                        tokens.shift()
                        return
                    }
                    if (token.data === '}') {
                        state.scope.exit()
                        tokens.shift()
                        return state.shift()
                    }
                    if (token.data === ';') {
                        tokens.shift();
                        return
                    }
                    state.unshift(decl(DECL_STRUCT))
                }
            )

        parse_precision =
            stative(
                function() {
                    return tokens.shift(), Advance
                },
                function() {
                    return assert(
                        'keyword', ['lowp', 'mediump', 'highp']
                    ) && (state.unshift(keyword()), Advance)
                },
                function() {
                    return (state.unshift(keyword()), Advance)
                },
                function() {
                    return state.shift()
                }
            )

        parse_quantifier =
            stative(
                advance('['), advance_expr(']'), advance(']'),
                function() {
                    return state.shift()
                }
            )

        parse_forloop =
            stative(
                advance('for', 'keyword'), advance('('),
                function() {
                    var lookup
                    if (token.type === 'ident') {
                        if (!(lookup = state.scope.find(token.data))) {
                            lookup = state.create_node()
                        }

                        if (lookup.parent.type === 'struct') {
                            return state.unshift(decl(DECL_STATEMENT)), Advance
                        }
                    } else if (token.type === 'builtin' || token.type === 'keyword') {
                        return state.unshift(decl(DECL_STATEMENT)), Advance
                    }
                    return advance_expr(';')()
                }, advance(';'), advance_expr(';'), advance(';'), advance_expr(')'), advance(')'), maybe_stmtlist(3), advance_stmtlist(), advance('}'), popstmt()
            )

        parse_if =
            stative(
                advance('if', 'keyword'), advance('('), advance_expr(')'), advance(')'), maybe_stmtlist(3), advance_stmtlist(), advance('}'),
                function() {
                    if (token.data === 'else') {
                        return tokens.shift(), state.unshift(stmt()), Advance
                    }
                    return popstmt()()
                }, popstmt()
            )

        parse_return =
            stative(
                advance('return', 'keyword'),
                function() {
                    if (token.data === ';') return Advance
                    return state.unshift(expr(';')), Advance
                },
                function() {
                    tokens.shift(), popstmt()()
                }
            )

        parse_whileloop =
            stative(
                advance('while', 'keyword'), advance('('), advance_expr(')'), advance(')'), maybe_stmtlist(3), advance_stmtlist(), advance('}'), popstmt()
            )

        parse_dowhileloop =
            stative(
                advance('do', 'keyword'), maybe_stmtlist(3), advance_stmtlist(), advance('}'), advance('while', 'keyword'), advance('('), advance_expr(')'), advance(')'), popstmt()
            )

        parse_function =
            stative(
                function() {
                    for (var i = 1, len = state.length; i < len; ++i)
                        if (state[i].mode === FUNCTION) {
                            return unexpected('function definition is not allowed within another function')
                        }

                    return Advance
                },
                function() {
                    if (!assert("ident")) return

                    var name = token.data,
                        lookup = state.scope.find(name)

                    state.unshift(ident())
                    state.scope.define(name)

                    state.scope.enter(lookup ? lookup.scope : null)
                    return Advance
                }, advance('('),
                function() {
                    return state.unshift(fnargs()), Advance
                }, advance(')'),
                function() {
                    // forward decl
                    if (token.data === ';') {
                        return state.scope.exit(), state.shift(), state.shift()
                    }
                    return Advance
                }, advance('{'), advance_stmtlist(), advance('}'),
                function() {
                    state.scope.exit();
                    return Advance
                },
                function() {
                    return state.shift(), state.shift(), state.shift()
                }
            )

        parse_function_args =
            stative(
                function() {
                    if (token.data === 'void') {
                        state.fake(keyword());
                        tokens.shift();
                        return Advance
                    }
                    if (token.data === ')') {
                        state.shift();
                        return
                    }
                    if (token.data === 'struct') {
                        state.unshift(struct(NO_ASSIGN_ALLOWED, NO_COMMA_ALLOWED))
                        return Advance
                    }
                    state.unshift(decl(DECL_FUNCTION))
                    return Advance
                },
                function() {
                    if (token.data === ',') {
                        tokens.shift();
                        return 0
                    }
                    if (token.data === ')') {
                        state.shift();
                        return
                    }
                    unexpected('expected one of `,` or `)`, got ' + token.data)
                }
            )
    }
}

function mknode(mode, sourcetoken) {
    return {
        mode: mode,
        token: sourcetoken,
        children: [],
        type: stmt_type[mode],
        id: (Math.random() * 0xFFFFFFFF).toString(16)
    }
}

})();

return GLSL;
});
