/*
 * run test.js using node.js
 */

var r = require('../../lib/runtime');

var options = {
	"vec": [],
};

//(function(r, options) {

var test = {
	'count': 0,
	'failed': 0,
	'_err': 0.02,
}

test.done = function() {
	console.log(this.failed + " / " + this.count + " test(s) failed.");
}

test.func = function() {
	this.count++;

	var len = arguments.length;
	var f = arguments[0];

	// rule out invalid tests
	if (!r[f])
		console.log("[invalid test]:[" + f + "]");

	var input = [];
	for (var i = 1; i < len - 1; i++)
		input.push(arguments[i]);
	var output_expected = arguments[len - 1];
	var output_actual = (r[f]).apply(r, input);

	// compare results
	if (this._compare(output_actual, output_expected)) {
		console.log("[passed]:[" + f + "]");
	} else {
		this.failed++;
		console.error("[failed]:[" + f + "] expected " + output_expected + ", output " + output_actual);
	}
}

test._compare = function(x, y) {
	// compare x and y when they are both vec or mat
	if ((x instanceof r.vec) && (y instanceof r.vec) ||
			(x instanceof r.mat) && (y instanceof r.mat)) {
		return x.equal(y);
	}

	// TODO add sanity checks

	// compare x and y when they are both numbers
	return x >= y - this._err && x <= y + this._err;
}


var v2 = r.Vec2(1, 2);
v2.minus(r.Vec2(5, 2));
console.log(v2);

var v3 = r.Vec3(1, 2, 3);
v3.add(r.Vec3(3, 2, 1));
console.log(v3);

var v4 = r.Vec4(1, 2, 3, 4);
v4.multiply(v4);
console.log(v4);

var v31 = r.Vec3(v3).normalize();
console.log(v3, v31);
console.log(r.cross(v3, v31));

console.log(r.Vec4(r.Vec2(1), 2), r.Vec2(r.Vec3(3)), r.Vec4(4));

// Angle
test.func("radians", 90, 1.57);
//test.func("radians", r.Vec3(90, 90, 180), r.Vec3(1.57, 1.57, 3.14));
//console.log(r.radians(r.Vec3(90, 90, 180)));

// Exponential
test.func("pow", 2, 3, 8);
test.func("sqrt", 9, 3);
test.func("inversesqrt", 16, 0.25);
test.func("pow", r.Vec3(4, 3, 2), r.Vec3(1, 3, 5), r.Vec3(4, 27, 32));
test.func("exp2", r.Vec3(1, 3, 5), r.Vec3(2, 8, 32));

// Common
test.func("fract", 1.5, 0.5);
test.func("sign", -1.1, -1);
test.func("sign", 1111.1, 1);
test.func("sign", 0.0, 0);
test.func("clamp", 10, 20, 22, 20);

// Geometric
test.func("length", r.Vec2(3, 4), 5);
test.func("distance", v2, r.Vec2(v2).normalize(), 3);
test.func("dot", r.Vec2(3, 4), r.Vec2(3, 4), 25);
test.func("dot", 3, 3, 9);
test.func("cross", r.Vec3(1, 2, 0), r.Vec3(2, 4, 0), r.Vec3(0, 0, 0));
test.func("normalize", r.Vec2(4, 0), r.Vec2(1, 0));
test.func("faceforward", r.Vec3(1, 1, 1), v3, v31, r.Vec3(-1, -1, -1));
test.func("reflect", r.Vec3(1, 1, 0), r.Vec3(0, 1, 0), r.Vec3(1, -1, 0));
test.func("refract", r.Vec3(1, 1, 0), r.Vec3(0, 1, 0), 0.5, r.Vec3(0.5, -1, 0));
//console.log(r.refract(r.Vec3(1, 1, 0), r.Vec3(0, 1, 0), 1.5));

// Vector Relational Functions
test.func("lessThan", r.Vec2(1, 2), r.Vec2(3, 2), r.Vec2(1, 0));
test.func("lessThanEqual", r.Vec2(1, 2), r.Vec2(3, 2), r.Vec2(1, 1));
test.func("greaterThan", r.Vec2(1, 2), r.Vec2(3, 2), r.Vec2(0, 0));
test.func("greaterThanEqual", r.Vec2(1, 2), r.Vec2(3, 2), r.Vec2(0, 1));
test.func("equal", r.Vec2(1, 2), r.Vec2(3, 2), r.Vec2(0, 1));
test.func("notEqual", r.Vec2(1, 2), r.Vec2(3, 2), r.Vec2(1, 0));
test.func("any", r.Vec2(1, 0), true);
test.func("any", r.Vec2(0, 0), false);
test.func("all", r.Vec2(1, 0), false);
test.func("all", r.Vec2(10, 10), true);
test.func("not", r.Vec2(10, 0), r.Vec2(0, 1));

// Getters and Setters
test.func("get", r.Vec2(100, 200), 0, 100);
test.func("get", r.Vec3(10, 20, 30), "yywx", r.Vec3(20, 20, 10));
test.func("get", r.Vec3(10, 20, 30), "y", 20);
test.func("set", r.Vec2(100, 200), 0, -100, r.Vec2(-100, 200));
test.func("set", r.Vec2(10, 20), "yywx", r.Vec4(2000, 200, 400, 100), r.Vec2(100, 200));
test.func("set", r.Vec2(10, 20), "ggar", r.Vec4(2000, 200, 400, 100), r.Vec2(100, 200));

test.func("get", r.mat(100, 200, 300, 400), 0, 1, 300);
test.func("get", r.mat(100, 200, 300, 400), 0, r.Vec2(100, 300));
test.func("get", r.mat(100, 200, 300, 400), 0, "y", 300);
test.func("get", r.mat(100, 200, 300, 400), 1, "xy", r.Vec2(200, 400));
test.func("set", r.mat(100, 200, 300, 400), 0, 1, -300, r.mat(100, 200, -300, 400));
test.func("set", r.mat(100, 200, 300, 400), 0, r.Vec3(-1, -3, -4), r.mat(-1, 200, -3, 400));
test.func("set", r.mat(100, 200, 300, 400), 0, "yxy", r.Vec3(-1, -3, -4), r.mat(-3, 200, -4, 400));

// ops tests
test.func("op_pos", r.Vec2(10, -1.4), r.Vec2(10, -1.4));
test.func("op_neg", r.Vec2(10, -1.4), r.Vec2(-10, 1.4));

test.func("op_bnot", r.Vec2(5, 1), r.Vec2(-6, 2)); // wrong
test.func("op_lnot", r.Vec2(10, -1), r.Vec2(false, true)); // wrong
test.func("op_eq", r.Vec2(10, -1,4), r.Vec2(1, -1.4), false);
test.func("op_neq", r.Vec2(10, -1,4), r.Vec2(1, -1.4), true);

test.func("op_mod", 10.5, 2, 0.5);
test.func("op_mod", r.Vec2(10.5, 4.5), r.Vec2(2, 1.5), r.Vec2(0.5, 0));
test.func("op_add", 10.5, 2, 12.5);
test.func("op_add", r.Vec2(10.5, 4.5), r.Vec2(2, 1.5), r.Vec2(12.5, 6));
test.func("op_shl", 1, 2, 4);
test.func("op_shl", r.Vec2(1, 6), r.Vec2(2, 4), r.Vec2(4, 96));

test.done();

var mat0 = r.Mat2(
10, 20,
30, 40
);
console.log(mat0);

var mat1 = r.Mat3(
1, 2, 3,
4, 8, 12,
8, 16, 24, 10
);
console.log(r.Mat4(mat0));
console.log(r.Mat4(4));

var mat2 = r.mat(
r.Vec3(1, 2, 3),
r.Vec2(4, 8),
r.Vec4(8, 16, 24, 9)
);
console.log(mat2);

var mat3 = r.mat(mat2);
mat3.set(1, r.Vec3(4, 8, 12));
console.log(mat3, mat3.equal(mat1));

console.log("mat.add", r.mat(mat1).add(mat3));
console.log("mat.minus", r.mat(mat1).minus(mat3));
console.log("mat.divide", r.mat(mat1).divide(mat3));
console.log("mat.matrixCompMult", r.mat(mat1).matrixCompMult(mat3));
console.log("mat.multiply", r.mat(mat1).multiply(mat3));

// Testing texture lookup
var arr = [];
for (var i = 0; i < 100; i++) {
	var row = [];
	for (var j = 0; j < 200; j++) {
		row.push([1, 0.5, 0.3, 0.1]);
	}
	arr.push(row);
}

var s1 = new r.sampler("aaa", "img1");
r.textureAdd(s1, 2, arr);
var v = r.texture2D(s1, r.Vec2(0.8, 0.8));

console.log(v);

//})(GLSL.r, options)
