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

//var mat = require('./mat');

/*
 * vec
 */
var vec = function(d) {
	if (!(this instanceof vec)) {
		var arr = [];
		for (var i in arguments) {
			// from vec
			if (arguments[i] instanceof vec)
				arr = arr.concat(arguments[i].get().slice());
			// from number
			else if (typeof arguments[i] === 'number')
				arr.push(arguments[i]);
		}
		return new vec(arr);
	}

	this.d = d;
	return this;
}

vec.prototype.cast = function() {
	// same dimension casting: from vec to vec? (? = 2 or 3 or 4)
	if (arguments.length == 0 || arguments[0] == this.dimensions()) {
		switch (this.dimensions()) {
		case 2:
			var vec2 = require('./vec2');
			return new vec2(this.d);
		case 3:
			var vec3 = require('./vec3');
			return new vec3(this.d);
		case 4:
			var vec4 = require('./vec4');
			return new vec4(this.d);
		default:
		}
		return this;
	}

	var dim = arguments[0];

	// from high to low
	if (dim < this.dimensions()) {
		this.d.splice(dim, this.dimensions() - dim);
		return this.cast();
	}

	// from low to high
	if (this.dimensions() == 1) {
		for (var i = 1; i < dim; i++)
			this.d.push(this.d[0]);
		return this.cast();
	}

	return this;
}

vec.prototype.get = function() {
	if (arguments.length == 0)
		return this.d;
	
	var i = arguments[0];
	// if i is a string: xyzw, rgba, or stpq, return vec
	if (typeof i === 'string') {
		var arr = [];
		for (var j in i) {
			switch(i[j]) {
			case 'x':
			case 'r':
			case 's':
				arr.push(this.d[0]);
				break;
			case 'y':
			case 'g':
			case 't':
				if (this.dimensions() >= 2)
					arr.push(this.d[1]);
				break;
			case 'z':
			case 'b':
			case 'p':
				if (this.dimensions() >= 3)
					arr.push(this.d[2]);
				break;
			case 'w':
			case 'a':
			case 'q':
				if (this.dimensions() >= 4)
					arr.push(this.d[3]);
				break;
			default:
			}
		}
		if (arr.length == 1)
			return arr[0];
		return vec.apply(null, arr).cast();
	}

	// if i is a number, return number
	if (i >= this.dimensions())
		return null;

	return this.d[i];
}

vec.prototype.set = function(i, f) {
	// i is a string
	if (typeof i === 'string') {
		for (var j in i) {
			j = parseInt(j); // j was of type string; unclear why
			switch (i[j]) {
			case 'x':
			case 'r':
			case 's':
				this.set(0, f.get(j));
				break;
			case 'y':
			case 'g':
			case 't':
				if (this.dimensions() >= 2)
					this.set(1, f.get(j));
				break;
			case 'z':
			case 'b':
			case 'p':
				if (this.dimensions() >= 3)
					this.set(2, f.get(j));
				break;
			case 'w':
			case 'a':
			case 'q':
				if (this.dimensions() >= 4)
					this.set(3, f.get(j));
				break;
			default:
			}
		}
		return this;
	}

	// i is a number
	if (i >= this.dimensions())
		return this;

	this.d[i] = f;

	return this;
}

vec.prototype.dimensions = function() {
	return this.d.length;
}

vec.prototype.add = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.d)
		this.d[i] += v.d[i];

	return this;
}

vec.prototype.negate = function() {
	for (var i in this.d)
		this.d[i] = -this.d[i];

	return this;
}

vec.prototype.minus = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.d)
		this.d[i] -= v.d[i];

	return this;
}

vec.prototype.multiply = function(v) {
	// vec .* vec
	if (v instanceof vec) {
		if (!this._op_check(v))
			return;
	
		for (var i in this.d)
			this.d[i] *= v.d[i];
		return this;
	}

	//if (v instanceof mat) {
	//}
	
	// vec * number
	for (var i in this.d)
		this.d[i] *= v;

	return this;
}

vec.prototype.divide = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.d)
		this.d[i] /= v.d[i];

	return this;
}

vec.prototype.equal = function(v) {
	if (!this._op_check(v))
		return;
	
	for (var i in this.d)
		if (this.d[i] != v.d[i])
			return false;
	return true;
}

vec.prototype.dot = function(v) {
	if (!this._op_check(v))
		return;
	
	var r = 0;
	for (var i in this.d)
		r += this.d[i] * v.d[i];
	return r;
}

vec.prototype.normalize = function() {
	var len = this.length();

	for (var i in this.d)
		this.d[i] /= len;
	
	return this;
}

vec.prototype.length = function() {
	return Math.sqrt(this.length2());
}

vec.prototype.length2 = function() {
	var r = 0;
	for (var i in this.d)
		r += this.d[i] * this.d[i];

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
