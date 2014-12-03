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

/*
 * angle
 */
var angle = {};

angle._evalVec = function() {
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

angle.radians = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return x / 180 * Math.PI;
}

angle.degrees = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return x / Math.PI * 180;
}

angle.sin = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return Math.sin(x);
}

angle.cos = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return Math.cos(x);
}

angle.tan = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return Math.tan(x);
}

angle.asin = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return Math.asin(x);
}

angle.acos = function(x) {
	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return Math.acos(x);
}

angle.atan = function(x) {
	if (arguments.length == 2) {
		if (x instanceof vec)
			return this._evalVec(x, arguments[1], arguments.callee);
		return Math.atan2(x, arguments[1]);
	}

	if (x instanceof vec)
		return this._evalVec(x, arguments.callee);
	return Math.atan(x);
}

return angle;
});
