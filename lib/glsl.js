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

return GLSL;
});
