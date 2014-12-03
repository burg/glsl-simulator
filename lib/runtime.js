var Runtime = {};

// Add built-in types
var vector = require('./runtime/vector');
Runtime.vec = vector.vec;
Runtime.Vec2 = vector.Vec2;
Runtime.Vec3 = vector.Vec3;
Runtime.Vec4 = vector.Vec4;

var matrix = require("./runtime/matrix");
Runtime.mat = matrix.mat;
Runtime.Mat2 = matrix.Mat2;
Runtime.Mat3 = matrix.Mat3;
Runtime.Mat4 = matrix.Mat4;

var access = require('./runtime/access');
var angle = require('./runtime/angle');
var common = require('./runtime/common');
var exponential = require('./runtime/exponential');
var geometric = require('./runtime/geometric');
var vecfunc = require('./runtime/vecfunc');

// Functions
for (var i in access)
    Runtime[i] = access[i];
for (var i in angle)
    Runtime[i] = angle[i];
for (var i in common)
    Runtime[i] = common[i];
for (var i in exponential)
    Runtime[i] = exponential[i];
for (var i in geometric)
    Runtime[i] = geometric[i];
for (var i in vecfunc)
    Runtime[i] = vecfunc[i];

module.exports = Runtime;
