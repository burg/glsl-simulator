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
 * mat
 */
var mat = function(argv) {
	if (!(this instanceof mat)) {
		var d = [];

		// construct by a mat
		if (arguments[0] instanceof mat) {
			var n = arguments[0].d.length;
			for (var i = 0; i < n; i++) {
				d.push(arguments[0].d[i].slice());
			}
			return new mat(d);
		}

		// construct by a set of vec
		if (arguments[0] instanceof vec) {
			var n = arguments.length;
			for (var i = 0; i < n; i++)
				d.push([]);
			for (var i = 0; i < n; i++) {
				for (var j = 0; j < n; j++) {
					if (j < arguments[i].dimensions())
						d[j].push(arguments[i].get(j));
					else
						d[j].push(0);
				}
			}
			return new mat(d);
		}

		// construct by numbers
		// we only take the first n * n numbers and ignore the rest
		var n = Math.floor(Math.sqrt(arguments.length));
		for (var i = 0; i < n; i++)
				d.push([]);
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < n; j++)
				d[j].push(arguments[i * n + j]);
		}
		return new mat(d);
	}

	// store as a 2d array
	this.d = argv;
	return this;
}

mat.prototype.cast = function() {
	// same dimension casting: from mat to mat? (? = 2 or 3 or 4)
	if (arguments.length == 0 || arguments[0] == this.dimensions()) {
		switch (this.dimensions()) {
		case 2:
			var mat2 = require('./mat2');
			return new mat2(this.d);
		case 3:
			var mat3 = require('./mat3');
			return new mat3(this.d);
		case 4:
			var mat4 = require('./mat4');
			return new mat4(this.d);
		default:
		}
		return this;
	}

	var dim = arguments[0];

	// from high to low
	if (dim < this.dimensions()) {
		this.d.splice(dim, this.dimensions() - dim);
		for (var i in this.d) {
			this.d[i].splice(dim, this.d[i].length - dim);
		}
		return this.cast();
	}

	// from low to high
	var f = this.dimensions() == 1 ? this.d[0][0] : 1;
	for (var i in this.d)
		for (var j = this.dimensions(); j < dim; j++)
			this.d[i].push(0);
	for (var i = this.dimensions(); i < dim; i++) {
		this.d.push([]);
		for (var j = 0; j < dim; j++) {
			if (i == j)
				this.d[i].push(f);
			else
				this.d[i].push(0);
		}
	}
	return this.cast()
}

mat.prototype.get = function() {
	if (arguments.length == 0)
		return null;
	
	// process the first argument
	var i = arguments[0];
	if (i >= this.dimensions())
		return null;
	
	var v = vec.apply(null, this.d[i]);

	if (arguments.length == 1)
		return v.cast();

	// process the second argument
	var j = arguments[1];
	return v.get(j);
}

mat.prototype.set = function() {
	if (arguments.length < 2)
		return this;
	
	// process the first argument
	var i = arguments[0];
	if (i >= this.dimensions())
		return this;
	
	// set a vec using one argument
	if (arguments.length == 2) {
		var v = arguments[1];

		for (var j = 0; j < this.dimensions(); j++) {
			if (j < v.dimensions())
				this.d[i][j] = v.get(j);
			else
				this.d[i][j] = 0;
		}
		return this;
	}
	
	// set a number or vec using two arguments
	var j = arguments[1];
	var k = arguments[2];

	var v = vec.apply(null, this.d[i]).set(j, k);

	if (typeof v === 'number') {
		this.d[i][j] = v;
		return this;
	}

	this.d[i] = v.d;

	return this;
}

mat.prototype.dimensions = function() {
	return this.d.length;
}

mat.prototype.equal = function(m) {
	if (!this._op_check(m))
		return false;
	
	if (this.dimensions() != m.dimensions())
		return false;
	
	for (var i = 0; i < this.dimensions(); i++)
		for (var j = 0; j < this.dimensions(); j++)
			if (this.d[i][j] != m.d[i][j])
				return false;

	return true;
}

mat.prototype.add = function(m) {
	return this._op(m, "+");
}

mat.prototype.minus = function(m) {
	return this._op(m, "-");
}

mat.prototype.matrixCompMult = function(m) {
	return this._op(m, "*");
}

mat.prototype.divide = function(m) {
	return this._op(m, "/");
}

mat.prototype.multiply = function(m) {
	// mat * mat
	// TODO set the resulting mat to this
	if (m instanceof mat) {
		if (!this._op_check(m))
			return this;

		var t = mat(m).minus(m); // set zero matrix
		for (var i = 0; i < this.dimensions(); i++)
			for (var j = 0; j < this.dimensions(); j++)
				for (var k = 0; k < this.dimensions(); k++)
					t.d[j][i] += this.d[k][i] * m.d[j][k];
		return t;
	}

	// mat * vec
	if (m instanceof vec) {
		if (!this._op_check_vec(v))
			return this;

		var t = vec(m).minus(m);
		for (var i = 0; i < this.dimensions(); i++) {
			var f = 0;
			for (var j = 0; j < this.dimensions(); j++)
				f += this.d[j][i] * m.get(j);
			t.set(i, f);
		}
		return t;
	}

	// mat * number
	for (var i = 0; i < this.dimensions(); i++)
		for (var j = 0; j < this.dimensions(); j++)
			this.d[i][j] *= m;

	return this;
}

mat.prototype._op = function(m, op) {
	if (!this._op_check(m))
		return this;
	
	for (var i = 0; i < this.dimensions(); i++)
		for (var j = 0; j < this.dimensions(); j++) {
			if (op == "+")
				this.d[i][j] += m.d[i][j];
			else if (op == "-")
				this.d[i][j] -= m.d[i][j];
			else if (op == "*")
				this.d[i][j] *= m.d[i][j];
			else if (op == "/")
				this.d[i][j] /= m.d[i][j];
		}

	return this;
}

mat.prototype._op_check = function(m) {
	if (!(m instanceof mat)) {
		console.error("argument to mat operation is not a mat.");
		return false;
	}

	if (m.dimensions() != this.dimensions()) {
		console.error("unable to operate on two mats of different dimensions.");
		return false;
	}
	
	return true;
}

mat.prototype._op_check_vec = function(m) {
	if (!(m instanceof vec)) {
		console.error("argument is not a vec.");
		return false;
	}

	if (m.dimensions() != this.dimensions()) {
		console.error("unable to operate on mat and vec of different dimensions.");
		return false;
	}
	
	return true;
}

return mat;
});
