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

var vec = require('./vec');
var vec2 = require('./vec2');
var vec3 = require('./vec3');
var vec4 = require('./vec4');

/*
 * common
 */
var common = {};

common._evalVec = function() {
	var func = arguments[arguments.length - 1];

	r = vec(arguments[0]).cast();
	for (var i = 0; i < arguments[0].dimensions(); i++) {
		var arr = [];
		for (var j = 0; j < arguments.length - 1; j++)
			arr.push(arguments[j].get(i));
		r.set(i, func.apply(this, arr));
	}

	return r;
}

common._extVec = function(x, ref) {
	if (x instanceof vec)
		return x;
	
	switch (ref.dimensions()) {
	case 2:
		return vec2(x);
	case 3:
		return vec3(x);
	case 4:
		return vec4(x);
	default:
	}

	return x;
}

common.abs = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return x >= 0 ? x : -x;
}

common.sign = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	if (x == 0) return 0;
	return x > 0 ? 1 : -1;
}

common.floor = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return Math.floor(x);
}

common.ceil = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return Math.ceil(x);
}

common.fract = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return x - this.floor(x);
}

common.mod = function(x, y) {
	if (x instanceof vec)
		return this._evalVec(x, this._extVec(y, x), arguments.callee);
	return x - Math.floor(x / y) * y;
}

common.min = function(x, y) {
	if (x instanceof vec)
		return this._evalVec(x, this._extVec(y, x), arguments.callee);
	return x < y ? x : y;
}

common.max = function(x, y) {
	if (x instanceof vec)
		return this._evalVec(x, this._extVec(y, x), arguments.callee);
	return x > y ? x : y;
}

common.clamp = function(x, minVal, maxVal) {
	if (x instanceof vec)
		return this._evalVec(x, this._extVec(minVal, x), this._extVec(maxVal, x), arguments.callee);
	if (minVal > maxVal)
		console.error("[error] minVal is larger than maxVal.");
	return this.min(this.max(x, minVal), maxVal);
}

common.mix = function(x, y, alpha) {
	if (x instanceof vec)
		return this._evalVec(x, y, this._extVec(alpha, x), arguments.callee);
	if (alpha < 0 || alpha > 1)
		console.error("[error] alpha should be within range [0, 1].");
	return alpha * x + (1 - alpha) * y;
}

common.step = function(edge, x) {
	if (x instanceof vec)
		return this._evalVec(this._extVec(edge, x), x, arguments.callee);
	return x < edge ? 0 : 1;
}

common.smoothstep = function(edge0, edge1, x) {
	if (x instanceof vec)
		return this._evalVec(this._extVec(edge0, x), this._extVec(edge1, x), x, arguments.callee);
	var t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
	return t * t * (3 - 2 * t);
}

return common;
});
