/*
 * GLSL: pass in the GLSL runtime
 * opt:  pass in the inputs/outputs; return opt in the end
 */

(function(GLSL, opt) {

(function (time, mouse, resolution, r) {
    var col = r.vec3(0.1, 0.2, 0.3);
    var pos = r.get(opt.gl_FragCoord, "x", "y").divide(r.get(resolution, "x", "y"));

    var sd = 0.19 - (pos.y * 0.004 / pos.x * 0.5) - r.atan(pos.x + pos.y, 40.0);
    var so = 0.22 + pos.y * 0.0003 / pos.x * (0.15 + r.sin(time * 0.04 + pos.x * 3.5));

    var t = r.mod(time * 0.1, 2.0) + 440.0;
    var x = r.mod(pos.x + t, so);
    var y = r.mod(pos.y + t, so * 2.0);
    var d1 = r.mod(
        r.distance(r.vec2(x, y), r.vec2(so * 0.45, so * 1.05)) + t * 0.5
        , 0.05) * 3.0 + pos.x * 0.5;
    var d2 = r.mod(
        r.distance(r.vec2(x, y), r.vec2(so * 0.55, so * 0.95)) + t * 0.5
        , 0.015) * 3.0;

    if (x - 0.03 < sd && y - 0.03 < sd * 2.0)
        if (x < sd && y < sd * 2.0)
            col = r.vec3(0.2, 0.6, r.mix(d1, d2, 0.8));
    	else
        	col = r.vec3(0.72, 0.25, pos.y * 0.06 + 0.3);

    l = r.length(r.mod(t * 0.1 + dol * r.distance(pos, r.vec2(pos.y, 0.0)), 0.02) * 27.5);

    if (pos.y > 0.1 && pos.y < 0.9)
    	opt.gl_FragColor = r.vec4(1, 1, 1, 1.0);
    else
        opt.gl_FragColor = r.vec4(0.9, 0.9, 0.9, 1.0);

    return opt;
})(opt.time, opt.mouse, opt.resolution, GLSL.r);

})(GLSL, opt);
