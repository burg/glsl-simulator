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
var operations = require("./runtime/ops");
var access = require("./runtime/access");
var texture = require("./runtime/texture");

for (var i in operations)
    Runtime[i] = operations[i];

for (var i in builtins)
    Runtime[i] = builtins[i];

for (var i in access)
    Runtime[i] = access[i];

for (var i in texture)
    Runtime[i] = texture[i];

module.exports = Runtime;
