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
