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

mat.prototype.get = function() {
	if (arguments.length == 1) {
		var i = arguments[0];

		// TODO sanity checks
		return 0;
	}

	var i = arguments[0], j = arguments[1];
	if (i >= this.dimensions() || j >= this.dimensions())
		return null;

	return this.d[j][i];
}

mat.prototype.set = function(i, v) {
	if (i >= this.dimensions())
		return this;
	
	for (var j = 0; j < this.dimensions(); j++)
		this.d[j][i] = v.get(j);

	return this;
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

mat.prototype.dimensions = function() {
	return this.d.length;
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
