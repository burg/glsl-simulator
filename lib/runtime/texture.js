var Runtime = {};
Runtime.vec = require('./vector').vec;
Runtime.Vec3 = require('./vector').Vec3;
Runtime.Vec4 = require('./vector').Vec4;

var Texture = {
    textures: {},
};

Texture.sampler = function(type, name) {
    this.type = type;
    this.name = name;
}

Texture.textureLoad = function(url) {
    // TODO load image from a url
    // call this.textureAdd to add it to the texture map
}

Texture.textureAdd = function(sampler, dimension, arr) {
    var name = sampler.name;
    this.textures[name] = {
        dimension: dimension,
        data: arr,
        nx: arr.length,
        ny: arr[0].length,
        nz: arr[0][0].length,
    };
}

Texture.texture2D = function(sampler, coord) {
    if (coord.dimensions() == 2)
        return this._textureX(sampler, coord);
    throw new Error("dimension of coord is not equal to 2.");
}

Texture.textureCube = function(sampler, coord) {
    if (coord.dimensions() == 3)
        return this._textureX(sampler, coord);
    throw new Error("dimension of coord is not equal to 3.");
}

Texture.texture2DProj = function(sampler, coord) {
    if (coord.dimensions() == 3)
        return this._textureX(sampler, coord.get("xy").divide(coord.get(2)));

    if (coord.dimensions() == 4)
        return this._textureX(sampler, coord.get("xy").divide(coord.get(3)));
}

Texture._textureX = function(sampler, coord) {
    var texture = this.textures[sampler.name];
	var d = texture.data;
    if (coord instanceof Runtime.vec && coord.dimensions() == 2) {
        var x = coord.get(0) * texture.nx - 1;
        var y = coord.get(1) * texture.ny - 1;

        // linear interpolation
        var xl = Math.floor(x);
        var yl = Math.floor(y);
        var xr = Math.ceil(x);
        var yr = Math.ceil(y);
		var a1 = x - xl;
		var a2 = xr - x;
		var b1 = y - yl;
		var b2 = yr - y;

        var arr = [];
        for (var i in d[xl][yl]) {
			if (yl == yr && xl == xr)
				arr.push(d[xl][yl][i]);
			else if (yl == yr)
				arr.push(a1 * d[xl][yl][i] + a2 * d[xr][yl][i]);
			else if (xl == xr)
				arr.push(b1 * d[xl][yl][i] + b2 * d[xl][yr][i]);
			else
				arr.push(b1 * (a1 * d[xl][yl][i] + a2 * d[xr][yl][i])
				+ b2 * (a1 * d[xl][yr][i] + a2 * d[xr][yr][i]));
        }

        return Runtime.Vec4.apply(null, arr);
    } else if (coord instanceof Runtime.vec && coord.dimensions() == 3) {
        var x = coord.get(0) * texture.nx - 1;
        var y = coord.get(1) * texture.nx - 1;
        var z = coord.get(2) * texture.nx - 1;

        // linear interpolation
        var xl = Math.floor(x);
        var yl = Math.floor(y);
        var zl = Math.floor(z);
        var xr = Math.ceil(x);
        var yr = Math.ceil(y);
        var zr = Math.ceil(z);
		var a1 = x - xl;
		var a2 = xr - x;
		var b1 = y - yl;
		var b2 = yr - y;
		var c1 = z - zl;
		var c2 = zr - z;

        var arr = [];
		for (var i in d[xl][yl][zl]) {
			if (xl == xr && yl == yr && zl == zr)
				arr.push(d[xl][yl][zl][i]);
			else if (xl == xr && yl == yr)
				arr.push(c1 * d[xl][yl][zl][i] + c2 * d[xl][yl][zr][i]);
			else if (yl == yr && zl == zr)
				arr.push(a1 * d[xl][yl][zl][i] + a2 * d[xr][yl][zl][i]);
			else if (zl == zr && xl == xr)
				arr.push(b1 * d[xl][yl][zl][i] + b2 * d[xl][yr][zl][i]);
			else if (xl == xr)
				arr.push(b1 * (c1 * d[xl][yl][zl][i] + c2 * d[xl][yl][zr][i])
				+ b2 * (c1 * d[xl][yr][zl][i] + c2 * d[xl][yr][zr][i]));
			else if (yl == yr)
				arr.push(a1 * (c1 * d[xl][yl][zl][i] + c2 * d[xl][yl][zr][i])
				+ a2 * (c1 * d[xr][yl][zl][i] + c2 * d[xr][yl][zr][i]));
			else if (zl == zr)
				arr.push(b1 * (a1 * d[xl][yl][zl][i] + a2 * d[xr][yl][zl][i])
				+ b2 * (a1 * d[xl][yr][zl][i] + a2 * d[xr][yr][zl][i]));
			else
				arr.push(a1 * b1 * (c1 * d[xl][yl][zl][i] + c2 * d[xl][yl][zr][i])
				+ a1 * b2 * (c1 * d[xl][yr][zl][i] + c2 * d[xl][yr][zr][i])
				+ a2 * b1 * (c1 * d[xr][yl][zl][i] + c2 * d[xr][yl][zr][i])
				+ a2 * b2 * (c1 * d[xr][yr][zl][i] + c2 * d[xr][yr][zr][i]));
		}

        return Runtime.Vec4.apply(null, arr);
    }
}

module.exports = Texture;
