var vec = function(d) {
    if (!(this instanceof vec)) {
        var arr = [];
        for (var i in arguments) {
            // from vec
            if (arguments[i] instanceof vec)
                arr = arr.concat(arguments[i].get().slice());
            // from number
            else if (typeof arguments[i] === 'number')
                arr.push(arguments[i]);
        }
        return new vec(arr);
    }

    this.d = d;
    return this;
}

vec.prototype = {
    constructor: vec,

    cast: function()
    {
        // same dimension casting: from vec to vec? (? = 2 or 3 or 4)
        if (arguments.length == 0 || arguments[0] == this.dimensions()) {
            switch (this.dimensions()) {
            case 2: return new Vec2(this.d);
            case 3: return new Vec3(this.d);
            case 4: return new Vec4(this.d);
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
            return vec.apply(null, arr).cast();
        }

        // if i is a number, return number
        if (i >= this.dimensions())
            return null;

        return this.d[i];
    },

    set: function(i, f)
    {
        // i is a string
        if (typeof i === 'string') {
            for (var j in i) {
                j = parseInt(j); // j was of type string; unclear why
                switch (i[j]) {
                case 'x':
                case 'r':
                case 's':
                    this.set(0, f.get(j));
                    break;
                case 'y':
                case 'g':
                case 't':
                    if (this.dimensions() >= 2)
                        this.set(1, f.get(j));
                    break;
                case 'z':
                case 'b':
                case 'p':
                    if (this.dimensions() >= 3)
                        this.set(2, f.get(j));
                    break;
                case 'w':
                case 'a':
                case 'q':
                    if (this.dimensions() >= 4)
                        this.set(3, f.get(j));
                    break;
                default:
                }
            }
            return this;
        }

        // i is a number
        if (i >= this.dimensions())
            return this;

        this.d[i] = f;

        return this;
    },

    dimensions: function()
    {
        return this.d.length;
    },

    add: function(v)
    {
        if (!this._op_check(v))
            return;

        for (var i in this.d)
            this.d[i] += v.d[i];

        return this;
    },

    negate: function()
    {
        for (var i in this.d)
            this.d[i] = -this.d[i];

        return this;
    },

    minus: function(v)
    {
        if (!this._op_check(v))
            return;

        for (var i in this.d)
            this.d[i] -= v.d[i];

        return this;
    },

    multiply: function(v)
    {
        // vec .* vec
        if (v instanceof vec) {
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
        if (!this._op_check(v))
            return;

        for (var i in this.d)
            this.d[i] /= v.d[i];

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
        if (!(v instanceof vec)) {
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

var Vec2 = function(d) {
    if (!(this instanceof Vec2)) {
        return vec.apply(null, arguments).cast(2);
    }

    if (d.length != 2) {
        console.error("2 arguments to Vec2 is expected.");
        return;
    }
    this.d = d;
    return this;
}

Vec2.prototype = {
    constructor: Vec2,
    __proto__: vec.prototype,
};

var Vec3 = function(d) {
    if (!(this instanceof Vec3)) {
        return vec.apply(null, arguments).cast(3);
    }

    if (d.length != 3) {
        console.error("3 arguments to Vec3 is expected.");
        return;
    }
    this.d = d;
    return this;
}

Vec3.prototype = {
    constructor: Vec3,
    __proto__: vec.prototype,
};

Vec3.prototype.cross = function(v) {
    if (v.dimensions() != 3)
        console.error("arguments to Vec3.cross() should be Vec3.");

    return Vec3(
        this.get(1) * v.get(2) - this.get(2) * v.get(1),
        this.get(2) * v.get(0) - this.get(0) * v.get(2),
        this.get(0) * v.get(1) - this.get(1) * v.get(0)
    );
}

var Vec4 = function(d) {
    if (!(this instanceof Vec4)) {
        return vec.apply(null, arguments).cast(4);
    }

    if (d.length != 4) {
        console.error("4 arguments to Vec4 is expected.");
        return;
    }
    this.d = d;
    return this;
}

Vec4.prototype = {
    constructor: Vec4,
    __proto__: vec.prototype,
};

module.exports = {
    "vec": vec,
    "Vec2": Vec2,
    "Vec3": Vec3,
    "Vec4": Vec4
};

