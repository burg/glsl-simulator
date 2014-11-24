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
var vec3 = require('./vec3');

/*
 * geometric
 */
var geometric = {};

geometric.len = function(v) {
	if (!this._op_check(v))
		console.error("the argument should be vec.");

	return v.length();
}

geometric.distance = function(x, y) {
	if (!this._op_check(x))
		console.error("the argument should be vec.");
	if (x.dimensions() != y.dimensions())
		console.error("x dot y requires x and y of the same dimension.");

	var r = vec(x).minus(y);
	return this.len(r);
}

geometric.dot = function(x, y) {
	if (!this._op_check(x))
		console.error("the argument should be vec.");
	if (x.dimensions() != y.dimensions())
		console.error("x dot y requires x and y of the same dimension.");

	return x.dot(y);
}

geometric.cross = function(x, y) {
	if (!this._op_check(x))
		console.error("the argument should be vec.");
	if (x.dimensions() != y.dimensions())
		console.error("x cross y requires x and y of the same dimension.");
	if (x.dimensions() != 3)
		console.error("x cross y requires x and y of 3 dimensions.");

	return vec3(x).cross(y);
}

geometric.normalize = function(x) {
	if (!this._op_check(x))
		console.error("the argument should be vec.");

	return x.normalize();
}

geometric.faceforward = function(N, I, Nref) {
	if (!this._op_check(N) || !this._op_check(I) || !this._op_check(Nref))
		console.error("the arguments should be vec.");
	if (N.dimensions() != I.dimensions() || N.dimensions() != Nref.dimensions())
		console.error("N, I, Nref in faceforward() should be of the same dimension.");

	// TODO do we expect to change N?
	return this.dot(Nref, I) < 0 ? vec(N) : vec(N).negate();
}

geometric.reflect = function(I, N) {
	if (!this._op_check(I) || !this._op_check(N))
		console.error("the argument should be vec.");
	if (I.dimensions() != N.dimensions())
		console.error("x cross y requires x and y of the same dimension.");

	var temp = this.dot(I, N) * 2;

	return vec(I).minus(vec(N).multiply(temp));
}

// TODO check the correctness
geometric.refract = function(I, N, eta) {
	if (!this._op_check(I) || !this._op_check(N))
		console.error("the argument should be vec.");
	if (I.dimensions() != N.dimensions())
		console.error("x cross y requires x and y of the same dimension.");

	var k = 1 - eta * eta * (1 - this.dot(I, N) * this.dot(I, N));

	if (k < 0)
		return vec(I).minus(I);
	var r = eta * this.dot(I, N) + Math.sqrt(k);

	return vec(I).multiply(eta).minus(vec(N).multiply(r));
}

geometric._op_check = function(v) {
	if (v instanceof vec)
		return true;

	return false;
}

return geometric;
});
