/*
  glsl-simulator.js 0.1.0
  https://www.github.com/burg/glsl-simulator/

  Copyright (c) 2014, Brian Burg <burg@cs.uw.edu>
  Copyright (c) 2014, Xiao Sophia Wang.
  All rights reserved.

  Distributed under the terms of the Simplified BSD License:

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice, this
     list of conditions and the following disclaimer.
  2. Redistributions in binary form must reproduce the above copyright notice,
     this list of conditions and the following disclaimer in the documentation
     and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var GLSL = (function(undefined) {
  var modules = {
    define: function(name, factory) {
      var dir    = name.replace(/(^|\/)[^/]+$/, "$1"),
          module = { exports: {} };

      function require(path) {
        var name   = dir + path,
            regexp = /[^\/]+\/\.\.\/|\.\//;

        /* Can't use /.../g because we can move backwards in the string. */
        while (regexp.test(name)) {
          name = name.replace(regexp, "");
        }

        return modules[name];
      }

      factory(module, require);
      this[name] = module.exports;
    }
  };
  modules.define("error", function(module, require) {
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
  });

  modules.define("events", function(module, require) {
    /*
     * Copyright (C) 2008, 2013 Apple Inc. All Rights Reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions
     * are met:
     * 1. Redistributions of source code must retain the above copyright
     *    notice, this list of conditions and the following disclaimer.
     * 2. Redistributions in binary form must reproduce the above copyright
     *    notice, this list of conditions and the following disclaimer in the
     *    documentation and/or other materials provided with the distribution.
     *
     * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
     * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
     * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
     * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
     * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
     * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
     * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
     * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
     * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    
    // Borrowed from WebKit Web Inspector's Object.js.
    
    var GLSL = {};
    
    GLSL.Object = function()
    {
    };
    
    GLSL.Object.addConstructorFunctions = function(subclassConstructor)
    {
        // Copies the relevant functions the subclass constructor.
        for (var property in GLSL.Object) {
            var value = GLSL.Object[property];
            if (typeof value !== "function")
                continue;
            if (value === arguments.callee)
                continue;
            subclassConstructor[property] = value;
        }
    };
    
    GLSL.Object.addEventListener = function(eventType, listener, thisObject)
    {
        thisObject = thisObject || null;
    
        console.assert(eventType, "Object.addEventListener: invalid event type ", eventType, "(listener: ", listener, "thisObject: ", thisObject, ")");
        if (!eventType)
            return;
    
        console.assert(listener, "Object.addEventListener: invalid listener ", listener, "(event type: ", eventType, "thisObject: ", thisObject, ")");
        if (!listener)
            return;
    
        if (!this._listeners)
            this._listeners = {};
    
        var listeners = this._listeners[eventType];
        if (!listeners)
            listeners = this._listeners[eventType] = [];
    
        // Prevent registering multiple times.
        for (var i = 0; i < listeners.length; ++i) {
            if (listeners[i].listener === listener && listeners[i].thisObject === thisObject)
                return;
        }
    
        listeners.push({thisObject: thisObject, listener: listener});
    };
    
    GLSL.Object.removeEventListener = function(eventType, listener, thisObject)
    {
        eventType = eventType || null;
        listener = listener || null;
        thisObject = thisObject || null;
    
        if (!this._listeners)
            return;
    
        if (!eventType) {
            for (eventType in this._listeners)
                this.removeEventListener(eventType, listener, thisObject);
            return;
        }
    
        var listeners = this._listeners[eventType];
        if (!listeners)
            return;
    
        for (var i = listeners.length - 1; i >= 0; --i) {
            if (listener && listeners[i].listener === listener && listeners[i].thisObject === thisObject)
                listeners.splice(i, 1);
            else if (!listener && thisObject && listeners[i].thisObject === thisObject)
                listeners.splice(i, 1);
        }
    
        if (!listeners.length)
            delete this._listeners[eventType];
    
        if (!Object.keys(this._listeners).length)
            delete this._listeners;
    };
    
    GLSL.Object.removeAllListeners = function()
    {
        delete this._listeners;
    };
    
    GLSL.Object.hasEventListeners = function(eventType)
    {
        if (!this._listeners || !this._listeners[eventType])
            return false;
        return true;
    };
    
    GLSL.Object.prototype = {
        constructor: GLSL.Object,
    
        addEventListener: GLSL.Object.addEventListener,
    
        removeEventListener: GLSL.Object.removeEventListener,
    
        removeAllListeners: GLSL.Object.removeAllListeners,
    
        hasEventListeners: GLSL.Object.hasEventListeners,
    
        dispatchEventToListeners: function(eventType, eventData)
        {
            var event = new GLSL.Event(this, eventType, eventData);
    
            function dispatch(object)
            {
                if (!object || !object._listeners || !object._listeners[eventType] || event._stoppedPropagation)
                    return;
    
                // Make a copy with slice so mutations during the loop doesn't affect us.
                var listenersForThisEvent = object._listeners[eventType].slice(0);
    
                // Iterate over the listeners and call them. Stop if stopPropagation is called.
                for (var i = 0; i < listenersForThisEvent.length; ++i) {
                    listenersForThisEvent[i].listener.call(listenersForThisEvent[i].thisObject, event);
                    if (event._stoppedPropagation)
                        break;
                }
            }
    
            // Dispatch to listeners of this specific object.
            dispatch(this);
    
            // Allow propagation again so listeners on the constructor always have a crack at the event.
            event._stoppedPropagation = false;
    
            // Dispatch to listeners on all constructors up the prototype chain, including the immediate constructor.
            var constructor = this.constructor;
            while (constructor) {
                dispatch(constructor);
    
                if (!constructor.prototype.__proto__)
                    break;
    
                constructor = constructor.prototype.__proto__.constructor;
            }
    
            return event.defaultPrevented;
        }
    };
    
    GLSL.Event = function(target, type, data)
    {
        this.target = target;
        this.type = type;
        this.data = data;
        this.defaultPrevented = false;
        this._stoppedPropagation = false;
    };
    
    GLSL.Event.prototype = {
        constructor: GLSL.Event,
    
        stopPropagation: function()
        {
            this._stoppedPropagation = true;
        },
    
        preventDefault: function()
        {
            this.defaultPrevented = true;
        }
    };
    
    module.exports = GLSL;
  });

  modules.define("runtime/vector", function(module, require) {
    Runtime = {};
    
    Runtime.vec = function(d) {
        if (!(this instanceof Runtime.vec)) {
            var arr = [];
            for (var i = 0; i < arguments.length; ++i) {
                // from vec
                if (arguments[i] instanceof Runtime.vec)
                    arr = arr.concat(arguments[i].get().slice());
                // from number
                else if (typeof arguments[i] === 'number')
                    arr.push(arguments[i]);
            }
            return new Runtime.vec(arr);
        }
    
        this.d = d;
        return this;
    }
    
    Runtime.vec.prototype = {
        constructor: Runtime.vec,
    
        cast: function(dim)
        {
            // same dimension casting: from vec to vec? (? = 2 or 3 or 4)
            if (typeof dim === "undefined" || dim === this.dimensions()) {
                switch (this.dimensions()) {
                case 2: return new Runtime.Vec2(this.d);
                case 3: return new Runtime.Vec3(this.d);
                case 4: return new Runtime.Vec4(this.d);
                default:
                }
                return this;
            }
    
            // from high to low
            if (dim < this.dimensions()) {
                this.d.splice(dim, this.dimensions() - dim);
                return this.cast();
            }
    
            // from low to high
            if (this.dimensions() == 1) {
                for (var i = 1; i < dim; ++i)
                    this.d.push(this.d[0]);
                return this.cast();
            }
    
            return this;
        },
    
        get: function(selector)
        {
            if (typeof selector === "undefined")
                return this.d;
    
            // if i is a string: xyzw, rgba, or stpq, return vec
            if (typeof selector === 'string') {
                var result = [];
                for (var i = 0; i < selector.length; ++i) {
                    switch (selector.charAt(i)) {
                    case 'x':
                    case 'r':
                    case 's':
                        result.push(this.d[0]);
                        break;
                    case 'y':
                    case 'g':
                    case 't':
                        if (this.dimensions() >= 2)
                            result.push(this.d[1]);
                        break;
                    case 'z':
                    case 'b':
                    case 'p':
                        if (this.dimensions() >= 3)
                            result.push(this.d[2]);
                        break;
                    case 'w':
                    case 'a':
                    case 'q':
                        if (this.dimensions() >= 4)
                            result.push(this.d[3]);
                        break;
                    default:
                    }
                }
                if (result.length === 1)
                    return result[0];
                return Runtime.vec.apply(null, result).cast();
            }
    
            // if selector is a number, return number
            if (selector >= this.dimensions())
                return null;
    
            return this.d[selector];
        },
    
        set: function(selector, value)
        {
            if (typeof selector === 'number') {
                if (selector < this.dimensions())
                    this.d[selector] = value;
    
                return this;
            }
    
            if (typeof selector === 'string') {
                for (var i = 0; i < selector.length; ++i) {
                    var destructuredValue = (typeof value === 'number') ? value : value.get(i);
                    switch (selector.charAt(i)) {
                    case 'x':
                    case 'r':
                    case 's':
                        this.set(0, destructuredValue);
                        break;
                    case 'y':
                    case 'g':
                    case 't':
                        if (this.dimensions() >= 2)
                            this.set(1, destructuredValue);
                        break;
                    case 'z':
                    case 'b':
                    case 'p':
                        if (this.dimensions() >= 3)
                            this.set(2, destructuredValue);
                        break;
                    case 'w':
                    case 'a':
                    case 'q':
                        if (this.dimensions() >= 4)
                            this.set(3, destructuredValue);
                        break;
                    default:
                        throw new Error("Unknown field or index selector character '" + selector.charAt(i) + "' for Runtime.vec");
                    }
                }
                return this;
            }
    
            throw new Error("Unknown field or index selector '" + selector + "' for Runtime.vec");
        },
    
        dimensions: function()
        {
            return this.d.length;
        },
    
        add: function(v)
        {
            if (v instanceof Runtime.vec) {
                for (var i = 0; i < this.d.length; ++i)
                    this.d[i] += v.d[i];
            }
            else if (typeof v === 'number') {
                for (var i = 0; i < this.d.length; ++i)
                    this.d[i] += v;
            }
            else
                throw new Error("Unexpected argument to vec.add");
    
            return this;
        },
    
        negate: function()
        {
            for (var i = 0; i < this.d.length; ++i)
                this.d[i] = -this.d[i];
    
            return this;
        },
    
        subtract: function(v)
        {
            if (v instanceof Runtime.vec) {
                for (var i = 0; i < this.d.length; ++i)
                    this.d[i] -= v.d[i];
            }
            else if (typeof v === 'number') {
                for (var i = 0; i < this.d.length; ++i)
                    this.d[i] -= v;
            }
            else
                throw new Error("Unexpected argument to vec.subtract");
    
            return this;
        },
    
        multiply: function(v)
        {
            // vec .* vec
            if (v instanceof Runtime.vec) {
                if (!this._op_check(v))
                    return;
    
                for (var i = 0; i < this.d.length; ++i)
                    this.d[i] *= v.d[i];
                return this;
            }
    
            //if (v instanceof mat) {
            //}
    
            // vec * number
            for (var i = 0; i < this.d.length; ++i)
                this.d[i] *= v;
    
            return this;
        },
    
        divide: function(v)
        {
            if (v instanceof Runtime.vec) {
                for (var i = 0; i < this.d.length; ++i)
                    this.d[i] /= v.d[i];
            }
            else if (typeof v === 'number') {
                v = v || 0.0000001; // Try to avoid NaNs from div0
                for (var i = 0; i < this.d.length; ++i)
                    this.d[i] /= v;
            }
            else
                throw new Error("Unexpected argument to vec.add");
    
            return this;
        },
    
        equal: function(v)
        {
            if (!this._op_check(v))
                return;
    
            for (var i = 0; i < this.d.length; ++i)
                if (this.d[i] != v.d[i])
                    return false;
            return true;
        },
    
        dot: function(v)
        {
            if (!this._op_check(v))
                return;
    
            var r = 0;
            for (var i = 0; i < this.d.length; ++i)
                r += this.d[i] * v.d[i];
            return r;
        },
    
        normalize: function()
        {
            var len = this.length();
    
            for (var i = 0; i < this.d.length; ++i)
                this.d[i] /= len;
    
            return this;
        },
    
        length: function()
        {
            return Math.sqrt(this.length2());
        },
    
        length2: function()
        {
            var r = 0;
            for (var i = 0; i < this.d.length; ++i)
                r += this.d[i] * this.d[i];
    
            return r;
        },
    
        _op_check: function(v)
        {
            if (!(v instanceof Runtime.vec)) {
                console.error("argument to vec operation is not a vec.");
                return false;
            }
    
            if (v.dimensions() != this.dimensions()) {
                console.error("unable to operate on two vecs of different dimensions.");
                return false;
            }
    
            return true;
        },
    };
    
    Runtime.Vec2 = function(d) {
        if (!(this instanceof Runtime.Vec2)) {
            return Runtime.vec.apply(null, arguments).cast(2);
        }
    
        if (d.length != 2) {
            console.error("2 arguments to Vec2 is expected.");
            return;
        }
        this.d = d;
        return this;
    }
    
    Runtime.Vec2.prototype = {
        constructor: Runtime.Vec2,
        __proto__: Runtime.vec.prototype,
    };
    
    Runtime.Vec3 = function(d) {
        if (!(this instanceof Runtime.Vec3)) {
            return Runtime.vec.apply(null, arguments).cast(3);
        }
    
        if (d.length != 3) {
            console.error("3 arguments to Vec3 is expected.");
            return;
        }
        this.d = d;
        return this;
    }
    
    Runtime.Vec3.prototype = {
        constructor: Runtime.Vec3,
        __proto__: Runtime.vec.prototype,
    };
    
    Runtime.Vec3.prototype.cross = function(v) {
        if (v.dimensions() != 3)
            console.error("arguments to Vec3.cross() should be Vec3.");
    
        return Runtime.Vec3(
            this.get(1) * v.get(2) - this.get(2) * v.get(1),
            this.get(2) * v.get(0) - this.get(0) * v.get(2),
            this.get(0) * v.get(1) - this.get(1) * v.get(0)
        );
    }
    
    Runtime.Vec4 = function(d) {
        if (!(this instanceof Runtime.Vec4)) {
            return Runtime.vec.apply(null, arguments).cast(4);
        }
    
        if (d.length != 4) {
            console.error("4 arguments to Vec4 is expected.");
            return;
        }
        this.d = d;
        return this;
    }
    
    Runtime.Vec4.prototype = {
        constructor: Runtime.Vec4,
        __proto__: Runtime.vec.prototype,
    };
    
    module.exports = {
        "vec": Runtime.vec,
        "Vec2": Runtime.Vec2,
        "Vec3": Runtime.Vec3,
        "Vec4": Runtime.Vec4
    };
  });

  modules.define("runtime/matrix", function(module, require) {
    var Runtime = {};
    Runtime.vec = require('./vector').vec;
    
    Runtime.mat = function(argv) {
        if (!(this instanceof Runtime.mat)) {
            var d = [];
    
            // construct by a mat
            if (arguments[0] instanceof Runtime.mat) {
                var n = arguments[0].d.length;
                for (var i = 0; i < n; i++) {
                    d.push(arguments[0].d[i].slice());
                }
                return new Runtime.mat(d);
            }
    
            // construct by a set of vec
            if (arguments[0] instanceof Runtime.vec) {
                var n = arguments.length;
                for (var i = 0; i < n; i++)
                    d.push([]);
                for (var i = 0; i < n; i++) {
                    for (var j = 0; j < n; j++) {
                        if (j < arguments[i].dimensions())
                            d[j].push(arguments[i].get(j));
                        else
                            d[j].push(0);
                    }
                }
                return new Runtime.mat(d);
            }
    
            // construct by numbers
            // we only take the first n * n numbers and ignore the rest
            var n = Math.floor(Math.sqrt(arguments.length));
            for (var i = 0; i < n; i++)
                    d.push([]);
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < n; j++)
                    d[j].push(arguments[i * n + j]);
            }
            return new Runtime.mat(d);
        }
    
        // store as a 2d array
        this.d = argv;
        return this;
    }
    
    Runtime.mat.prototype = {
        constructor: Runtime.mat,
    
        cast: function()
        {
            // same dimension casting: from mat to mat? (? = 2 or 3 or 4)
            if (arguments.length == 0 || arguments[0] == this.dimensions()) {
                switch (this.dimensions()) {
                case 2: return new Runtime.Mat2(this.d);
                case 3: return new Runtime.Mat3(this.d);
                case 4: return new Runtime.Mat4(this.d);
                default:
                }
                return this;
            }
    
            var dim = arguments[0];
    
            // from high to low
            if (dim < this.dimensions()) {
                this.d.splice(dim, this.dimensions() - dim);
                for (var i in this.d) {
                    this.d[i].splice(dim, this.d[i].length - dim);
                }
                return this.cast();
            }
    
            // from low to high
            var f = this.dimensions() == 1 ? this.d[0][0] : 1;
            for (var i in this.d)
                for (var j = this.dimensions(); j < dim; j++)
                    this.d[i].push(0);
            for (var i = this.dimensions(); i < dim; i++) {
                this.d.push([]);
                for (var j = 0; j < dim; j++) {
                    if (i == j)
                        this.d[i].push(f);
                    else
                        this.d[i].push(0);
                }
            }
            return this.cast()
        },
    
        get: function()
        {
            if (arguments.length == 0)
                return null;
    
            // process the first argument
            var i = arguments[0];
            if (i >= this.dimensions())
                return null;
    
            var v = Runtime.vec.apply(null, this.d[i]);
    
            if (arguments.length == 1)
                return v.cast();
    
            // process the second argument
            var j = arguments[1];
            return v.get(j);
        },
    
        set: function()
        {
            if (arguments.length < 2)
                return this;
    
            // process the first argument
            var i = arguments[0];
            if (i >= this.dimensions())
                return this;
    
            // set a vec using one argument
            if (arguments.length == 2) {
                var v = arguments[1];
    
                for (var j = 0; j < this.dimensions(); j++) {
                    if (j < v.dimensions())
                        this.d[i][j] = v.get(j);
                    else
                        this.d[i][j] = 0;
                }
                return this;
            }
    
            // set a number or vec using two arguments
            var j = arguments[1];
            var k = arguments[2];
    
            var v = Runtime.vec.apply(null, this.d[i]).set(j, k);
    
            if (typeof v === 'number') {
                this.d[i][j] = v;
                return this;
            }
    
            this.d[i] = v.d;
    
            return this;
        },
    
        dimensions: function()
        {
            return this.d.length;
        },
    
        equal: function(m)
        {
            if (!this._op_check(m))
                return false;
    
            if (this.dimensions() != m.dimensions())
                return false;
    
            for (var i = 0; i < this.dimensions(); i++)
                for (var j = 0; j < this.dimensions(); j++)
                    if (this.d[i][j] != m.d[i][j])
                        return false;
    
            return true;
        },
    
        add: function(m)
        {
            return this._op(m, "+");
        },
    
        subtract: function(m)
        {
            return this._op(m, "-");
        },
    
        matrixCompMult: function(m)
        {
            return this._op(m, "*");
        },
    
        divide: function(m)
        {
            return this._op(m, "/");
        },
    
        multiply: function(m)
        {
            // mat * mat
            // TODO set the resulting mat to this
            if (m instanceof Runtime.mat) {
                if (!this._op_check(m))
                    return this;
    
                var t = Runtime.mat(m).subtract(m); // set zero matrix
                for (var i = 0; i < this.dimensions(); i++)
                    for (var j = 0; j < this.dimensions(); j++)
                        for (var k = 0; k < this.dimensions(); k++)
                            t.d[j][i] += this.d[k][i] * m.d[j][k];
                return t;
            }
    
            // mat * vec
            if (m instanceof Runtime.vec) {
                if (!this._op_check_vec(v))
                    return this;
    
                var t = Runtime.vec(m).subtract(m);
                for (var i = 0; i < this.dimensions(); i++) {
                    var f = 0;
                    for (var j = 0; j < this.dimensions(); j++)
                        f += this.d[j][i] * m.get(j);
                    t.set(i, f);
                }
                return t;
            }
    
            // mat * number
            for (var i = 0; i < this.dimensions(); i++)
                for (var j = 0; j < this.dimensions(); j++)
                    this.d[i][j] *= m;
    
            return this;
        },
    
        _op: function(m, op)
        {
            if (!this._op_check(m))
                return this;
    
            for (var i = 0; i < this.dimensions(); i++)
                for (var j = 0; j < this.dimensions(); j++) {
                    if (op == "+")
                        this.d[i][j] += m.d[i][j];
                    else if (op == "-")
                        this.d[i][j] -= m.d[i][j];
                    else if (op == "*")
                        this.d[i][j] *= m.d[i][j];
                    else if (op == "/")
                        this.d[i][j] /= m.d[i][j];
                }
    
            return this;
        },
    
        _op_check: function(m)
        {
            if (!(m instanceof Runtime.mat)) {
                console.error("argument to mat operation is not a mat.");
                return false;
            }
    
            if (m.dimensions() != this.dimensions()) {
                console.error("unable to operate on two mats of different dimensions.");
                return false;
            }
    
            return true;
        },
    
        _op_check_vec: function(m)
        {
            if (!(m instanceof Runtime.vec)) {
                console.error("argument is not a vec.");
                return false;
            }
    
            if (m.dimensions() != this.dimensions()) {
                console.error("unable to operate on mat and vec of different dimensions.");
                return false;
            }
    
            return true;
        }
    };
    
    Runtime.Mat2 = function(d) {
        if (!(this instanceof Runtime.Mat2)) {
            return Runtime.mat.apply(null, arguments).cast(2);
        }
    
        if (d.length != 2) {
            console.error("2 arguments to Mat2 is expected.");
            return;
        }
        this.d = d;
        return this;
    };
    
    Runtime.Mat2.prototype = {
        constructor: Runtime.Mat2,
        __proto__: Runtime.mat.prototype,
    };
    
    Runtime.Mat3 = function(d) {
        if (!(this instanceof Runtime.Mat3)) {
            return Runtime.mat.apply(null, arguments).cast(3);
        }
    
        if (d.length != 3) {
            console.error("3 dimensions of Mat3 is expected.");
            return;
        }
        this.d = d;
        return this;
    };
    
    Runtime.Mat3.prototype = {
        constructor: Runtime.Mat3,
        __proto__: Runtime.mat.prototype,
    };
    
    Runtime.Mat4 = function(d) {
        if (!(this instanceof Runtime.Mat4)) {
            return Runtime.mat.apply(null, arguments).cast(4);
        }
    
        if (d.length != 4) {
            console.error("4 dimensions of Mat4 is expected.");
            return;
        }
        this.d = d;
        return this;
    };
    
    Runtime.Mat4.prototype = {
        constructor: Runtime.Mat4,
        __proto__: Runtime.mat.prototype,
    };
    
    module.exports = {
        "mat": Runtime.mat,
        "Mat2": Runtime.Mat2,
        "Mat3": Runtime.Mat3,
        "Mat4": Runtime.Mat4
    };
  });

  modules.define("runtime/access", function(module, require) {
    var Runtime = {};
    Runtime.vec = require('./vector').vec;
    Runtime.mat = require("./matrix").mat;
    
    var access = {};
    
    access.get = function() {
        if (arguments.length == 0)
            return;
    
        var x = arguments[0];
    
        // get from vec
        if (x instanceof Runtime.vec) {
            if (arguments.length < 2)
                return x;
    
            return x.get(arguments[1]);
        }
    
        // get from mat
        if (x instanceof Runtime.mat) {
            if (arguments.length < 2)
                return x;
    
            if (arguments.length == 2)
                return x.get(arguments[1]);
    
            return x.get(arguments[1], arguments[2]);
        }
    
        // get from others (self)
        return x;
    }
    
    access.set = function() {
        if (arguments.length == 0)
            return;
    
        var x = arguments[0];
    
        // set to vec
        if (x instanceof Runtime.vec) {
            if (arguments.length < 3)
                return x;
    
            return x.set(arguments[1], arguments[2]);
        }
    
        // set to mat
        if (x instanceof Runtime.mat) {
            if (arguments.length < 3)
                return x;
    
            if (arguments.length == 3)
                return x.set(arguments[1], arguments[2]);
    
            return x.set(arguments[1], arguments[2], arguments[3]);
        }
    
        return x;
    }
    
    module.exports = access;
  });

  modules.define("runtime/internal", function(module, require) {
    var Runtime = {};
    var vector = require('./vector');
    Runtime.vec = vector.vec;
    Runtime.Vec2 = vector.Vec2;
    Runtime.Vec3 = vector.Vec3;
    Runtime.Vec4 = vector.Vec4;
    
    var Internal = {}
    
    Internal._evalVec = function() {
        var func = arguments[arguments.length - 1];
    
        r = Runtime.vec(arguments[0]).cast();
        for (var i = 0; i < arguments[0].dimensions(); i++) {
            var arr = [];
            for (var j = 0; j < arguments.length - 1; j++)
                arr.push(arguments[j].get(i));
            r.set(i, func.apply(this, arr));
        }
        return r;
    }
    
    Internal._extVec = function(x, ref) {
        if (x instanceof Runtime.vec)
            return x;
    
        switch (ref.dimensions()) {
        case 2: return Runtime.Vec2(x);
        case 3: return Runtime.Vec3(x);
        case 4: return Runtime.Vec4(x);
        default:
        }
    
        return x;
    }
    
    Internal._compare = function(x, y, op) {
        var r = Runtime.vec(x).subtract(x);
        if (op == "<") {
            for (var i = 0; i < x.dimensions(); i++)
                r.set(i, x.get(i) < y.get(i) ? 1 : 0);
        } else if (op == "<=") {
            for (var i = 0; i < x.dimensions(); i++)
                r.set(i, x.get(i) <= y.get(i) ? 1 : 0);
        } else if (op == ">") {
            for (var i = 0; i < x.dimensions(); i++)
                r.set(i, x.get(i) > y.get(i) ? 1 : 0);
        } else if (op == ">=") {
            for (var i = 0; i < x.dimensions(); i++)
                r.set(i, x.get(i) >= y.get(i) ? 1 : 0);
        } else if (op == "==") {
            for (var i = 0; i < x.dimensions(); i++)
                r.set(i, x.get(i) == y.get(i) ? 1 : 0);
        } else if (op == "!=") {
            for (var i = 0; i < x.dimensions(); i++)
                r.set(i, x.get(i) != y.get(i) ? 1 : 0);
        }
    
        return r;
    }
    
    Internal._op_check = function() {
        for (var i = 0; i < arguments.length; i++) {
            if (!(arguments[i] instanceof Runtime.vec))
                throw new Error("Expected argument to be instanceof Runtime.vec!");
    
            if (i > 0 && arguments[i].dimensions() != arguments[i - 1].dimensions())
                throw new Error("Expected binary operands to have the same dimensions!");
        }
    
        return true;
    }
    
    Internal._checkNumber = function() {
        for (var i = 0; i < arguments.length; i++)
            if (typeof arguments[i] !== 'number')
                return false;
        return true;
    }
    
    Internal.pos = function(x) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, Internal.pos);
        return +x;
    }
    
    Internal.neg = function(x) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, Internal.neg);
        return -x;
    }
    
    Internal.bnot = function(x) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, Internal.bnot);
        return ~x;
    }
    
    Internal.lnot = function(x) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, Internal.lnot);
        return !x;
    }
    
    Internal.mod = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, this._extVec(y, x), Internal.mod);
        return x - Math.floor(x / y) * y;
    }
    
    Internal.shl = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.shl);
        return x << y;
    }
    
    Internal.shr = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.shr);
        return x >> y;
    }
    
    Internal.lt = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.lt);
        return x < y;
    }
    
    Internal.gt = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.gt);
        return x > y;
    }
    
    Internal.le = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.le);
        return x <= y;
    }
    
    Internal.ge = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.ge);
        return x >= y;
    }
    
    Internal.band = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.band);
        return x & y;
    }
    
    Internal.bxor = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.bxor);
        return x ^ y;
    }
    
    Internal.bor = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.bor);
        return x | y;
    }
    
    Internal.land = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.land);
        return x && y;
    }
    
    Internal.lxor = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.lxor);
        return (x && !y) || (!x && y);
    }
    
    Internal.lor = function(x, y) {
        if (x instanceof Runtime.vec)
            return this._evalVec(x, y, Internal.lor);
        return x || y;
    }
    
    module.exports = Internal;
  });

  modules.define("runtime/builtins", function(module, require) {
    var Runtime = {};
    var vector = require('./vector');
    var internal = require('./internal');
    var texture = require('./texture');
    Runtime.vec = vector.vec;
    Runtime.Vec2 = vector.Vec2;
    Runtime.Vec3 = vector.Vec3;
    Runtime.Vec4 = vector.Vec4;
    
    var Builtins = {};
    
    // Angle & Trigonometry Functions [OpenGL ES SL 1.0, Sec 8.1]
    
    Builtins.radians = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.radians);
        return x / 180 * Math.PI;
    }
    
    Builtins.degrees = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.degrees);
        return x / Math.PI * 180;
    }
    
    Builtins.sin = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.sin);
        return Math.sin(x);
    }
    
    Builtins.cos = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.cos);
        return Math.cos(x);
    }
    
    Builtins.tan = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.tan);
        return Math.tan(x);
    }
    
    Builtins.asin = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.asin);
        return Math.asin(x);
    }
    
    Builtins.acos = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.acos);
        return Math.acos(x);
    }
    
    Builtins.atan = function(y, x) {
        if (typeof x !== "undefined") {
            if (y instanceof Runtime.vec)
                return internal._evalVec(y, x, Builtins.atan);
            return Math.atan2(y, x);
        }
    
        if (y instanceof Runtime.vec)
            return internal._evalVec(y, Builtins.atan);
        return Math.atan(y);
    }
    
    // Exponential Functions [OpenGL ES SL 1.0, Sec. 8.2]
    
    Builtins.pow = function(x, y) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, y, Builtins.pow);
        return Math.pow(x, y);
    }
    
    Builtins.exp = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.exp);
        return Math.exp(x);
    }
    
    Builtins.log = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.log);
        return Math.log(x);
    }
    
    Builtins.exp2 = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.exp2);
        return Math.pow(2, x);
    }
    
    Builtins.log2 = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.log2);
        return Math.log(x) / Math.log(2);
    }
    
    Builtins.sqrt = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.sqrt);
        return Math.sqrt(x);
    }
    
    Builtins.inversesqrt = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.inversesqrt);
        return 1 / Math.sqrt(x);
    }
    
    // Common Functions [OpenGL ES SL 1.0, Sec. 8.3]
    
    Builtins.abs = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.abs);
        return x >= 0 ? x : -x;
    }
    
    Builtins.sign = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.sign);
        if (x == 0) return 0;
        return x > 0 ? 1 : -1;
    }
    
    Builtins.floor = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.floor);
        return Math.floor(x);
    }
    
    Builtins.ceil = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.ceil);
        return Math.ceil(x);
    }
    
    Builtins.fract = function(x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, Builtins.fract);
        return x - Builtins.floor(x);
    }
    
    Builtins.mod = function(x, y) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, internal._extVec(y, x), Builtins.mod);
        return x - Math.floor(x / y) * y;
    }
    
    Builtins.min = function(x, y) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, internal._extVec(y, x), Builtins.min);
        return Math.min(x, y);
    }
    
    Builtins.max = function(x, y) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, internal._extVec(y, x), Builtins.max);
        return Math.max(x, y);
    }
    
    Builtins.clamp = function(x, minVal, maxVal) {
        if (minVal > maxVal)
            throw new Error("clamp(): maxVal must be larger than minVal.");
    
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, internal._extVec(minVal, x), internal._extVec(maxVal, x), Builtins.clamp);
    
        return Builtins.min(Builtins.max(x, minVal), maxVal);
    }
    
    Builtins.mix = function(x, y, alpha) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(x, y, internal._extVec(alpha, x), Builtins.mix);
    
        return alpha * x + (1 - alpha) * y;
    }
    
    Builtins.step = function(edge, x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(internal._extVec(edge, x), x, Builtins.step);
        return x < edge ? 0 : 1;
    }
    
    Builtins.smoothstep = function(edge0, edge1, x) {
        if (x instanceof Runtime.vec)
            return internal._evalVec(internal._extVec(edge0, x), internal._extVec(edge1, x), x, Builtins.smoothstep);
        var t = Builtins.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }
    
    // Geometric Functions [OpenGL ES SL 1.0, Sec. 8.4]
    
    Builtins.length = function(v) {
        if (internal._checkNumber(v))
            return Math.abs(v);
    
        if (!internal._op_check(v))
            return null;
    
        return v.length();
    }
    
    Builtins.distance = function(x, y) {
        if (internal._checkNumber(x, y))
            return Math.abs(x - y);
    
        if (!internal._op_check(x, y))
            return null;
    
        var r = Runtime.vec(x).subtract(y);
        return Builtins.length(r);
    }
    
    Builtins.dot = function(x, y) {
        if (internal._checkNumber(x, y))
            return x * y;
    
        if (!internal._op_check(x, y))
            return null;
    
        return x.dot(y);
    }
    
    Builtins.cross = function(x, y) {
        if (x.dimensions() != 3)
            throw new Error("cross(): parameters x and y must have 3 dimensions.");
    
        if (!internal._op_check(x, y))
            return null;
    
        return Runtime.Vec3(x).cross(y);
    }
    
    Builtins.normalize = function(x) {
        if (internal._checkNumber(x)) {
            if (x == 0)
                return x;
            return x / Math.abs(x);
        }
    
        if (!internal._op_check(x))
            return null;
    
        return x.normalize();
    }
    
    // TODO make it work when arguments are float?
    Builtins.faceforward = function(N, I, Nref) {
        if (!internal._op_check(I, N, Nref))
            return null;
    
        // TODO do we expect to change N?
        var r = Builtins.dot(Nref, I) < 0 ? Runtime.vec(N) : Runtime.vec(N).negate();
        return r.cast();
    }
    
    // TODO make it work when arguments are float?
    Builtins.reflect = function(I, N) {
        if (!internal._op_check(I, N))
            return null;
    
        var temp = Builtins.dot(I, N) * 2;
        return Runtime.vec(I).subtract(Runtime.vec(N).multiply(temp)).cast();
    }
    
    // TODO check the correctness
    // TODO make it work when arguments are float?
    Builtins.refract = function(I, N, eta) {
        if (!internal._op_check(I, N))
            return null;
    
        var k = 1 - eta * eta * (1 - Builtins.dot(I, N) * Builtins.dot(I, N));
    
        if (k < 0)
            return Runtime.vec(I).subtract(I);
        var r = eta * Builtins.dot(I, N) + Math.sqrt(k);
    
        return Runtime.vec(I).multiply(eta).subtract(Runtime.vec(N).multiply(r)).cast();
    }
    
    // Matrix Functions [OpenGL ES SL 1.0, Sec. 8.5]
    
    Builtins.matrixCompMult = function(a, b)
    {
        return a.matrixCompMult(b);
    }
    
    // Vector Relational Functions [OpenGL ES SL 1.0, Sec. 8.6]
    
    Builtins.lessThan = function(x, y) {
        return internal._compare(x, y, "<");
    }
    
    Builtins.lessThanEqual = function(x, y) {
        return internal._compare(x, y, "<=");
    }
    
    Builtins.greaterThan = function(x, y) {
        return internal._compare(x, y, ">");
    }
    
    Builtins.greaterThanEqual = function(x, y) {
        return internal._compare(x, y, ">=");
    }
    
    Builtins.equal = function(x, y) {
        return internal._compare(x, y, "==");
    }
    
    Builtins.notEqual = function(x, y) {
        return internal._compare(x, y, "!=");
    }
    
    Builtins.any = function(x) {
        for (var i = 0; i < x.dimensions(); i++)
            if (x.get(i))
                return true;
    
        return false;
    }
    
    Builtins.all = function(x) {
        for (var i = 0; i < x.dimensions(); i++)
            if (!x.get(i))
                return false;
    
        return true;
    }
    
    Builtins.not = function(x) {
        var r = Runtime.vec(x);
        for (var i = 0; i < x.dimensions(); i++)
            r.set(i, x.get(i) ? 0 : 1);
    
        return r;
    }
    
    Builtins.texture2DLod = function(sampler, coord, lod) {
        return texture.texture2D(sampler, coord, lod);
    }
    
    Builtins.texture2DProjLod = function(sampler, coord, lod) {
        return texture.texture2DProj(sampler, coord, lod);
    }
    
    Builtins.textureCubeLod = function(sampler, coord, lod) {
        return texture.textureCube(sampler, coord, lod);
    }
    
    Builtins.texture2D = function(sampler, coord) {
        if (arguments.length == 3)
            return texture.texture2D(sampler, coord, arguments[2]);
    
        return texture.texture2D(sampler, coord);
    }
    
    Builtins.texture2DProj = function(sampler, coord) {
        if (arguments.length == 3)
            return texture.texture2DProj(sampler, coord, arguments[2]);
    
        return texture.texture2DProj(sampler, coord);
    }
    
    Builtins.textureCube = function(sampler, coord) {
        if (arguments.length == 3)
            return texture.textureCube(sampler, coord, arguments[2]);
    
        return texture.textureCube(sampler, coord);
    }
    
    module.exports = Builtins;
  });

  modules.define("runtime/ops", function(module, require) {
    var Runtime = {};
    Runtime.vec = require('./vector').vec;
    Runtime.mat = require("./matrix").mat;
    internal = require('./builtins');
    var internal = require('./internal');
    
    Operations = {};
    
    // Unary Operators [OpenGL ES SL 1.0, Sec 5.9]
    
    // + term
    Operations.op_pos = function(term)
    {
        return internal.pos(term);
    }
    
    // - term
    Operations.op_neg = function(term)
    {
        return internal.neg(term);
    }
    
    // ~ term
    Operations.op_bnot = function(term)
    {
        return internal.bnot(term);
    }
    
    // ! term
    Operations.op_lnot = function(term)
    {
        return internal.lnot(term);
    }
    
    // Binary Operators [OpenGL ES SL 1.0, Sec 5.9]
    
    // lhs == rhs
    Operations.op_eq = function(lhs, rhs)
    {
        if (lhs instanceof Runtime.vec && rhs instanceof Runtime.vec)
            return lhs.equal(rhs);
    
        if (lhs instanceof Runtime.mat && rhs instanceof Runtime.mat)
            return lhs.equal(rhs);
    
        if (typeof lhs != 'Object' && typeof rjs != 'Object')
            return lhs == rhs;
    
        return false;
    }
    
    // lhs != rhs
    Operations.op_neq = function(lhs, rhs)
    {
        return !this.op_eq(lhs, rhs);
    }
    
    // lhs * rhs
    Operations.op_mul = function(lhs, rhs)
    {
        var scalarLHS = !(lhs instanceof Runtime.vec || lhs instanceof Runtime.mat);
        var scalarRHS = !(rhs instanceof Runtime.vec || rhs instanceof Runtime.mat);
    
        // {i,f} * {i,f}
        if (scalarLHS && scalarRHS)
            return lhs * rhs;
    
        // {i,f} * {vec,mat}
        if (scalarLHS)
            return rhs.multiply(lhs);
    
        // {vec,mat} * {i,f}
        if (scalarRHS)
            return lhs.multiply(rhs);
    
        // {vec,mat} * {vec,mat}
        return lhs.multiply(rhs);
    }
    
    // lhs / rhs
    Operations.op_div = function(lhs, rhs)
    {
        if (lhs instanceof Runtime.vec && rhs instanceof Runtime.mat)
            throw new Error("op_div cannot handle vec / mat");
    
        if (lhs instanceof Runtime.mat && rhs instanceof Runtime.vec)
            throw new Error("op_div cannot handle mat / vec");
    
        if (lhs instanceof Runtime.vec || lhs instanceof Runtime.mat)
            return lhs.divide(rhs);
    
        if (rhs instanceof Runtime.vec || rhs instanceof Runtime.mat)
            return rhs.divide(lhs);
    
        return lhs / rhs;
    }
    
    // lhs % rhs
    Operations.op_mod = function(lhs, rhs)
    {
        return internal.mod(lhs, rhs);
    }
    
    // lhs + rhs
    Operations.op_add = function(lhs, rhs)
    {
        if (lhs instanceof Runtime.vec && rhs instanceof Runtime.mat)
            throw new Error("op_add cannot handle vec + mat");
    
        if (lhs instanceof Runtime.mat && rhs instanceof Runtime.vec)
            throw new Error("op_add cannot handle mat + vec");
    
        if (lhs instanceof Runtime.vec || lhs instanceof Runtime.mat)
            return lhs.add(rhs);
    
        if (rhs instanceof Runtime.vec || rhs instanceof Runtime.mat)
            return rhs.add(lhs);
    
        return lhs + rhs;
    }
    
    // lhs - rhs
    Operations.op_sub = function(lhs, rhs)
    {
        if (lhs instanceof Runtime.vec && rhs instanceof Runtime.mat)
            throw new Error("op_sub cannot handle vec - mat");
    
        if (lhs instanceof Runtime.mat && rhs instanceof Runtime.vec)
            throw new Error("op_sub cannot handle mat - vec");
    
        if (lhs instanceof Runtime.vec || lhs instanceof Runtime.mat)
            return lhs.subtract(rhs);
    
        if (rhs instanceof Runtime.vec || rhs instanceof Runtime.mat)
            return rhs.subtract(lhs);
    
        return lhs - rhs;
    }
    
    // lhs << rhs
    Operations.op_shl = function(lhs, rhs)
    {
        return internal.shl(lhs, rhs);
    }
    
    // lhs >> rhs
    Operations.op_shr = function(lhs, rhs)
    {
        return internal.shr(lhs, rhs);
    }
    
    // lhs < rhs
    Operations.op_lt = function(lhs, rhs)
    {
        return internal.lt(lhs, rhs);
    }
    
    // lhs > rhs
    Operations.op_gt = function(lhs, rhs)
    {
        return internal.gt(lhs, rhs);
    }
    
    // lhs <= rhs
    Operations.op_le = function(lhs, rhs)
    {
        return internal.le(lhs, rhs);
    }
    
    // lhs >= rhs
    Operations.op_ge = function(lhs, rhs)
    {
        return internal.ge(lhs, rhs);
    }
    
    // lhs & rhs
    Operations.op_band = function(lhs, rhs)
    {
        return internal.band(lhs, rhs);
    }
    
    // lhs ^ rhs
    Operations.op_bxor = function(lhs, rhs)
    {
        return internal.bxor(lhs, rhs);
    }
    
    // lhs | rhs
    Operations.op_bor = function(lhs, rhs)
    {
        return internal.bor(lhs, rhs);
    }
    
    // lhs && rhs
    Operations.op_land = function(lhs, rhs)
    {
        return internal.land(lhs, rhs);
    }
    
    // lhs ^^ rhs
    Operations.op_lxor = function(lhs, rhs)
    {
        return internal.lxor(lhs, rhs);
    }
    
    // lhs || rhs
    Operations.op_lor = function(lhs, rhs)
    {
        return internal.lor(lhs, rhs);
    }
    
    
    module.exports = Operations;
  });

  modules.define("runtime/environment", function(module, require) {
    GLSL = {};
    GLSL.Object = require("../events").Object;
    
    GLSL.Environment = function() {
        GLSL.Object.call(this);
    
        this._data = {};
        this._debugHooks = [];
    
        this._editScopeLevel = 0;
        this._runScopeLevel = 0;
    };
    
    GLSL.Environment.Event = {
        InputChanged: "environment-input-changed",
        ResultChanged: "environment-result-changed",
    };
    
    GLSL.Environment.prototype = {
        constructor: GLSL.Environment,
        __proto__: GLSL.Object.prototype,
    
        // Public
    
        get: function(name)
        {
            return this._data[name];
        },
    
        set: function(name, value)
        {
            console.assert(this._editScopeLevel || this._runScopeLevel, this);
            if (!this._editScopeLevel && !this._runScopeLevel)
                throw new Error("Tried to set variable " + name + " while not in a edit or run scope!");
    
            this._data[name] = value;
        },
    
        clone: function()
        {
            var result = new GLSL.Environment;
            result.enterEditScope();
            for (var key in this._data)
                result.set(key, this.get(key));
            result.exitEditScope();
            return result;
        },
    
        reset: function()
        {
            this._data = {};
        },
    
        // This is a mechanism used to delimit the scope of variable editing.
        // In the future, it could be used to keep track of historical changes.
        enterEditScope: function()
        {
            console.assert(!this._runScopeLevel, this._runScopeLevel);
    
            ++this._editScopeLevel;
        },
    
        exitEditScope: function()
        {
            console.assert(this._editScopeLevel > 0, this._editScopeLevel);
    
            --this._editScopeLevel;
    
            if (!this._editScopeLevel)
                this.dispatchEventToListeners(GLSL.Environment.Event.InputChanged);
        },
    
        // This is a mechanism used to delimit the scope of a shader execution.
        // In the future, it could be used to keep track of historical changes.
        enterRunScope: function()
        {
            console.assert(!this._editScopeLevel, this._editScopeLevel);
    
            ++this._runScopeLevel;
        },
    
        exitRunScope: function()
        {
            console.assert(!this._editScopeLevel, this._editScopeLevel);
            console.assert(this._runScopeLevel > 0, this._runScopeLevel);
    
            --this._runScopeLevel;
    
            if (!this._runScopeLevel)
                this.dispatchEventToListeners(GLSL.Environment.Event.ResultChanged);
        },
    
        get debugHooks()
        {
            return this._debugHooks.slice();
        },
    
        clearDebugHooks: function()
        {
            this._debugHooks = [];
        },
    
        addDebugHook: function(shaderType, position, hookId, expression)
        {
            // TODO: implement this once the basic generator exists.
    
            // Each hook consists of a program point and an expression to be evaluated
            // at that point for its result. These results will be saved as program
            // outputs with a name that is correlated back to the specific hook.
    
            // This will be implemented in the generated code in a manner that's
            // conceptually similar to JS breakpoints. After each statement, see if
            // any hooks apply to the current line and evaluate if necessary. Unlike JS
            // breakpoints, simulator execution does not pause and resume; instead
            // the client will rerun the shader every time different info is needed.
    
            // A stepping debugger could be implemented by a client as follows:
            // - for the current debugger step, add a hook for each live variable at that program point.
            // - show the UI as "paused" at that location, getting runtime data from hook outputs.
    
            // We don't plan to support it now, but "edit and continue" could be implemented as
            // a new hook type that reapplies user modifications to the simulator state.
        },
    
        validateForShader: function(shader)
        {
            // TODO: check for required shader inputs.
            return true;
        },
    
        setDefaultValuesForShader: function(shader, suggestedVariableValueCallback)
        {
            function setDefaultValue(env, variable) {
                var value = null;
                if (suggestedVariableValueCallback instanceof Function)
                    value = suggestedVariableValueCallback(variable);
    
                if (!value) {
                    switch (variable.type) {
                    case "float": value = 1.0; break;
                    case "bool": value = true; break;
                    case "vec2": value = GLSL.Runtime.Vec2(1, 1); break;
                    case "vec3": value = GLSL.Runtime.Vec3(1, 1, 1); break;
                    case "vec4": value = GLSL.Runtime.Vec4(1, 1, 1, 1); break;
                    case "mat2": value = GLSL.Runtime.Mat2(1, 1,
                                                           1 ,1); break;
                    case "mat3": value = GLSL.Runtime.Mat3(1, 1, 1,
                                                           1, 1, 1,
                                                           1, 1, 1); break;
                    case "mat4": value = GLSL.Runtime.Mat4(1, 1, 1, 1,
                                                           1, 1, 1, 1,
                                                           1, 1, 1, 1,
                                                           1, 1, 1, 1); break;
                    }
                }
                env.set(variable.name, value);
            }
    
            if (!shader)
                return;
    
            console.assert(shader instanceof GLSL.Shader, shader);
    
            this.enterEditScope();
    
            shader.uniforms.map(setDefaultValue.bind(null, env));
            shader.attributes.map(setDefaultValue.bind(null, env));
            if (shader.type === GLSL.Shader.Type.Fragment)
                shader.varyings.map(setDefaultValue.bind(null, env));
    
            this.exitEditScope();
        }
    };
    
    module.exports = GLSL.Environment;
  });

  modules.define("runtime", function(module, require) {
    var Runtime = {};
    
    // Add built-in types
    var vector = require('./runtime/vector');
    Runtime.vec = vector.vec;
    Runtime.Vec2 = vector.Vec2;
    Runtime.Vec3 = vector.Vec3;
    Runtime.Vec4 = vector.Vec4;
    
    var matrix = require("./runtime/matrix");
    Runtime.mat = matrix.mat;
    Runtime.Mat2 = matrix.Mat2;
    Runtime.Mat3 = matrix.Mat3;
    Runtime.Mat4 = matrix.Mat4;
    
    var builtins = require('./runtime/builtins');
    var operations = require("./runtime/ops");
    var access = require("./runtime/access");
    var texture = require("./runtime/texture");
    
    for (var i in operations)
        Runtime[i] = operations[i];
    
    for (var i in builtins)
        Runtime[i] = builtins[i];
    
    for (var i in access)
        Runtime[i] = access[i];
    
    for (var i in texture)
        Runtime[i] = texture[i];
    
    module.exports = Runtime;
  });

  modules.define("compiler/ast", function(module, require) {
    ASTNode = function(type, position, properties)
    {
        this.type = type;
        this.position = position;
    
        for (var prop in properties)
            if (properties.hasOwnProperty(prop))
              this[prop] = properties[prop];
    };
    
    ASTNode.__nextId = 1;
    
    // Map of our node type names to values of the PEG parser's "type" property.
    // Expected properties are documented here per-node.
    //
    // Some aliases used in the comments:
    // Node.$initializer == Node.{FunctionPrototype, FunctionDeclaration, Invariant, Precision, Declarator}
    // Node.$expression == Node.{Operator, PostfixExpression, UnaryExpression, BinaryExpression, TernaryExpression, IndexSelector, FieldSelector, Identifier, IntegerLiteral, FloatLiteral, BooleanLiteral}
    // Node.$statement == Node.{IfStatement, ForStatement, WhileStatement, DoStatement, ReturnStatement, ContinueStatement, BreakStatement, DiscardStatement, ExpressionStatement, Preprocessor, MacroCall}
    ASTNode.Types = {
        Program: 'root', // {statements: [Node.$statement]*}
        Preprocessor: 'preprocessor', // {directive: string, identifier: string?, parameters: [string]?, value: string?, guarded_statements: [Node.$statement]*}
        MacroCall: 'macro_call', // {macro_name: string, parameters: [string]+}
        FunctionCall: 'function_call', // {function_name: string, parameters: [Node.$expression]*}
        FunctionPrototype: 'function_prototype', // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*}
        FunctionDeclaration: 'function_declaration', // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*, body: Node.Scope}
        Scope: 'scope', // {statements: [Node.$statement]*}
    
        IfStatement: 'if_statement', // {condition: Node.$expression, body: Node.Scope, elseBody: Node.Scope?}
        ForStatement: 'for_statement', // {initializer: Node.$initializer, condition: Node.$expression, increment: Node.$expression, body: Node.Scope}}
        WhileStatement: 'while_statement', // {condition: Node.$expression, body: Node.Scope}
        DoStatement: 'do_statement', // {condition: Node.$expression, body: Node.Scope}
        ReturnStatement: 'return', // {value: Node.$expression}
        ContinueStatement: 'continue', // {}
        BreakStatement: 'break', // {}
        DiscardStatement: 'discard', // {}
        ExpressionStatement: 'expression', // {expression: Node.$expression?}
    
        Declarator: 'declarator', // {typeAttribute: Node.Type, declarators: [Node.DeclaratorItem]+}
        DeclaratorItem: 'declarator_item', // {name: Node.Identifier, initializer: Node.$expression}
        Invariant: 'invariant', // {identifiers: [Node.Identifier]*}
        Precision: 'precision', // {precision: string, typeName: string}
        Parameter: 'parameter', // {type_name: string, name: string, typeQualifier: string?, parameterQualifier: string?, precision: string?, arraySize: Node.$expression}
        StructDefinition: 'struct_definition', // {qualifier: string?, name: string?, members: [Node.Declarator]+, declarators: [Node.Declarator]?}
        Type: 'type', // {name: string, precision: string?, qualifier: string?}
    
        IntegerLiteral: 'int', // {value: number}
        FloatLiteral: 'float', // {value: number}
        BooleanLiteral: 'bool', // {value: boolean}
        Identifier: 'identifier', // {name: string}
    
        Operator: 'operator', // {operator: {string, Node.FieldSelector, Node.IndexSelector}}
        PostfixExpression: 'postfix', // {operator: Node.Operator, expression: Node.$expression}
        UnaryExpression: 'unary', // {operator: Node.Operator, expression: Node.$expression}
        BinaryExpression: 'binary', // {operator: Node.Operator, left: Node.$expression, right:}Node.$expression}
        TernaryExpression: 'ternary', // {condition: Node.$expression, is_true: Node.$expression, is_false: Node.$expression}
        IndexSelector: 'accessor', // {index: Node.$expression}
        FieldSelector: 'field_selector', // {selection: string}
    };
    
    module.exports = ASTNode;
  });

  modules.define("compiler/visitor", function(module, require) {
    ASTVisitor = function(callbacks)
    {
        this._callbacks = callbacks || {};
        for (key in this._callbacks) { // Keep braces in case this assert is stripped out.
            console.assert(key !== "undefined", "Visitor callback provided for node type 'undefined'. This is a bug. Function text: " + this._callbacks[key].toString());
        }
    
    }
    
    ASTVisitor.prototype = {
        constructor: ASTVisitor,
    
        // Public
    
        // Subclasses should override this to plug in their overridden visit methods.
        visitorForType: function(type)
        {
            if (type in this._callbacks)
                return this._callbacks[type];
    
            return this.defaultVisitor;
        },
    
        visitNode: function(node)
        {
            if (!node || !node.type)
                return;
    
            var callback = this.visitorForType(node.type);
            return callback.call(this, node);
        },
    
        visitList: function(nodeList)
        {
            if (!(nodeList instanceof Array) || !nodeList.length)
                return;
    
            var result = [];
            for (var i = 0; i < nodeList.length; ++i)
                result.push(this.visitNode(nodeList[i]));
    
            return result;
        },
    
        defaultVisitor: function(node)
        {
            for (var key in node) {
                var val = node[key];
                if (val instanceof Array)
                    this.visitList(val);
                else if (val instanceof Object && val.type)
                    this.visitNode(val);
            }
        }
    };
    
    module.exports = ASTVisitor;
  });

  modules.define("compiler/typecheck", function(module, require) {
    var GLSL = {};
    
    // Check semantic properties local to a vertex or fragment shader.
    
    GLSL.Typechecker = function(shader) {
        // TODO: implement
    };
    
    GLSL.Typechecker.prototype = {
        constructor: GLSL.Typechecker,
    
        // Public:
    
        typecheck: function()
        {
            return true;
        }
    
    }
    
    module.exports = GLSL.Typechecker;
  });

  modules.define("compiler/pretty", function(module, require) {
    var ASTVisitor = require("./visitor");
    
    PrettyPrinter = function()
    {
        ASTVisitor.call(this);
    
        this._scopes = [];
        this._currentIndent = "";
    }
    
    PrettyPrinter.prototype = {
        constructor: PrettyPrinter,
        __proto__: ASTVisitor.prototype,
    
        // Public
    
        formattedText: function(tree)
        {
            this._lines = [];
            this.visitNode(tree);
            return this._lines.join("\n");
        },
    
        // Overrides for ASTVisitor
    
        visitorForType: function(type)
        {
            if (type in PrettyPrinter.Callbacks)
                return PrettyPrinter.Callbacks[type];
    
            return ASTVisitor.prototype.visitorForType(type);
        },
    
        // Private
    
        _addLine: function(line)
        {
            this._lines.push([this._currentIndent, line].join(""));
        },
    
        _increaseIndent: function()
        {
            var oldIndent = this._currentIndent;
            this._currentIndent = [this._currentIndent, PrettyPrinter.IndentString].join("");
            return oldIndent;
        },
    };
    
    PrettyPrinter.IndentString = "    ";
    
    PrettyPrinter.Callbacks = {};
    
    PrettyPrinter.Callbacks[ASTNode.Types.Identifier] = function(node)
    {
        return node.name;
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.Program] = function(node)
    {
        this.visitList(node.statements);
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.Preprocessor] = function(node)
    {
        if (node.directive === "#define") {
            var pieces = [node.directive, " ", node.identifier];
    
            if (node.parameters)
                pieces.push("(" + node.parameters.join(", ") +")");
    
            if (node.token_string) {
                pieces.push(" ");
                pieces.push(node.token_string);
            }
    
            this._addLine(pieces.join(""));
        } else {
            // Deduplicate any trailing #endif. We always add #endif, since we
            // don't have matched preprocessor directive in the AST itself.
            var shouldPairWithPrevious = node.directive === "#elif" || node.directive === "#else";
            if (shouldPairWithPrevious && this._lines[this._lines.length - 1] === "#endif")
                this._lines.pop();
    
            this._addLine(node.directive + " " + node.value);
            this.visitList(node.guarded_statements);
            this._addLine("#endif");
        }
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.MacroCall] = function(node)
    {
        return node.macro_name + "(" + node.paremeters.join(", ") + ")";
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.FunctionCall] = function(node)
    {
        var argList = this.visitList(node.parameters) || [];
        return node.function_name + "(" + argList.join(", ") + ")";
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.FunctionDeclaration] = function(node)
    {
        var returnType = this.visitNode(node.returnType);
        var argList = this.visitList(node.parameters) || ["void"];
    
        this._addLine(""); // Induce a newline before function declaration.
        this._addLine(returnType + " " + node.name + "(" + argList.join(", ") + ") {");
        var oldIndent = this._increaseIndent();
        this.visitNode(node.body);
        this._currentIndent = oldIndent;
        this._addLine("}");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.FunctionPrototype] = function(node)
    {
        var returnType = this.visitNode(node.returnType);
        var argList = this.visitList(node.parameters) || ["void"];
    
        this._addLine(""); // Induce a newline before function declaration.
        this._addLine(returnType + " " + node.name + "(" + argList.join(", ") + ");");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.Scope] = function(node)
    {
        this._scopes.push(node);
        this.visitList(node.statements);
        this._scopes.pop(node);
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.IfStatement] = function(node)
    {
        this._addLine("if (" + this.visitNode(node.condition) + ") {");
        var oldIndent = this._increaseIndent();
        this.visitNode(node.body);
        this._currentIndent = oldIndent;
    
        if (node.elseBody) {
            this._addLine("} else {")
            var oldIndent = this._increaseIndent();
            this.visitNode(node.elseBody);
            this._currentIndent = oldIndent;
        }
    
        this._addLine("}");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.ForStatement] = function(node)
    {
        // The declarator node is normally a statement on its own line.
        // So, pop it off the end if it exists.
        var initializer = "";
        if (node.initializer) {
            this.visitNode(node.initializer);
            initializer = this._lines.pop().trim();
            initializer = initializer.substr(0, initializer.length - 1);
        }
    
        var condition = this.visitNode(node.condition) || "";
        var increment = this.visitNode(node.increment) || "";
    
        this._addLine("for (" + [initializer, condition, increment].join("; ") + ") {");
        var oldIndent = this._increaseIndent();
        this.visitNode(node.body);
        this._currentIndent = oldIndent;
        this._addLine("}");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.WhileStatement] = function(node)
    {
        this._addLine("while (" + this.visitNode(node.condition) + ") {");
        var oldIndent = this._increaseIndent();
        this.visitNode(node.body);
        this._currentIndent = oldIndent;
        this._addLine("}");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.DoStatement] = function(node)
    {
        this._addLine("do {");
        var oldIndent = this._increaseIndent();
        this.visitNode(node.body);
        this._currentIndent = oldIndent;
        this._addLine("} while (" + this.visitNode(node.condition) + ");");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.ReturnStatement] = function(node)
    {
        if (node.value)
            this._addLine("return " + this.visitNode(node.value) + ";");
        else
            this._addLine("return;");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.ContinueStatement] = function(node)
    {
        this._addLine("continue;");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.BreakStatement] = function(node)
    {
        this._addLine("break;");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.DiscardStatement] = function(node)
    {
        this._addLine("discard;");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.ExpressionStatement] = function(node)
    {
        this._addLine(this.visitNode(node.expression) + ";");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.Declarator] = function(node)
    {
        var type = this.visitNode(node.typeAttribute);
        var items = this.visitList(node.declarators);
    
        this._addLine(type + " " + items.join(", ") + ";");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.DeclaratorItem] = function(node)
    {
        var tokens = [this.visitNode(node.name)];
        if (node.initializer) {
            tokens.push("=");
            tokens.push(this.visitNode(node.initializer));
        }
    
        return tokens.join(" ");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.Invariant] = function(node)
    {
        this._addLine("invariant " + this.visitList(node.identifiers).join(", ") + ";");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.Precision] = function(node)
    {
        return this._addLine(["precision", node.precision, node.typeName].join(" ") + ";");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.Parameter] = function(node)
    {
        var tokens = [node.type_name, node.name];
    
        if (node.precision)
            tokens.unshift(node.precision);
        if (node.parameterQualifier)
            tokens.unshift(node.parameterQualifier);
        if (node.typeQualifier)
            tokens.unshift(node.typeQualifier);
    
        var result = tokens.join(" ");
        if (node.arraySize)
            result = result + "[" + this.visit(node.arraySize) + "]";
    
        return result;
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.StructDefinition] = function(node)
    {
        var tokens = ["struct"];
        if (node.qualifier)
            tokens.unshift(node.qualifier);
    
        if (node.name)
            tokens.push(node.name);
    
        tokens.push("{")
        this._addLine(tokens.join(" "));
        var oldIndent = this._increaseIndent();
        this.visitList(node.members);
        this._currentIndent = oldIndent;
    
        if (!node.declarators) {
            this._addLine("};");
            return;
        }
    
        var declarators = this.visitList(node.declarators);
        this._addLine("} " + declarators.join(", ") + ";");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.Type] = function(node)
    {
        var tokens = [node.name];
    
        if (node.precision)
            tokens.unshift(node.precision);
        if (node.qualifier)
            tokens.unshift(node.qualifier);
    
        return tokens.join(" ");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.IntegerLiteral] = function(node)
    {
        return node.value;
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.FloatLiteral] = function(node)
    {
        return node.value;
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.BooleanLiteral] = function(node)
    {
        return node.value;
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.Operator] = function(node)
    {
        return node.operator;
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.PostfixExpression] = function(node)
    {
        return this.visitNode(node.expression) + this.visitNode(node.operator);
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.UnaryExpression] = function(node)
    {
        return this.visitNode(node.operator) + this.visitNode(node.expression);
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.BinaryExpression] = function(node)
    {
        var expr = [this.visitNode(node.left), this.visitNode(node.operator), this.visitNode(node.right)].join(" ")
        var op = node.operator.operator;
        if (op.indexOf("==") === -1 && op.indexOf("=") !== -1)
            return expr;
        else
            return "(" + expr + ")";
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.TernaryExpression] = function(node)
    {
        return [this.visitNode(node.condition), "?", this.visitNode(node.is_true), ":", this.visitNode(node.is_false)].join(" ");
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.IndexSelector] = function(node)
    {
        return "[" + this.visitNode(node.index) + "]";
    }
    
    PrettyPrinter.Callbacks[ASTNode.Types.FieldSelector] = function(node)
    {
        return "." + node.selection;
    }
    
    module.exports = PrettyPrinter;
  });

  modules.define("compiler/codegen", function(module, require) {
    var ASTVisitor  = require("./visitor");
    var Builtins    = require("../runtime/builtins");
    var Operations  = require("../runtime/ops");
    
    var CodeGenerator = function(shader)
    {
        ASTVisitor.call(this);
        this._shader = shader;
        this._currentIndent = "";
    
        this._withinFunctionScope = null;
    
        this._globalVariableNames = new Set;
    
        for (var list = shader.uniforms, i = 0; i < list.length; ++i)
            this._globalVariableNames.add(list[i].name);
    
        for (var list = shader.varyings, i = 0; i < list.length; ++i)
            this._globalVariableNames.add(list[i].name);
    
        for (var list = shader.attributes, i = 0; i < list.length; ++i)
            this._globalVariableNames.add(list[i].name);
    };
    
    CodeGenerator.ConstructorMap = {
        "vec2": "Vec2",
        "vec3": "Vec3",
        "vec4": "Vec4",
        "mat2": "Mat2",
        "mat3": "Mat3",
        "mat4": "Mat4",
    };
    
    CodeGenerator.prototype = {
        constructor: CodeGenerator,
        __proto__: ASTVisitor.prototype,
    
        translateShader: function() {
            this._lines = [];
            this._addLine("");
            this._addLine("var RT = GLSL.Runtime;");
            this._addLine("");
            this.visitNode(this._shader.ast);
            this._addLine("");
            if (this._shader.shouldEmitDebuggerStatement)
                this._addLine("debugger;")
            this._addLine(this._resolveFunction("main") + "();");
            this._addLine("");
            var executable = {};
            try {
                executable.code = new Function("GLSL", "env", this._lines.join("\n"));
            } catch (e) {
                executable.source = "function(GLSL, env) {\n" + this._lines.join("\n") + "}";
                executable.error = e.message;
            }
    
            return executable;
        },
    
        // Overrides for ASTVisitor
    
        visitorForType: function(type)
        {
            if (type in CodeGenerator.Callbacks)
                return CodeGenerator.Callbacks[type];
    
            return ASTVisitor.prototype.visitorForType.call(this, type);
        },
    
        // Private
    
        _resolveGetLocal: function(name)
        {
            console.assert(typeof name === "string", name);
    
            return this._resolveGetName(name);
        },
    
        _resolveFunction: function(name)
        {
            console.assert(typeof name === "string", name);
    
            if (name in Builtins)
                return "RT." + name;
    
            if (name in Operations)
                return "RT." + name;
    
            if (name in CodeGenerator.ConstructorMap)
                return "RT." + CodeGenerator.ConstructorMap[name];
    
            return this._resolveGetName(name);
        },
    
        _resolveGetName: function(name)
        {
            console.assert(typeof name === "string", name);
    
            if (this._globalVariableNames.has(name))
                return "env.get('" + name + "')";
    
            return "$" + name;
        },
    
        _resolveSetName: function(name, valueExpr)
        {
            console.assert(typeof name === "string", name);
    
            if (this._globalVariableNames.has(name))
                return "env.set('" + name + "', " + valueExpr +  ")";
    
            return "$" + name + " = " + valueExpr;
        },
    
        _addLine: function(line)
        {
            this._lines.push([this._currentIndent, line].join(""));
        },
    
        _increaseIndent: function()
        {
            var oldIndent = this._currentIndent;
            this._currentIndent = [this._currentIndent, CodeGenerator.IndentString].join("");
            return oldIndent;
        },
    };
    
    CodeGenerator.IndentString = "    ";
    
    CodeGenerator.Callbacks = {};
    
    CodeGenerator.Callbacks[ASTNode.Types.Program] = function(node)
    {
        // {statements: [Node.$statement]*}
        this.visitList(node.statements);
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.Preprocessor] = function(node)
    {
        // {directive: string, identifier: string?, parameters: [string]?, value: string?, guarded_statements: [Node.$statement]*}
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.MacroCall] = function(node)
    {
        // {macro_name: string, parameters: [string]+}
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.FunctionCall] = function(node)
    {
        // {function_name: string, parameters: [Node.$expression]*}
        var params = this.visitList(node.parameters) || [];
        return this._resolveFunction(node.function_name) + "(" + params.join(", ") + ")";
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.FunctionPrototype] = function(node)
    {
        // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*}
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.FunctionDeclaration] = function(node)
    {
        // {name: string, returnType: Node.Type, parameters: [Node.Parameter]*, body: Node.Scope}
    
        var paramNames = this.visitList(node.parameters) || [];
        paramNames = paramNames.map(function(p) { return this._resolveGetLocal(p); }, this);
    
        // TODO: emit code that asserts argument types for debugging purposes.
        // This is unnecessary if the shader is statically typechecked (and there are no bugs in the checker).
    
        this._withinFunctionScope = node;
        this._addLine("var " + this._resolveGetLocal(node.name) + " = function(" + paramNames.join(", ") + ") {");
        var oldIndent = this._increaseIndent();
        this.visitNode(node.body);
        this._currentIndent = oldIndent;
        this._addLine("};")
        delete this._withinFunctionScope;
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.Scope] = function(node)
    {
        // {statements: [Node.$statement]*}
        this.visitList(node.statements);
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.IfStatement] = function(node)
    {
        // {condition: Node.$expression, body: Node.Scope, elseBody: Node.Scope?}
        var expr = this.visitNode(node.condition);
        this._addLine("if (" + expr + ") {");
        var oldIndent = this._increaseIndent();
        this.visitNode(node.body);
        this._currentIndent = oldIndent;
    
        if (node.elseBody) {
            this._addLine("} else {");
            var oldIndent = this._increaseIndent();
            this.visitNode(node.elseBody);
            this._currentIndent = oldIndent;
        }
    
        this._addLine("}");
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.ForStatement] = function(node)
    {
        // {initializer: Node.$initializer, condition: Node.$expression, increment: Node.$expression, body: Node.Scope}}
    
        // We emit for-loops as while loops because they have a simpler grammar. In particular,
        // declarators are treated as statements elsewhere, so we can emit it to its own line.
        this.visitNode(node.initializer);
    
        var condition = this.visitNode(node.condition) || "true";
        var increment = this.visitNode(node.increment);
        this._addLine("while (" + condition + ") {");
        var oldIndent = this._increaseIndent();
        this.visitNode(node.body);
        if (increment)
            this._addLine(increment + ";");
        this._currentIndent = oldIndent;
        this._addLine("}");
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.WhileStatement] = function(node)
    {
        // {condition: Node.$expression, body: Node.Scope}
        var expr = this.visitNode(node.condition);
        this._addLine("while (" + expr + ") {");
        var oldIndent = this._increaseIndent();
        this.visitNode(node.body);
        this._currentIndent = oldIndent;
        this._addLine("}")
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.DoStatement] = function(node)
    {
        // {condition: Node.$expression, body: Node.Scope}
        var expr = this.visitNode(node.condition);
        this._addLine("do {");
        var oldIndent = this._increaseIndent();
        this.visitNode(node.body);
        this._currentIndent = oldIndent;
        this._addLine("} while (" + expr + ");");
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.ReturnStatement] = function(node)
    {
        // {value: Node.$expression}
        if (node.value)
            this._addLine("return " + this.visitNode(node.value) + ";");
        else
            this._addLine("return;");
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.ContinueStatement] = function(node)
    {
        // {}
        this._addLine("continue;");
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.BreakStatement] = function(node)
    {
        // {}
        this._addLine("break;");
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.DiscardStatement] = function(node)
    {
        // {}
        this._addLine("discard;");
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.ExpressionStatement] = function(node)
    {
        // {expression: Node.$expression?}
        this._addLine(this.visitNode(node.expression) + ";");
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.Declarator] = function(node)
    {
        // {typeAttribute: Node.Type, declarators: [Node.DeclaratorItem]+}
    
        // If outside a function, then this is a uniform, attribute, or varying and passed through env.
        if (!this._withinFunctionScope)
            return;
    
        // TODO: register type information here to ensure assignments are type-compatible
        this.visitList(node.declarators);
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.DeclaratorItem] = function(node)
    {
        // {name: Node.Identifier, initializer: Node.$expression}
        var name = this.visitNode(node.name);
        if (node.initializer)
            this._addLine("var " + name + " = " + this.visitNode(node.initializer) + ";");
        else
            this._addLine("var " + name + ";");
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.Invariant] = function(node)
    {
        // {identifiers: [Node.Identifier]*}
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.Precision] = function(node)
    {
        // {precision: string, typeName: string}
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.Parameter] = function(node)
    {
        // {type_name: string, name: string, typeQualifier: string?, parameterQualifier: string?, precision: string?, arraySize: Node.$expression}
        return node.name;
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.StructDefinition] = function(node)
    {
        // {qualifier: string?, name: string?, members: [Node.Declarator]+, declarators: [Node.Declarator]?}
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.Type] = function(node)
    {
        // {name: string, precision: string?, qualifier: string?}
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.IntegerLiteral] = function(node)
    {
        // {value: number}
        return Number(node.value);
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.FloatLiteral] = function(node)
    {
        // {value: number}
        return Number(node.value);
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.BooleanLiteral] = function(node)
    {
        // {value: boolean}
        return node.value ? "true" : "false";
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.Identifier] = function(node)
    {
        // {name: string}
        return this._resolveGetName(node.name);
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.Operator] = function(node)
    {
        // {operator: string}
        return node.operator;
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.PostfixExpression] = function(node)
    {
        // {operator: Node.Operator, expression: Node.$expression}
        var op = this.visitNode(node.operator);
        var expr = this.visitNode(node.expression);
        var builder = new SelectorBuilder(node);
        var params = builder.params.slice();
    
        // FIXME: we assume op is a field or index selector and expr is not an lvalue.
        // This will fall apart if code does something like |max(color.x++, color.x++)|
    
        var func = null;
        switch (op) {
        case '++': func = "op_add"; break;
        case '--': func = "op_sub"; break;
        default:
            params.unshift(this._resolveGetName(builder.operand));
            return "RT.get(" + params.join(", ") + ")";
        }
    
        var result = (func) ? (this._resolveFunction(func) + "("  + expr + ", 1.0)") : "/* " + op + " */" + expr;
    
        var params = builder.params.slice();
        params.unshift(this._resolveGetLocal(builder.operand));
        params.push(result);
    
        // FIXME: the generated code here returns the value of ++expr, not expr++. We
        // need to copy the pre-assignment value into a temporary variable and return that.
        if (builder.params.length)
            return this._resolveSetName(builder.operand, "RT.set(" + params.join(", ") + ")");
        else
            return this._resolveSetName(builder.operand, result);
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.UnaryExpression] = function(node)
    {
        // {operator: Node.Operator, expression: Node.$expression}
        var op = this.visitNode(node.operator);
        var expr = this.visitNode(node.expression);
    
        var func = null;
        switch (op) {
        case '+': func = "op_pos"; break;
        case '-': func = "op_neg"; break;
        case '~': func = "op_bnot"; break;
        case '!': func = "op_lnot"; break;
        default:
            return "/* " + op + " */" + expr;
        }
    
        return (func) ? (this._resolveFunction(func) + "(" + expr + ")") : "/* " + op + " */" + expr;
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.BinaryExpression] = function(node)
    {
        // {operator: Node.Operator, left: Node.$expression, right:}Node.$expression}
        var op = this.visitNode(node.operator);
        var left = this.visitNode(node.left);
        var right = this.visitNode(node.right);
    
        var func = null;
        var do_assign = false;
    
        switch (op) {
        case '==': func = "op_eq"; break;
        case '!=': func = "op_neq"; break;
        case '*': func = "op_mul"; break;
        case '/': func = "op_div"; break;
        case '%': func = "op_mod"; break;
        case '+': func = "op_add"; break;
        case '-': func = "op_sub"; break;
        case '<<': func = "op_shl"; break;
        case '>>': func = "op_shr"; break;
        case '<': func = "op_lt"; break;
        case '>': func = "op_gt"; break;
        case '<=': func = "op_le"; break;
        case '>=': func = "op_ge"; break;
        case '&': func = "op_band"; break;
        case '^': func = "op_bxor"; break;
        case '|': func = "op_bor"; break;
        case '&&': func = "op_land"; break;
        case '^^': func = "op_lxor"; break;
        case '||': func = "op_lor"; break;
    
        /* TODO: we need a strategy for extracting and assigning to l-values.
         Current idea: hard-code l-vlaue cases and synthesize the correct setter.
         Cases are listed in section 5.8 of the specification (reproduced here):
    
         - variables of builtin type
         - entire structures or arrays
         - single fields of structs
         - arrays dereferenced with the subscript operator '[]'
         - components or swizzles chosen with the field selector '.''
    
         Note that subscript and swizzle can be chained up to two times, in the case
         of code like |m[1].yxz = vec3(1,0,0);|
        */
        case '=': do_assign = true; break;
        case '+=': func = "op_add"; do_assign = true; break;
        case '-=': func = "op_sub"; do_assign = true; break;
        case '*=': func = "op_mul"; do_assign = true; break;
        case '/=': func = "op_div"; do_assign = true; break;
        case '%=': func = "op_mod"; do_assign = true; break;
        case '<<=': func = "op_shl"; do_assign = true; break;
        case '>>=': func = "op_shr"; do_assign = true; break;
        case '&=': func = "op_band"; do_assign = true; break;
        case '^=': func = "op_bxor"; do_assign = true; break;
        case "|=": func = "op_bor"; do_assign = true; break;
        default:
            return left + " /* " + op + " */ " + right;
        }
    
        var result = (func) ? (this._resolveFunction(func) + "(" + left + ", " + right + ")") : right;
        // TODO: assert that LHS is an lvalue, or figure this out in typechecking
        if (do_assign) {
            var builder = new SelectorBuilder(node.left);
            var params = builder.params.slice();
            params.unshift(this._resolveGetLocal(builder.operand));
            params.push(result);
            if (builder.params.length)
                return this._resolveSetName(builder.operand, "RT.set(" + params.join(", ") + ")");
            else
                return this._resolveSetName(builder.operand, result);
        }
        else
            return result;
    
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.TernaryExpression] = function(node)
    {
        // {condition: Node.$expression, is_true: Node.$expression, is_false: Node.$expression}
        return "(" + this.visitNode(node.condition) + ") " + this.visitNode(node.is_true) + " : " + this.visitNode(node.is_false);
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.IndexSelector] = function(node)
    {
        // {index: Node.$expression}
    }
    
    CodeGenerator.Callbacks[ASTNode.Types.FieldSelector] = function(node)
    {
        // {selection: string}
    }
    
    SelectorBuilder = function(expr) {
        ASTVisitor.call(this);
    
        this.operand = null;
        this.params = [];
        this.visitNode(expr);
    }
    
    SelectorBuilder.prototype = {
        constructor: SelectorBuilder,
        __proto__: ASTVisitor.prototype,
    
        // Overrides for ASTVisitor
    
        visitorForType: function(type)
        {
            if (type in SelectorBuilder.Callbacks)
                return SelectorBuilder.Callbacks[type];
    
            throw new Error("Unexpected AST node encountered by selector builder.");
        },
    }
    
    SelectorBuilder.Callbacks = {};
    
    SelectorBuilder.Callbacks[ASTNode.Types.IntegerLiteral] = function(node)
    {
        return this.params.push(node.value);
    }
    
    SelectorBuilder.Callbacks[ASTNode.Types.FloatLiteral] = function(node)
    {
        return this.params.push(node.value);
    }
    
    SelectorBuilder.Callbacks[ASTNode.Types.Identifier] = function(node)
    {
        return this.operand = node.name;
    }
    
    SelectorBuilder.Callbacks[ASTNode.Types.Operator] = function(node)
    {
        if (node.operator instanceof ASTNode)
            this.visitNode(node.operator);
    }
    
    SelectorBuilder.Callbacks[ASTNode.Types.PostfixExpression] = function(node)
    {
        // {operator: Node.Operator, expression: Node.$expression}
        this.visitNode(node.expression);
        this.visitNode(node.operator);
    }
    
    SelectorBuilder.Callbacks[ASTNode.Types.IndexSelector] = function(node)
    {
        // {index: Node.$expression}
        this.visitNode(node.index);
    }
    
    SelectorBuilder.Callbacks[ASTNode.Types.FieldSelector] = function(node)
    {
        // {selection: string}
        this.params.push("'" + node.selection + "'");
    }
    
    
    module.exports = CodeGenerator;
  });

  modules.define("compiler/parser", function(module, require) {
    module.exports = (function() {
        /*
         * Generated by PEG.js 0.8.0.
         *
         * http://pegjs.majda.cz/
         */
      
        function peg$subclass(child, parent) {
          function ctor() { this.constructor = child; }
          ctor.prototype = parent.prototype;
          child.prototype = new ctor();
        }
      
        function SyntaxError(message, expected, found, offset, line, column) {
          this.message  = message;
          this.expected = expected;
          this.found    = found;
          this.offset   = offset;
          this.line     = line;
          this.column   = column;
      
          this.name     = "SyntaxError";
        }
      
        peg$subclass(SyntaxError, Error);
      
        function parse(input) {
          var options = arguments.length > 1 ? arguments[1] : {},
      
              peg$FAILED = {},
      
              peg$startRuleFunctions = { start: peg$parsestart },
              peg$startRuleFunction  = peg$parsestart,
      
              peg$c0 = peg$FAILED,
              peg$c1 = function() {  shaderType = "vs"; return true; },
              peg$c2 = void 0,
              peg$c3 = function(root) {
                    return root;
                  },
              peg$c4 = function() {  shaderType = "fs"; return true; },
              peg$c5 = /^[\n]/,
              peg$c6 = { type: "class", value: "[\\n]", description: "[\\n]" },
              peg$c7 = function() {
                  return "\n";
                },
              peg$c8 = { type: "any", description: "any character" },
              peg$c9 = { type: "other", description: "whitespace" },
              peg$c10 = [],
              peg$c11 = /^[\\\n]/,
              peg$c12 = { type: "class", value: "[\\\\\\n]", description: "[\\\\\\n]" },
              peg$c13 = /^[\r\t\f\x0B ]/,
              peg$c14 = { type: "class", value: "[\\r\\t\\f\\x0B ]", description: "[\\r\\t\\f\\x0B ]" },
              peg$c15 = "/*",
              peg$c16 = { type: "literal", value: "/*", description: "\"/*\"" },
              peg$c17 = "*/",
              peg$c18 = { type: "literal", value: "*/", description: "\"*/\"" },
              peg$c19 = "//",
              peg$c20 = { type: "literal", value: "//", description: "\"//\"" },
              peg$c21 = /^[^\n]/,
              peg$c22 = { type: "class", value: "[^\\n]", description: "[^\\n]" },
              peg$c23 = { type: "other", description: "comment" },
              peg$c24 = null,
              peg$c25 = ";",
              peg$c26 = { type: "literal", value: ";", description: "\";\"" },
              peg$c27 = ",",
              peg$c28 = { type: "literal", value: ",", description: "\",\"" },
              peg$c29 = "[",
              peg$c30 = { type: "literal", value: "[", description: "\"[\"" },
              peg$c31 = "]",
              peg$c32 = { type: "literal", value: "]", description: "\"]\"" },
              peg$c33 = "=",
              peg$c34 = { type: "literal", value: "=", description: "\"=\"" },
              peg$c35 = "(",
              peg$c36 = { type: "literal", value: "(", description: "\"(\"" },
              peg$c37 = ")",
              peg$c38 = { type: "literal", value: ")", description: "\")\"" },
              peg$c39 = "{",
              peg$c40 = { type: "literal", value: "{", description: "\"{\"" },
              peg$c41 = "}",
              peg$c42 = { type: "literal", value: "}", description: "\"}\"" },
              peg$c43 = function(statements) {
                    // Skip blank statements.  These were either whitespace or
                    var result = new node({
                      type: "root",
                      statements: []
                    });
                    for (var i = 0; i < statements.length; i++) {
                      if (statements[i]) {
                        result.statements = result.statements.concat(statements[i]);
                      }
                    }
                    return result;
                  },
              peg$c44 = function(statement) { return statement; },
              peg$c45 = function() { return ""; },
              peg$c46 = "#",
              peg$c47 = { type: "literal", value: "#", description: "\"#\"" },
              peg$c48 = "undef",
              peg$c49 = { type: "literal", value: "undef", description: "\"undef\"" },
              peg$c50 = "pragma",
              peg$c51 = { type: "literal", value: "pragma", description: "\"pragma\"" },
              peg$c52 = "version",
              peg$c53 = { type: "literal", value: "version", description: "\"version\"" },
              peg$c54 = "error",
              peg$c55 = { type: "literal", value: "error", description: "\"error\"" },
              peg$c56 = "extension",
              peg$c57 = { type: "literal", value: "extension", description: "\"extension\"" },
              peg$c58 = "line",
              peg$c59 = { type: "literal", value: "line", description: "\"line\"" },
              peg$c60 = function(defname) {return defname.join("")},
              peg$c61 = function(directive, value) {
                  return new node({
                    type: "preprocessor",
                    directive: "#" + directive,
                    value: value
                  });
                },
              peg$c62 = /^[A-Za-z_]/,
              peg$c63 = { type: "class", value: "[A-Za-z_]", description: "[A-Za-z_]" },
              peg$c64 = /^[A-Za-z_0-9]/,
              peg$c65 = { type: "class", value: "[A-Za-z_0-9]", description: "[A-Za-z_0-9]" },
              peg$c66 = function(head, tail) {
                   return new node({
                     type: "identifier",
                     name: head + tail.join("")
                   });
                },
              peg$c67 = function(head, tail) {
                  if (!head) {
                    return [];
                  }
                  return [ head ].concat(tail.map(function(item) { return item[1]; }));
                },
              peg$c68 = /^[^()]/,
              peg$c69 = { type: "class", value: "[^()]", description: "[^()]" },
              peg$c70 = function(head, paren, tail) {
                  return head.join("") + paren + tail.join("");
                },
              peg$c71 = function(value) {
                  return "(" + value + ")";
                },
              peg$c72 = /^[^,)]/,
              peg$c73 = { type: "class", value: "[^,)]", description: "[^,)]" },
              peg$c74 = function(value) {
                  return value.join("");
                },
              peg$c75 = function(head, tail) {
                  return [head].concat(tail.map(function(item) { return item[1]; }));
                },
              peg$c76 = function(macro_name, parameters) {
                    var result = new node({
                      type: "macro_call",
                      macro_name: macro_name,
                      parameters: parameters
                    });
                    if (!parameters) {
                      result.parameters = [];
                    }
                    return result;
                  },
              peg$c77 = function(head, tail) {
                  return {
                    macro_call: head,
                    rest_of_line: tail.join('')
                  }
                },
              peg$c78 = "define",
              peg$c79 = { type: "literal", value: "define", description: "\"define\"" },
              peg$c80 = /^[ \t]/,
              peg$c81 = { type: "class", value: "[ \\t]", description: "[ \\t]" },
              peg$c82 = function(identifier, parameters, token_string) {
                  return new node({
                       type: "preprocessor",
                       directive: "#define",
                       identifier: identifier.name,
                       token_string: token_string,
                       parameters: parameters || null
                     });
                   },
              peg$c83 = "ifdef",
              peg$c84 = { type: "literal", value: "ifdef", description: "\"ifdef\"" },
              peg$c85 = "ifndef",
              peg$c86 = { type: "literal", value: "ifndef", description: "\"ifndef\"" },
              peg$c87 = "if",
              peg$c88 = { type: "literal", value: "if", description: "\"if\"" },
              peg$c89 = function(directive, value) {
                     return new node({
                       type: "preprocessor",
                       directive: "#" + directive,
                       value: value
                     });
                   },
              peg$c90 = "elif",
              peg$c91 = { type: "literal", value: "elif", description: "\"elif\"" },
              peg$c92 = function(value) {
                    return new node({
                      type: "preprocessor",
                      directive: "#elif",
                      value: value
                    });
                  },
              peg$c93 = "else",
              peg$c94 = { type: "literal", value: "else", description: "\"else\"" },
              peg$c95 = function() {
                  return new node({
                    type: "preprocessor",
                    directive: "#else"
                  });
                },
              peg$c96 = "endif",
              peg$c97 = { type: "literal", value: "endif", description: "\"endif\"" },
              peg$c98 = function(if_directive, elif_directive, else_directive) {
                    return preprocessor_branch(if_directive, elif_directive, else_directive);
                  },
              peg$c99 = function(prototype, body) {
                    result = new node({
                      type: "function_declaration",
                      name: prototype.name,
                      returnType: prototype.returnType,
                      parameters: prototype.parameters,
                      body: body
                    });
                    return result;
                },
              peg$c100 = function(statements) {
                    result = new node({
                      type: "scope",
                      statements: []
                    });
                    if (statements && statements.statements) {
                      result.statements = statements.statements;
                    }
                    return result;
                  },
              peg$c101 = function(list) {return {statements: list};},
              peg$c102 = function(statement) {
                  return statement;
                },
              peg$c103 = function(condition, if_body, else_body) {
                     result = new node({
                       type:"if_statement",
                       condition:condition,
                       body:if_body
                     });
                     if (else_body) {
                       result.elseBody = else_body[2];
                     }
                     return result;
                   },
              peg$c104 = "for",
              peg$c105 = { type: "literal", value: "for", description: "\"for\"" },
              peg$c106 = function(initializer, condition, increment, body) {
                      return new node({
                        type:"for_statement",
                        initializer:initializer,
                        condition:condition,
                        increment:increment,
                        body:body
                      });
                    },
              peg$c107 = "while",
              peg$c108 = { type: "literal", value: "while", description: "\"while\"" },
              peg$c109 = function(condition) {
                     return {
                       condition:condition
                     };
                   },
              peg$c110 = function(w, body) {
                    return new node({
                      type: "while_statement",
                      condition: w.condition,
                      body: body
                    });
                  },
              peg$c111 = "do",
              peg$c112 = { type: "literal", value: "do", description: "\"do\"" },
              peg$c113 = function(body, w) {
                     return new node({
                       type: "do_statement",
                       condition: w.condition,
                       body: body
                     });
                   },
              peg$c114 = "return",
              peg$c115 = { type: "literal", value: "return", description: "\"return\"" },
              peg$c116 = function(expression) {
                    return new node({
                      type: "return",
                      value: expression
                    });
                  },
              peg$c117 = "continue",
              peg$c118 = { type: "literal", value: "continue", description: "\"continue\"" },
              peg$c119 = "break",
              peg$c120 = { type: "literal", value: "break", description: "\"break\"" },
              peg$c121 = function() { return shaderType == "fs" },
              peg$c122 = "discard",
              peg$c123 = { type: "literal", value: "discard", description: "\"discard\"" },
              peg$c124 = function() {return "discard";},
              peg$c125 = function(type) {
                          return new node({
                            type:type[0]
                          });
                        },
              peg$c126 = function(e) {
                    return new node({
                      type: "expression",
                      expression: e
                    });
                },
              peg$c127 = { type: "other", description: "declaration" },
              peg$c128 = function(function_prototype) {
                    return function_prototype;
                  },
              peg$c129 = function(type, declarators) {
                    return new node({
                      type: "declarator",
                      typeAttribute: type,
                      declarators: declarators
                    });
                  },
              peg$c130 = function() { return shaderType == "vs"; },
              peg$c131 = "invariant",
              peg$c132 = { type: "literal", value: "invariant", description: "\"invariant\"" },
              peg$c133 = function(head, tail) {
                      var items = [ head ].concat(tail.map(function(item) {
                        return item[1]; }));
                      return new node({
                        type: "invariant",
                        identifiers: items
                      });
                    },
              peg$c134 = "precision",
              peg$c135 = { type: "literal", value: "precision", description: "\"precision\"" },
              peg$c136 = function(precission, type) {
                    return new node({
                      type:"precision",
                      precision: precission,
                      typeName: type
                    });
                  },
              peg$c137 = function(type, declarators) {
                  return new node({
                    type: "declarator",
                    typeAttribute: type,
                    declarators: declarators
                  });
                },
              peg$c138 = "void",
              peg$c139 = { type: "literal", value: "void", description: "\"void\"" },
              peg$c140 = function(head, tail) {
                    return [ head ].concat(tail.map(function(item) { return item[1]; }));
                  },
              peg$c141 = function(type, identifier, parameters) {
                    result = new node({
                      type:"function_prototype",
                      name: identifier.name,
                      returnType: type,
                      parameters: parameters
                    });
                    if (parameters == "void" || !parameters) {
                      result.parameters = [];
                    }
                    return result;
                  },
              peg$c142 = "inout",
              peg$c143 = { type: "literal", value: "inout", description: "\"inout\"" },
              peg$c144 = "in",
              peg$c145 = { type: "literal", value: "in", description: "\"in\"" },
              peg$c146 = "out",
              peg$c147 = { type: "literal", value: "out", description: "\"out\"" },
              peg$c148 = function(const_qualifier, parameter, precision, type_name, identifier, array_size) {
                  var result = new node({
                    type: "parameter",
                    type_name: type_name,
                    name: identifier.name
                  });
                  if (const_qualifier) result.typeQualifier = const_qualifier[0];
                  if (parameter) result.parameterQualifier = parameter[0];
                  if (precision) result.precision = precision[0];
                  if (array_size) result.arraySize = array_size[1];
                  // "const" is only legal on "in" parameter qualifiers.
                  if (result.typeQualifier &&
                      result.parameterQualifier &&
                      result.parameterQualifier != "in") {
                    return null;
                  } else {
                    return result;
                  }
                },
              peg$c149 = function(head, tail) {
                  return [ head ].concat(tail.map(function(item) { return item[1]; }));
                },
              peg$c150 = function(name) {
                    return new node({
                      type: "declarator_item",
                      name:name
                    });
                  },
              peg$c151 = function(name, arraySize) {
                    return new node({
                      type: "declarator_item",
                      name: name,
                      arraySize: arraySize,
                      isArray: true
                    });
                  },
              peg$c152 = function(name) {
                    return new node({
                      type: "declarator_item",
                      name: name,
                      isArray: true
                    });
                  },
              peg$c153 = function(name, initializer) {
                    return new node({
                      type: "declarator_item",
                      name: name,
                      initializer:initializer
                    });
                  },
              peg$c154 = function(declarators) {
                   return declarators.map(function(item) {
                     return new node({
                       type: "declarator",
                       typeAttribute: item[0],
                       declarators: item[2]
                     })
                    });
                },
              peg$c155 = "struct",
              peg$c156 = { type: "literal", value: "struct", description: "\"struct\"" },
              peg$c157 = function(qualifier, identifier, members, declarators) {
                    var result = new node({
                      type: "struct_definition",
                      members:members
                    });
                    if (qualifier) {
                      result.qualifier = qualifier[0];
                    }
                    if (identifier) {
                      result.name = identifier[1].name;
                      typeNames[result.name] = result;
                    }
                    if (declarators) {
                      result.declarators = declarators;
                    }
                    return result;
                  },
              peg$c158 = function(precision, name) {
                  var result = new node({
                    type: "type",
                    name: name
                  });
                  if (precision) result.precision = precision[0];
                  return result;
                },
              peg$c159 = { type: "other", description: "locally specified type" },
              peg$c160 = function(qualifier, type) {
                  var result = type;
                  if (qualifier) result.qualifier = qualifier[0];
                  return result;
                },
              peg$c161 = "attribute",
              peg$c162 = { type: "literal", value: "attribute", description: "\"attribute\"" },
              peg$c163 = function() {
                  return "attribute";
                },
              peg$c164 = function(qualifier, type) {
                  var result = type;
                  result.qualifier = qualifier;
                  return result;
                },
              peg$c165 = { type: "other", description: "fully specified type" },
              peg$c166 = { type: "other", description: "precision qualifier" },
              peg$c167 = "highp",
              peg$c168 = { type: "literal", value: "highp", description: "\"highp\"" },
              peg$c169 = "mediump",
              peg$c170 = { type: "literal", value: "mediump", description: "\"mediump\"" },
              peg$c171 = "lowp",
              peg$c172 = { type: "literal", value: "lowp", description: "\"lowp\"" },
              peg$c173 = "const",
              peg$c174 = { type: "literal", value: "const", description: "\"const\"" },
              peg$c175 = { type: "other", description: "type qualifier" },
              peg$c176 = "varying",
              peg$c177 = { type: "literal", value: "varying", description: "\"varying\"" },
              peg$c178 = function() { return "invariant varying"; },
              peg$c179 = "uniform",
              peg$c180 = { type: "literal", value: "uniform", description: "\"uniform\"" },
              peg$c181 = { type: "other", description: "void" },
              peg$c182 = function() {
                  return new node({
                    type: "type",
                    name: "void"
                  })
                },
              peg$c183 = { type: "other", description: "type name" },
              peg$c184 = "float",
              peg$c185 = { type: "literal", value: "float", description: "\"float\"" },
              peg$c186 = "int",
              peg$c187 = { type: "literal", value: "int", description: "\"int\"" },
              peg$c188 = "bool",
              peg$c189 = { type: "literal", value: "bool", description: "\"bool\"" },
              peg$c190 = "sampler2D",
              peg$c191 = { type: "literal", value: "sampler2D", description: "\"sampler2D\"" },
              peg$c192 = "samplerCube",
              peg$c193 = { type: "literal", value: "samplerCube", description: "\"samplerCube\"" },
              peg$c194 = function(name) {
                    if (name.name in typeNames) {
                       return name.name;
                    } else {
                      return null;
                    }
                  },
              peg$c195 = { type: "other", description: "identifier" },
              peg$c196 = /^[^A-Za-z_0-9]/,
              peg$c197 = { type: "class", value: "[^A-Za-z_0-9]", description: "[^A-Za-z_0-9]" },
              peg$c198 = { type: "other", description: "keyword" },
              peg$c199 = "true",
              peg$c200 = { type: "literal", value: "true", description: "\"true\"" },
              peg$c201 = "false",
              peg$c202 = { type: "literal", value: "false", description: "\"false\"" },
              peg$c203 = /^[bi]/,
              peg$c204 = { type: "class", value: "[bi]", description: "[bi]" },
              peg$c205 = "vec",
              peg$c206 = { type: "literal", value: "vec", description: "\"vec\"" },
              peg$c207 = /^[234]/,
              peg$c208 = { type: "class", value: "[234]", description: "[234]" },
              peg$c209 = function(a) { return a.join(""); },
              peg$c210 = "mat",
              peg$c211 = { type: "literal", value: "mat", description: "\"mat\"" },
              peg$c212 = { type: "other", description: "reserved name" },
              peg$c213 = "__",
              peg$c214 = { type: "literal", value: "__", description: "\"__\"" },
              peg$c215 = /^[A-Za-z0-9]/,
              peg$c216 = { type: "class", value: "[A-Za-z0-9]", description: "[A-Za-z0-9]" },
              peg$c217 = "_",
              peg$c218 = { type: "literal", value: "_", description: "\"_\"" },
              peg$c219 = /^[1-9]/,
              peg$c220 = { type: "class", value: "[1-9]", description: "[1-9]" },
              peg$c221 = /^[0-9]/,
              peg$c222 = { type: "class", value: "[0-9]", description: "[0-9]" },
              peg$c223 = function(head, tail) {
                    return new node({
                      type: "int",
                      value: parseInt([head].concat(tail).join(""), 10)
                    });
                  },
              peg$c224 = "0",
              peg$c225 = { type: "literal", value: "0", description: "\"0\"" },
              peg$c226 = /^[Xx]/,
              peg$c227 = { type: "class", value: "[Xx]", description: "[Xx]" },
              peg$c228 = /^[0-9A-Fa-f]/,
              peg$c229 = { type: "class", value: "[0-9A-Fa-f]", description: "[0-9A-Fa-f]" },
              peg$c230 = function(digits) {
                    return new node({
                      type:"int",
                      value:parseInt(digits.join(""), 16)
                    });
                  },
              peg$c231 = /^[0-7]/,
              peg$c232 = { type: "class", value: "[0-7]", description: "[0-7]" },
              peg$c233 = function(digits) {
                    return new node({
                      type:"int",
                      value:parseInt(digits.join(""), 8)
                    });
                  },
              peg$c234 = function() {
                    return new node({
                      type: "int",
                      value: 0
                    });
                  },
              peg$c235 = ".",
              peg$c236 = { type: "literal", value: ".", description: "\".\"" },
              peg$c237 = function(digits) {
                    digits[0] = digits[0].join("");
                    digits[2] = digits[2].join("");
                    return new node({
                      type: "float",
                      value:parseFloat(digits.join(""))
                    });
                  },
              peg$c238 = function(digits) {
                    return new node({
                      type: "float",
                      value: parseFloat(digits[0].join("") + digits[1])
                    });
                },
              peg$c239 = /^[Ee]/,
              peg$c240 = { type: "class", value: "[Ee]", description: "[Ee]" },
              peg$c241 = /^[+\-]/,
              peg$c242 = { type: "class", value: "[+\\-]", description: "[+\\-]" },
              peg$c243 = function(sign, exponent) {
                    return ["e", sign].concat(exponent).join("");
                 },
              peg$c244 = function(expression) {
                    return expression;
                  },
              peg$c245 = function(value) {
                  return new node({
                    type: "bool",
                    value: value == "true"
                  });
                },
              peg$c246 = function(index) {
                  return new node({
                    type: "accessor",
                    index: index
                  });
                },
              peg$c247 = function(id) {
                  return new node({
                    type: "field_selector",
                    selection: id.name
                  })
                },
              peg$c248 = function(head, tail) {
                    var result = head;
                    for (var i = 0; i < tail.length; i++) {
                      result = new node({
                        type: "postfix",
                        operator: tail[i],
                        expression: result
                      })
                    }
                    return result;
                  },
              peg$c249 = "++",
              peg$c250 = { type: "literal", value: "++", description: "\"++\"" },
              peg$c251 = "--",
              peg$c252 = { type: "literal", value: "--", description: "\"--\"" },
              peg$c253 = function(head, tail, rest) {
                    var result = head;
                    if(tail) {
                      result = new node({
                        type: "postfix",
                        operator: new node({
                          id: next_id++,
                          type: "operator",
                          operator: tail
                        }),
                        expression: result
                      })
                    }
                    for (var i = 0; i < rest.length; i++) {
                      result = new node({
                        type: "postfix",
                        operator: rest[i],
                        expression: result
                      })
                    }
                    return result;
                  },
              peg$c254 = function() {return []; },
              peg$c255 = function(head, tail) {
                    return [ head ].concat(tail.map(function(item) { return item[1] }));
                  },
              peg$c256 = function(function_name, parameters) {
                    var result = new node({
                      type: "function_call",
                      function_name: function_name,
                      parameters: parameters
                    });
                    if (!parameters) {
                      result.parameters = [];
                    }
                    return result;
                  },
              peg$c257 = function(id) {return id.name;},
              peg$c258 = "!",
              peg$c259 = { type: "literal", value: "!", description: "\"!\"" },
              peg$c260 = "~",
              peg$c261 = { type: "literal", value: "~", description: "\"~\"" },
              peg$c262 = "+",
              peg$c263 = { type: "literal", value: "+", description: "\"+\"" },
              peg$c264 = "-",
              peg$c265 = { type: "literal", value: "-", description: "\"-\"" },
              peg$c266 = function(head, tail) {
                    result = tail
                    if (head) {
                      result = new node({
                        type: "unary",
                        expression: result,
                        operator: new node({
                          type: "operator",
                          operator: head
                        })
                      });
                    }
                    return result;
                  },
              peg$c267 = "*",
              peg$c268 = { type: "literal", value: "*", description: "\"*\"" },
              peg$c269 = "/",
              peg$c270 = { type: "literal", value: "/", description: "\"/\"" },
              peg$c271 = "%",
              peg$c272 = { type: "literal", value: "%", description: "\"%\"" },
              peg$c273 = function(operator) {
                  return new node({
                    type: "operator",
                    operator: operator
                  });
                },
              peg$c274 = function(head, tail) {
                    return daisy_chain(head, tail);
                  },
              peg$c275 = function() {
                  return new node({
                    type: "operator",
                    operator: "+"
                  });
                },
              peg$c276 = function() {
                  return new node({
                    type: "operator",
                    operator: "-"
                  });
                },
              peg$c277 = "<<",
              peg$c278 = { type: "literal", value: "<<", description: "\"<<\"" },
              peg$c279 = ">>",
              peg$c280 = { type: "literal", value: ">>", description: "\">>\"" },
              peg$c281 = "<",
              peg$c282 = { type: "literal", value: "<", description: "\"<\"" },
              peg$c283 = function(equal) {
                  return new node({
                    type: "operator",
                    operator: "<" + (equal || "")
                  });
                },
              peg$c284 = ">",
              peg$c285 = { type: "literal", value: ">", description: "\">\"" },
              peg$c286 = function(equal) {
                  return new node({
                    type: "operator",
                    operator: ">" + (equal || "")
                  });
                },
              peg$c287 = "==",
              peg$c288 = { type: "literal", value: "==", description: "\"==\"" },
              peg$c289 = "!=",
              peg$c290 = { type: "literal", value: "!=", description: "\"!=\"" },
              peg$c291 = function(operator) {
                   return new node({
                     type: "operator",
                     operator: operator
                   });
                 },
              peg$c292 = "&",
              peg$c293 = { type: "literal", value: "&", description: "\"&\"" },
              peg$c294 = function() {
                   return new node({
                     type: "operator",
                     operator: "&"
                   });
                 },
              peg$c295 = "^",
              peg$c296 = { type: "literal", value: "^", description: "\"^\"" },
              peg$c297 = function() {
                   return new node({
                     type: "operator",
                     operator: "^"
                   });
                 },
              peg$c298 = "|",
              peg$c299 = { type: "literal", value: "|", description: "\"|\"" },
              peg$c300 = function() {
                   return new node({
                     type: "operator",
                     operator: "|"
                   });
                 },
              peg$c301 = "&&",
              peg$c302 = { type: "literal", value: "&&", description: "\"&&\"" },
              peg$c303 = function() {
                   return new node({
                     type: "operator",
                     operator: "&&"
                   });
                 },
              peg$c304 = "^^",
              peg$c305 = { type: "literal", value: "^^", description: "\"^^\"" },
              peg$c306 = function() {
                   return new node({
                     type: "operator",
                     operator: "^^"
                   });
                 },
              peg$c307 = "||",
              peg$c308 = { type: "literal", value: "||", description: "\"||\"" },
              peg$c309 = function() {
                   return new node({
                     type: "operator",
                     operator: "||"
                   });
                 },
              peg$c310 = "?",
              peg$c311 = { type: "literal", value: "?", description: "\"?\"" },
              peg$c312 = ":",
              peg$c313 = { type: "literal", value: ":", description: "\":\"" },
              peg$c314 = function(head, tail) {
                    result = head;
                    if (tail) {
                      result = new node({
                        type: "ternary",
                        condition: head,
                        is_true: tail[3],
                        is_false: tail[7]
                      })
                    }
                    return result;
                  },
              peg$c315 = "*=",
              peg$c316 = { type: "literal", value: "*=", description: "\"*=\"" },
              peg$c317 = "/=",
              peg$c318 = { type: "literal", value: "/=", description: "\"/=\"" },
              peg$c319 = "%=",
              peg$c320 = { type: "literal", value: "%=", description: "\"%=\"" },
              peg$c321 = "+=",
              peg$c322 = { type: "literal", value: "+=", description: "\"+=\"" },
              peg$c323 = "-=",
              peg$c324 = { type: "literal", value: "-=", description: "\"-=\"" },
              peg$c325 = "<<=",
              peg$c326 = { type: "literal", value: "<<=", description: "\"<<=\"" },
              peg$c327 = ">>=",
              peg$c328 = { type: "literal", value: ">>=", description: "\">>=\"" },
              peg$c329 = "&=",
              peg$c330 = { type: "literal", value: "&=", description: "\"&=\"" },
              peg$c331 = "^=",
              peg$c332 = { type: "literal", value: "^=", description: "\"^=\"" },
              peg$c333 = "|=",
              peg$c334 = { type: "literal", value: "|=", description: "\"|=\"" },
              peg$c335 = function(variable, operator, expression) {
                    return new node({
                      type: "binary",
                      operator: new node({
                        type: "operator",
                        operator: operator
                      }),
                      left: variable,
                      right: expression
                    });
                  },
      
              peg$currPos          = 0,
              peg$reportedPos      = 0,
              peg$cachedPos        = 0,
              peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
              peg$maxFailPos       = 0,
              peg$maxFailExpected  = [],
              peg$silentFails      = 0,
      
              peg$result;
      
          if ("startRule" in options) {
            if (!(options.startRule in peg$startRuleFunctions)) {
              throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
            }
      
            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
          }
      
          function text() {
            return input.substring(peg$reportedPos, peg$currPos);
          }
      
          function offset() {
            return peg$reportedPos;
          }
      
          function line() {
            return peg$computePosDetails(peg$reportedPos).line;
          }
      
          function column() {
            return peg$computePosDetails(peg$reportedPos).column;
          }
      
          function expected(description) {
            throw peg$buildException(
              null,
              [{ type: "other", description: description }],
              peg$reportedPos
            );
          }
      
          function error(message) {
            throw peg$buildException(message, null, peg$reportedPos);
          }
      
          function peg$computePosDetails(pos) {
            function advance(details, startPos, endPos) {
              var p, ch;
      
              for (p = startPos; p < endPos; p++) {
                ch = input.charAt(p);
                if (ch === "\n") {
                  if (!details.seenCR) { details.line++; }
                  details.column = 1;
                  details.seenCR = false;
                } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
                  details.line++;
                  details.column = 1;
                  details.seenCR = true;
                } else {
                  details.column++;
                  details.seenCR = false;
                }
              }
            }
      
            if (peg$cachedPos !== pos) {
              if (peg$cachedPos > pos) {
                peg$cachedPos = 0;
                peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
              }
              advance(peg$cachedPosDetails, peg$cachedPos, pos);
              peg$cachedPos = pos;
            }
      
            return peg$cachedPosDetails;
          }
      
          function peg$fail(expected) {
            if (peg$currPos < peg$maxFailPos) { return; }
      
            if (peg$currPos > peg$maxFailPos) {
              peg$maxFailPos = peg$currPos;
              peg$maxFailExpected = [];
            }
      
            peg$maxFailExpected.push(expected);
          }
      
          function peg$buildException(message, expected, pos) {
            function cleanupExpected(expected) {
              var i = 1;
      
              expected.sort(function(a, b) {
                if (a.description < b.description) {
                  return -1;
                } else if (a.description > b.description) {
                  return 1;
                } else {
                  return 0;
                }
              });
      
              while (i < expected.length) {
                if (expected[i - 1] === expected[i]) {
                  expected.splice(i, 1);
                } else {
                  i++;
                }
              }
            }
      
            function buildMessage(expected, found) {
              function stringEscape(s) {
                function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }
      
                return s
                  .replace(/\\/g,   '\\\\')
                  .replace(/"/g,    '\\"')
                  .replace(/\x08/g, '\\b')
                  .replace(/\t/g,   '\\t')
                  .replace(/\n/g,   '\\n')
                  .replace(/\f/g,   '\\f')
                  .replace(/\r/g,   '\\r')
                  .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
                  .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
                  .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
                  .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
              }
      
              var expectedDescs = new Array(expected.length),
                  expectedDesc, foundDesc, i;
      
              for (i = 0; i < expected.length; i++) {
                expectedDescs[i] = expected[i].description;
              }
      
              expectedDesc = expected.length > 1
                ? expectedDescs.slice(0, -1).join(", ")
                    + " or "
                    + expectedDescs[expected.length - 1]
                : expectedDescs[0];
      
              foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";
      
              return "Expected " + expectedDesc + " but " + foundDesc + " found.";
            }
      
            var posDetails = peg$computePosDetails(pos),
                found      = pos < input.length ? input.charAt(pos) : null;
      
            if (expected !== null) {
              cleanupExpected(expected);
            }
      
            return new SyntaxError(
              message !== null ? message : buildMessage(expected, found),
              expected,
              found,
              pos,
              posDetails.line,
              posDetails.column
            );
          }
      
          function peg$parsestart() {
            var s0;
      
            s0 = peg$parseexternal_statement_list();
      
            return s0;
          }
      
          function peg$parsevertex_start() {
            var s0, s1, s2;
      
            s0 = peg$currPos;
            peg$reportedPos = peg$currPos;
            s1 = peg$c1();
            if (s1) {
              s1 = peg$c2;
            } else {
              s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseexternal_statement_list();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c3(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsefragment_start() {
            var s0, s1, s2;
      
            s0 = peg$currPos;
            peg$reportedPos = peg$currPos;
            s1 = peg$c4();
            if (s1) {
              s1 = peg$c2;
            } else {
              s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseexternal_statement_list();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c3(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsenewLine() {
            var s0, s1;
      
            s0 = peg$currPos;
            if (peg$c5.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c6); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c7();
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parseEOF() {
            var s0, s1;
      
            s0 = peg$currPos;
            peg$silentFails++;
            if (input.length > peg$currPos) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c8); }
            }
            peg$silentFails--;
            if (s1 === peg$FAILED) {
              s0 = peg$c2;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parse_() {
            var s0, s1;
      
            peg$silentFails++;
            s0 = [];
            s1 = peg$parsenewLine();
            if (s1 === peg$FAILED) {
              if (peg$c11.test(input.charAt(peg$currPos))) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c12); }
              }
              if (s1 === peg$FAILED) {
                if (peg$c13.test(input.charAt(peg$currPos))) {
                  s1 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c14); }
                }
                if (s1 === peg$FAILED) {
                  s1 = peg$parsecomment();
                }
              }
            }
            if (s1 !== peg$FAILED) {
              while (s1 !== peg$FAILED) {
                s0.push(s1);
                s1 = peg$parsenewLine();
                if (s1 === peg$FAILED) {
                  if (peg$c11.test(input.charAt(peg$currPos))) {
                    s1 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c12); }
                  }
                  if (s1 === peg$FAILED) {
                    if (peg$c13.test(input.charAt(peg$currPos))) {
                      s1 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c14); }
                    }
                    if (s1 === peg$FAILED) {
                      s1 = peg$parsecomment();
                    }
                  }
                }
              }
            } else {
              s0 = peg$c0;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c9); }
            }
      
            return s0;
          }
      
          function peg$parsenoNewlineComment() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c15) {
              s1 = peg$c15;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c16); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$currPos;
              peg$silentFails++;
              if (input.substr(peg$currPos, 2) === peg$c17) {
                s5 = peg$c17;
                peg$currPos += 2;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c18); }
              }
              peg$silentFails--;
              if (s5 === peg$FAILED) {
                s4 = peg$c2;
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
              if (s4 !== peg$FAILED) {
                if (input.length > peg$currPos) {
                  s5 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c8); }
                }
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 2) === peg$c17) {
                  s5 = peg$c17;
                  peg$currPos += 2;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c18); }
                }
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                  s4 = peg$c2;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
                if (s4 !== peg$FAILED) {
                  if (input.length > peg$currPos) {
                    s5 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c8); }
                  }
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c17) {
                  s3 = peg$c17;
                  peg$currPos += 2;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c18); }
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c19) {
                s1 = peg$c19;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c20); }
              }
              if (s1 !== peg$FAILED) {
                s2 = [];
                if (peg$c21.test(input.charAt(peg$currPos))) {
                  s3 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c22); }
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  if (peg$c21.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c22); }
                  }
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            }
      
            return s0;
          }
      
          function peg$parsenoNewlineWhitespace() {
            var s0, s1;
      
            s0 = [];
            if (peg$c13.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c14); }
            }
            if (s1 === peg$FAILED) {
              s1 = peg$parsenoNewlineComment();
            }
            if (s1 !== peg$FAILED) {
              while (s1 !== peg$FAILED) {
                s0.push(s1);
                if (peg$c13.test(input.charAt(peg$currPos))) {
                  s1 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c14); }
                }
                if (s1 === peg$FAILED) {
                  s1 = peg$parsenoNewlineComment();
                }
              }
            } else {
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsecomment() {
            var s0, s1, s2, s3, s4, s5;
      
            peg$silentFails++;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c15) {
              s1 = peg$c15;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c16); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$currPos;
              peg$silentFails++;
              if (input.substr(peg$currPos, 2) === peg$c17) {
                s5 = peg$c17;
                peg$currPos += 2;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c18); }
              }
              peg$silentFails--;
              if (s5 === peg$FAILED) {
                s4 = peg$c2;
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
              if (s4 !== peg$FAILED) {
                if (input.length > peg$currPos) {
                  s5 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c8); }
                }
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 2) === peg$c17) {
                  s5 = peg$c17;
                  peg$currPos += 2;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c18); }
                }
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                  s4 = peg$c2;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
                if (s4 !== peg$FAILED) {
                  if (input.length > peg$currPos) {
                    s5 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c8); }
                  }
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c17) {
                  s3 = peg$c17;
                  peg$currPos += 2;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c18); }
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c19) {
                s1 = peg$c19;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c20); }
              }
              if (s1 !== peg$FAILED) {
                s2 = [];
                if (peg$c21.test(input.charAt(peg$currPos))) {
                  s3 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c22); }
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  if (peg$c21.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c22); }
                  }
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$parsenewLine();
                  if (s3 === peg$FAILED) {
                    s3 = peg$parseEOF();
                  }
                  if (s3 !== peg$FAILED) {
                    s1 = [s1, s2, s3];
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c23); }
            }
      
            return s0;
          }
      
          function peg$parsesemicolon() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 59) {
                s2 = peg$c25;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c26); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsecomma() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s2 = peg$c27;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c28); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseleft_bracket() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 91) {
                s2 = peg$c29;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c30); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseright_bracket() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s2 = peg$c31;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c32); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseequals() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 61) {
                s2 = peg$c33;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c34); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseleft_paren() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 40) {
                s2 = peg$c35;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c36); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseright_paren() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s2 = peg$c37;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c38); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseleft_brace() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 123) {
                s2 = peg$c39;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c40); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseright_brace() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s2 = peg$c41;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c42); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseexternal_statement_list() {
            var s0, s1, s2;
      
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parseexternal_statement();
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parseexternal_statement();
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c43(s1);
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parseexternal_statement() {
            var s0, s1;
      
            s0 = peg$currPos;
            s1 = peg$parsepreprocessor_external_branch();
            if (s1 === peg$FAILED) {
              s1 = peg$parseexternal_declaration();
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c44(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parse_();
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c45();
              }
              s0 = s1;
            }
      
            return s0;
          }
      
          function peg$parseexternal_declaration() {
            var s0;
      
            s0 = peg$parsefunction_definition();
            if (s0 === peg$FAILED) {
              s0 = peg$parseglobal_declaration();
              if (s0 === peg$FAILED) {
                s0 = peg$parsepreprocessor_define();
                if (s0 === peg$FAILED) {
                  s0 = peg$parsepreprocessor_operator();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parsestruct_definition();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parsemacro_call();
                    }
                  }
                }
              }
            }
      
            return s0;
          }
      
          function peg$parsepreprocessor_operator() {
            var s0, s1, s2, s3, s4, s5, s6;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 35) {
              s1 = peg$c46;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s1 !== peg$FAILED) {
              if (input.substr(peg$currPos, 5) === peg$c48) {
                s2 = peg$c48;
                peg$currPos += 5;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c49); }
              }
              if (s2 === peg$FAILED) {
                if (input.substr(peg$currPos, 6) === peg$c50) {
                  s2 = peg$c50;
                  peg$currPos += 6;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c51); }
                }
                if (s2 === peg$FAILED) {
                  if (input.substr(peg$currPos, 7) === peg$c52) {
                    s2 = peg$c52;
                    peg$currPos += 7;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c53); }
                  }
                  if (s2 === peg$FAILED) {
                    if (input.substr(peg$currPos, 5) === peg$c54) {
                      s2 = peg$c54;
                      peg$currPos += 5;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c55); }
                    }
                    if (s2 === peg$FAILED) {
                      if (input.substr(peg$currPos, 9) === peg$c56) {
                        s2 = peg$c56;
                        peg$currPos += 9;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c57); }
                      }
                      if (s2 === peg$FAILED) {
                        if (input.substr(peg$currPos, 4) === peg$c58) {
                          s2 = peg$c58;
                          peg$currPos += 4;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c59); }
                        }
                      }
                    }
                  }
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 !== peg$FAILED) {
                  s4 = peg$currPos;
                  s5 = [];
                  if (peg$c21.test(input.charAt(peg$currPos))) {
                    s6 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c22); }
                  }
                  while (s6 !== peg$FAILED) {
                    s5.push(s6);
                    if (peg$c21.test(input.charAt(peg$currPos))) {
                      s6 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s6 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c22); }
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    peg$reportedPos = s4;
                    s5 = peg$c60(s5);
                  }
                  s4 = s5;
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsenewLine();
                    if (s5 === peg$FAILED) {
                      s5 = peg$parseEOF();
                    }
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c61(s2, s4);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsemacro_identifier() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (peg$c62.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c63); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              if (peg$c64.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c65); }
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                if (peg$c64.test(input.charAt(peg$currPos))) {
                  s3 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c65); }
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c66(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsepreprocessor_parameter_list() {
            var s0, s1, s2, s3, s4, s5, s6;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 40) {
              s1 = peg$c35;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c36); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsemacro_identifier();
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$currPos;
                s5 = peg$parsecomma();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsemacro_identifier();
                  if (s6 !== peg$FAILED) {
                    s5 = [s5, s6];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$currPos;
                  s5 = peg$parsecomma();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsemacro_identifier();
                    if (s6 !== peg$FAILED) {
                      s5 = [s5, s6];
                      s4 = s5;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$c0;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parseright_paren();
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c67(s2, s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsemacro_paren_parameter() {
            var s0, s1, s2, s3, s4, s5, s6;
      
            s0 = peg$currPos;
            s1 = peg$parseleft_paren();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = [];
              if (peg$c68.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c69); }
              }
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                if (peg$c68.test(input.charAt(peg$currPos))) {
                  s4 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c69); }
                }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsemacro_paren_parameter();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = [];
                  if (peg$c68.test(input.charAt(peg$currPos))) {
                    s6 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c69); }
                  }
                  while (s6 !== peg$FAILED) {
                    s5.push(s6);
                    if (peg$c68.test(input.charAt(peg$currPos))) {
                      s6 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s6 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c69); }
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    peg$reportedPos = s2;
                    s3 = peg$c70(s3, s4, s5);
                    s2 = s3;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c0;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parseright_paren();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c71(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsemacro_call_parameter() {
            var s0, s1, s2;
      
            s0 = peg$parsemacro_paren_parameter();
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = [];
              if (peg$c72.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c73); }
              }
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                if (peg$c72.test(input.charAt(peg$currPos))) {
                  s2 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c73); }
                }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c74(s1);
              }
              s0 = s1;
            }
      
            return s0;
          }
      
          function peg$parsemacro_call_parameter_list() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$parsemacro_call_parameter();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parsecomma();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsemacro_call_parameter();
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parsecomma();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsemacro_call_parameter();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c75(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsemacro_call() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$parsemacro_identifier();
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parseleft_paren();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parseparameter_list();
                  if (s4 === peg$FAILED) {
                    s4 = peg$c24;
                  }
                  if (s4 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 41) {
                      s5 = peg$c37;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c38); }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c76(s1, s4);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsemacro_call_line() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parsemacro_call();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              if (peg$c21.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c22); }
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                if (peg$c21.test(input.charAt(peg$currPos))) {
                  s3 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c22); }
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c77(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsepreprocessor_define() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 35) {
              s1 = peg$c46;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                if (input.substr(peg$currPos, 6) === peg$c78) {
                  s3 = peg$c78;
                  peg$currPos += 6;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c79); }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parse_();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsemacro_identifier();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsepreprocessor_parameter_list();
                      if (s6 === peg$FAILED) {
                        s6 = peg$c24;
                      }
                      if (s6 !== peg$FAILED) {
                        s7 = [];
                        if (peg$c80.test(input.charAt(peg$currPos))) {
                          s8 = input.charAt(peg$currPos);
                          peg$currPos++;
                        } else {
                          s8 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c81); }
                        }
                        while (s8 !== peg$FAILED) {
                          s7.push(s8);
                          if (peg$c80.test(input.charAt(peg$currPos))) {
                            s8 = input.charAt(peg$currPos);
                            peg$currPos++;
                          } else {
                            s8 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c81); }
                          }
                        }
                        if (s7 !== peg$FAILED) {
                          s8 = peg$currPos;
                          s9 = [];
                          if (peg$c21.test(input.charAt(peg$currPos))) {
                            s10 = input.charAt(peg$currPos);
                            peg$currPos++;
                          } else {
                            s10 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c22); }
                          }
                          while (s10 !== peg$FAILED) {
                            s9.push(s10);
                            if (peg$c21.test(input.charAt(peg$currPos))) {
                              s10 = input.charAt(peg$currPos);
                              peg$currPos++;
                            } else {
                              s10 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c22); }
                            }
                          }
                          if (s9 !== peg$FAILED) {
                            peg$reportedPos = s8;
                            s9 = peg$c60(s9);
                          }
                          s8 = s9;
                          if (s8 !== peg$FAILED) {
                            s9 = peg$parsenewLine();
                            if (s9 === peg$FAILED) {
                              s9 = peg$parseEOF();
                            }
                            if (s9 !== peg$FAILED) {
                              peg$reportedPos = s0;
                              s1 = peg$c82(s5, s6, s8);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsepreprocessor_if() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 35) {
              s1 = peg$c46;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                if (input.substr(peg$currPos, 5) === peg$c83) {
                  s3 = peg$c83;
                  peg$currPos += 5;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c84); }
                }
                if (s3 === peg$FAILED) {
                  if (input.substr(peg$currPos, 6) === peg$c85) {
                    s3 = peg$c85;
                    peg$currPos += 6;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c86); }
                  }
                  if (s3 === peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c87) {
                      s3 = peg$c87;
                      peg$currPos += 2;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c88); }
                    }
                  }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parse_();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$currPos;
                    s6 = [];
                    if (peg$c21.test(input.charAt(peg$currPos))) {
                      s7 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c22); }
                    }
                    while (s7 !== peg$FAILED) {
                      s6.push(s7);
                      if (peg$c21.test(input.charAt(peg$currPos))) {
                        s7 = input.charAt(peg$currPos);
                        peg$currPos++;
                      } else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c22); }
                      }
                    }
                    if (s6 !== peg$FAILED) {
                      peg$reportedPos = s5;
                      s6 = peg$c60(s6);
                    }
                    s5 = s6;
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsenewLine();
                      if (s6 === peg$FAILED) {
                        s6 = peg$parseEOF();
                      }
                      if (s6 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c89(s3, s5);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsepreprocessor_else_if() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 35) {
              s1 = peg$c46;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                if (input.substr(peg$currPos, 4) === peg$c90) {
                  s3 = peg$c90;
                  peg$currPos += 4;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c91); }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parse_();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$currPos;
                    s6 = [];
                    if (peg$c21.test(input.charAt(peg$currPos))) {
                      s7 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c22); }
                    }
                    while (s7 !== peg$FAILED) {
                      s6.push(s7);
                      if (peg$c21.test(input.charAt(peg$currPos))) {
                        s7 = input.charAt(peg$currPos);
                        peg$currPos++;
                      } else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c22); }
                      }
                    }
                    if (s6 !== peg$FAILED) {
                      peg$reportedPos = s5;
                      s6 = peg$c60(s6);
                    }
                    s5 = s6;
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsenewLine();
                      if (s6 === peg$FAILED) {
                        s6 = peg$parseEOF();
                      }
                      if (s6 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c92(s5);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsepreprocessor_else() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 35) {
              s1 = peg$c46;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                if (input.substr(peg$currPos, 4) === peg$c93) {
                  s3 = peg$c93;
                  peg$currPos += 4;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c94); }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsenoNewlineWhitespace();
                  if (s4 === peg$FAILED) {
                    s4 = peg$c24;
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsenewLine();
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c95();
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsepreprocessor_end() {
            var s0, s1, s2, s3, s4, s5, s6;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 35) {
              s1 = peg$c46;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                if (input.substr(peg$currPos, 5) === peg$c96) {
                  s3 = peg$c96;
                  peg$currPos += 5;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c97); }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsenoNewlineWhitespace();
                  if (s4 === peg$FAILED) {
                    s4 = peg$c24;
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsenewLine();
                    if (s5 === peg$FAILED) {
                      s5 = peg$parseEOF();
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parse_();
                      if (s6 === peg$FAILED) {
                        s6 = peg$c24;
                      }
                      if (s6 !== peg$FAILED) {
                        s1 = [s1, s2, s3, s4, s5, s6];
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsepreprocessor_external_branch() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parsepreprocessor_if();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseexternal_statement_list();
              if (s3 !== peg$FAILED) {
                s2 = [s2, s3];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parsepreprocessor_else_if();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseexternal_statement_list();
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parsepreprocessor_else_if();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseexternal_statement_list();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                s4 = peg$parsepreprocessor_else();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseexternal_statement_list();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsepreprocessor_end();
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c98(s1, s2, s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsepreprocessor_statement_branch() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parsepreprocessor_if();
            if (s2 !== peg$FAILED) {
              s3 = peg$parsestatement_list();
              if (s3 !== peg$FAILED) {
                s2 = [s2, s3];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parsepreprocessor_else_if();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsestatement_list();
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parsepreprocessor_else_if();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsestatement_list();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                s4 = peg$parsepreprocessor_else();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsestatement_list();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsepreprocessor_end();
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c98(s1, s2, s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsefunction_definition() {
            var s0, s1, s2;
      
            s0 = peg$currPos;
            s1 = peg$parsefunction_prototype();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsecompound_statement();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c99(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsecompound_statement() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parseleft_brace();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsestatement_list();
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parseright_brace();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c100(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsestatement_list() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsestatement_no_new_scope();
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsestatement_no_new_scope();
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parse_();
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c101(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsestatement_no_new_scope() {
            var s0;
      
            s0 = peg$parsecompound_statement();
            if (s0 === peg$FAILED) {
              s0 = peg$parsesimple_statement();
              if (s0 === peg$FAILED) {
                s0 = peg$parsepreprocessor_statement_branch();
              }
            }
      
            return s0;
          }
      
          function peg$parsestatement_with_scope() {
            var s0;
      
            s0 = peg$parsecompound_statement();
            if (s0 === peg$FAILED) {
              s0 = peg$parsesimple_statement();
              if (s0 === peg$FAILED) {
                s0 = peg$parsepreprocessor_statement_branch();
              }
            }
      
            return s0;
          }
      
          function peg$parsesimple_statement() {
            var s0, s1;
      
            s0 = peg$currPos;
            s1 = peg$parsedeclaration();
            if (s1 === peg$FAILED) {
              s1 = peg$parseexpression_statement();
              if (s1 === peg$FAILED) {
                s1 = peg$parseselection_statement();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseiteration_statement();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parsejump_statement();
                    if (s1 === peg$FAILED) {
                      s1 = peg$parsepreprocessor_define();
                      if (s1 === peg$FAILED) {
                        s1 = peg$parsepreprocessor_operator();
                        if (s1 === peg$FAILED) {
                          s1 = peg$parsemacro_call();
                        }
                      }
                    }
                  }
                }
              }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c102(s1);
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parseselection_statement() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c87) {
              s1 = peg$c87;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c88); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseleft_paren();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseassignment_expression();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parseright_paren();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsestatement_with_scope();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$currPos;
                      if (input.substr(peg$currPos, 4) === peg$c93) {
                        s7 = peg$c93;
                        peg$currPos += 4;
                      } else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c94); }
                      }
                      if (s7 !== peg$FAILED) {
                        s8 = peg$parse_();
                        if (s8 === peg$FAILED) {
                          s8 = peg$c24;
                        }
                        if (s8 !== peg$FAILED) {
                          s9 = peg$parsestatement_with_scope();
                          if (s9 !== peg$FAILED) {
                            s7 = [s7, s8, s9];
                            s6 = s7;
                          } else {
                            peg$currPos = s6;
                            s6 = peg$c0;
                          }
                        } else {
                          peg$currPos = s6;
                          s6 = peg$c0;
                        }
                      } else {
                        peg$currPos = s6;
                        s6 = peg$c0;
                      }
                      if (s6 === peg$FAILED) {
                        s6 = peg$c24;
                      }
                      if (s6 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c103(s3, s5, s6);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsefor_loop() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c104) {
              s1 = peg$c104;
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c105); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseleft_paren();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseexpression_statement();
                if (s3 === peg$FAILED) {
                  s3 = peg$parsedeclaration();
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsecondition();
                  if (s4 === peg$FAILED) {
                    s4 = peg$c24;
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsesemicolon();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parseassignment_expression();
                      if (s6 === peg$FAILED) {
                        s6 = peg$c24;
                      }
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parseright_paren();
                        if (s7 !== peg$FAILED) {
                          s8 = peg$parsestatement_no_new_scope();
                          if (s8 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c106(s3, s4, s6, s8);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsewhile_statement() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 5) === peg$c107) {
              s1 = peg$c107;
              peg$currPos += 5;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c108); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseleft_paren();
              if (s2 !== peg$FAILED) {
                s3 = peg$parsecondition();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parseright_paren();
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c109(s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsewhile_loop() {
            var s0, s1, s2;
      
            s0 = peg$currPos;
            s1 = peg$parsewhile_statement();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsestatement_no_new_scope();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c110(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsedo_while() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c111) {
              s1 = peg$c111;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c112); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsestatement_with_scope();
              if (s2 !== peg$FAILED) {
                s3 = peg$parsewhile_statement();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c113(s2, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseiteration_statement() {
            var s0;
      
            s0 = peg$parsewhile_loop();
            if (s0 === peg$FAILED) {
              s0 = peg$parsedo_while();
              if (s0 === peg$FAILED) {
                s0 = peg$parsefor_loop();
              }
            }
      
            return s0;
          }
      
          function peg$parsejump_statement() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 6) === peg$c114) {
              s1 = peg$c114;
              peg$currPos += 6;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c115); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseassignment_expression();
              if (s2 !== peg$FAILED) {
                s3 = peg$parsesemicolon();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c116(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$currPos;
              if (input.substr(peg$currPos, 8) === peg$c117) {
                s2 = peg$c117;
                peg$currPos += 8;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c118); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsesemicolon();
                if (s3 !== peg$FAILED) {
                  s2 = [s2, s3];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$c0;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
              if (s1 === peg$FAILED) {
                s1 = peg$currPos;
                if (input.substr(peg$currPos, 5) === peg$c119) {
                  s2 = peg$c119;
                  peg$currPos += 5;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c120); }
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$parsesemicolon();
                  if (s3 !== peg$FAILED) {
                    s2 = [s2, s3];
                    s1 = s2;
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c0;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c0;
                }
                if (s1 === peg$FAILED) {
                  s1 = peg$currPos;
                  if (input.substr(peg$currPos, 6) === peg$c114) {
                    s2 = peg$c114;
                    peg$currPos += 6;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c115); }
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parsesemicolon();
                    if (s3 !== peg$FAILED) {
                      s2 = [s2, s3];
                      s1 = s2;
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c0;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c0;
                  }
                  if (s1 === peg$FAILED) {
                    s1 = peg$currPos;
                    s2 = peg$currPos;
                    peg$reportedPos = peg$currPos;
                    s3 = peg$c121();
                    if (s3) {
                      s3 = peg$c2;
                    } else {
                      s3 = peg$c0;
                    }
                    if (s3 !== peg$FAILED) {
                      if (input.substr(peg$currPos, 7) === peg$c122) {
                        s4 = peg$c122;
                        peg$currPos += 7;
                      } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c123); }
                      }
                      if (s4 !== peg$FAILED) {
                        peg$reportedPos = s2;
                        s3 = peg$c124();
                        s2 = s3;
                      } else {
                        peg$currPos = s2;
                        s2 = peg$c0;
                      }
                    } else {
                      peg$currPos = s2;
                      s2 = peg$c0;
                    }
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsesemicolon();
                      if (s3 !== peg$FAILED) {
                        s2 = [s2, s3];
                        s1 = s2;
                      } else {
                        peg$currPos = s1;
                        s1 = peg$c0;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c0;
                    }
                  }
                }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c125(s1);
              }
              s0 = s1;
            }
      
            return s0;
          }
      
          function peg$parseexpression_statement() {
            var s0, s1, s2;
      
            s0 = peg$currPos;
            s1 = peg$parseassignment_expression();
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsesemicolon();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c126(s1);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsedeclaration() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
      
            peg$silentFails++;
            s0 = peg$currPos;
            s1 = peg$parsefunction_prototype();
            if (s1 !== peg$FAILED) {
              s2 = peg$parsesemicolon();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c128(s1);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parselocally_specified_type();
              if (s1 !== peg$FAILED) {
                s2 = peg$parse_();
                if (s2 !== peg$FAILED) {
                  s3 = peg$parseinit_declarator_list();
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parsesemicolon();
                    if (s4 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c129(s1, s3);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                peg$reportedPos = peg$currPos;
                s1 = peg$c130();
                if (s1) {
                  s1 = peg$c2;
                } else {
                  s1 = peg$c0;
                }
                if (s1 !== peg$FAILED) {
                  if (input.substr(peg$currPos, 9) === peg$c131) {
                    s2 = peg$c131;
                    peg$currPos += 9;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c132); }
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parse_();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parseidentifier();
                      if (s4 !== peg$FAILED) {
                        s5 = [];
                        s6 = peg$currPos;
                        s7 = peg$parsecomma();
                        if (s7 !== peg$FAILED) {
                          s8 = peg$parseidentifier();
                          if (s8 !== peg$FAILED) {
                            s7 = [s7, s8];
                            s6 = s7;
                          } else {
                            peg$currPos = s6;
                            s6 = peg$c0;
                          }
                        } else {
                          peg$currPos = s6;
                          s6 = peg$c0;
                        }
                        while (s6 !== peg$FAILED) {
                          s5.push(s6);
                          s6 = peg$currPos;
                          s7 = peg$parsecomma();
                          if (s7 !== peg$FAILED) {
                            s8 = peg$parseidentifier();
                            if (s8 !== peg$FAILED) {
                              s7 = [s7, s8];
                              s6 = s7;
                            } else {
                              peg$currPos = s6;
                              s6 = peg$c0;
                            }
                          } else {
                            peg$currPos = s6;
                            s6 = peg$c0;
                          }
                        }
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parsesemicolon();
                          if (s6 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c133(s4, s5);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 9) === peg$c134) {
                    s1 = peg$c134;
                    peg$currPos += 9;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c135); }
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parse_();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parseprecision_qualifier();
                      if (s3 !== peg$FAILED) {
                        s4 = peg$parse_();
                        if (s4 !== peg$FAILED) {
                          s5 = peg$parsetype_name();
                          if (s5 !== peg$FAILED) {
                            s6 = peg$parsesemicolon();
                            if (s6 !== peg$FAILED) {
                              peg$reportedPos = s0;
                              s1 = peg$c136(s3, s5);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                }
              }
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c127); }
            }
      
            return s0;
          }
      
          function peg$parseglobal_declaration() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$parsedeclaration();
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parsefully_specified_type();
              if (s1 !== peg$FAILED) {
                s2 = peg$parse_();
                if (s2 !== peg$FAILED) {
                  s3 = peg$parseinit_declarator_list();
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parsesemicolon();
                    if (s4 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c137(s1, s3);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseattribute_type();
                if (s1 !== peg$FAILED) {
                  s2 = peg$parse_();
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parsedeclarator_list_no_array();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parsesemicolon();
                      if (s4 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c137(s1, s3);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              }
            }
      
            return s0;
          }
      
          function peg$parsefunction_prototype_parameter_list() {
            var s0, s1, s2, s3, s4, s5;
      
            if (input.substr(peg$currPos, 4) === peg$c138) {
              s0 = peg$c138;
              peg$currPos += 4;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c139); }
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseparameter_declaration();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parsecomma();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseparameter_declaration();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parsecomma();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parseparameter_declaration();
                    if (s5 !== peg$FAILED) {
                      s4 = [s4, s5];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                }
                if (s2 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c140(s1, s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            }
      
            return s0;
          }
      
          function peg$parsefunction_prototype() {
            var s0, s1, s2, s3, s4, s5, s6;
      
            s0 = peg$currPos;
            s1 = peg$parsevoid_type();
            if (s1 === peg$FAILED) {
              s1 = peg$parseprecision_type();
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseidentifier();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parseleft_paren();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsefunction_prototype_parameter_list();
                    if (s5 === peg$FAILED) {
                      s5 = peg$c24;
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parseright_paren();
                      if (s6 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c141(s1, s3, s5);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseparameter_qualifier() {
            var s0;
      
            if (input.substr(peg$currPos, 5) === peg$c142) {
              s0 = peg$c142;
              peg$currPos += 5;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c143); }
            }
            if (s0 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c144) {
                s0 = peg$c144;
                peg$currPos += 2;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c145); }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 3) === peg$c146) {
                  s0 = peg$c146;
                  peg$currPos += 3;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c147); }
                }
              }
            }
      
            return s0;
          }
      
          function peg$parseparameter_declaration() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
      
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parseconst_qualifier();
            if (s2 !== peg$FAILED) {
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                s2 = [s2, s3];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parseparameter_qualifier();
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                s4 = peg$parseprecision_qualifier();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parse_();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsetype_name();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parse_();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parseidentifier();
                      if (s6 !== peg$FAILED) {
                        s7 = peg$currPos;
                        s8 = peg$parseleft_bracket();
                        if (s8 !== peg$FAILED) {
                          s9 = peg$parseconditional_expression();
                          if (s9 !== peg$FAILED) {
                            s10 = peg$parseright_bracket();
                            if (s10 !== peg$FAILED) {
                              s8 = [s8, s9, s10];
                              s7 = s8;
                            } else {
                              peg$currPos = s7;
                              s7 = peg$c0;
                            }
                          } else {
                            peg$currPos = s7;
                            s7 = peg$c0;
                          }
                        } else {
                          peg$currPos = s7;
                          s7 = peg$c0;
                        }
                        if (s7 === peg$FAILED) {
                          s7 = peg$c24;
                        }
                        if (s7 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c148(s1, s2, s3, s4, s6, s7);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseinit_declarator_list() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$parseinit_declarator();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parsecomma();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseinit_declarator();
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parsecomma();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseinit_declarator();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c149(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsedeclarator_list() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$parsedeclarator();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parsecomma();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsedeclarator();
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parsecomma();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsedeclarator();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c149(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsedeclarator_list_no_array() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$parsedeclarator_no_array();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parsecomma();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsedeclarator_no_array();
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parsecomma();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsedeclarator_no_array();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c149(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsedeclarator_list_arrays_have_size() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$parsedeclarator_array_with_size();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parsecomma();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsedeclarator_array_with_size();
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parsecomma();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsedeclarator_array_with_size();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c149(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsedeclarator_no_array() {
            var s0, s1;
      
            s0 = peg$currPos;
            s1 = peg$parseidentifier();
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c150(s1);
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parsedeclarator_array_with_size() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parseidentifier();
            if (s1 !== peg$FAILED) {
              s2 = peg$parseleft_bracket();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseconditional_expression();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parseright_bracket();
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c151(s1, s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$parsedeclarator_no_array();
            }
      
            return s0;
          }
      
          function peg$parsedeclarator() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parseidentifier();
            if (s1 !== peg$FAILED) {
              s2 = peg$parseleft_bracket();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseright_bracket();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c152(s1);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$parsedeclarator_array_with_size();
            }
      
            return s0;
          }
      
          function peg$parseinit_declarator() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parseidentifier();
            if (s1 !== peg$FAILED) {
              s2 = peg$parseequals();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseconditional_expression();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c153(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$parsedeclarator();
            }
      
            return s0;
          }
      
          function peg$parsemember_list() {
            var s0, s1, s2, s3, s4, s5, s6;
      
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$currPos;
            s3 = peg$parselocally_specified_type();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = peg$parsedeclarator_list_arrays_have_size();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsesemicolon();
                  if (s6 !== peg$FAILED) {
                    s3 = [s3, s4, s5, s6];
                    s2 = s3;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c0;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
            if (s2 !== peg$FAILED) {
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$currPos;
                s3 = peg$parselocally_specified_type();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parse_();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsedeclarator_list_arrays_have_size();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsesemicolon();
                      if (s6 !== peg$FAILED) {
                        s3 = [s3, s4, s5, s6];
                        s2 = s3;
                      } else {
                        peg$currPos = s2;
                        s2 = peg$c0;
                      }
                    } else {
                      peg$currPos = s2;
                      s2 = peg$c0;
                    }
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c0;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              }
            } else {
              s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c154(s1);
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parsestruct_definition() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
      
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parsetype_qualifier();
            if (s2 === peg$FAILED) {
              s2 = peg$parseattribute_qualifier();
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                s2 = [s2, s3];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              if (input.substr(peg$currPos, 6) === peg$c155) {
                s2 = peg$c155;
                peg$currPos += 6;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c156); }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseidentifier();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parseleft_brace();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsemember_list();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parseright_brace();
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parsedeclarator_list();
                        if (s7 === peg$FAILED) {
                          s7 = peg$c24;
                        }
                        if (s7 !== peg$FAILED) {
                          s8 = peg$parsesemicolon();
                          if (s8 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c157(s1, s3, s5, s7);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseprecision_type() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parseprecision_qualifier();
            if (s2 !== peg$FAILED) {
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                s2 = [s2, s3];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsetype_name();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c158(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parselocally_specified_type() {
            var s0, s1, s2, s3;
      
            peg$silentFails++;
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parseconst_qualifier();
            if (s2 !== peg$FAILED) {
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                s2 = [s2, s3];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseprecision_type();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c160(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c159); }
            }
      
            return s0;
          }
      
          function peg$parseattribute_qualifier() {
            var s0, s1, s2;
      
            s0 = peg$currPos;
            peg$reportedPos = peg$currPos;
            s1 = peg$c130();
            if (s1) {
              s1 = peg$c2;
            } else {
              s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
              if (input.substr(peg$currPos, 9) === peg$c161) {
                s2 = peg$c161;
                peg$currPos += 9;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c162); }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c163();
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseattribute_type() {
            var s0, s1, s2, s3;
      
            peg$silentFails++;
            s0 = peg$currPos;
            s1 = peg$parseattribute_qualifier();
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseprecision_type();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c164(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c159); }
            }
      
            return s0;
          }
      
          function peg$parsefully_specified_type() {
            var s0, s1, s2, s3;
      
            peg$silentFails++;
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parsetype_qualifier();
            if (s2 !== peg$FAILED) {
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                s2 = [s2, s3];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseprecision_type();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c160(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c165); }
            }
      
            return s0;
          }
      
          function peg$parseprecision_qualifier() {
            var s0, s1;
      
            peg$silentFails++;
            if (input.substr(peg$currPos, 5) === peg$c167) {
              s0 = peg$c167;
              peg$currPos += 5;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c168); }
            }
            if (s0 === peg$FAILED) {
              if (input.substr(peg$currPos, 7) === peg$c169) {
                s0 = peg$c169;
                peg$currPos += 7;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c170); }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 4) === peg$c171) {
                  s0 = peg$c171;
                  peg$currPos += 4;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c172); }
                }
              }
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c166); }
            }
      
            return s0;
          }
      
          function peg$parseconst_qualifier() {
            var s0;
      
            if (input.substr(peg$currPos, 5) === peg$c173) {
              s0 = peg$c173;
              peg$currPos += 5;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c174); }
            }
      
            return s0;
          }
      
          function peg$parsetype_qualifier() {
            var s0, s1, s2, s3;
      
            peg$silentFails++;
            s0 = peg$parseconst_qualifier();
            if (s0 === peg$FAILED) {
              if (input.substr(peg$currPos, 7) === peg$c176) {
                s0 = peg$c176;
                peg$currPos += 7;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c177); }
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 9) === peg$c131) {
                  s1 = peg$c131;
                  peg$currPos += 9;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c132); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parse_();
                  if (s2 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 7) === peg$c176) {
                      s3 = peg$c176;
                      peg$currPos += 7;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c177); }
                    }
                    if (s3 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c178();
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
                if (s0 === peg$FAILED) {
                  if (input.substr(peg$currPos, 7) === peg$c179) {
                    s0 = peg$c179;
                    peg$currPos += 7;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c180); }
                  }
                }
              }
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c175); }
            }
      
            return s0;
          }
      
          function peg$parsevoid_type() {
            var s0, s1;
      
            peg$silentFails++;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 4) === peg$c138) {
              s1 = peg$c138;
              peg$currPos += 4;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c139); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c182();
            }
            s0 = s1;
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c181); }
            }
      
            return s0;
          }
      
          function peg$parsetype_name() {
            var s0, s1;
      
            peg$silentFails++;
            if (input.substr(peg$currPos, 5) === peg$c184) {
              s0 = peg$c184;
              peg$currPos += 5;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c185); }
            }
            if (s0 === peg$FAILED) {
              if (input.substr(peg$currPos, 3) === peg$c186) {
                s0 = peg$c186;
                peg$currPos += 3;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c187); }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 4) === peg$c188) {
                  s0 = peg$c188;
                  peg$currPos += 4;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c189); }
                }
                if (s0 === peg$FAILED) {
                  if (input.substr(peg$currPos, 9) === peg$c190) {
                    s0 = peg$c190;
                    peg$currPos += 9;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c191); }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 11) === peg$c192) {
                      s0 = peg$c192;
                      peg$currPos += 11;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c193); }
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$parsevector();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parsematrix();
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          s1 = peg$parseidentifier();
                          if (s1 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c194(s1);
                          }
                          s0 = s1;
                        }
                      }
                    }
                  }
                }
              }
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c183); }
            }
      
            return s0;
          }
      
          function peg$parseidentifier() {
            var s0, s1, s2, s3, s4;
      
            peg$silentFails++;
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = peg$currPos;
            s3 = peg$parsekeyword();
            if (s3 !== peg$FAILED) {
              if (peg$c196.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c197); }
              }
              if (s4 !== peg$FAILED) {
                s3 = [s3, s4];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
            peg$silentFails--;
            if (s2 === peg$FAILED) {
              s1 = peg$c2;
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
              if (peg$c62.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c63); }
              }
              if (s2 !== peg$FAILED) {
                s3 = [];
                if (peg$c64.test(input.charAt(peg$currPos))) {
                  s4 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c65); }
                }
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  if (peg$c64.test(input.charAt(peg$currPos))) {
                    s4 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c65); }
                  }
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c66(s2, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c195); }
            }
      
            return s0;
          }
      
          function peg$parsekeyword() {
            var s0, s1;
      
            peg$silentFails++;
            if (input.substr(peg$currPos, 9) === peg$c161) {
              s0 = peg$c161;
              peg$currPos += 9;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c162); }
            }
            if (s0 === peg$FAILED) {
              if (input.substr(peg$currPos, 5) === peg$c173) {
                s0 = peg$c173;
                peg$currPos += 5;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c174); }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 4) === peg$c188) {
                  s0 = peg$c188;
                  peg$currPos += 4;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c189); }
                }
                if (s0 === peg$FAILED) {
                  if (input.substr(peg$currPos, 5) === peg$c184) {
                    s0 = peg$c184;
                    peg$currPos += 5;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c185); }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 3) === peg$c186) {
                      s0 = peg$c186;
                      peg$currPos += 3;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c187); }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 5) === peg$c119) {
                        s0 = peg$c119;
                        peg$currPos += 5;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c120); }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 8) === peg$c117) {
                          s0 = peg$c117;
                          peg$currPos += 8;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c118); }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 2) === peg$c111) {
                            s0 = peg$c111;
                            peg$currPos += 2;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c112); }
                          }
                          if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 4) === peg$c93) {
                              s0 = peg$c93;
                              peg$currPos += 4;
                            } else {
                              s0 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c94); }
                            }
                            if (s0 === peg$FAILED) {
                              if (input.substr(peg$currPos, 3) === peg$c104) {
                                s0 = peg$c104;
                                peg$currPos += 3;
                              } else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c105); }
                              }
                              if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 2) === peg$c87) {
                                  s0 = peg$c87;
                                  peg$currPos += 2;
                                } else {
                                  s0 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c88); }
                                }
                                if (s0 === peg$FAILED) {
                                  if (input.substr(peg$currPos, 7) === peg$c122) {
                                    s0 = peg$c122;
                                    peg$currPos += 7;
                                  } else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c123); }
                                  }
                                  if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 6) === peg$c114) {
                                      s0 = peg$c114;
                                      peg$currPos += 6;
                                    } else {
                                      s0 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c115); }
                                    }
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$parsevector();
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$parsematrix();
                                        if (s0 === peg$FAILED) {
                                          if (input.substr(peg$currPos, 2) === peg$c144) {
                                            s0 = peg$c144;
                                            peg$currPos += 2;
                                          } else {
                                            s0 = peg$FAILED;
                                            if (peg$silentFails === 0) { peg$fail(peg$c145); }
                                          }
                                          if (s0 === peg$FAILED) {
                                            if (input.substr(peg$currPos, 3) === peg$c146) {
                                              s0 = peg$c146;
                                              peg$currPos += 3;
                                            } else {
                                              s0 = peg$FAILED;
                                              if (peg$silentFails === 0) { peg$fail(peg$c147); }
                                            }
                                            if (s0 === peg$FAILED) {
                                              if (input.substr(peg$currPos, 5) === peg$c142) {
                                                s0 = peg$c142;
                                                peg$currPos += 5;
                                              } else {
                                                s0 = peg$FAILED;
                                                if (peg$silentFails === 0) { peg$fail(peg$c143); }
                                              }
                                              if (s0 === peg$FAILED) {
                                                if (input.substr(peg$currPos, 7) === peg$c179) {
                                                  s0 = peg$c179;
                                                  peg$currPos += 7;
                                                } else {
                                                  s0 = peg$FAILED;
                                                  if (peg$silentFails === 0) { peg$fail(peg$c180); }
                                                }
                                                if (s0 === peg$FAILED) {
                                                  if (input.substr(peg$currPos, 7) === peg$c176) {
                                                    s0 = peg$c176;
                                                    peg$currPos += 7;
                                                  } else {
                                                    s0 = peg$FAILED;
                                                    if (peg$silentFails === 0) { peg$fail(peg$c177); }
                                                  }
                                                  if (s0 === peg$FAILED) {
                                                    if (input.substr(peg$currPos, 9) === peg$c190) {
                                                      s0 = peg$c190;
                                                      peg$currPos += 9;
                                                    } else {
                                                      s0 = peg$FAILED;
                                                      if (peg$silentFails === 0) { peg$fail(peg$c191); }
                                                    }
                                                    if (s0 === peg$FAILED) {
                                                      if (input.substr(peg$currPos, 11) === peg$c192) {
                                                        s0 = peg$c192;
                                                        peg$currPos += 11;
                                                      } else {
                                                        s0 = peg$FAILED;
                                                        if (peg$silentFails === 0) { peg$fail(peg$c193); }
                                                      }
                                                      if (s0 === peg$FAILED) {
                                                        if (input.substr(peg$currPos, 6) === peg$c155) {
                                                          s0 = peg$c155;
                                                          peg$currPos += 6;
                                                        } else {
                                                          s0 = peg$FAILED;
                                                          if (peg$silentFails === 0) { peg$fail(peg$c156); }
                                                        }
                                                        if (s0 === peg$FAILED) {
                                                          if (input.substr(peg$currPos, 4) === peg$c138) {
                                                            s0 = peg$c138;
                                                            peg$currPos += 4;
                                                          } else {
                                                            s0 = peg$FAILED;
                                                            if (peg$silentFails === 0) { peg$fail(peg$c139); }
                                                          }
                                                          if (s0 === peg$FAILED) {
                                                            if (input.substr(peg$currPos, 5) === peg$c107) {
                                                              s0 = peg$c107;
                                                              peg$currPos += 5;
                                                            } else {
                                                              s0 = peg$FAILED;
                                                              if (peg$silentFails === 0) { peg$fail(peg$c108); }
                                                            }
                                                            if (s0 === peg$FAILED) {
                                                              if (input.substr(peg$currPos, 5) === peg$c167) {
                                                                s0 = peg$c167;
                                                                peg$currPos += 5;
                                                              } else {
                                                                s0 = peg$FAILED;
                                                                if (peg$silentFails === 0) { peg$fail(peg$c168); }
                                                              }
                                                              if (s0 === peg$FAILED) {
                                                                if (input.substr(peg$currPos, 7) === peg$c169) {
                                                                  s0 = peg$c169;
                                                                  peg$currPos += 7;
                                                                } else {
                                                                  s0 = peg$FAILED;
                                                                  if (peg$silentFails === 0) { peg$fail(peg$c170); }
                                                                }
                                                                if (s0 === peg$FAILED) {
                                                                  if (input.substr(peg$currPos, 4) === peg$c171) {
                                                                    s0 = peg$c171;
                                                                    peg$currPos += 4;
                                                                  } else {
                                                                    s0 = peg$FAILED;
                                                                    if (peg$silentFails === 0) { peg$fail(peg$c172); }
                                                                  }
                                                                  if (s0 === peg$FAILED) {
                                                                    if (input.substr(peg$currPos, 4) === peg$c199) {
                                                                      s0 = peg$c199;
                                                                      peg$currPos += 4;
                                                                    } else {
                                                                      s0 = peg$FAILED;
                                                                      if (peg$silentFails === 0) { peg$fail(peg$c200); }
                                                                    }
                                                                    if (s0 === peg$FAILED) {
                                                                      if (input.substr(peg$currPos, 5) === peg$c201) {
                                                                        s0 = peg$c201;
                                                                        peg$currPos += 5;
                                                                      } else {
                                                                        s0 = peg$FAILED;
                                                                        if (peg$silentFails === 0) { peg$fail(peg$c202); }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c198); }
            }
      
            return s0;
          }
      
          function peg$parsevector() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$currPos;
            if (peg$c203.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c204); }
            }
            if (s2 === peg$FAILED) {
              s2 = peg$c24;
            }
            if (s2 !== peg$FAILED) {
              if (input.substr(peg$currPos, 3) === peg$c205) {
                s3 = peg$c205;
                peg$currPos += 3;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c206); }
              }
              if (s3 !== peg$FAILED) {
                if (peg$c207.test(input.charAt(peg$currPos))) {
                  s4 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c208); }
                }
                if (s4 !== peg$FAILED) {
                  s2 = [s2, s3, s4];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$c0;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c209(s1);
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parsematrix() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c210) {
              s2 = peg$c210;
              peg$currPos += 3;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c211); }
            }
            if (s2 !== peg$FAILED) {
              if (peg$c207.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c208); }
              }
              if (s3 !== peg$FAILED) {
                s2 = [s2, s3];
                s1 = s2;
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c209(s1);
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parsereserved() {
            var s0, s1, s2, s3, s4;
      
            peg$silentFails++;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parsesingle_underscore_identifier();
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parsesingle_underscore_identifier();
            }
            if (s1 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c213) {
                s2 = peg$c213;
                peg$currPos += 2;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c214); }
              }
              if (s2 !== peg$FAILED) {
                s3 = [];
                if (peg$c64.test(input.charAt(peg$currPos))) {
                  s4 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c65); }
                }
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  if (peg$c64.test(input.charAt(peg$currPos))) {
                    s4 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c65); }
                  }
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c212); }
            }
      
            return s0;
          }
      
          function peg$parsesingle_underscore_identifier() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = [];
            if (peg$c215.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c216); }
            }
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              if (peg$c215.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c216); }
              }
            }
            if (s1 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 95) {
                s2 = peg$c217;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c218); }
              }
              if (s2 !== peg$FAILED) {
                s3 = [];
                if (peg$c215.test(input.charAt(peg$currPos))) {
                  s4 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c216); }
                }
                if (s4 !== peg$FAILED) {
                  while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    if (peg$c215.test(input.charAt(peg$currPos))) {
                      s4 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c216); }
                    }
                  }
                } else {
                  s3 = peg$c0;
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseint_constant() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            if (peg$c219.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c220); }
            }
            if (s1 !== peg$FAILED) {
              s2 = [];
              if (peg$c221.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c222); }
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                if (peg$c221.test(input.charAt(peg$currPos))) {
                  s3 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c222); }
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c223(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 48) {
                s1 = peg$c224;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c225); }
              }
              if (s1 !== peg$FAILED) {
                if (peg$c226.test(input.charAt(peg$currPos))) {
                  s2 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c227); }
                }
                if (s2 !== peg$FAILED) {
                  s3 = [];
                  if (peg$c228.test(input.charAt(peg$currPos))) {
                    s4 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c229); }
                  }
                  if (s4 !== peg$FAILED) {
                    while (s4 !== peg$FAILED) {
                      s3.push(s4);
                      if (peg$c228.test(input.charAt(peg$currPos))) {
                        s4 = input.charAt(peg$currPos);
                        peg$currPos++;
                      } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c229); }
                      }
                    }
                  } else {
                    s3 = peg$c0;
                  }
                  if (s3 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c230(s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 48) {
                  s1 = peg$c224;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c225); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = [];
                  if (peg$c231.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c232); }
                  }
                  if (s3 !== peg$FAILED) {
                    while (s3 !== peg$FAILED) {
                      s2.push(s3);
                      if (peg$c231.test(input.charAt(peg$currPos))) {
                        s3 = input.charAt(peg$currPos);
                        peg$currPos++;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c232); }
                      }
                    }
                  } else {
                    s2 = peg$c0;
                  }
                  if (s2 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c233(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 48) {
                    s1 = peg$c224;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c225); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c234();
                  }
                  s0 = s1;
                }
              }
            }
      
            return s0;
          }
      
          function peg$parsefloat_constant() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = [];
            if (peg$c221.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c222); }
            }
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              if (peg$c221.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c222); }
              }
            }
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 46) {
                s3 = peg$c235;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c236); }
              }
              if (s3 !== peg$FAILED) {
                s4 = [];
                if (peg$c221.test(input.charAt(peg$currPos))) {
                  s5 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c222); }
                }
                if (s5 !== peg$FAILED) {
                  while (s5 !== peg$FAILED) {
                    s4.push(s5);
                    if (peg$c221.test(input.charAt(peg$currPos))) {
                      s5 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c222); }
                    }
                  }
                } else {
                  s4 = peg$c0;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsefloat_exponent();
                  if (s5 === peg$FAILED) {
                    s5 = peg$c24;
                  }
                  if (s5 !== peg$FAILED) {
                    s2 = [s2, s3, s4, s5];
                    s1 = s2;
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c0;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c0;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
            if (s1 === peg$FAILED) {
              s1 = peg$currPos;
              s2 = [];
              if (peg$c221.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c222); }
              }
              if (s3 !== peg$FAILED) {
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  if (peg$c221.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c222); }
                  }
                }
              } else {
                s2 = peg$c0;
              }
              if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                  s3 = peg$c235;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c236); }
                }
                if (s3 !== peg$FAILED) {
                  s4 = [];
                  if (peg$c221.test(input.charAt(peg$currPos))) {
                    s5 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c222); }
                  }
                  while (s5 !== peg$FAILED) {
                    s4.push(s5);
                    if (peg$c221.test(input.charAt(peg$currPos))) {
                      s5 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c222); }
                    }
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsefloat_exponent();
                    if (s5 === peg$FAILED) {
                      s5 = peg$c24;
                    }
                    if (s5 !== peg$FAILED) {
                      s2 = [s2, s3, s4, s5];
                      s1 = s2;
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c0;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c0;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c0;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c237(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$currPos;
              s2 = [];
              if (peg$c221.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c222); }
              }
              if (s3 !== peg$FAILED) {
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  if (peg$c221.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c222); }
                  }
                }
              } else {
                s2 = peg$c0;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsefloat_exponent();
                if (s3 !== peg$FAILED) {
                  s2 = [s2, s3];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$c0;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c0;
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c238(s1);
              }
              s0 = s1;
            }
      
            return s0;
          }
      
          function peg$parsefloat_exponent() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            if (peg$c239.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c240); }
            }
            if (s1 !== peg$FAILED) {
              if (peg$c241.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c242); }
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                s3 = [];
                if (peg$c221.test(input.charAt(peg$currPos))) {
                  s4 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c222); }
                }
                if (s4 !== peg$FAILED) {
                  while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    if (peg$c221.test(input.charAt(peg$currPos))) {
                      s4 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c222); }
                    }
                  }
                } else {
                  s3 = peg$c0;
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c243(s2, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseparen_expression() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parseleft_paren();
            if (s1 !== peg$FAILED) {
              s2 = peg$parseassignment_expression();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseright_paren();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c244(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsebool_constant() {
            var s0, s1;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 4) === peg$c199) {
              s1 = peg$c199;
              peg$currPos += 4;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c200); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 5) === peg$c201) {
                s1 = peg$c201;
                peg$currPos += 5;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c202); }
              }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c245(s1);
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parseprimary_expression() {
            var s0;
      
            s0 = peg$parsefunction_call();
            if (s0 === peg$FAILED) {
              s0 = peg$parseidentifier();
              if (s0 === peg$FAILED) {
                s0 = peg$parsefloat_constant();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseint_constant();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parsebool_constant();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseparen_expression();
                    }
                  }
                }
              }
            }
      
            return s0;
          }
      
          function peg$parseindex_accessor() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parseleft_bracket();
            if (s1 !== peg$FAILED) {
              s2 = peg$parseassignment_expression();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseright_bracket();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c246(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsefield_selector() {
            var s0, s1, s2;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 46) {
              s1 = peg$c235;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c236); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseidentifier();
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c247(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsepostfix_expression() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            s1 = peg$parseprimary_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsefield_selector();
              if (s3 === peg$FAILED) {
                s3 = peg$parseindex_accessor();
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parsefield_selector();
                if (s3 === peg$FAILED) {
                  s3 = peg$parseindex_accessor();
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c248(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsepostfix_expression_no_repeat() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$parsepostfix_expression();
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c249) {
                  s3 = peg$c249;
                  peg$currPos += 2;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c250); }
                }
                if (s3 === peg$FAILED) {
                  if (input.substr(peg$currPos, 2) === peg$c251) {
                    s3 = peg$c251;
                    peg$currPos += 2;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c252); }
                  }
                }
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s4 = [];
                  s5 = peg$parsefield_selector();
                  if (s5 === peg$FAILED) {
                    s5 = peg$parseindex_accessor();
                  }
                  while (s5 !== peg$FAILED) {
                    s4.push(s5);
                    s5 = peg$parsefield_selector();
                    if (s5 === peg$FAILED) {
                      s5 = peg$parseindex_accessor();
                    }
                  }
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c253(s1, s3, s4);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseparameter_list() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 4) === peg$c138) {
              s1 = peg$c138;
              peg$currPos += 4;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c139); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c254();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseassignment_expression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parsecomma();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseassignment_expression();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parsecomma();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parseassignment_expression();
                    if (s5 !== peg$FAILED) {
                      s4 = [s4, s5];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                }
                if (s2 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c255(s1, s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            }
      
            return s0;
          }
      
          function peg$parsefunction_call() {
            var s0, s1, s2, s3, s4;
      
            s0 = peg$currPos;
            s1 = peg$parsefunction_identifier();
            if (s1 !== peg$FAILED) {
              s2 = peg$parseleft_paren();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseparameter_list();
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parseright_paren();
                  if (s4 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c256(s1, s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsefunction_identifier() {
            var s0, s1;
      
            s0 = peg$currPos;
            s1 = peg$parseidentifier();
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c257(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$parsetype_name();
            }
      
            return s0;
          }
      
          function peg$parseunary_expression() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c249) {
              s1 = peg$c249;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c250); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c251) {
                s1 = peg$c251;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c252); }
              }
              if (s1 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 33) {
                  s1 = peg$c258;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c259); }
                }
                if (s1 === peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 126) {
                    s1 = peg$c260;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c261); }
                  }
                  if (s1 === peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 43) {
                      s1 = peg$c262;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c263); }
                    }
                    if (s1 === peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 45) {
                        s1 = peg$c264;
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c265); }
                      }
                    }
                  }
                }
              }
            }
            if (s1 === peg$FAILED) {
              s1 = peg$c24;
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$parsepostfix_expression_no_repeat();
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c266(s1, s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsemultiplicative_operator() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 42) {
              s1 = peg$c267;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c268); }
            }
            if (s1 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 47) {
                s1 = peg$c269;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c270); }
              }
              if (s1 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 37) {
                  s1 = peg$c271;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c272); }
                }
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 61) {
                s3 = peg$c33;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c34); }
              }
              peg$silentFails--;
              if (s3 === peg$FAILED) {
                s2 = peg$c2;
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c273(s1);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsemultiplicative_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parseunary_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 === peg$FAILED) {
                s4 = peg$c24;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsemultiplicative_operator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c24;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseunary_expression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsemultiplicative_operator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 === peg$FAILED) {
                      s6 = peg$c24;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parseunary_expression();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c0;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c274(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseadditive_operator() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 43) {
              s1 = peg$c262;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c263); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 43) {
                s3 = peg$c262;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c263); }
              }
              if (s3 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 61) {
                  s3 = peg$c33;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c34); }
                }
              }
              peg$silentFails--;
              if (s3 === peg$FAILED) {
                s2 = peg$c2;
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c275();
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 45) {
                s1 = peg$c264;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c265); }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                if (input.charCodeAt(peg$currPos) === 45) {
                  s3 = peg$c264;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c265); }
                }
                if (s3 === peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 61) {
                    s3 = peg$c33;
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c34); }
                  }
                }
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                  s2 = peg$c2;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
                if (s2 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c276();
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            }
      
            return s0;
          }
      
          function peg$parseadditive_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parsemultiplicative_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 === peg$FAILED) {
                s4 = peg$c24;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parseadditive_operator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c24;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parsemultiplicative_expression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseadditive_operator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 === peg$FAILED) {
                      s6 = peg$c24;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsemultiplicative_expression();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c0;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c274(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseshift_operator() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c277) {
              s1 = peg$c277;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c278); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c279) {
                s1 = peg$c279;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c280); }
              }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 61) {
                s3 = peg$c33;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c34); }
              }
              peg$silentFails--;
              if (s3 === peg$FAILED) {
                s2 = peg$c2;
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c273(s1);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseshift_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parseadditive_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 === peg$FAILED) {
                s4 = peg$c24;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parseshift_operator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c24;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseadditive_expression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseshift_operator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 === peg$FAILED) {
                      s6 = peg$c24;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parseadditive_expression();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c0;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c274(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parserelational_operator() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 60) {
              s1 = peg$c281;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c282); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 60) {
                s3 = peg$c281;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c282); }
              }
              peg$silentFails--;
              if (s3 === peg$FAILED) {
                s2 = peg$c2;
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 61) {
                  s3 = peg$c33;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c34); }
                }
                if (s3 === peg$FAILED) {
                  s3 = peg$c24;
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c283(s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 62) {
                s1 = peg$c284;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c285); }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                if (input.charCodeAt(peg$currPos) === 62) {
                  s3 = peg$c284;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c285); }
                }
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                  s2 = peg$c2;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
                if (s2 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 61) {
                    s3 = peg$c33;
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c34); }
                  }
                  if (s3 === peg$FAILED) {
                    s3 = peg$c24;
                  }
                  if (s3 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c286(s3);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            }
      
            return s0;
          }
      
          function peg$parserelational_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parseshift_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 === peg$FAILED) {
                s4 = peg$c24;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parserelational_operator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c24;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseshift_expression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parserelational_operator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 === peg$FAILED) {
                      s6 = peg$c24;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parseshift_expression();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c0;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c274(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseequality_operator() {
            var s0, s1;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c287) {
              s1 = peg$c287;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c288); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c289) {
                s1 = peg$c289;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c290); }
              }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c291(s1);
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parseequality_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parserelational_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 === peg$FAILED) {
                s4 = peg$c24;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parseequality_operator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c24;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parserelational_expression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseequality_operator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 === peg$FAILED) {
                      s6 = peg$c24;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parserelational_expression();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c0;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c274(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsebitwise_and_operator() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 38) {
              s1 = peg$c292;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c293); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 61) {
                s3 = peg$c33;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c34); }
              }
              if (s3 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 38) {
                  s3 = peg$c292;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c293); }
                }
              }
              peg$silentFails--;
              if (s3 === peg$FAILED) {
                s2 = peg$c2;
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c294();
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsebitwise_and_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parseequality_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 === peg$FAILED) {
                s4 = peg$c24;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsebitwise_and_operator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c24;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parseequality_expression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsebitwise_and_operator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 === peg$FAILED) {
                      s6 = peg$c24;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parseequality_expression();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c0;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c274(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsebitwise_xor_operator() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 94) {
              s1 = peg$c295;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c296); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 61) {
                s3 = peg$c33;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c34); }
              }
              if (s3 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 94) {
                  s3 = peg$c295;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c296); }
                }
              }
              peg$silentFails--;
              if (s3 === peg$FAILED) {
                s2 = peg$c2;
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c297();
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsebitwise_xor_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parsebitwise_and_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 === peg$FAILED) {
                s4 = peg$c24;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsebitwise_xor_operator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c24;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parsebitwise_and_expression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsebitwise_xor_operator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 === peg$FAILED) {
                      s6 = peg$c24;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsebitwise_and_expression();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c0;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c274(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsebitwise_or_operator() {
            var s0, s1, s2, s3;
      
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 124) {
              s1 = peg$c298;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c299); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 61) {
                s3 = peg$c33;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c34); }
              }
              if (s3 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 124) {
                  s3 = peg$c298;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c299); }
                }
              }
              peg$silentFails--;
              if (s3 === peg$FAILED) {
                s2 = peg$c2;
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c300();
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parsebitwise_or_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parsebitwise_xor_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 === peg$FAILED) {
                s4 = peg$c24;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parsebitwise_or_operator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c24;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parsebitwise_xor_expression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsebitwise_or_operator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 === peg$FAILED) {
                      s6 = peg$c24;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsebitwise_xor_expression();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c0;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c274(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parselogical_and_operator() {
            var s0, s1;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c301) {
              s1 = peg$c301;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c302); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c303();
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parselogical_and_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parsebitwise_or_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 === peg$FAILED) {
                s4 = peg$c24;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parselogical_and_operator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c24;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parsebitwise_or_expression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parselogical_and_operator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 === peg$FAILED) {
                      s6 = peg$c24;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parsebitwise_or_expression();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c0;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c274(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parselogical_xor_operator() {
            var s0, s1;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c304) {
              s1 = peg$c304;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c305); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c306();
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parselogical_xor_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parselogical_and_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 === peg$FAILED) {
                s4 = peg$c24;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parselogical_xor_operator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c24;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parselogical_and_expression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parselogical_xor_operator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 === peg$FAILED) {
                      s6 = peg$c24;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parselogical_and_expression();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c0;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c274(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parselogical_or_operator() {
            var s0, s1;
      
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c307) {
              s1 = peg$c307;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c308); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c309();
            }
            s0 = s1;
      
            return s0;
          }
      
          function peg$parselogical_or_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parselogical_xor_expression();
            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$currPos;
              s4 = peg$parse_();
              if (s4 === peg$FAILED) {
                s4 = peg$c24;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parselogical_or_operator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 === peg$FAILED) {
                    s6 = peg$c24;
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parselogical_xor_expression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$currPos;
                s4 = peg$parse_();
                if (s4 === peg$FAILED) {
                  s4 = peg$c24;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parselogical_or_operator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 === peg$FAILED) {
                      s6 = peg$c24;
                    }
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parselogical_xor_expression();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c0;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c0;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c0;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c274(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseconditional_expression() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
      
            s0 = peg$currPos;
            s1 = peg$parselogical_or_expression();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parse_();
              if (s3 === peg$FAILED) {
                s3 = peg$c24;
              }
              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 63) {
                  s4 = peg$c310;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c311); }
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parse_();
                  if (s5 === peg$FAILED) {
                    s5 = peg$c24;
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseassignment_expression();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parse_();
                      if (s7 === peg$FAILED) {
                        s7 = peg$c24;
                      }
                      if (s7 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 58) {
                          s8 = peg$c312;
                          peg$currPos++;
                        } else {
                          s8 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c313); }
                        }
                        if (s8 !== peg$FAILED) {
                          s9 = peg$parse_();
                          if (s9 === peg$FAILED) {
                            s9 = peg$c24;
                          }
                          if (s9 !== peg$FAILED) {
                            s10 = peg$parseassignment_expression();
                            if (s10 !== peg$FAILED) {
                              s3 = [s3, s4, s5, s6, s7, s8, s9, s10];
                              s2 = s3;
                            } else {
                              peg$currPos = s2;
                              s2 = peg$c0;
                            }
                          } else {
                            peg$currPos = s2;
                            s2 = peg$c0;
                          }
                        } else {
                          peg$currPos = s2;
                          s2 = peg$c0;
                        }
                      } else {
                        peg$currPos = s2;
                        s2 = peg$c0;
                      }
                    } else {
                      peg$currPos = s2;
                      s2 = peg$c0;
                    }
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c0;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c0;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c314(s1, s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
      
            return s0;
          }
      
          function peg$parseassignment_expression() {
            var s0, s1, s2, s3, s4, s5;
      
            s0 = peg$currPos;
            s1 = peg$parseconditional_expression();
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 === peg$FAILED) {
                s2 = peg$c24;
              }
              if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 61) {
                  s3 = peg$c33;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c34); }
                }
                if (s3 === peg$FAILED) {
                  if (input.substr(peg$currPos, 2) === peg$c315) {
                    s3 = peg$c315;
                    peg$currPos += 2;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c316); }
                  }
                  if (s3 === peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c317) {
                      s3 = peg$c317;
                      peg$currPos += 2;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c318); }
                    }
                    if (s3 === peg$FAILED) {
                      if (input.substr(peg$currPos, 2) === peg$c319) {
                        s3 = peg$c319;
                        peg$currPos += 2;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c320); }
                      }
                      if (s3 === peg$FAILED) {
                        if (input.substr(peg$currPos, 2) === peg$c321) {
                          s3 = peg$c321;
                          peg$currPos += 2;
                        } else {
                          s3 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c322); }
                        }
                        if (s3 === peg$FAILED) {
                          if (input.substr(peg$currPos, 2) === peg$c323) {
                            s3 = peg$c323;
                            peg$currPos += 2;
                          } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c324); }
                          }
                          if (s3 === peg$FAILED) {
                            if (input.substr(peg$currPos, 3) === peg$c325) {
                              s3 = peg$c325;
                              peg$currPos += 3;
                            } else {
                              s3 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c326); }
                            }
                            if (s3 === peg$FAILED) {
                              if (input.substr(peg$currPos, 3) === peg$c327) {
                                s3 = peg$c327;
                                peg$currPos += 3;
                              } else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c328); }
                              }
                              if (s3 === peg$FAILED) {
                                if (input.substr(peg$currPos, 2) === peg$c329) {
                                  s3 = peg$c329;
                                  peg$currPos += 2;
                                } else {
                                  s3 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c330); }
                                }
                                if (s3 === peg$FAILED) {
                                  if (input.substr(peg$currPos, 2) === peg$c331) {
                                    s3 = peg$c331;
                                    peg$currPos += 2;
                                  } else {
                                    s3 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c332); }
                                  }
                                  if (s3 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 2) === peg$c333) {
                                      s3 = peg$c333;
                                      peg$currPos += 2;
                                    } else {
                                      s3 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c334); }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parse_();
                  if (s4 === peg$FAILED) {
                    s4 = peg$c24;
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parseassignment_expression();
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c335(s1, s3, s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$parseconditional_expression();
            }
      
            return s0;
          }
      
          function peg$parsecondition() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
      
            s0 = peg$currPos;
            s1 = peg$parselocally_specified_type();
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseidentifier();
                if (s3 !== peg$FAILED) {
                  s4 = peg$parse_();
                  if (s4 === peg$FAILED) {
                    s4 = peg$c24;
                  }
                  if (s4 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 61) {
                      s5 = peg$c33;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c34); }
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parse_();
                      if (s6 === peg$FAILED) {
                        s6 = peg$c24;
                      }
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parseassignment_expression();
                        if (s7 !== peg$FAILED) {
                          s1 = [s1, s2, s3, s4, s5, s6, s7];
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$parseassignment_expression();
            }
      
            return s0;
          }
      
      
            // Map containing the names of structs defined in the shader mapped to "true".
            var typeNames = { };
      
            // Identifer for each node.
            var next_id = 0;
      
            // The type of shader being parsed.  This sould be set before parsing begins.
            // This allows us to reject invalid constructs such as attribute declaration
            // in a fragment shader or discard ina vertex shader.
            var shaderType = "vs";
      
            function pos() {
                return {
                line: line(),
                column: column(),
                offset: offset(),
                span: text().length
              };
            }
      
            var ASTNode = require("./ast");
      
            /** @constructor */
            function node(extraProperties, position) {
              return new ASTNode(extraProperties.type, pos(), extraProperties);
            };
      
            // Helper function to daisy chain together a series of binary operations.
            function daisy_chain(head, tail) {
              var result = head;
              for (var i = 0; i < tail.length; i++) {
                result = new node({
                  type: "binary",
                  operator: tail[i][1],
                  left: result,
                  right: tail[i][3]
                });
              }
              return result;
            };
      
            // Generates AST Nodes for a preprocessor branch.
            function preprocessor_branch(if_directive,
                                         elif_directives,
                                         else_directive) {
              var elseList = elif_directives;
              if (else_directive) {
                elseList = elseList.concat([else_directive]);
              }
              var result = if_directive[0];
              result.guarded_statements = if_directive[1].statements;
              var current_branch = result;
              for (var i = 0; i < elseList.length; i++) {
                current_branch.elseBody = elseList[i][0];
                current_branch.elseBody.guarded_statements =
                  elseList[i][1].statements;
                current_branch = current_branch.elseBody;
              }
              return result;
            };
      
      
          peg$result = peg$startRuleFunction();
      
          if (peg$result !== peg$FAILED && peg$currPos === input.length) {
            return peg$result;
          } else {
            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
              peg$fail({ type: "end", description: "end of input" });
            }
      
            throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
          }
        }
      
        return {
          SyntaxError: SyntaxError,
          parse:       parse
        };
      })();
        });

  modules.define("compiler/shader", function(module, require) {
    var GLSL = {};
    GLSL.Error         = require("../error");
    GLSL.Object        = require("../events").Object;
    GLSL.ASTNode       = require("./ast");
    GLSL.ASTVisitor    = require("./visitor");
    GLSL.Parser        = require("./parser");
    GLSL.Typechecker   = require("./typecheck");
    GLSL.CodeGenerator = require("./codegen");
    
    GLSL.Shader = function(text, type)
    {
        GLSL.Object.call(this);
    
        this.sourceText = text;
        try {
            this.ast = GLSL.Parser.parse(text);
        } catch (e) {
            if (type === GLSL.Shader.Type.Vertex)
                e.type = GLSL.Error.Type.VertexShaderParsing;
            if (type === GLSL.Shader.Type.Fragment)
                e.type = GLSL.Error.Type.FragmentShaderParsing;
    
            throw e;
        }
    
        this.type = type;
    
        this._typecheckResult = null;
        this._executable = null;
    
        this._shouldEmitDebuggerStatement = false;
    
        console.assert(type === GLSL.Shader.Type.Vertex || type === GLSL.Shader.Type.Fragment);
    
        this._uniforms = [];
        this._varyings = [];
        this._attributes = [];
    
        this._errors = [];
    
        this._extractVariables();
    };
    
    GLSL.Object.addConstructorFunctions(GLSL.Shader);
    
    GLSL.Shader.Event = {
        ExecutableChanged: "shader-executable-changed"
    };
    
    GLSL.Shader.Type = {
        Vertex: "shader-type-vertex",
        Fragment: "shader-type-fragment"
    };
    
    GLSL.Shader.prototype = {
        constructor: GLSL.Shader,
        __proto__: GLSL.Object.prototype,
    
        // Public
    
        get uniforms() {
            return this._uniforms.slice();
        },
    
        get attributes() {
            return this._attributes.slice();
        },
    
        get varyings() {
            return this._varyings.slice();
        },
    
        get executable() {
            if (!this._executable)
                this._executable = new GLSL.CodeGenerator(this).translateShader();
    
            return this._executable;
        },
    
        get shouldEmitDebuggerStatement()
        {
            return this._shouldEmitDebuggerStatement;
        },
    
        set shouldEmitDebuggerStatement(value)
        {
            if (this._shouldEmitDebuggerStatement === value)
                return;
    
            this._shouldEmitDebuggerStatement = value;
            this._clearExecutable();
        },
    
        typecheck: function()
        {
            if (this._typecheckResult !== null)
                return this._typecheckResult;
    
            this._typecheckResult = new GLSL.Typechecker(this).typecheck();
            return this._typecheckResult;
        },
    
        // Private
    
        _extractVariables: function()
        {
            var extractor = new VariableExtractor();
            extractor.extract(this);
    
            if (extractor.errors.length) {
                this._errors = this._errors.concat(extractor.errors);
                for (var i = 0; i < this._errors.length; ++i)
                    console.error("Error extracting variables: " + JSON.stringify(this._errors[i]));
    
                throw new Error(this._errors[0].message);
            }
    
            this._uniforms = this._uniforms.concat(extractor.uniforms);
            this._attributes = this._attributes.concat(extractor.attributes);
            this._varyings = this._varyings.concat(extractor.varyings);
        },
    
        _clearExecutable: function()
        {
            this._executable = null;
            this.dispatchEventToListeners(GLSL.Shader.Event.ExecutableChanged);
        }
    };
    
    VariableExtractor = function() {
        GLSL.ASTVisitor.call(this, VariableExtractor.Functions);
    
        this.uniforms = [];
        this.attributes = [];
        this.varyings = [];
        this.errors = [];
    };
    
    VariableExtractor.prototype = {
        __proto__: GLSL.ASTVisitor.prototype,
        constructor: VariableExtractor,
    
        extract: function(shader)
        {
            this.shader = shader;
            this.visitNode(shader.ast);
    
            // GLSL ES 1.0, Section 7.1
            if (this.shader.type === GLSL.Shader.Type.Vertex) {
                this.varyings.push({
                    name: "gl_Position",
                    type: "vec4",
                    qualifier: "varying",
                    usage: "out",
                    builtin: true
                });
    
                this.varyings.push({
                    name: "gl_PointSize",
                    type: "float",
                    qualifier: "varying",
                    usage: "out",
                    builtin: true
                });
            }
    
            // GLSL ES 1.0, Section 7.2
            if (this.shader.type === GLSL.Shader.Type.Fragment) {
                this.varyings.push({
                    name: "gl_FragCoord",
                    type: "vec4",
                    qualifier: "varying",
                    usage: "in",
                    builtin: true,
                });
    
                this.varyings.push({
                    name: "gl_FrontFacing",
                    type: "bool",
                    qualifier: "varying",
                    usage: "in",
                    builtin: true,
                });
    
                this.varyings.push({
                    name: "gl_PointCoord",
                    type: "vec2",
                    qualifier: "varying",
                    usage: "in",
                    builtin: true,
                });
    
                this.varyings.push({
                    name: "gl_FragColor",
                    type: "vec4",
                    qualifier: "varying",
                    usage: "out",
                    builtin: true,
                });
    
                this.varyings.push({
                    name: "gl_FragData",
                    type: "vec4[]",
                    qualifier: "varying",
                    usage: "out",
                    builtin: true,
                });
            }
    
            this.shader = null;
        },
    
        defaultVisitor: function(node)
        {
            // Do nothing.
        }
    };
    
    VariableExtractor.Functions = {};
    
    VariableExtractor.Functions[GLSL.ASTNode.Types.Program] = function(node)
    {
        this.visitList(node.statements);
    }
    
    VariableExtractor.Functions[GLSL.ASTNode.Types.DeclaratorItem] = function(node)
    {
        return this.visitNode(node.name);
    }
    
    VariableExtractor.Functions[GLSL.ASTNode.Types.Identifier] = function(node)
    {
        return node.name;
    }
    
    VariableExtractor.Functions[GLSL.ASTNode.Types.Declarator] = function(node)
    {
        var typeAttribute = node.typeAttribute;
        var itemNames = this.visitList(node.declarators);
    
        if (this.shader.type === GLSL.Shader.Type.Fragment && typeAttribute.qualifier === "attribute") {
            this.errors.push({node: node, message: "'attribute' variable not allowed in fragment shader."});
            return;
        }
        var list = null;
        if (typeAttribute.qualifier === "varying") list = this.varyings;
        if (typeAttribute.qualifier === "uniform") list = this.uniforms;
        if (typeAttribute.qualifier === "attribute") list = this.attributes;
    
        var isInputVariable = true;
        if (this.shader.type === GLSL.Shader.Type.Vertex && typeAttribute.qualifier === "varying")
            isInputVariable = false;
        if (this.shader.type === GLSL.Shader.Type.Fragment && typeAttribute.name == "gl_FragColor")
            isInputVariable = false;
    
        for (var i = 0; i < itemNames.length; ++i) {
            list.push({
                type: typeAttribute.name,
                name: itemNames[i],
                qualifier: typeAttribute.qualifier,
                usage: isInputVariable ? "in" : "out"
            })
        }
    }
    
    module.exports = GLSL.Shader;
  });

  modules.define("compiler/program", function(module, require) {
    // This is the GLSL reference passed to translated shader programs.
    // It should only require access to the Runtime library.
    var GLSL_RT = {};
    GLSL_RT.Runtime  = require("../runtime");
    
    var GLSL = {}; // Internal GLSL handle.
    GLSL.Shader      = require("./shader");
    GLSL.Typechecker = require("./typecheck");
    GLSL.Error       = require("../error");
    GLSL.Object      = require("../events").Object;
    GLSL.Builtins    = require("../runtime/builtins");
    GLSL.Environment = require("../runtime/environment");
    
    
    GLSL.Program = function() {
        GLSL.Object.call(this);
    
        this.vertexShader = null;
        this.fragmentShader = null;
    
        this._linkerResult = null;
        this._programCode = null;
    }
    
    GLSL.Program.Event = {
        ShaderChanged: "program-shader-changed",
        Error: "program-error"
    };
    
    GLSL.Program.prototype = {
        constructor: GLSL.Program,
        __proto__: GLSL.Object.prototype,
    
        // Public
    
        shaderWithType: function(type)
        {
            if (type === GLSL.Shader.Type.Vertex)
                return this.vertexShader;
    
            if (type === GLSL.Shader.Type.Fragment)
                return this.fragmentShader;
    
            console.error("Unknown shader type requested: ", type);
        },
    
        // This will replace the existing vertex or fragment shader with a new shader.
        updateShaderWithType: function(shaderType, text)
        {
            this._linkerResult = false;
            this._programCode = null;
    
            try {
                var oldShader = this.shaderWithType(shaderType);
                var newShader = new GLSL.Shader(text, shaderType);
            } catch (e) {
                var errorType = null;
                if (shaderType === GLSL.Shader.Type.Vertex)
                    errorType = GLSL.Error.Type.VertexShaderParsing;
                if (shaderType === GLSL.Shader.Type.Fragment)
                    errorType = GLSL.Error.Type.FragmentShaderParsing;
    
                this.dispatchEventToListeners(GLSL.Program.Event.Error, {type: errorType, message: e.message});
                return;
            }
            if (shaderType === GLSL.Shader.Type.Fragment)
                this.fragmentShader = newShader;
            else if (shaderType === GLSL.Shader.Type.Vertex)
                this.vertexShader = newShader;
    
            this.dispatchEventToListeners(GLSL.Program.Event.ShaderChanged, {oldShader: oldShader, newShader: newShader});
        },
    
        // Run the combined shader program (vertex shader + rasterization + fragment shader).
        renderToBuffer: function(env, buffer)
        {
            if (!this.vertexShader)
                throw new Error("Couldn't run shader program: no vertex shader specified.");
    
            if (!this.vertexShader.typecheck())
                throw new Error("Couldn't run shader program: typechecking failed for vertex shader program.");
    
            if (!this.fragmentShader)
                throw new Error("Couldn't run shader program: no fragment shader specified.");
    
            if (!this.fragmentShader.typecheck())
                throw new Error("Couldn't run shader program: typechecking failed for fragment shader program.");
    
            if (!this._linkerResult)
                this._linkerResult = this._linkShaders();
    
            if (!this._linkerResult)
                throw new Error("Couldn't run shader program: linking failed.");
    
            if (!env.validateForShader(this.vertexShader))
                throw new Error("Couldn't run shader program: vertex shader environment validation failed.");
    
            if (!env.validateForShader(this.fragmentShader))
                throw new Error("Couldn't run shader program: vertex shader environment validation failed.");
    
            // TODO: these should be glued together with a "program" executable, which
            // handles rasterization etc.
            // TODO: Maybe we want a different entry point to run only one shader, or provide a dummy.
    
            try {
                env.enterRunScope();
                for (var y = 0; y < buffer.height; ++y) {
                    env.get('gl_FragCoord').set('y', y);
                    for (var x = 0; x < buffer.width; ++x) {
                        env.get('gl_FragCoord').set('x', x);
                        this.fragmentShader.executable.code.call(null, GLSL_RT, env);
                        var color = env.get('gl_FragColor');
                        color = GLSL.Builtins.clamp(color, 0.0, 1.0);
                        buffer.data[(buffer.width * y + x) * 4 + 0] = color.d[0] * 255.0;
                        buffer.data[(buffer.width * y + x) * 4 + 1] = color.d[1] * 255.0;
                        buffer.data[(buffer.width * y + x) * 4 + 2] = color.d[2] * 255.0;
                        buffer.data[(buffer.width * y + x) * 4 + 3] = color.d[3] * 255.0;
                    }
                }
                env.exitRunScope();
            } catch (e) {
                env.exitRunScope();
            }
        },
    
        runShaderWithType: function(shaderType, env)
        {
            var shader = this.shaderWithType(shaderType);
            if (!shader)
                return;
    
            this._runSingleShader(shader, env);
        },
    
        // Run both vertex and fragment shaders in isolation, if they exist.
        // Do not connect them with interpolated varying variables.
        runShaders: function(env)
        {
            if (!this.vertexShader && !this.fragmentShader)
                return;
    
            // TODO: this doesn't actually enforce isolation, it just makes it more likely.
            // We assume that fragment shader will try to read the output of the vertex shader.
            if (this.fragmentShader)
                this._runSingleShader(this.fragmentShader, env);
    
            if (this.vertexShader)
                this._runSingleShader(this.vertexShader, env);
        },
    
        // Private
    
        _runSingleShader: function(shader, env)
        {
            console.assert(shader instanceof GLSL.Shader, shader);
            console.assert(env instanceof GLSL.Environment, env);
    
            if (!shader)
                throw new Error("Couldn't run single shader: the shader was empty.");
    
            if (!shader.typecheck())
                throw new Error("Couldn't run single shader: typechecking failed.");
    
            if (!env.validateForShader(shader))
                throw new Error("Couldn't run single shader: environment validation failed.");
    
            if (shader.executable.error) {
                var errorType = (shader.type === GLSL.Shader.Type.Vertex) ? GLSL.Error.Type.VertexShaderTranslation : GLSL.Error.Type.FragmentShaderTranslation;
                var data = {type: errorType, message: shader.executable.error};
                this.dispatchEventToListeners(GLSL.Program.Event.Error, data);
                return;
            }
    
            env.enterRunScope();
    
            try {
                shader.executable.code.call(null, GLSL_RT, env);
            } catch (e) {
                var errorType = (shader.type === GLSL.Shader.Type.Vertex) ? GLSL.Error.Type.VertexShaderExecution : GLSL.Error.Type.FragmentShaderExecution;
                env.exitRunScope();
                this.dispatchEventToListeners(GLSL.Program.Event.Error, {type: errorType, message: e.message});
                return;
            }
    
            env.exitRunScope();
        },
    
        _linkShaders: function()
        {
            // TODO: check that inputs and outputs match between vertex and fragment shader
    
            return true;
        }
    };
    
    module.exports = GLSL.Program;
  });

  modules.define("glsl", function(module, require) {
    /* Copyright (c) 2014, Brian Burg.
     * All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are met:
     *
     * 1. Redistributions of source code must retain the above copyright notice, this
     *    list of conditions and the following disclaimer.
     * 2. Redistributions in binary form must reproduce the above copyright notice,
     *    this list of conditions and the following disclaimer in the documentation
     *    and/or other materials provided with the distribution.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
     * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
     * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
     * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
     * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
     * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
     * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
     * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
     * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */
    
    var GLSL = {
        VERSION: "0.1.0",
    
        Parser: require("./compiler/parser"),
        PrettyPrinter: require("./compiler/pretty"),
        Shader: require("./compiler/shader"),
        Program: require("./compiler/program"),
        Runtime: require("./runtime"),
        Environment: require("./runtime/environment"),
        Object: require("./events").Object,
        Event: require("./events").Event,
        Error: require("./error")
    };
    
    module.exports = GLSL;
  });

  return modules["glsl"]
})();
