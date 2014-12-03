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

var vec = require('./vec');
var vec3 = require('./vec3');

var geometric = {};

geometric._evalVec = function() {
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

geometric._checkNumber = function() {
    for (var i = 0; i < arguments.length; i++)
        if (typeof arguments[i] !== 'number')
            return false;
    return true;
}

geometric.len = function(v) {
    if (this._checkNumber(v))
        return Math.abs(v);

    if (!this._op_check(v))
        return null;

    return v.length();
}

geometric.distance = function(x, y) {
    if (this._checkNumber(x, y))
        return Math.abs(x - y);

    if (!this._op_check(x, y))
        return null;

    var r = vec(x).minus(y);
    return this.len(r);
}

geometric.dot = function(x, y) {
    if (this._checkNumber(x, y))
        return x * y;

    if (!this._op_check(x, y))
        return null;

    return x.dot(y);
}

geometric.cross = function(x, y) {
    if (!this._op_check(x, y))
        return null;

    if (x.dimensions() != 3)
        console.error("x cross y requires x and y of 3 dimensions.");

    return vec3(x).cross(y);
}

geometric.normalize = function(x) {
    if (this._checkNumber(x)) {
        if (x == 0)
            return x;
        return x / Math.abs(x);
    }

    if (!this._op_check(x))
        return null;

    return x.normalize();
}

// TODO make it work when arguments are float?
geometric.faceforward = function(N, I, Nref) {
    if (!this._op_check(I, N, Nref))
        return null;

    // TODO do we expect to change N?
    var r = this.dot(Nref, I) < 0 ? vec(N) : vec(N).negate();
    return r.cast();
}

// TODO make it work when arguments are float?
geometric.reflect = function(I, N) {
    if (!this._op_check(I, N))
        return null;

    var temp = this.dot(I, N) * 2;
    return vec(I).minus(vec(N).multiply(temp)).cast();
}

// TODO check the correctness
// TODO make it work when arguments are float?
geometric.refract = function(I, N, eta) {
    if (!this._op_check(I, N))
        return null;

    var k = 1 - eta * eta * (1 - this.dot(I, N) * this.dot(I, N));

    if (k < 0)
        return vec(I).minus(I);
    var r = eta * this.dot(I, N) + Math.sqrt(k);

    return vec(I).multiply(eta).minus(vec(N).multiply(r)).cast();
}

geometric._op_check = function() {
    for (var i = 0; i < arguments.length; i++) {
        if (!(arguments[i] instanceof vec)) {
            console.error("the argument should be vec.");
            return false;
        }

        if (i > 0 && arguments[i].dimensions() != arguments[i - 1].dimensions()) {
            console.error("x _op_ y requires x and y of the same dimension.");
            return false;
        }
    }

    return true;
}

module.exports = geometric;
