var RenderView = function(program, env) {
    this.updateProgram(program);
    this.updateEnvironment(env);

    var resolution = this.env.get("iResolution") || this.env.get("resolution") || GLSL.Runtime.Vec3(50, 50, 1);
    this.renderWidth = resolution.get('x');
    this.renderHeight = resolution.get('y');

    this.element = document.createElement("div");
    this.element.classList.add("render-view");

    this._canvasElement = document.createElement("canvas");
    this._canvasElement.width = this.renderWidth;
    this._canvasElement.height = this.renderHeight;
    this.element.appendChild(this._canvasElement);

    this._context = this._canvasElement.getContext("2d");
    this._buffer = this._context.createImageData(this.renderWidth, this.renderHeight);
};

RenderView.prototype = {
    constructor: RenderView,
    __proto__: GLSL.Object.prototype,

    updateProgram: function(program)
    {
        console.assert(program instanceof GLSL.Program);
        this.program = new GLSL.Program;
        if (program.vertexShader)
            this.program.updateShaderWithType(GLSL.Shader.Type.Vertex, program.vertexShader.sourceText);

        if (program.fragmentShader)
            this.program.updateShaderWithType(GLSL.Shader.Type.Fragment, program.fragmentShader.sourceText);

        this._renderImage();
    },

    updateEnvironment: function(env)
    {
        console.assert(env instanceof GLSL.Environment);
        this.env = env.clone();

        this._renderImage();
    },

    // Private

    _renderImage: function()
    {
        if (!this.program.vertexShader || !this.program.fragmentShader)
            return;

        this.program.renderToBuffer(this.env, this._buffer);
        this._context.putImageData(this._buffer, 0, 0);
    }
};
