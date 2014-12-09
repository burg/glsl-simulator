var VariableView = function(variable, suggestedValue) {
    this.variable = variable;

    this._fields = [];

    var variableRow = this.element = document.createElement("div");
    variableRow.classList.add("variable-row", variable.usage);

    var usageLabel = variableRow.appendChild(document.createElement("span"));
    usageLabel.classList.add("variable-usage", variable.usage);
    usageLabel.textContent = variable.usage;

    var qualifierLabel = variableRow.appendChild(document.createElement("span"));
    qualifierLabel.classList.add("variable-qualifier", variable.qualifier);
    qualifierLabel.textContent = variable.qualifier;

    var label = variableRow.appendChild(document.createElement("span"));
    label.classList.add("variable-label");
    if (variable.builtin)
        label.classList.add("builtin");
    label.textContent = variable.name;

    var typeLabel = variableRow.appendChild(document.createElement("span"));
    typeLabel.classList.add(variable.type, "variable-type");
    typeLabel.textContent = variable.type;

    // TODO: handle sampler2D and samplerCube seperately, by adding a
    // file upload widget and thumbnail preview.

    var cellTable = variableRow.appendChild(document.createElement("table"));
    cellTable.classList.add("variable-cells");

    var rowCount = 1;
    var colCount = 1;

    switch (variable.type) {
    case "float": break;
    case "vec2":  colCount = 2; break;
    case "vec3":  colCount = 3; break;
    case "vec4":  colCount = 4; break;
    case "mat2":  colCount = 2; rowCount = 2; break;
    case "mat3":  colCount = 3; rowCount = 3; break;
    case "mat4":  colCount = 4; rowCount = 4; break;
    default: break;
    }

    for (var i = 0; i < rowCount; ++i) {
        var row = document.createElement("tr");
        for (var j = 0; j < colCount; ++j) {
            var cell = document.createElement("td");
            if (j == 0)
                cell.appendChild(document.createTextNode(i == 0 && colCount > 1 ? "[" : "\u00A0"));

            var input = cell.appendChild(document.createElement("input"));
            input.type = "text";
            input.maxLength = 5;
            input.placeholder = "0.0";
            if (variable.usage === "out")
                input.readOnly = true;
            this._fields.push(input);
            if (j < colCount - 1)
                cell.appendChild(document.createTextNode(","));
            else if (colCount > 1 && i == rowCount - 1)
                cell.appendChild(document.createTextNode("]"))
            row.appendChild(cell);
        }

        cellTable.appendChild(row);
    }

    if (variable.usage === "in" && !!suggestedValue)
        this.insertValue(suggestedValue);

    if (variable.usage === "in")
        cellTable.addEventListener("input", this._fieldInputChanged.bind(this));
}

VariableView.Event = {
    "InputChanged": "variable-view-input-changed",
};

VariableView.prototype = {
    constructor: VariableView,
    __proto__: GLSL.Object.prototype,

    // Public

    insertValue: function(value)
    {
        var dim = 4;

        switch (this.variable.type) {
        case "float": this._fields[0].value = value; break;

        case "vec2": dim--;
        case "vec3": dim--;
        case "vec4":
            for (var i = 0; i < dim; ++i)
                this._fields[i].value = value.d[i];
            break;

        case "vec2": dim--;
        case "vec3": dim--;
        case "vec4":
            for (var i = 0; i < dim; ++i)
                for (var j = 0; j < dim; ++j)
                    this._fields[i * dim + j].value = value.d[i][j];
            break;

        default: break;
        }
    },

    extractValue: function()
    {
        var values = this._fields.map(function(f) {
            return (f.value && !f.value.endsWith(".")) ? Number(f.value) : NaN;
        });
        if (values.some(function(v) { return isNaN(v); }))
            return null;

        switch (this.variable.type) {
            case "float": return values[0];
            case "vec2": return GLSL.Runtime.Vec2.apply(null, values);
            case "vec3": return GLSL.Runtime.Vec3.apply(null, values);
            case "vec4": return GLSL.Runtime.Vec4.apply(null, values);
            case "mat2": return GLSL.Runtime.Mat2.apply(null, values);
            case "mat3": return GLSL.Runtime.Mat3.apply(null, values);
            case "mat4": return GLSL.Runtime.Mat4.apply(null, values);
        }
    },

    // Private

    _fieldInputChanged: function(event)
    {
        var cell = event.target;
        cell.classList.remove("valid-input");
        cell.classList.remove("invalid-input");

        if (cell.value.endsWith(".") || isNaN(Number(cell.value))) {
            cell.classList.add("invalid-input");
            return;
        }

        cell.classList.add("valid-input");

        if (this.extractValue() !== null) // Don't send an event unless all fields complete.
            this.dispatchEventToListeners(VariableView.Event.InputChanged);
    }
};

var VariableListView = function(shader, suggestedVariableValueCallback) {
    this.shader = shader;

    this._variableMap = new Map;

    this.element = document.createElement("div");
    this.element.classList.add("variable-list");

    if (!this.shader)
        return;

    function createVariable(variable) {
        var view = new VariableView(variable, suggestedVariableValueCallback(variable));
        this._variableMap.set(variable, view);
        this.element.appendChild(view.element);

        if (!variable.readOnly)
            view.addEventListener(VariableView.Event.InputChanged, this._inputChanged, this);
    }

    this.shader.uniforms.map(createVariable.bind(this));
    if (this.shader.type === GLSL.Shader.Type.Vertex)
        this.shader.attributes.map(createVariable.bind(this));

    this.shader.varyings.map(createVariable.bind(this));
};

VariableListView.Event = {
    VariableValueChanged: "variable-list-view-variable-value-changed"
};

VariableListView.prototype = {
    constructor: VariableListView,
    __proto__: GLSL.Object.prototype,

    // Public

    populateResults: function(env)
    {
        console.assert(env instanceof GLSL.Environment, env);

        this._variableMap.forEach(function(value, key, map) {
            var variable = key, view = value;
            var storedValue = env.get(variable.name);

            if (!variable.readOnly && storedValue)
                view.insertValue(storedValue);
        }, this);
    },

    // Private

    _inputChanged: function(event)
    {
        var view = event.target;
        var data = {variable: view.variable, value: view.extractValue()};
        this.dispatchEventToListeners(VariableListView.Event.VariableValueChanged, data);
    }
};
