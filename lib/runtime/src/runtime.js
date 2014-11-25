/* Copyright (c) 2014, Sophia Wang.
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

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		module.exports = mod();
	else if (typeof define = "function" && define.amd) // AMD
		return define([], mod);
	else // Plain browser env
		this.GLSL = mod();
})(function() {

////////////// TODO remove when batched up with other libs
// Add built-in types
var vec = require('./lib/vec');
var vec2 = require('./lib/vec2');
var vec3 = require('./lib/vec3');
var vec4 = require('./lib/vec4');
var mat = require('./lib/mat');
// Add built-in functions
var access = require('./lib/access');
var angle = require('./lib/angle');
var common = require('./lib/common');
var exponential = require('./lib/exponential');
var geometric = require('./lib/geometric');
var vecfunc = require('./lib/vecfunc');

function GLSL() {}

function r() {}

////////////// Types
r.vec = vec;
r.vec2 = vec2;
r.vec3 = vec3;
r.vec4 = vec4;
r.mat = mat;

////////////// Functions
for (var i in access)
	r[i] = access[i];
for (var i in angle)
	r[i] = angle[i];
for (var i in common)
	r[i] = common[i];
for (var i in exponential)
	r[i] = exponential[i];
for (var i in geometric)
	r[i] = geometric[i];
for (var i in vecfunc)
	r[i] = vecfunc[i];

GLSL.r = r;
return GLSL;

});
