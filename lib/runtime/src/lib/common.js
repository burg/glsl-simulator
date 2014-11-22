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

/*
 * common
 */
var common = {};

common.abs = function(x) {
	return x >= 0 ? x : -x;
}

common.sign = function(x) {
	if (x == 0) return 0;
	return x > 0 ? 1 : -1;
}

common.floor = function(x) {
	return Math.floor(x);
}

common.ceil = function(x) {
	return Math.ceil(x);
}

common.fract = function(x) {
	return x - this.floor(x);
}

common.mod = function(x, y) {
	return x - Math.floor(x / y) * y;
}

common.min = function(x, y) {
	return x < y ? x : y;
}

common.max = function(x, y) {
	return x > y ? x : y;
}

common.clamp = function(x, minVal, maxVal) {
	if (minVal > maxVal)
		console.error("[error] minVal is larger than maxVal.");
	return this.min(this.max(x, minVal), maxVal);
}

common.mix = function(x, y, alpha) {
	if (alpha < 0 || alpha > 1)
		console.error("[error] alpha should be within range [0, 1].");
	return alpha * x + (1 - alpha) * y;
}

common.step = function(edge, x) {
	return x < edge ? 0 : 1;
}

common.smoothstep = function(edge0, edge1, x) {
	var t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
	return t * t * (3 - 2 * t);
}

return common;
});
