var Runtime = {};
var vector = require('./vector');
var internal = require('./internal');
var texture = require('./texture');
Runtime.vec = vector.vec;
Runtime.Vec2 = vector.Vec2;
Runtime.Vec3 = vector.Vec3;
Runtime.Vec4 = vector.Vec4;

var Builtins = {};

// Angle & Trigonometry Functions [OpenGL ES SL 1.0, Sec 8.1]

Builtins.radians = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return x / 180 * Math.PI;
}

Builtins.degrees = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return x / Math.PI * 180;
}

Builtins.sin = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.sin(x);
}

Builtins.cos = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.cos(x);
}

Builtins.tan = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.tan(x);
}

Builtins.asin = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.asin(x);
}

Builtins.acos = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.acos(x);
}

Builtins.atan = function(x) {
    if (arguments.length == 2) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, arguments[1], arguments.callee);
        return Math.atan2(x, arguments[1]);
    }

    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.atan(x);
}

// Exponential Functions [OpenGL ES SL 1.0, Sec. 8.2]

Builtins.pow = function(x, y) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, y, arguments.callee);
    return Math.pow(x, y);
}

Builtins.exp = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.exp(x);
}

Builtins.log = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.log(x);
}

Builtins.exp2 = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.pow(2, x);
}

Builtins.log2 = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.log(x) / Math.log(2);
}

Builtins.sqrt = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.sqrt(x);
}

Builtins.inversesqrt = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return 1 / Math.sqrt(x);
}

// Common Functions [OpenGL ES SL 1.0, Sec. 8.3]

Builtins.abs = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return x >= 0 ? x : -x;
}

Builtins.sign = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    if (x == 0) return 0;
    return x > 0 ? 1 : -1;
}

Builtins.floor = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.floor(x);
}

Builtins.ceil = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return Math.ceil(x);
}

Builtins.fract = function(x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, arguments.callee);
    return x - Builtins.floor(x);
}

Builtins.mod = function(x, y) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, internal._extVec(y, x), arguments.callee);
    return x - Math.floor(x / y) * y;
}

Builtins.min = function(x, y) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, internal._extVec(y, x), arguments.callee);
    return x < y ? x : y;
}

Builtins.max = function(x, y) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, internal._extVec(y, x), arguments.callee);
    return x > y ? x : y;
}

Builtins.clamp = function(x, minVal, maxVal) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, internal._extVec(minVal, x), internal._extVec(maxVal, x), arguments.callee);
    if (minVal > maxVal)
        console.error("[error] minVal is larger than maxVal.");
    return Builtins.min(Builtins.max(x, minVal), maxVal);
}

Builtins.mix = function(x, y, alpha) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(x, y, internal._extVec(alpha, x), arguments.callee);
    if (alpha < 0 || alpha > 1)
        console.error("[error] alpha should be within range [0, 1].");
    return alpha * x + (1 - alpha) * y;
}

Builtins.step = function(edge, x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(internal._extVec(edge, x), x, arguments.callee);
    return x < edge ? 0 : 1;
}

Builtins.smoothstep = function(edge0, edge1, x) {
    if (x instanceof Runtime.vec)
        return internal._evalVec(internal._extVec(edge0, x), internal._extVec(edge1, x), x, arguments.callee);
    var t = Builtins.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

// Geometric Functions [OpenGL ES SL 1.0, Sec. 8.4]

Builtins.length = function(v) {
    if (internal._checkNumber(v))
        return Math.abs(v);

    if (!internal._op_check(v))
        return null;

    return v.length();
}

Builtins.distance = function(x, y) {
    if (internal._checkNumber(x, y))
        return Math.abs(x - y);

    if (!internal._op_check(x, y))
        return null;

    var r = Runtime.vec(x).minus(y);
    return Builtins.length(r);
}

Builtins.dot = function(x, y) {
    if (internal._checkNumber(x, y))
        return x * y;

    if (!internal._op_check(x, y))
        return null;

    return x.dot(y);
}

Builtins.cross = function(x, y) {
    if (!internal._op_check(x, y))
        return null;

    if (x.dimensions() != 3)
        console.error("x cross y requires x and y of 3 dimensions.");

    return Runtime.Vec3(x).cross(y);
}

Builtins.normalize = function(x) {
    if (internal._checkNumber(x)) {
        if (x == 0)
            return x;
        return x / Math.abs(x);
    }

    if (!internal._op_check(x))
        return null;

    return x.normalize();
}

// TODO make it work when arguments are float?
Builtins.faceforward = function(N, I, Nref) {
    if (!internal._op_check(I, N, Nref))
        return null;

    // TODO do we expect to change N?
    var r = Builtins.dot(Nref, I) < 0 ? Runtime.vec(N) : Runtime.vec(N).negate();
    return r.cast();
}

// TODO make it work when arguments are float?
Builtins.reflect = function(I, N) {
    if (!internal._op_check(I, N))
        return null;

    var temp = Builtins.dot(I, N) * 2;
    return Runtime.vec(I).minus(Runtime.vec(N).multiply(temp)).cast();
}

// TODO check the correctness
// TODO make it work when arguments are float?
Builtins.refract = function(I, N, eta) {
    if (!internal._op_check(I, N))
        return null;

    var k = 1 - eta * eta * (1 - Builtins.dot(I, N) * Builtins.dot(I, N));

    if (k < 0)
        return Runtime.vec(I).minus(I);
    var r = eta * Builtins.dot(I, N) + Math.sqrt(k);

    return Runtime.vec(I).multiply(eta).minus(Runtime.vec(N).multiply(r)).cast();
}

// Matrix Functions [OpenGL ES SL 1.0, Sec. 8.5]

Builtins.matrixCompMult = function(a, b)
{
    return a.matrixCompMult(b);
}

// Vector Relational Functions [OpenGL ES SL 1.0, Sec. 8.6]

Builtins.lessThan = function(x, y) {
    return internal._compare(x, y, "<");
}

Builtins.lessThanEqual = function(x, y) {
    return internal._compare(x, y, "<=");
}

Builtins.greaterThan = function(x, y) {
    return internal._compare(x, y, ">");
}

Builtins.greaterThanEqual = function(x, y) {
    return internal._compare(x, y, ">=");
}

Builtins.equal = function(x, y) {
    return internal._compare(x, y, "==");
}

Builtins.notEqual = function(x, y) {
    return internal._compare(x, y, "!=");
}

Builtins.any = function(x) {
    for (var i = 0; i < x.dimensions(); i++)
        if (x.get(i))
            return true;

    return false;
}

Builtins.all = function(x) {
    for (var i = 0; i < x.dimensions(); i++)
        if (!x.get(i))
            return false;

    return true;
}

Builtins.not = function(x) {
    var r = Runtime.vec(x);
    for (var i = 0; i < x.dimensions(); i++)
        r.set(i, x.get(i) ? 0 : 1);

    return r;
}

Builtins.texture2DLod = function(sampler, coord, lod) {
    return texture.texture2D(sampler, coord, lod);
}

Builtins.texture2DProjLod = function(sampler, coord, lod) {
    return texture.texture2DProj(sampler, coord, lod);
}

Builtins.textureCubeLod = function(sampler, coord, lod) {
    return texture.textureCube(sampler, coord, lod);
}

Builtins.texture2D = function(sampler, coord) {
    if (arguments.length == 3)
        return texture.texture2D(sampler, coord, arguments[2]);

    return texture.texture2D(sampler, coord);
}

Builtins.texture2DProj = function(sampler, coord) {
    if (arguments.length == 3)
        return texture.texture2DProj(sampler, coord, arguments[2]);

    return texture.texture2DProj(sampler, coord);
}

Builtins.textureCube = function(sampler, coord) {
    if (arguments.length == 3)
        return texture.textureCube(sampler, coord, arguments[2]);

    return texture.textureCube(sampler, coord);
}

module.exports = Builtins;
