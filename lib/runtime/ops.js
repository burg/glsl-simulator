var Runtime = {};
var vector = require('./vector');
Runtime.vec = vector.vec;
Runtime.Vec2 = vector.Vec2;
Runtime.Vec3 = vector.Vec3;
Runtime.Vec4 = vector.Vec4;

Operations = {};

// Unary Operators [OpenGL ES SL 1.0, Sec 5.9]

// + term
Operations.op_pos = function(term)
{
    return null;
}

// - term
Operations.op_neg = function(term)
{
    return null;
}

// ~ term
Operations.op_bnot = function(term)
{
    return null;
}

// ! term
Operations.op_lnot = function(term)
{
    return null;
}

// Binary Operators [OpenGL ES SL 1.0, Sec 5.9]

// lhs == rhs
Operations.op_eq = function(lhs, rhs)
{
    return null;
}

// lhs != rhs
Operations.op_neq = function(lhs, rhs)
{
    return null;
}

// lhs * rhs
Operations.op_mul = function(lhs, rhs)
{
    var scalarLHS = !(lhs instanceof Runtime.vec || lhs instanceof Runtime.mat);
    var scalarRHS = !(rhs instanceof Runtime.vec || rhs instanceof Runtime.mat);

    // {i,f} * {i,f}
    if (scalarLHS && scalarRHS)
        return lhs * rhs;

    // {i,f} * {vec,mat}
    if (scalarLHS)
        return rhs.multiply(lhs);

    // {vec,mat} * {i,f}
    if (scalarRHS)
        return lhs.multiply(rhs);

    // {vec,mat} * {vec,mat}
    return lhs.multiply(rhs);
}

// lhs / rhs
Operations.op_div = function(lhs, rhs)
{
    var scalarLHS = !(lhs instanceof Runtime.vec || lhs instanceof Runtime.mat);
    var scalarRHS = !(rhs instanceof Runtime.vec || rhs instanceof Runtime.mat);

    // {i,f} / {i,f}
    if (scalarLHS && scalarRHS)
        return lhs / rhs;

    // {i,f} / {vec,mat}
    if (scalarLHS)
        return rhs.divide(lhs);

    // {vec,mat} / {i,f}
    if (scalarRHS)
        return lhs.divide(rhs);

    // {vec,mat} / {vec,mat}
    throw new Error("op_div expects at least one scalar operand.");
}

// lhs % rhs
Operations.op_mod = function(lhs, rhs)
{
    return null;
}

// lhs + rhs
Operations.op_add = function(lhs, rhs)
{
    return null;
}

// lhs - rhs
Operations.op_sub = function(lhs, rhs)
{
    return null;
}

// lhs << rhs
Operations.op_shl = function(lhs, rhs)
{
    return null;
}

// lhs >> rhs
Operations.op_shr = function(lhs, rhs)
{
    return null;
}

// lhs < rhs
Operations.op_lt = function(lhs, rhs)
{
    return null;
}

// lhs > rhs
Operations.op_gt = function(lhs, rhs)
{
    return null;
}

// lhs <= rhs
Operations.op_le = function(lhs, rhs)
{
    return null;
}

// lhs >= rhs
Operations.op_ge = function(lhs, rhs)
{
    return null;
}

// lhs & rhs
Operations.op_band = function(lhs, rhs)
{
    return null;
}

// lhs ^ rhs
Operations.op_bxor = function(lhs, rhs)
{
    return null;
}

// lhs | rhs
Operations.op_bor = function(lhs, rhs)
{
    return null;
}

// lhs && rhs
Operations.op_land = function(lhs, rhs)
{
    return null;
}

// lhs ^^ rhs
Operations.op_lxor = function(lhs, rhs)
{
    return null;
}

// lhs || rhs
Operations.op_lor = function(lhs, rhs)
{
    return null;
}


module.exports = Operations;
