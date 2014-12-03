var Runtime = {};

// Add built-in types
var vector = require('./runtime/vector');
Runtime.vec = vector.vec;
Runtime.vec2 = vector.vec2;
Runtime.vec3 = vector.vec3;
Runtime.vec4 = vector.vec4;

var matrix = require("./runtime/matrix");
Runtime.mat = matrix.mat;
Runtime.mat2 = matrix.mat2;
Runtime.mat3 = matrix.mat3;
Runtime.mat4 = matrix.mat4;

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
