var vec = require('./vec');

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
        if (x.get(i))
            return true;

    return false;
}

vecfunc.all = function(x) {
    if (!this._op_check(x)) {
        console.error("vectors sent for comparison fail to pass sanity checks.");
        return false;
    }

    for (var i = 0; i < x.dimensions(); i++)
        if (!x.get(i))
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
        r.set(i, x.get(i) ? 0 : 1);

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

module.exports = vecfunc;
