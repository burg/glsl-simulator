var Runtime = {};
Runtime.vec = require('./vector').vec;
Runtime.Vec3 = require('./vector').Vec3;
Runtime.Vec4 = require('./vector').Vec4;

var texture = {
	textures: {},
};

texture.sampler = function(type, name) {
	this.type = type;
	this.name = name;
}

texture.textureLoad = function(url) {
	// TODO load image from a url
	// call this.textureAdd to add it to the texture map
}

texture.textureAdd = function(sampler, dimension, arr) {
	var name = sampler.name;
	this.textures[name] = {
		dimension: dimension,
		data: arr,
		nx: arr.length,
		ny: arr[0].length,
		nz: arr[0][0].length,
	};
}

texture.texture2D = function(sampler, coord) {
	return this._textureX(sampler, coord);
}

texture.textureCube = function(sampler, coord) {
	return this._textureX(sampler, coord);
}

texture.texture2DProj = function(sampler, coord) {
	if (coord.dimensions() == 3)
		return this._textureX(sampler, coord.get("xy").divide(coord.get(2)));

	if (coord.dimensions() == 4)
		return this._textureX(sampler, coord.get("xy").divide(coord.get(3)));
}

texture._textureX = function(sampler, coord) {
	var texture = this.textures[sampler.name];
	if (coord instanceof Runtime.vec && coord.dimensions() == 2) {
		var x = Math.round(coord.get(0) * texture.nx);
		var y = Math.round(coord.get(1) * texture.nx);
		var arr = texture.data[x][y];
		return Runtime.Vec3(arr);
	} else if (coord instanceof Runtime.vec && coord.dimensions() == 3) {
		var x = Math.round(coord.get(0) * texture.nx);
		var y = Math.round(coord.get(1) * texture.nx);
		var z = Math.round(coord.get(2) * texture.nx);
		var arr = texture.data[x][y][z];
		return Runtime.Vec4(arr);
	}
}

module.exports = texture;
