var EditorView = function(program) {
    this.program = program;

    this.element = document.createElement("div");
    this.element.classList.add("shader-editor");

    var item = null;

    this.optionsElement = document.createElement("span");
        this.optionsElement.classList.add("editor-options");
        var optionsList = this.optionsElement.appendChild(document.createElement("ul"));
        this.selectorElement = document.createElement("select");
            this.selectorElement.id = "editor-selector";
            var option = null;
                option = document.createElement("option");
                option.text = "Vertex Shader";
                option.value = GLSL.Shader.Type.Vertex;
            this.selectorElement.add(option, null);

            option = document.createElement("option");
                option.text = "Fragment Shader";
                option.value = GLSL.Shader.Type.Fragment;
            this.selectorElement.add(option, null);
            item = optionsList.appendChild(document.createElement("li"));
        item.appendChild(this.selectorElement);
        var checkboxLabel = document.createElement("label");
            this.emitDebuggerCheckbox = document.createElement("input");
                this.emitDebuggerCheckbox.type = "checkbox";
            checkboxLabel.textContent = "Pause Inside Shader";
            checkboxLabel.appendChild(this.emitDebuggerCheckbox);
            item = optionsList.appendChild(document.createElement("li"));
        item.appendChild(checkboxLabel);
    this.element.appendChild(this.optionsElement);

    // Select the fragment shader by default.
    this.selectorElement.options[1].selected = true;
    this.selectorElement.addEventListener("change", this._shaderSelectorChanged.bind(this));

    var editorStub = document.createElement("div");
        editorStub.id = "shader-editor-stub";
    this.element.appendChild(editorStub);

    // Set up CodeMirror to replace the editor stub.
    this._cm = CodeMirror(function(editorNode) {
        editorStub.parentNode.replaceChild(editorNode, editorStub);
        editorNode.id = editorStub.id;
        editorNode.classList.add("stub");
    }, {
        value: "",
        mode: "glsl",
        lineNumbers: true
    });

    this._cm.on("changes", this._shaderEditorContentChanged.bind(this));
    this.emitDebuggerCheckbox.addEventListener("change", this._emitDebuggerCheckboxChanged.bind(this));
};

EditorView.Event = {
    ShaderTypeChanged: "editor-view-shader-type-changed"
};

EditorView.prototype = {
    constructor: EditorView,
    __proto__: GLSL.Object.prototype,

    // Public

    get activeShaderType()
    {
        return this.selectorElement.options[this.selectorElement.selectedIndex].value;
    },

    set activeShaderType(value)
    {
        var options = this.selectorElement.options;
        for (var i = 0; i < options.length; ++i)
            if (value === options[i].value)
                options[i].selected = true;

        this.refresh();
    },

    refresh: function()
    {
        this.autosizeHeight();

        var selectedShader = this.program.shaderWithType(this.activeShaderType);
        this._cm.setValue(selectedShader ? selectedShader.sourceText : "");
    },

    autosizeHeight: function()
    {
        var allowedHeight = this.element.offsetHeight - 5 + "px";
        document.getElementById("shader-editor-stub").style.height = allowedHeight;
    },

    // Private

    _shaderSelectorChanged: function(event)
    {
        console.assert(event.target === this.selectorElement, event.target);
        console.assert(event.target.selectedIndex != -1, event.target);

        var inactiveShaderType = (this.activeShaderType === GLSL.Shader.Type.Vertex) ? GLSL.Shader.Type.Fragment : GLSL.Shader.Type.Vertex;
        this.program.shaderWithType(inactiveShaderType).shouldEmitDebuggerStatement = false;
        this.program.shaderWithType(this.activeShaderType).shouldEmitDebuggerStatement = !!this.emitDebuggerCheckbox.checked;

        this.refresh();
        this.dispatchEventToListeners(EditorView.Event.ShaderTypeChanged, this.activeShaderType);
    },

    _shaderEditorContentChanged: function(event)
    {
        this.program.updateShaderWithType(this.activeShaderType, this._cm.getValue());
    },

    _emitDebuggerCheckboxChanged: function(event)
    {
        var activeShader = this.program.shaderWithType(this.activeShaderType);
        activeShader.shouldEmitDebuggerStatement = !!this.emitDebuggerCheckbox.checked;
    },
};
