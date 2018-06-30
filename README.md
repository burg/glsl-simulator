# Target

`glsl-simulator` is a JavaScript compiler and runtime for GLSL shaders. It is designed to provide (browser) developer tools with the runtime information necessary to implement features such as stepping through shader control flow, introspecting live state and logging. As such, it is currently designed to run in a full browser environment. However, the development environment makes use of NodeJS.

# Dependencies

`glsl-simulator` requires NodeJS, npm, and the npm packages `pegjs` and `uglify-js`. To satisfy the latter dependencies, run

    $ npm install pegjs uglify-js

To combine the script resources:

    $ make

# Running

Currently, the project is exercised through several demo pages. See the `demo/` directory.

To use `glsl-simulator` from another (browser) code base, run `make` and use the resulting library in the `browser/` build directory.

# Hacking

`glsl-simulator` uses a PEG.js grammar to parse the OpenGL ES 2.0 Shader Language (GLSL).
Usually the generated grammar is also checked into the repository. To change the grammar
and regenerate the JavaScript parser, you need to run `make`.
