var RenderView = function(program, env) {
    this.element = document.createElement("div");
    this.element.classList.add("render-view");

    var label = this.element.appendChild(document.createElement("div"));
    label.classList.add("picker-label");
    label.textContent = "Select a pixel to debug:";

    this._canvasElement = document.createElement("canvas");
    this.element.appendChild(this._canvasElement);

    //this._canvasElement.addEventListener("mousemove", this._canvasMouseEvent.bind(this));
    this._canvasElement.addEventListener("click", this._canvasMouseClicked.bind(this));

    this._updateButton = document.createElement("input");
    this._updateButton.type = "button";
    this._updateButton.value = "Render";
    this._updateButton.disabled = true;
    this.element.appendChild(this._updateButton);
    this._updateButton.addEventListener("click", this._updateButtonClicked.bind(this));

    this._pixelCoordElement = document.createElement("span");
    this._pixelCoordElement.classList.add("pixel-coord");
    this.element.appendChild(this._pixelCoordElement);

    this._pixelColorElement = document.createElement("div");
    this._pixelColorElement.classList.add("pixel-color");
    this.element.appendChild(this._pixelColorElement);

    this.updateProgram(program);
    this.updateEnvironment(env);
};

RenderView.Event = {
    PixelSelected: "render-view-pixel-selected"
}

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

        this._updateButton.disabled = false;
    },

    updateEnvironment: function(env)
    {
        console.assert(env instanceof GLSL.Environment);
        this.env = env.clone();

        var resolution = this.env.get("iResolution") || this.env.get("resolution") || GLSL.Runtime.Vec3(50, 50, 1);
        var w = resolution.get('x');
        var h = resolution.get('y');
        if (!this._context || !(this.renderWidth == w && this.renderHeight == h)) {
            this.renderWidth = this._canvasElement.width = w;
            this.renderHeight = this._canvasElement.height = h;
            var ctx = this._context = this._canvasElement.getContext("2d");
            this._buffer = this._context.createImageData(this.renderWidth, this.renderHeight);

            // Draw placeholder box.
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.fillRect(0, 0, w, h);
            ctx.strokeRect(0, 0, w, h);
        }

        this._updateButton.disabled = false;
    },

    // Private

    _renderImage: function()
    {
        if (!this.program.vertexShader || !this.program.fragmentShader)
            return;

        this.program.renderToBuffer(this.env, this._buffer);
        this._context.putImageData(this._buffer, 0, 0);
        this._updateButton.disabled = true;
    },

    _updateButtonClicked: function()
    {
        this._renderImage();
    },

    _canvasMouseEvent: function(event)
    {
        var x = event.clientX - event.target.offsetLeft;
        var y = event.clientY - event.target.offsetTop;
        this._selectedCoord = [x, y];

        var rgba = [this._buffer.data[(y * this.renderWidth + x) * 4 + 0] | 0,
                    this._buffer.data[(y * this.renderWidth + x) * 4 + 1] | 0,
                    this._buffer.data[(y * this.renderWidth + x) * 4 + 2] | 0,
                    (this._buffer.data[(y * this.renderWidth + x) * 4 + 3] / 255) | 0];

        console.log(rgba);

        this._pixelColorElement.style.backgroundColor = "rgba(" + rgba.join(", ") + ")";
        this._pixelCoordElement.textContent = "gl_FragCoord = (" + [x, y, 1, 1].join(", ") + ")";
    },

    _canvasMouseClicked: function(event)
    {
        this._canvasMouseEvent(event);

        this.dispatchEventToListeners(RenderView.Event.PixelSelected, {x: this._selectedCoord.x, y: this._selectedCoord.y});
    }
};
