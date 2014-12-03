/* Copyright (c) 2014, Sophia Wang.
 * Copyright (c) 2014, Brian Burg <burg@cs.washington.edu>
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

var Runtime = {};

// Add built-in types
Runtime.vec = require('./runtime/vec');
Runtime.vec2 = require('./runtime/vec2');
Runtime.vec3 = require('./runtime/vec3');
Runtime.vec4 = require('./runtime/vec4');
Runtime.mat = require('./runtime/mat');
Runtime.mat2 = require('./runtime/mat2');
Runtime.mat3 = require('./runtime/mat3');
Runtime.mat4 = require('./runtime/mat4');

var access = require('./runtime/access');
var angle = require('./runtime/angle');
var common = require('./runtime/common');
var exponential = require('./runtime/exponential');
var geometric = require('./runtime/geometric');
var vecfunc = require('./runtime/vecfunc');

// Functions
for (var i in access)
    Runtime[i] = access[i];
for (var i in angle)
    Runtime[i] = angle[i];
for (var i in common)
    Runtime[i] = common[i];
for (var i in exponential)
    Runtime[i] = exponential[i];
for (var i in geometric)
    Runtime[i] = geometric[i];
for (var i in vecfunc)
    Runtime[i] = vecfunc[i];

module.exports = Runtime;
