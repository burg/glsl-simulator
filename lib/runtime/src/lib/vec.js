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
 * vec
 */
var vec = function(argv) {
	if (!(this instanceof vec)) {
		if (arguments[0] instanceof vec)
			return new vec(arguments[0].argv.slice());
		return new vec(Array.prototype.slice.call(arguments, 0));
	}

	this.argv = argv;
	return this;
}

vec.prototype.dimensions = function() {
	return this.argv.length;
}

vec.prototype.add = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.argv)
		this.argv[i] += v.argv[i];

	return this;
}

vec.prototype.negate = function() {
	for (var i in this.argv)
		this.argv[i] = -this.argv[i];

	return this;
}

vec.prototype.minus = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.argv)
		this.argv[i] -= v.argv[i];

	return this;
}

vec.prototype.multiply = function(v) {
	if (v instanceof vec) {
		if (!this._op_check(v))
			return;
	
		for (var i in this.argv)
			this.argv[i] *= v.argv[i];
	} else {
		for (var i in this.argv)
			this.argv[i] *= v;
	}

	return this;
}

vec.prototype.divide = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.argv)
		this.argv[i] /= v.argv[i];

	return this;
}

vec.prototype.equal = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.argv)
		if (this.argv[i] != v.argv[i])
			return false;
	return true;
}

vec.prototype.dot = function(v) {
	if (!this._op_check(v))
		return;
	
	var r = 0;
	for (var i in this.argv)
		r += this.argv[i] * v.argv[i];
	return r;
}

vec.prototype.normalize = function() {
	var len = this.length();

	for (var i in this.argv)
		this.argv[i] /= len;
	
	return this;
}

vec.prototype.length = function() {
	return Math.sqrt(this.length2());
}

vec.prototype.length2 = function() {
	var r = 0;
	for (var i in this.argv)
		r += this.argv[i] * this.argv[i];
	return r;
}

vec.prototype._op_check = function(v) {
	if (!(v instanceof vec)) {
		console.error("argument to vec operation is not a vec.");
		return false;
	}

	if (v.dimensions() != this.dimensions()) {
		console.error("unable to operate on two vecs of different dimensions.");
		return false;
	}
	
	return true;
}

return vec;
});
