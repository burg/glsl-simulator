var ImageView = function(options, suggestedVariableValueCallback) {

    this.element = document.createElement("div");
    this.element.classList.add("image-container");

	this.image = document.createElement("img");
	this.image.src = "assets/test_image.png";
	this.image.height = 150;
	this.element.appendChild(this.image);
};

ImageView.Event = {
    VariableValueChanged: "image-view-value-changed"
};

ImageView.prototype = {
    constructor: ImageView,
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
        this.dispatchEventToListeners(ImageView.Event.VariableValueChanged, data);
    }
};
