/*
 * run test.js using node.js
 */

var r = require('../src/runtime').r;

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


var v2 = r.vec2(1, 2);
v2.minus(r.vec2(5, 2));
console.log(v2);

var v3 = r.vec3(1, 2, 3);
v3.add(r.vec3(3, 2, 1));
console.log(v3);

var v4 = r.vec4(1, 2, 3, 4);
v4.multiply(v4);
console.log(v4);

var v31 = r.vec3(v3).normalize();
console.log(v3, v31);
console.log(r.cross(v3, v31));

console.log(r.vec4(r.vec2(1), 2), r.vec2(r.vec3(3)), r.vec4(4));

// Angle
test.func("radians", 90, 1.57);

// Exponential
test.func("pow", 2, 3, 8);
test.func("sqrt", 9, 3);
test.func("inversesqrt", 16, 0.25);

// Common
test.func("fract", 1.5, 0.5);
test.func("sign", -1.1, -1);
test.func("sign", 1111.1, 1);
test.func("sign", 0.0, 0);
test.func("clamp", 10, 20, 22, 20);

// Geometric
test.func("len", r.vec2(3, 4), 5);
test.func("distance", v2, r.vec2(v2).normalize(), 3);
test.func("dot", r.vec2(3, 4), r.vec2(3, 4), 25);
test.func("cross", r.vec3(1, 2, 0), r.vec3(2, 4, 0), r.vec3(0, 0, 0));
test.func("normalize", r.vec2(4, 0), r.vec2(1, 0));
test.func("faceforward", r.vec3(1, 1, 1), v3, v31, r.vec3(-1, -1, -1));
test.func("reflect", r.vec3(1, 1, 0), r.vec3(0, 1, 0), r.vec3(1, -1, 0));
test.func("refract", r.vec3(1, 1, 0), r.vec3(0, 1, 0), 0.5, r.vec3(0.5, -1, 0));
//console.log(r.refract(r.vec3(1, 1, 0), r.vec3(0, 1, 0), 1.5));

// Vector Relational Functions
test.func("lessThan", r.vec2(1, 2), r.vec2(3, 2), r.vec2(1, 0));
test.func("lessThanEqual", r.vec2(1, 2), r.vec2(3, 2), r.vec2(1, 1));
test.func("greaterThan", r.vec2(1, 2), r.vec2(3, 2), r.vec2(0, 0));
test.func("greaterThanEqual", r.vec2(1, 2), r.vec2(3, 2), r.vec2(0, 1));
test.func("equal", r.vec2(1, 2), r.vec2(3, 2), r.vec2(0, 1));
test.func("notEqual", r.vec2(1, 2), r.vec2(3, 2), r.vec2(1, 0));
test.func("any", r.vec2(1, 0), true);
test.func("any", r.vec2(0, 0), false);
test.func("all", r.vec2(1, 0), false);
test.func("all", r.vec2(10, 10), true);
test.func("not", r.vec2(10, 0), r.vec2(0, 1));

// Getters and Setters
test.func("get", r.vec2(100, 200), 0, 100);
test.func("get", r.vec3(10, 20, 30), "yywx", r.vec3(20, 20, 10));
test.func("get", r.vec3(10, 20, 30), "y", 20);
test.func("set", r.vec2(100, 200), 0, -100, r.vec2(-100, 200));
test.func("set", r.vec2(10, 20), "yywx", r.vec4(2000, 200, 400, 100), r.vec2(100, 200));
test.func("set", r.vec2(10, 20), "ggar", r.vec4(2000, 200, 400, 100), r.vec2(100, 200));

test.func("get", r.mat(100, 200, 300, 400), 0, 1, 300);
test.func("get", r.mat(100, 200, 300, 400), 0, r.vec2(100, 300));
test.func("get", r.mat(100, 200, 300, 400), 0, "y", 300);
test.func("get", r.mat(100, 200, 300, 400), 1, "xy", r.vec2(200, 400));
test.func("set", r.mat(100, 200, 300, 400), 0, 1, -300, r.mat(100, 200, -300, 400));
test.func("set", r.mat(100, 200, 300, 400), 0, r.vec3(-1, -3, -4), r.mat(-1, 200, -3, 400));
test.func("set", r.mat(100, 200, 300, 400), 0, "yxy", r.vec3(-1, -3, -4), r.mat(-3, 200, -4, 400));

test.done();

var mat0 = r.mat2(
10, 20,
30, 40
);
console.log(mat0);

var mat1 = r.mat3(
1, 2, 3,
4, 8, 12,
8, 16, 24, 10
);
console.log(r.mat4(mat0));
console.log(r.mat4(4));

var mat2 = r.mat(
r.vec3(1, 2, 3),
r.vec2(4, 8),
r.vec4(8, 16, 24, 9)
);
console.log(mat2);

var mat3 = r.mat(mat2);
mat3.set(1, r.vec3(4, 8, 12));
console.log(mat3, mat3.equal(mat1));

console.log("mat.add", r.mat(mat1).add(mat3));
console.log("mat.minus", r.mat(mat1).minus(mat3));
console.log("mat.divide", r.mat(mat1).divide(mat3));
console.log("mat.matrixCompMult", r.mat(mat1).matrixCompMult(mat3));
console.log("mat.multiply", r.mat(mat1).multiply(mat3));

//})(GLSL.r, options)
