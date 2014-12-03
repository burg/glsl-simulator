var vec = require('./vec');

var exponential = {};

exponential._evalVec = function() {
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

exponential.pow = function(x, y) {
    if (x instanceof vec)
        return this._evalVec(x, y, arguments.callee);
    return Math.pow(x, y);
}

exponential.exp = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return Math.exp(x);
}

exponential.log = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return Math.log(x);
}

exponential.exp2 = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return Math.pow(2, x);
}

exponential.log2 = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return Math.log(x) / Math.log(2);
}

exponential.sqrt = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return Math.sqrt(x);
}

exponential.inversesqrt = function(x) {
    if (x instanceof vec)
        return this._evalVec(x, arguments.callee);
    return 1 / Math.sqrt(x);
}

module.exports = exponential;
