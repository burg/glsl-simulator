var Runtime = {};
Runtime.vec = require('./vector').vec;
Runtime.mat = require("./matrix").mat;
internal = require('./builtins');
var internal = require('./internal');

Operations = {};

// Unary Operators [OpenGL ES SL 1.0, Sec 5.9]

// + term
Operations.op_pos = function(term)
{
    return internal.pos(term);
}

// - term
Operations.op_neg = function(term)
{
    return internal.neg(term);
}

// ~ term
Operations.op_bnot = function(term)
{
    return internal.bnot(term);
}

// ! term
Operations.op_lnot = function(term)
{
    return internal.lnot(term);
}

// Binary Operators [OpenGL ES SL 1.0, Sec 5.9]

// lhs == rhs
Operations.op_eq = function(lhs, rhs)
{
    if (lhs instanceof Runtime.vec && rhs instanceof Runtime.vec)
        return lhs.equal(rhs);

    if (lhs instanceof Runtime.mat && rhs instanceof Runtime.mat)
        return lhs.equal(rhs);

    if (typeof lhs != 'Object' && typeof rjs != 'Object')
        return lhs == rhs;

    return false;
}

// lhs != rhs
Operations.op_neq = function(lhs, rhs)
{
    return !this.op_eq(lhs, rhs);
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
    if ((lhs instanceof Runtime.vec && rhs instanceof Runtime.vec) ||
        (lhs instanceof Runtime.mat && rhs instanceof Runtime.mat))
        return lhs.divide(rhs);

    throw new Error("op_div expects at least one scalar operand.");
}

// lhs % rhs
Operations.op_mod = function(lhs, rhs)
{
    return internal.mod(lhs, rhs);
}

// lhs + rhs
Operations.op_add = function(lhs, rhs)
{
    if (typeof lhs == 'number' && typeof rhs == 'number')
        return lhs + rhs;
    
    if (lhs instanceof Runtime.vec && rhs instanceof Runtime.vec)
        return Runtime.vec(lhs).add(rhs);
    
    throw new Error("Type of lhs and/or rhs is invalid.");
}

// lhs - rhs
Operations.op_sub = function(lhs, rhs)
{
    if (typeof lhs == 'number' && typeof rhs == 'number')
        return lhs - rhs;
    
    if (lhs instanceof Runtime.vec && rhs instanceof Runtime.vec)
        return Runtime.vec(lhs).minus(rhs);
    
    throw new Error("Type of lhs and/or rhs is invalid.");
}

// lhs << rhs
Operations.op_shl = function(lhs, rhs)
{
    return internal.shl(lhs, rhs);
}

// lhs >> rhs
Operations.op_shr = function(lhs, rhs)
{
    return internal.shr(lhs, rhs);
}

// lhs < rhs
Operations.op_lt = function(lhs, rhs)
{
    return internal.lt(lhs, rhs);
}

// lhs > rhs
Operations.op_gt = function(lhs, rhs)
{
    return internal.gt(lhs, rhs);
}

// lhs <= rhs
Operations.op_le = function(lhs, rhs)
{
    return internal.le(lhs, rhs);
}

// lhs >= rhs
Operations.op_ge = function(lhs, rhs)
{
    return internal.ge(lhs, rhs);
}

// lhs & rhs
Operations.op_band = function(lhs, rhs)
{
    return internal.band(lhs, rhs);
}

// lhs ^ rhs
Operations.op_bxor = function(lhs, rhs)
{
    return internal.bxor(lhs, rhs);
}

// lhs | rhs
Operations.op_bor = function(lhs, rhs)
{
    return internal.bor(lhs, rhs);
}

// lhs && rhs
Operations.op_land = function(lhs, rhs)
{
    return internal.land(lhs, rhs);
}

// lhs ^^ rhs
Operations.op_lxor = function(lhs, rhs)
{
    return internal.lxor(lhs, rhs);
}

// lhs || rhs
Operations.op_lor = function(lhs, rhs)
{
    return internal.lor(lhs, rhs);
}


module.exports = Operations;
