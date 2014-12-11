Runtime = {};

Runtime.vec = function(d) {
    if (!(this instanceof Runtime.vec)) {
        var arr = [];
        for (var i in arguments) {
            // from vec
            if (arguments[i] instanceof Runtime.vec)
                arr = arr.concat(arguments[i].get().slice());
            // from number
            else if (typeof arguments[i] === 'number')
                arr.push(arguments[i]);
        }
        return new Runtime.vec(arr);
    }

    this.d = d;
    return this;
}

Runtime.vec.prototype = {
    constructor: Runtime.vec,

    cast: function()
    {
        // same dimension casting: from vec to vec? (? = 2 or 3 or 4)
        if (arguments.length == 0 || arguments[0] == this.dimensions()) {
            switch (this.dimensions()) {
            case 2: return new Runtime.Vec2(this.d);
            case 3: return new Runtime.Vec3(this.d);
            case 4: return new Runtime.Vec4(this.d);
            default:
            }
            return this;
        }

        var dim = arguments[0];

        // from high to low
        if (dim < this.dimensions()) {
            this.d.splice(dim, this.dimensions() - dim);
            return this.cast();
        }

        // from low to high
        if (this.dimensions() == 1) {
            for (var i = 1; i < dim; i++)
                this.d.push(this.d[0]);
            return this.cast();
        }

        return this;
    },

    get: function()
    {
        if (arguments.length == 0)
            return this.d;

        var i = arguments[0];
        // if i is a string: xyzw, rgba, or stpq, return vec
        if (typeof i === 'string') {
            var arr = [];
            for (var j in i) {
                switch(i[j]) {
                case 'x':
                case 'r':
                case 's':
                    arr.push(this.d[0]);
                    break;
                case 'y':
                case 'g':
                case 't':
                    if (this.dimensions() >= 2)
                        arr.push(this.d[1]);
                    break;
                case 'z':
                case 'b':
                case 'p':
                    if (this.dimensions() >= 3)
                        arr.push(this.d[2]);
                    break;
                case 'w':
                case 'a':
                case 'q':
                    if (this.dimensions() >= 4)
                        arr.push(this.d[3]);
                    break;
                default:
                }
            }
            if (arr.length == 1)
                return arr[0];
            return Runtime.vec.apply(null, arr).cast();
        }

        // if i is a number, return number
        if (i >= this.dimensions())
            return null;

        return this.d[i];
    },

    set: function(selector, value)
    {
        if (typeof selector === 'number') {
            if (selector < this.dimensions())
                this.d[selector] = value;

            return this;
        }

        if (typeof selector === 'string') {
            for (var i = 0; i < selector.length; ++i) {
                var destructuredValue = (typeof value === 'number') ? value : value.get(i);
                switch (selector.charAt(i)) {
                case 'x':
                case 'r':
                case 's':
                    this.set(0, destructuredValue);
                    break;
                case 'y':
                case 'g':
                case 't':
                    if (this.dimensions() >= 2)
                        this.set(1, destructuredValue);
                    break;
                case 'z':
                case 'b':
                case 'p':
                    if (this.dimensions() >= 3)
                        this.set(2, destructuredValue);
                    break;
                case 'w':
                case 'a':
                case 'q':
                    if (this.dimensions() >= 4)
                        this.set(3, destructuredValue);
                    break;
                default:
                    throw new Error("Unknown field or index selector character '" + selector.charAt(i) + "' for Runtime.vec");
                }
            }
            return this;
        }

        throw new Error("Unknown field or index selector '" + selector + "' for Runtime.vec");
    },

    dimensions: function()
    {
        return this.d.length;
    },

    add: function(v)
    {
        if (v instanceof Runtime.vec) {
            for (var i = 0; i < this.d.length; ++i)
                this.d[i] += v.d[i];
        }
        else if (typeof v === 'number') {
            for (var i = 0; i < this.d.length; ++i)
                this.d[i] += v;
        }
        else
            throw new Error("Unexpected argument to vec.add");

        return this;
    },

    negate: function()
    {
        for (var i in this.d)
            this.d[i] = -this.d[i];

        return this;
    },

    subtract: function(v)
    {
        if (v instanceof Runtime.vec) {
            for (var i = 0; i < this.d.length; ++i)
                this.d[i] -= v.d[i];
        }
        else if (typeof v === 'number') {
            for (var i = 0; i < this.d.length; ++i)
                this.d[i] -= v;
        }
        else
            throw new Error("Unexpected argument to vec.subtract");

        return this;
    },

    multiply: function(v)
    {
        // vec .* vec
        if (v instanceof Runtime.vec) {
            if (!this._op_check(v))
                return;

            for (var i in this.d)
                this.d[i] *= v.d[i];
            return this;
        }

        //if (v instanceof mat) {
        //}

        // vec * number
        for (var i in this.d)
            this.d[i] *= v;

        return this;
    },

    divide: function(v)
    {
        if (v instanceof Runtime.vec) {
            for (var i = 0; i < this.d.length; ++i)
                this.d[i] /= v.d[i];
        }
        else if (typeof v === 'number') {
            for (var i = 0; i < this.d.length; ++i)
                this.d[i] /= v;
        }
        else
            throw new Error("Unexpected argument to vec.add");

        return this;
    },

    equal: function(v)
    {
        if (!this._op_check(v))
            return;

        for (var i in this.d)
            if (this.d[i] != v.d[i])
                return false;
        return true;
    },

    dot: function(v)
    {
        if (!this._op_check(v))
            return;

        var r = 0;
        for (var i in this.d)
            r += this.d[i] * v.d[i];
        return r;
    },

    normalize: function()
    {
        var len = this.length();

        for (var i in this.d)
            this.d[i] /= len;

        return this;
    },

    length: function()
    {
        return Math.sqrt(this.length2());
    },

    length2: function()
    {
        var r = 0;
        for (var i in this.d)
            r += this.d[i] * this.d[i];

        return r;
    },

    _op_check: function(v)
    {
        if (!(v instanceof Runtime.vec)) {
            console.error("argument to vec operation is not a vec.");
            return false;
        }

        if (v.dimensions() != this.dimensions()) {
            console.error("unable to operate on two vecs of different dimensions.");
            return false;
        }

        return true;
    },
};

Runtime.Vec2 = function(d) {
    if (!(this instanceof Runtime.Vec2)) {
        return Runtime.vec.apply(null, arguments).cast(2);
    }

    if (d.length != 2) {
        console.error("2 arguments to Vec2 is expected.");
        return;
    }
    this.d = d;
    return this;
}

Runtime.Vec2.prototype = {
    constructor: Runtime.Vec2,
    __proto__: Runtime.vec.prototype,
};

Runtime.Vec3 = function(d) {
    if (!(this instanceof Runtime.Vec3)) {
        return Runtime.vec.apply(null, arguments).cast(3);
    }

    if (d.length != 3) {
        console.error("3 arguments to Vec3 is expected.");
        return;
    }
    this.d = d;
    return this;
}

Runtime.Vec3.prototype = {
    constructor: Runtime.Vec3,
    __proto__: Runtime.vec.prototype,
};

Runtime.Vec3.prototype.cross = function(v) {
    if (v.dimensions() != 3)
        console.error("arguments to Vec3.cross() should be Vec3.");

    return Runtime.Vec3(
        this.get(1) * v.get(2) - this.get(2) * v.get(1),
        this.get(2) * v.get(0) - this.get(0) * v.get(2),
        this.get(0) * v.get(1) - this.get(1) * v.get(0)
    );
}

Runtime.Vec4 = function(d) {
    if (!(this instanceof Runtime.Vec4)) {
        return Runtime.vec.apply(null, arguments).cast(4);
    }

    if (d.length != 4) {
        console.error("4 arguments to Vec4 is expected.");
        return;
    }
    this.d = d;
    return this;
}

Runtime.Vec4.prototype = {
    constructor: Runtime.Vec4,
    __proto__: Runtime.vec.prototype,
};

module.exports = {
    "vec": Runtime.vec,
    "Vec2": Runtime.Vec2,
    "Vec3": Runtime.Vec3,
    "Vec4": Runtime.Vec4
};
