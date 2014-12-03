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
var mat = require('./mat');

/*
 * access
 */
var access = {};

access.get = function() {
	if (arguments.length == 0)
		return;
	
	var x = arguments[0];
	
	// get from vec
	if (x instanceof vec) {
		if (arguments.length < 2)
			return x;

		return x.get(arguments[1]);
	}

	// get from mat
	if (x instanceof mat) {
		if (arguments.length < 2)
			return x;

		if (arguments.length == 2)
			return x.get(arguments[1]);

		return x.get(arguments[1], arguments[2]);
	}

	// get from others (self)
	return x;
}

access.set = function() {
	if (arguments.length == 0)
		return;
	
	var x = arguments[0];

	// set to vec
	if (x instanceof vec) {
		if (arguments.length < 3)
			return x;

		return x.set(arguments[1], arguments[2]);
	}

	// set to mat
	if (x instanceof mat) {
		if (arguments.length < 3)
			return x;

		if (arguments.length == 3)
			return x.set(arguments[1], arguments[2]);

		return x.set(arguments[1], arguments[2], arguments[3]);
	}

	return x;
}

return access;
});
