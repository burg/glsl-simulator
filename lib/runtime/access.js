var Runtime = {};
Runtime.vec = require('./vector').vec;
Runtime.mat = require("./matrix").mat;

var access = {};

access.get = function() {
    if (arguments.length == 0)
        return;

    var x = arguments[0];

    // get from vec
    if (x instanceof Runtime.vec) {
        if (arguments.length < 2)
            return x;

        return x.get(arguments[1]);
    }

    // get from mat
    if (x instanceof Runtime.mat) {
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
    if (x instanceof Runtime.vec) {
        if (arguments.length < 3)
            return x;

        return x.set(arguments[1], arguments[2]);
    }

    // set to mat
    if (x instanceof Runtime.mat) {
        if (arguments.length < 3)
            return x;

        if (arguments.length == 3)
            return x.set(arguments[1], arguments[2]);

        return x.set(arguments[1], arguments[2], arguments[3]);
    }

    return x;
}

module.exports = access;
