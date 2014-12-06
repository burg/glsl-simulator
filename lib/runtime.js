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

var builtins = require('./runtime/builtins');

for (var i in builtins)
    Runtime[i] = builtins[i];

module.exports = Runtime;
