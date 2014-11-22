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
		return new vec(arguments);
	}

	if (argv.length < 2 || argv.length > 4) {
		// throws an error
		console.error("the number of arguments to r.vec is out of bounds.");
		return;
	}
	this.argv = argv;
	return this;
}

vec.prototype.length = function() {
	return this.argv.length;
}

vec.prototype.add = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.argv)
		this.argv[i] += v.argv[i];
}

vec.prototype.minus = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.argv)
		this.argv[i] -= v.argv[i];
}

vec.prototype.multiply = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.argv)
		this.argv[i] *= v.argv[i];
}

vec.prototype.divide = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.argv)
		this.argv[i] /= v.argv[i];
}

vec.prototype._op_check = function(v) {
	if (!(v instanceof vec)) {
		console.error("argument to vec.add() is not a vec.");
		return false;
	}

	if (v.length() != this.length()) {
		console.error("unable to add two vecs of different lengths.");
		return false;
	}
	
	return true;
}

return vec;
});
