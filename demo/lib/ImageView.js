var ImageView = function(options, suggestedVariableValueCallback) {

    this.element = document.createElement("div");
    this.element.classList.add("image-container");

	// init image array and add a test image to image array
	this.images = [];
	this.addImage("assets/test_image.png");

	// main canvas
	this.canvas = document.createElement("canvas");
	this.canvas.id = "canvas-main";
	this.canvas.height = 150;
	this.element.appendChild(this.canvas);

	this.displayImageFromSource();
};

ImageView.Event = {
    VariableValueChanged: "image-view-value-changed"
};

ImageView.prototype = {
    constructor: ImageView,
    __proto__: GLSL.Object.prototype,

    // Public

	addImage: function(url)
	{
		var image = new Image();
		image.src = url;
		image.crossOrigin = 'Anonymous';
		image.swidth = 1600;
		image.sheight = 800;
		this.images.push(image);
		console.log(this.images);
	},

	displayImageFromSource: function()
	{
		if (this.images.length == 0)
			return;

		var self = this;
		var ctx = this.canvas.getContext('2d');
		var image = this.images[0];
		image.onload = function() {
			ctx.drawImage(image, 0, 0, image.swidth, image.sheight, 0, 0, 300, 150);
			// TODO not able to get imgData due to security policies
			// need to set up a local server in order to do so
			var imgData = ctx.getImageData(0, 0, self.canvas.width, self.canvas.height);
			/*for (var i = 0; i < imgData.data.length; i += 4) {
				imgData.data[i    ] = 255 - imgData.data[i];
				imgData.data[i + 1] = 255 - imgData.data[i + 1];
				imgData.data[i + 2] = 255 - imgData.data[i + 2];
				imgData.data[i + 3] = 255;
			}
			console.log(imgData);
			ctx.putImageData(imgData, 0, 0);
		*/}
	},

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
