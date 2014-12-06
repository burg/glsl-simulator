var GLSL = {};

GLSL.Error = {};
GLSL.Error.Type = {
    VertexShaderParsing: "error-type-vertex-shader-parsing",
    FragmentShaderParsing: "error-type-fragment-shader-parsing",
    VertexShaderTranslation: "error-type-vertex-shader-translation",
    FragmentShaderTranslation: "error-type-fragment-shader-translation",
    VertexShaderExecution: "error-type-vertex-shader-execution",
    FragmentShaderExecution: "error-type-fragment-shader-execution",
};

module.exports = GLSL.Error;
