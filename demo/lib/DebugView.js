var DebugView = function(program, env, which) {
    console.assert(program instanceof GLSL.Program);
    console.assert(env instanceof GLSL.Environment);

    this.program = program;
    this.env = env;

    this._errorSources = {};
    this._errorSources[GLSL.Error.Type.VertexShaderParsing] = "Vertex Shader Parsing Problem:";
    this._errorSources[GLSL.Error.Type.FragmentShaderParsing] = "Fragment Shader Parsing Problem:";
    this._errorSources[GLSL.Error.Type.VertexShaderTranslation] = "Vertex Shader Translation Problem:";
    this._errorSources[GLSL.Error.Type.FragmentShaderTranslation] = "Fragment Shader Translation Problem:";
    this._errorSources[GLSL.Error.Type.VertexShaderExecution] = "Vertex Shader Execution Problem:";
    this._errorSources[GLSL.Error.Type.FragmentShaderExecution] = "Fragment Shader Execution Problem:";

    this.element = document.createElement("div");
    this.element.classList.add("results-viewer");
    this.element.id = "results-" + which;

    var optionsContainer = document.createElement("span");
        optionsContainer.classList.add("output-options");
    this.element.appendChild(optionsContainer);

    this.shaderSelectorElement = document.createElement("select");
        this.shaderSelectorElement.id = "results-" + which + "-shader-selector";
        var option = null;
        option = document.createElement("option");
            option.text = "Vertex Shader";
            option.value = GLSL.Shader.Type.Vertex;
        this.shaderSelectorElement.add(option, null);

        option = document.createElement("option");
            option.text = "Fragment Shader";
            option.value = GLSL.Shader.Type.Fragment;
        this.shaderSelectorElement.add(option, null);
    optionsContainer.appendChild(this.shaderSelectorElement);

    this.outputSelectorElement = document.createElement("select");
        this.outputSelectorElement.id = "results-" + which + "-output-selector";
        option = document.createElement("option");
            option.text = "Shader AST";
            option.value = "ast";
        this.outputSelectorElement.add(option, null);

        option = document.createElement("option");
            option.text = "Pretty Printer";
            option.value = "pretty";
        this.outputSelectorElement.add(option, null);

        option = document.createElement("option");
            option.text = "Generated JavaScript";
            option.value = "codegen";
        this.outputSelectorElement.add(option, null);

        option = document.createElement("option");
            option.text = "Primary Output";
            option.value = "output";
        this.outputSelectorElement.add(option, null);
        optionsContainer.appendChild(this.outputSelectorElement);

    this.outputElement = document.createElement("span");
        this.outputElement.classList.add("output");
    this.element.appendChild(this.outputElement);


    this.shaderSelectorElement.addEventListener("change", this.refresh.bind(this));
    this.outputSelectorElement.addEventListener("change", this.refresh.bind(this));
    this.program.addEventListener(GLSL.Program.Event.ShaderChanged, this.refresh, this);
    this.env.addEventListener(GLSL.Environment.Event.ResultChanged, this.refresh, this);
};

DebugView.prototype = {
    constructor: DebugView,
    __proto__: GLSL.Object.prototype,

    get activeShaderType()
    {
        return this.shaderSelectorElement.options[this.shaderSelectorElement.selectedIndex].value;
    },

    set activeShaderType(value)
    {
        var options = this.shaderSelectorElement.options;
        for (var i = 0; i < options.length; ++i)
            if (value === options[i].value)
                options[i].selected = true;

        this.refresh();
    },

    get activeOutputType()
    {
        return this.outputSelectorElement.options[this.outputSelectorElement.selectedIndex].value;
    },

    set activeOutputType(value)
    {
        var options = this.outputSelectorElement.options;
        for (var i = 0; i < options.length; ++i)
            if (value === options[i].value)
                options[i].selected = true;

        this.refresh();
    },

    showErrorMessage: function(type, message)
    {
        if (this.outputElement) {
            this.element.removeChild(this.outputElement);
            delete this.outputElement;
        }

        this.outputElement = document.createElement("span");
            this.element.classList.add("error-message");
            this.outputElement.classList.add("output");
            this.outputElement.textContent = (this._errorSources[type] || "Error:") + "\n" + message;
        this.element.appendChild(this.outputElement);
    },

    refresh: function()
    {
        if (this.outputElement) {
            this.element.removeChild(this.outputElement);
            delete this.outputElement;
        }

        var shader = this.program.shaderWithType(this.activeShaderType);
        if (!shader)
            return;

        this.outputElement = document.createElement("span");
            this.outputElement.classList.add("output");
        this.element.appendChild(this.outputElement);
        this.element.classList.remove("error-message");

        switch (this.activeOutputType) {
        case "ast":
            this.outputElement.appendChild(document.createTextNode(jsDump.parse(shader.ast)));
        break;

        case "codegen":
            var source = shader.executable.source || shader.executable.code.toString();
            this.outputElement.appendChild(document.createTextNode(source));
        break;

        case "output":
            if (this.activeShaderType === GLSL.Shader.Type.Fragment) {
                var rawColor = this.env.get('gl_FragColor');
                if (!rawColor)
                    break;

                var color = GLSL.Runtime.clamp(this.env.get('gl_FragColor'), 0.0, 1.0);
                var hex = GLSL.Runtime.floor(color.get("rgb").multiply(255.0));
                var colorString = "rgba(" + [hex.get('r'), hex.get('g'), hex.get('b'), color.get('a')].join(", ") + ")";
                var vectorString = [rawColor.get("r"), rawColor.get("g"), rawColor.get("b"), rawColor.get("a")].join(", ");
                this.outputElement.style.backgroundColor = colorString;
                var text = this.outputElement.appendChild(document.createElement("span"));
                text.classList.add("inverted");
                text.textContent = "gl_FragColor = [" + vectorString + "]\n\n(color: " + colorString + ")";
            }

            if (this.activeShaderType === GLSL.Shader.Type.Vertex) {
                var position = this.env.get('gl_Position');
                var pointSize = this.env.get('gl_PointSize');

                if (!position && !pointSize)
                    break;

                var output = "";
                if (position) {
                    var positionString = [position.get("x"), position.get("y"), position.get("z"), position.get("w")].join(", ");
                    output += "gl_Position = [" + positionString + "]\n";
                }
                if (pointSize)
                    output += "gl_PointSize = " + pointSize;

                this.outputElement.textContent = output;
            }
        break;

        case "pretty":
        default:
            var printer = new GLSL.PrettyPrinter();
            this.outputElement.appendChild(document.createTextNode(printer.formattedText(shader.ast)));
        break;
        }
    }
}
