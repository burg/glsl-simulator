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

GLSL.Token = function(type, data, line, column)
{
    this.type = type;
    this.data = data;
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
    },

    is_comment: function()
    {
        return this.type === 'line-comment' || this.type === 'block-comment';
    },

    is_whitespace: function()
    {
        return this.type === 'whitespace';
    }
};

GLSL.Node = function(mode, token, parent)
{
    this.mode = mode;
    this.token = token;
    this.type = stmt_type[mode];
    this.id = (Math.random() * 0xFFFFFFFF).toString(16);

    this.parent = parent;
    this.children = [];
};

GLSL.parse = function() {
    if (!GLSL.__parser)
        throw new Error("No GLSL parser detected, make sure to include glsl-parser.js.");

    return GLSL.__parser.parse.apply(GLSL.__parser, Array.prototype.slice.call(arguments));
}

return GLSL;
})();
