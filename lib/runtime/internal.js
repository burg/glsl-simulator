var Runtime = {};
var vector = require('./vector');
Runtime.vec = vector.vec;
Runtime.Vec2 = vector.Vec2;
Runtime.Vec3 = vector.Vec3;
Runtime.Vec4 = vector.Vec4;

var Internal = {}

Internal._evalVec = function() {
    var func = arguments[arguments.length - 1];

    r = Runtime.vec(arguments[0]).cast();
    for (var i = 0; i < arguments[0].dimensions(); i++) {
        var arr = [];
        for (var j = 0; j < arguments.length - 1; j++)
            arr.push(arguments[j].get(i));
        r.set(i, func.apply(this, arr));
    }
    return r;
}

Internal._extVec = function(x, ref) {
    if (x instanceof Runtime.vec)
        return x;

    switch (ref.dimensions()) {
    case 2: return Runtime.Vec2(x);
    case 3: return Runtime.Vec3(x);
    case 4: return Runtime.Vec4(x);
    default:
    }

    return x;
}

Internal._compare = function(x, y, op) {
    var r = Runtime.vec(x).subtract(x);
    if (op == "<") {
        for (var i = 0; i < x.dimensions(); i++)
            r.set(i, x.get(i) < y.get(i) ? 1 : 0);
    } else if (op == "<=") {
        for (var i = 0; i < x.dimensions(); i++)
            r.set(i, x.get(i) <= y.get(i) ? 1 : 0);
    } else if (op == ">") {
        for (var i = 0; i < x.dimensions(); i++)
            r.set(i, x.get(i) > y.get(i) ? 1 : 0);
    } else if (op == ">=") {
        for (var i = 0; i < x.dimensions(); i++)
            r.set(i, x.get(i) >= y.get(i) ? 1 : 0);
    } else if (op == "==") {
        for (var i = 0; i < x.dimensions(); i++)
            r.set(i, x.get(i) == y.get(i) ? 1 : 0);
    } else if (op == "!=") {
        for (var i = 0; i < x.dimensions(); i++)
            r.set(i, x.get(i) != y.get(i) ? 1 : 0);
    }

    return r;
}

Internal._op_check = function() {
    for (var i = 0; i < arguments.length; i++) {
        if (!(arguments[i] instanceof Runtime.vec))
            throw new Error("Expected argument to be instanceof Runtime.vec!");

        if (i > 0 && arguments[i].dimensions() != arguments[i - 1].dimensions())
            throw new Error("Expected binary operands to have the same dimensions!");
    }

    return true;
}

Internal._checkNumber = function() {
    for (var i = 0; i < arguments.length; i++)
        if (typeof arguments[i] !== 'number')
            return false;
    return true;
}

Internal.pos = function(x) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, arguments.callee);
    return +x;
}

Internal.neg = function(x) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, arguments.callee);
    return -x;
}

Internal.bnot = function(x) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, arguments.callee);
    return ~x;
}

Internal.lnot = function(x) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, arguments.callee);
    return !x;
}

Internal.mod = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, this._extVec(y, x), arguments.callee);
    return x - Math.floor(x / y) * y;
}

Internal.shl = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x << y;
}

Internal.shr = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x >> y;
}

Internal.lt = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x < y;
}

Internal.gt = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x > y;
}

Internal.le = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x <= y;
}

Internal.ge = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x >= y;
}

Internal.band = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x & y;
}

Internal.bxor = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x ^ y;
}

Internal.bor = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x | y;
}

Internal.land = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x && y;
}

Internal.lxor = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return (x && !y) || (!x && y);
}

Internal.lor = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x || y;
}

Internal.bxor = function(x, y) {
    if (x instanceof Runtime.vec)
        return this._evalVec(x, y, arguments.callee);
    return x ^ y;
}

module.exports = Internal;
