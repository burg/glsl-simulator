## GLSL simulator Runtime specs ##

Here are a set of our APIs that are different from the GLSL shader language.

|   | GLSL  | Our Runtime |
| :------------ |:---------------| -----    |
|             | length()              | r.len()             |
| vec         | v.xy                  | v.get("x", "y") or r.get(v, "x", "y")  |
| mat         | m[1] = vec4(2.0)      | m.set(1, vec4(2.0)) or r.set(m, 1, vec4(2.0))  |
| mat         | m[1][2] = 1.0         | m.set(1, 2, 1.0) or r.set(m, 1, 2, 1.0)  |
| vec         | v = f * v             | v.multiply(f) |
| mat         | m = f * m             | m.multiply(f) |

### Runtime APIs ###
