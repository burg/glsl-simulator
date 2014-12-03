var vec = require('./vec');

var mat = function(argv) {
    if (!(this instanceof mat)) {
        var d = [];

        // construct by a mat
        if (arguments[0] instanceof mat) {
            var n = arguments[0].d.length;
            for (var i = 0; i < n; i++) {
                d.push(arguments[0].d[i].slice());
            }
            return new mat(d);
        }

        // construct by a set of vec
        if (arguments[0] instanceof vec) {
            var n = arguments.length;
            for (var i = 0; i < n; i++)
                d.push([]);
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < n; j++) {
                    if (j < arguments[i].dimensions())
                        d[j].push(arguments[i].get(j));
                    else
                        d[j].push(0);
                }
            }
            return new mat(d);
        }

        // construct by numbers
        // we only take the first n * n numbers and ignore the rest
        var n = Math.floor(Math.sqrt(arguments.length));
        for (var i = 0; i < n; i++)
                d.push([]);
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++)
                d[j].push(arguments[i * n + j]);
        }
        return new mat(d);
    }

    // store as a 2d array
    this.d = argv;
    return this;
}

mat.prototype = {
    constructor: mat,

    cast: function()
    {
        // same dimension casting: from mat to mat? (? = 2 or 3 or 4)
        if (arguments.length == 0 || arguments[0] == this.dimensions()) {
            switch (this.dimensions()) {
            case 2:
                var Mat2 = require('./Mat2');
                return new Mat2(this.d);
            case 3:
                var Mat3 = require('./Mat3');
                return new Mat3(this.d);
            case 4:
                var Mat4 = require('./Mat4');
                return new Mat4(this.d);
            default:
            }
            return this;
        }

        var dim = arguments[0];

        // from high to low
        if (dim < this.dimensions()) {
            this.d.splice(dim, this.dimensions() - dim);
            for (var i in this.d) {
                this.d[i].splice(dim, this.d[i].length - dim);
            }
            return this.cast();
        }

        // from low to high
        var f = this.dimensions() == 1 ? this.d[0][0] : 1;
        for (var i in this.d)
            for (var j = this.dimensions(); j < dim; j++)
                this.d[i].push(0);
        for (var i = this.dimensions(); i < dim; i++) {
            this.d.push([]);
            for (var j = 0; j < dim; j++) {
                if (i == j)
                    this.d[i].push(f);
                else
                    this.d[i].push(0);
            }
        }
        return this.cast()
    },

    get: function()
    {
        if (arguments.length == 0)
            return null;

        // process the first argument
        var i = arguments[0];
        if (i >= this.dimensions())
            return null;

        var v = vec.apply(null, this.d[i]);

        if (arguments.length == 1)
            return v.cast();

        // process the second argument
        var j = arguments[1];
        return v.get(j);
    },

    set: function()
    {
        if (arguments.length < 2)
            return this;

        // process the first argument
        var i = arguments[0];
        if (i >= this.dimensions())
            return this;

        // set a vec using one argument
        if (arguments.length == 2) {
            var v = arguments[1];

            for (var j = 0; j < this.dimensions(); j++) {
                if (j < v.dimensions())
                    this.d[i][j] = v.get(j);
                else
                    this.d[i][j] = 0;
            }
            return this;
        }

        // set a number or vec using two arguments
        var j = arguments[1];
        var k = arguments[2];

        var v = vec.apply(null, this.d[i]).set(j, k);

        if (typeof v === 'number') {
            this.d[i][j] = v;
            return this;
        }

        this.d[i] = v.d;

        return this;
    },

    dimensions: function()
    {
        return this.d.length;
    },

    equal: function(m)
    {
        if (!this._op_check(m))
            return false;

        if (this.dimensions() != m.dimensions())
            return false;

        for (var i = 0; i < this.dimensions(); i++)
            for (var j = 0; j < this.dimensions(); j++)
                if (this.d[i][j] != m.d[i][j])
                    return false;

        return true;
    },

    add: function(m)
    {
        return this._op(m, "+");
    },

    minus: function(m)
    {
        return this._op(m, "-");
    },

    matrixCompMult: function(m)
    {
        return this._op(m, "*");
    },

    divide: function(m)
    {
        return this._op(m, "/");
    },

    multiply: function(m)
    {
        // mat * mat
        // TODO set the resulting mat to this
        if (m instanceof mat) {
            if (!this._op_check(m))
                return this;

            var t = mat(m).minus(m); // set zero matrix
            for (var i = 0; i < this.dimensions(); i++)
                for (var j = 0; j < this.dimensions(); j++)
                    for (var k = 0; k < this.dimensions(); k++)
                        t.d[j][i] += this.d[k][i] * m.d[j][k];
            return t;
        }

        // mat * vec
        if (m instanceof vec) {
            if (!this._op_check_vec(v))
                return this;

            var t = vec(m).minus(m);
            for (var i = 0; i < this.dimensions(); i++) {
                var f = 0;
                for (var j = 0; j < this.dimensions(); j++)
                    f += this.d[j][i] * m.get(j);
                t.set(i, f);
            }
            return t;
        }

        // mat * number
        for (var i = 0; i < this.dimensions(); i++)
            for (var j = 0; j < this.dimensions(); j++)
                this.d[i][j] *= m;

        return this;
    },

    _op: function(m, op)
    {
        if (!this._op_check(m))
            return this;

        for (var i = 0; i < this.dimensions(); i++)
            for (var j = 0; j < this.dimensions(); j++) {
                if (op == "+")
                    this.d[i][j] += m.d[i][j];
                else if (op == "-")
                    this.d[i][j] -= m.d[i][j];
                else if (op == "*")
                    this.d[i][j] *= m.d[i][j];
                else if (op == "/")
                    this.d[i][j] /= m.d[i][j];
            }

        return this;
    },

    _op_check: function(m)
    {
        if (!(m instanceof mat)) {
            console.error("argument to mat operation is not a mat.");
            return false;
        }

        if (m.dimensions() != this.dimensions()) {
            console.error("unable to operate on two mats of different dimensions.");
            return false;
        }

        return true;
    },

    _op_check_vec: function(m)
    {
        if (!(m instanceof vec)) {
            console.error("argument is not a vec.");
            return false;
        }

        if (m.dimensions() != this.dimensions()) {
            console.error("unable to operate on mat and vec of different dimensions.");
            return false;
        }

        return true;
    }
};

var Mat2 = function(d) {
    if (!(this instanceof Mat2)) {
        return mat.apply(null, arguments).cast(2);
    }

    if (d.length != 2) {
        console.error("2 arguments to Mat2 is expected.");
        return;
    }
    this.d = d;
    return this;
};

Mat2.prototype = {
    constructor: Mat2,
    __proto__: mat.prototype,
};

var Mat3 = function(d) {
    if (!(this instanceof Mat3)) {
        return mat.apply(null, arguments).cast(3);
    }

    if (d.length != 3) {
        console.error("3 dimensions of Mat3 is expected.");
        return;
    }
    this.d = d;
    return this;
};

Mat3.prototype = {
    constructor: Mat3,
    __proto__: mat.prototype,
};

var Mat4 = function(d) {
    if (!(this instanceof Mat4)) {
        return mat.apply(null, arguments).cast(4);
    }

    if (d.length != 4) {
        console.error("4 dimensions of Mat4 is expected.");
        return;
    }
    this.d = d;
    return this;
};

Mat4.prototype = {
    constructor: Mat4,
    __proto__: mat.prototype,
};

module.exports = {
    "mat": mat,
    "Mat2": Mat2,
    "Mat3": Mat3,
    "Mat4": Mat4
};
