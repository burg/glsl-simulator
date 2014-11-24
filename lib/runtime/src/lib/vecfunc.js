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
 * vecfunc
 */
var vecfunc = {};

vecfunc.lessThan = function(x, y) {
	return this._compare(x, y, "<");
}

vecfunc.lessThanEqual = function(x, y) {
	return this._compare(x, y, "<=");
}

vecfunc.greaterThan = function(x, y) {
	return this._compare(x, y, ">");
}

vecfunc.greaterThanEqual = function(x, y) {
	return this._compare(x, y, ">=");
}

vecfunc.equal = function(x, y) {
	return this._compare(x, y, "==");
}

vecfunc.notEqual = function(x, y) {
	return this._compare(x, y, "!=");
}

vecfunc.any = function(x) {
	if (!this._op_check(x)) {
		console.error("vectors sent for comparison fail to pass sanity checks.");
		return false;
	}

	for (var i = 0; i < x.dimensions(); i++)
		if (x.argv[i])
			return true;

	return false;
}

vecfunc.all = function(x) {
	if (!this._op_check(x)) {
		console.error("vectors sent for comparison fail to pass sanity checks.");
		return false;
	}

	for (var i = 0; i < x.dimensions(); i++)
		if (!x.argv[i])
			return false;

	return true;
}

vecfunc.not = function(x) {
	if (!this._op_check(x)) {
		console.error("vectors sent for comparison fail to pass sanity checks.");
		return false;
	}

	var r = vec(x);
	for (var i = 0; i < x.dimensions(); i++)
		r.argv[i] = (x.argv[i]) ? 0 : 1;

	return r;
}

vecfunc._compare = function(x, y, op) {
	if (!this._op_check(x, y)) {
		console.error("vectors sent for comparison fail to pass sanity checks.");
		return false;
	}

	var r = vec(x).minus(x);
	if (op == "<") {
		for (var i = 0; i < x.dimensions(); i++)
			r.argv[i] = x.argv[i] < y.argv[i] ? 1 : 0;
	} else if (op == "<=") {
		for (var i = 0; i < x.dimensions(); i++)
			r.argv[i] = x.argv[i] <= y.argv[i] ? 1 : 0;
	} else if (op == ">") {
		for (var i = 0; i < x.dimensions(); i++)
			r.argv[i] = x.argv[i] > y.argv[i] ? 1 : 0;
	} else if (op == ">=") {
		for (var i = 0; i < x.dimensions(); i++)
			r.argv[i] = x.argv[i] >= y.argv[i] ? 1 : 0;
	} else if (op == "==") {
		for (var i = 0; i < x.dimensions(); i++)
			r.argv[i] = x.argv[i] == y.argv[i] ? 1 : 0;
	} else if (op == "!=") {
		for (var i = 0; i < x.dimensions(); i++)
			r.argv[i] = x.argv[i] != y.argv[i] ? 1 : 0;
	}

	return r;
}

vecfunc._op_check = function() {
	var d = 0;
	for (var i in arguments) {
		var v = arguments[i];
		if (!(v instanceof vec))
			return false;
		if (d == 0)
			d = v.dimensions();
		if (v.dimensions() != d)
			return false;
	}

	return true;
}

return vecfunc;
});
