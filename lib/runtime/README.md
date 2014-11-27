## GLSL simulator Runtime specs ##

Here are a set of our APIs that are different from the GLSL shader language.

|   | GLSL  | Runtime Type | Runtime Function
| :------------ |:---------------| :----- | :----- |
|             | length()              | | r.len()             |
| vec access  | u = v.xy              | u = v.get("xy") | u = r.get(v, "xy")  |
| vec access  | v.xy = u              | v.set("xy", u) | r.set(v, "xy", u)  |
| vec access  | f = v[3]              | f = v.get(3) | f = r.get(v, 3)  |
| vec access  | v[3] = f              | v.set(3, u) | r.set(v, 3, f)  |
| vec op      | v = f * v             | v.multiply(f) | r.multiply(f, v) |
| mat access  | v = m[1]              | v = m.get(1) | v = r.get(m, 1)  |
| mat access  | f = m[1][2]           | f = m.get(1, 2) | f = r.get(m, 1, 2)  |
| mat access  | f = m[1].y            | f = m.get(1, "y") | f = r.get(m, 1, "y")  |
| mat access  | m[1] = vec4(2.0)      | m.set(1, vec4(2.0)) | r.set(m, 1, vec4(2.0))  |
| mat access  | m[1][2] = 1.0         | m.set(1, 2, 1.0) | r.set(m, 1, 2, 1.0)  |
| mat         | m = f * m             | m.multiply(f) | r.multiply(f, m) |

### Runtime APIs ###

### TODOs ###

Week of 11/24/14 -- 11/30/14

* [x] Make getters and setters work
* [x] Make casting (for vec? and mat?) work, from both low to high dimensions and high to low dimensions
* [x] Construct vec and mat by using a single value
* Make built-in functions work for vec?
* Testing framework

Week of 12/1/14 -- 12/7/14

* Implement texture lookup functions
* Implement Vertex/Fragment shader special variables
* Test thoroughly

Week of 12/8/14 -- 12/12/14

* Demo
* Writeups
