var Runtime = {};
Runtime.vec = require('./vector').vec;

var angle = {};

angle._evalVec = function() {
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

angle.radians = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return x / 180 * Math.PI;
}

angle.degrees = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return x / Math.PI * 180;
}

angle.sin = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return Math.sin(x);
}

angle.cos = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return Math.cos(x);
}

angle.tan = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return Math.tan(x);
}

angle.asin = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return Math.asin(x);
}

angle.acos = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return Math.acos(x);
}

angle.atan = function(x) {
    if (arguments.length == 2) {
        if (x instanceof vec)
            return this._evalVec(x, arguments[1], arguments.callee);
        return Math.atan2(x, arguments[1]);
    }

    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return Math.atan(x);
}

module.exports = angle;
