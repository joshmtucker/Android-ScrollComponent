require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"AndroidScrollComponent":[function(require,module,exports){
var $,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = {
  bounds: {
    topBound: {
      x: 0,
      y: 0,
      height: 400,
      d: []
    },
    bottomBound: {
      x: 0,
      height: 400
    }
  }
};

exports.AndroidScrollComponent = (function(superClass) {
  extend(AndroidScrollComponent, superClass);

  function AndroidScrollComponent(options) {
    if (options == null) {
      options = {};
    }
    this._updateSVG = bind(this._updateSVG, this);
    this._createSVG = bind(this._createSVG, this);
    this._createBound = bind(this._createBound, this);
    this._setBounds = bind(this._setBounds, this);
    this._updateOverscrollEndValue = bind(this._updateOverscrollEndValue, this);
    this._overscrollY = bind(this._overscrollY, this);
    this._touchEnd = bind(this._touchEnd, this);
    this._touchMove = bind(this._touchMove, this);
    this._touchStart = bind(this._touchStart, this);
    if (options.overscrollGlow == null) {
      options.overscrollGlow = true;
    }
    if (options.edgeEffect == null) {
      options.edgeEffect = true;
    }
    if (options.fill == null) {
      options.fill = {
        r: 0,
        g: 0,
        b: 0,
        a: .24
      };
    }
    AndroidScrollComponent.__super__.constructor.call(this, options);
    this.content.draggable.overdrag = false;
    this.content.draggable.bounce = false;
    this.bounds = [];
    this._setBounds();
    this.overscrollEndValue = 0;
    this.overscrollEnd = new Animation({
      layer: this,
      properties: {
        overscrollEndValue: 1
      },
      curve: "beizer-curve(0.0, 0.0, 0.2, 1)",
      time: .300
    });
    this.on(Events.TouchStart, this._touchStart);
    this.on(Events.TouchMove, this._touchMove);
    this.on(Events.TouchEnd, this._touchEnd);
    document.addEventListener("touchend", this._touchEnd);
  }

  AndroidScrollComponent.prototype._touchStart = function(e) {
    this.touched = true;
    this.overscrollEnd.stop();
    Framer.Loop.off("update", this._updateOverscrollEndValue);
    this.overscrollEndValue = 0;
    if (Utils.isMobile()) {
      return this.touch = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      };
    } else {
      return this.touch = {
        x: e.offsetX,
        y: e.offsetY
      };
    }
  };

  AndroidScrollComponent.prototype._touchMove = function(e) {
    if (this.touched) {
      if (this.scrollVertical && this.overscrollGlow === true) {
        return this._overscrollY(e);
      }
    }
  };

  AndroidScrollComponent.prototype._touchEnd = function(e) {
    var b, j, len, ref;
    this.touched = false;
    ref = this.bounds;
    for (j = 0, len = ref.length; j < len; j++) {
      b = ref[j];
      if (!(b.isOverscrolled === true)) {
        continue;
      }
      b.endY = b.deltaY;
      b.endSideY = b.deltaSideY;
      b.endAlpha = b.deltaAlpha;
    }
    this.overscrollEnd.start();
    this.overscrollEnd.onAnimationEnd(function() {
      return Framer.Loop.off("update", this.options.layer._updateOverscrollEndValue);
    });
    return Framer.Loop.on("update", this._updateOverscrollEndValue);
  };

  AndroidScrollComponent.prototype._overscrollY = function(e) {
    var b, bottom, d, eventX, eventY, top;
    top = this.bounds[0];
    bottom = this.bounds[0];
    eventX = Utils.isMobile() ? e.touches[0].pageX : e.offsetX;
    eventY = Utils.isMobile() ? e.touches[0].pageY : e.offsetY;
    if (this.scrollY === 0) {
      b = this.bounds[0];
      b.isOverscrolled = true;
      d = b.d;
      d[5] = b.deltaY = Utils.modulate(eventY - this.touch.y, [0, b.height], [0, b.height], true);
      d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [0, b.height], [0, b.height * .20], true);
      d[2] = b.deltaLeftSideX = Utils.modulate(eventX, [0, b.width], [-(b.width / 4), 0], true);
      d[6] = b.deltaRightSideX = Utils.modulate(eventX, [0, b.width], [b.width, b.width + (b.width / 4)], true);
      b.deltaAlpha = Utils.modulate(b.deltaY, [0, b.height], [0, this.fill.a], true);
      return this._updateSVG(b, d, b.deltaAlpha);
    } else if (this.scrollY === Math.floor(this.content.height - this.height)) {
      b = this.bounds[1];
      b.isOverscrolled = true;
      d = b.d;
      d[5] = b.deltaY = Utils.modulate(this.touch.y - eventY, [b.height, 0], [0, b.height], true);
      d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [b.height, 0], [b.height, b.height - (b.height * .20)], true);
      d[2] = b.deltaLeftSideX = Utils.modulate(eventX, [0, b.width], [-(b.width / 4), 0], true);
      d[6] = b.deltaRightSideX = Utils.modulate(eventX, [0, b.width], [b.width, b.width + (b.width / 4)], true);
      b.deltaAlpha = Utils.modulate(b.deltaY, [b.height, 0], [0, this.fill.a], true);
      return this._updateSVG(b, d, b.deltaAlpha);
    } else {
      top.isOverscrolled = false;
      return bottom.isOverscrolled = false;
    }
  };

  AndroidScrollComponent.prototype._updateOverscrollEndValue = function() {
    var b, d, j, len, options, ref, results;
    ref = this.bounds;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      b = ref[j];
      if (!(b.isOverscrolled === true)) {
        continue;
      }
      options = (function() {
        switch (false) {
          case b.name !== "topBound":
            d = b.d;
            d[5] = b.deltaY = Utils.modulate(this.overscrollEndValue, [0, 1], [b.endY, 0], true);
            d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [b.endY, 0], [b.endSideY, 0], true);
            return b.deltaAlpha = Utils.modulate(b.deltaY, [b.endY, 0], [b.endAlpha, 0], true);
          case b.name !== "bottomBound":
            d = b.d;
            d[5] = b.deltaY = Utils.modulate(this.overscrollEndValue, [0, 1], [b.endY, b.height], true);
            d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [b.endY, b.height], [b.endSideY, b.height], true);
            return b.deltaAlpha = Utils.modulate(b.deltaY, [b.endY, b.height], [b.endAlpha, 0], true);
        }
      }).call(this);
      results.push(this._updateSVG(b, d, b.deltaAlpha));
    }
    return results;
  };

  AndroidScrollComponent.prototype._setBounds = function() {
    var bound, i, name, options, ref, results;
    ref = $.bounds;
    results = [];
    for (name in ref) {
      bound = ref[name];
      i = _.keys($.bounds).indexOf("" + name);
      options = (function() {
        switch (false) {
          case i !== 0:
            bound.width = this.width;
            return bound.d = [0, 0, 0, 0, bound.width / 2, 0, bound.width, 0, bound.width, 0];
          case i !== 1:
            bound.y = this.height - bound.height;
            bound.width = this.width;
            return bound.d = [0, bound.height, 0, bound.height, bound.width / 2, bound.height, bound.width, bound.height, bound.width, bound.height];
        }
      }).call(this);
      results.push(this._createBound(name, bound));
    }
    return results;
  };

  AndroidScrollComponent.prototype._createBound = function(name, bound) {
    var b;
    b = new Layer({
      x: bound.x,
      y: bound.y,
      width: bound.width,
      height: bound.height,
      name: name,
      backgroundColor: "",
      parent: this
    });
    b.d = bound.d;
    b.isOverscrolled = false;
    this.bounds.push(b);
    return this._createSVG(b);
  };

  AndroidScrollComponent.prototype._createSVG = function(bound) {
    bound.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    bound.svg.setAttribute("width", bound.width);
    bound.svg.setAttribute("height", bound.height);
    bound.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    bound.svg.appendChild(bound.path);
    bound._element.appendChild(bound.svg);
    return this._updateSVG(bound, bound.d, this.fill.a);
  };

  AndroidScrollComponent.prototype._updateSVG = function(bound, d, alpha) {
    bound.path.setAttribute("d", "M" + d[0] + "," + d[1] + " L" + d[2] + ", " + d[3] + " Q" + d[4] + "," + d[5] + " " + d[6] + "," + d[7] + " L" + d[8] + ", " + d[9]);
    return bound.path.setAttribute("fill", "rgba(" + this.fill.r + ", " + this.fill.g + ", " + this.fill.b + ", " + alpha + ")");
  };

  AndroidScrollComponent.define("fill", {
    get: function() {
      return this._fill;
    },
    set: function(value) {
      return this._fill = value;
    }
  });

  AndroidScrollComponent.define("touched", {
    get: function() {
      return this._touched;
    },
    set: function(value) {
      return this._touched = value;
    }
  });

  AndroidScrollComponent.define("touch", {
    get: function() {
      return this._touch;
    },
    set: function(value) {
      return this._touch = value;
    }
  });

  AndroidScrollComponent.define("overscrollGlow", {
    get: function() {
      return this._overscrollGlow;
    },
    set: function(value) {
      return this._overscrollGlow = value;
    }
  });

  AndroidScrollComponent.define("overscrollEndValue", {
    get: function() {
      return this._overscrollEndValue;
    },
    set: function(value) {
      return this._overscrollEndValue = value;
    }
  });

  return AndroidScrollComponent;

})(ScrollComponent);


},{}],"AndroidScrollComponent":[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var $,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = {
  bounds: {
    topBound: {
      x: 0,
      y: 0,
      height: 400,
      d: []
    },
    bottomBound: {
      x: 0,
      height: 400
    }
  }
};

exports.AndroidScrollComponent = (function(superClass) {
  extend(AndroidScrollComponent, superClass);

  function AndroidScrollComponent(options) {
    if (options == null) {
      options = {};
    }
    this._updateSVG = bind(this._updateSVG, this);
    this._createSVG = bind(this._createSVG, this);
    this._createBound = bind(this._createBound, this);
    this._setBounds = bind(this._setBounds, this);
    this._updateOverscrollEndValue = bind(this._updateOverscrollEndValue, this);
    this._overscrollY = bind(this._overscrollY, this);
    this._touchEnd = bind(this._touchEnd, this);
    this._touchMove = bind(this._touchMove, this);
    this._touchStart = bind(this._touchStart, this);
    if (options.overscrollGlow == null) {
      options.overscrollGlow = true;
    }
    if (options.edgeEffect == null) {
      options.edgeEffect = true;
    }
    if (options.fill == null) {
      options.fill = {
        r: 0,
        g: 0,
        b: 0,
        a: .24
      };
    }
    AndroidScrollComponent.__super__.constructor.call(this, options);
    this.content.draggable.overdrag = false;
    this.content.draggable.bounce = false;
    this.bounds = [];
    this._setBounds();
    this.overscrollEndValue = 0;
    this.overscrollEnd = new Animation({
      layer: this,
      properties: {
        overscrollEndValue: 1
      },
      curve: "beizer-curve(0.0, 0.0, 0.2, 1)",
      time: .300
    });
    this.on(Events.TouchStart, this._touchStart);
    this.on(Events.TouchMove, this._touchMove);
    this.on(Events.TouchEnd, this._touchEnd);
    document.addEventListener("touchend", this._touchEnd);
  }

  AndroidScrollComponent.prototype._touchStart = function(e) {
    this.touched = true;
    this.overscrollEnd.stop();
    Framer.Loop.off("update", this._updateOverscrollEndValue);
    this.overscrollEndValue = 0;
    if (Utils.isMobile()) {
      return this.touch = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      };
    } else {
      return this.touch = {
        x: e.offsetX,
        y: e.offsetY
      };
    }
  };

  AndroidScrollComponent.prototype._touchMove = function(e) {
    if (this.touched) {
      if (this.scrollVertical && this.overscrollGlow === true) {
        return this._overscrollY(e);
      }
    }
  };

  AndroidScrollComponent.prototype._touchEnd = function(e) {
    var b, j, len, ref;
    this.touched = false;
    ref = this.bounds;
    for (j = 0, len = ref.length; j < len; j++) {
      b = ref[j];
      if (!(b.isOverscrolled === true)) {
        continue;
      }
      b.endY = b.deltaY;
      b.endSideY = b.deltaSideY;
      b.endAlpha = b.deltaAlpha;
    }
    this.overscrollEnd.start();
    this.overscrollEnd.onAnimationEnd(function() {
      return Framer.Loop.off("update", this.options.layer._updateOverscrollEndValue);
    });
    return Framer.Loop.on("update", this._updateOverscrollEndValue);
  };

  AndroidScrollComponent.prototype._overscrollY = function(e) {
    var b, bottom, d, eventX, eventY, top;
    top = this.bounds[0];
    bottom = this.bounds[0];
    eventX = Utils.isMobile() ? e.touches[0].pageX : e.offsetX;
    eventY = Utils.isMobile() ? e.touches[0].pageY : e.offsetY;
    if (this.scrollY === 0) {
      b = this.bounds[0];
      b.isOverscrolled = true;
      d = b.d;
      d[5] = b.deltaY = Utils.modulate(eventY - this.touch.y, [0, b.height], [0, b.height], true);
      d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [0, b.height], [0, b.height * .20], true);
      d[2] = b.deltaLeftSideX = Utils.modulate(eventX, [0, b.width], [-(b.width / 4), 0], true);
      d[6] = b.deltaRightSideX = Utils.modulate(eventX, [0, b.width], [b.width, b.width + (b.width / 4)], true);
      b.deltaAlpha = Utils.modulate(b.deltaY, [0, b.height], [0, this.fill.a], true);
      return this._updateSVG(b, d, b.deltaAlpha);
    } else if (this.scrollY === Math.floor(this.content.height - this.height)) {
      b = this.bounds[1];
      b.isOverscrolled = true;
      d = b.d;
      d[5] = b.deltaY = Utils.modulate(this.touch.y - eventY, [b.height, 0], [0, b.height], true);
      d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [b.height, 0], [b.height, b.height - (b.height * .20)], true);
      d[2] = b.deltaLeftSideX = Utils.modulate(eventX, [0, b.width], [-(b.width / 4), 0], true);
      d[6] = b.deltaRightSideX = Utils.modulate(eventX, [0, b.width], [b.width, b.width + (b.width / 4)], true);
      b.deltaAlpha = Utils.modulate(b.deltaY, [b.height, 0], [0, this.fill.a], true);
      return this._updateSVG(b, d, b.deltaAlpha);
    } else {
      top.isOverscrolled = false;
      return bottom.isOverscrolled = false;
    }
  };

  AndroidScrollComponent.prototype._updateOverscrollEndValue = function() {
    var b, d, j, len, options, ref, results;
    ref = this.bounds;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      b = ref[j];
      if (!(b.isOverscrolled === true)) {
        continue;
      }
      options = (function() {
        switch (false) {
          case b.name !== "topBound":
            d = b.d;
            d[5] = b.deltaY = Utils.modulate(this.overscrollEndValue, [0, 1], [b.endY, 0], true);
            d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [b.endY, 0], [b.endSideY, 0], true);
            return b.deltaAlpha = Utils.modulate(b.deltaY, [b.endY, 0], [b.endAlpha, 0], true);
          case b.name !== "bottomBound":
            d = b.d;
            d[5] = b.deltaY = Utils.modulate(this.overscrollEndValue, [0, 1], [b.endY, b.height], true);
            d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [b.endY, b.height], [b.endSideY, b.height], true);
            return b.deltaAlpha = Utils.modulate(b.deltaY, [b.endY, b.height], [b.endAlpha, 0], true);
        }
      }).call(this);
      results.push(this._updateSVG(b, d, b.deltaAlpha));
    }
    return results;
  };

  AndroidScrollComponent.prototype._setBounds = function() {
    var bound, i, name, options, ref, results;
    ref = $.bounds;
    results = [];
    for (name in ref) {
      bound = ref[name];
      i = _.keys($.bounds).indexOf("" + name);
      options = (function() {
        switch (false) {
          case i !== 0:
            bound.width = this.width;
            return bound.d = [0, 0, 0, 0, bound.width / 2, 0, bound.width, 0, bound.width, 0];
          case i !== 1:
            bound.y = this.height - bound.height;
            bound.width = this.width;
            return bound.d = [0, bound.height, 0, bound.height, bound.width / 2, bound.height, bound.width, bound.height, bound.width, bound.height];
        }
      }).call(this);
      results.push(this._createBound(name, bound));
    }
    return results;
  };

  AndroidScrollComponent.prototype._createBound = function(name, bound) {
    var b;
    b = new Layer({
      x: bound.x,
      y: bound.y,
      width: bound.width,
      height: bound.height,
      name: name,
      backgroundColor: "",
      parent: this
    });
    b.d = bound.d;
    b.isOverscrolled = false;
    this.bounds.push(b);
    return this._createSVG(b);
  };

  AndroidScrollComponent.prototype._createSVG = function(bound) {
    bound.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    bound.svg.setAttribute("width", bound.width);
    bound.svg.setAttribute("height", bound.height);
    bound.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    bound.svg.appendChild(bound.path);
    bound._element.appendChild(bound.svg);
    return this._updateSVG(bound, bound.d, this.fill.a);
  };

  AndroidScrollComponent.prototype._updateSVG = function(bound, d, alpha) {
    bound.path.setAttribute("d", "M" + d[0] + "," + d[1] + " L" + d[2] + ", " + d[3] + " Q" + d[4] + "," + d[5] + " " + d[6] + "," + d[7] + " L" + d[8] + ", " + d[9]);
    return bound.path.setAttribute("fill", "rgba(" + this.fill.r + ", " + this.fill.g + ", " + this.fill.b + ", " + alpha + ")");
  };

  AndroidScrollComponent.define("fill", {
    get: function() {
      return this._fill;
    },
    set: function(value) {
      return this._fill = value;
    }
  });

  AndroidScrollComponent.define("touched", {
    get: function() {
      return this._touched;
    },
    set: function(value) {
      return this._touched = value;
    }
  });

  AndroidScrollComponent.define("touch", {
    get: function() {
      return this._touch;
    },
    set: function(value) {
      return this._touch = value;
    }
  });

  AndroidScrollComponent.define("overscrollGlow", {
    get: function() {
      return this._overscrollGlow;
    },
    set: function(value) {
      return this._overscrollGlow = value;
    }
  });

  AndroidScrollComponent.define("overscrollEndValue", {
    get: function() {
      return this._overscrollEndValue;
    },
    set: function(value) {
      return this._overscrollEndValue = value;
    }
  });

  return AndroidScrollComponent;

})(ScrollComponent);

},{}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9zaG10dWNrZXIvR2l0SHViL0FuZHJvaWRTY3JvbGxDb21wb25lbnQvQW5kcm9pZFNjcm9sbENvbXBvbmVudC5mcmFtZXIvbW9kdWxlcy9BbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2pvc2htdHVja2VyL0dpdEh1Yi9BbmRyb2lkU2Nyb2xsQ29tcG9uZW50L0FuZHJvaWRTY3JvbGxDb21wb25lbnQuZnJhbWVyL21vZHVsZXMvQW5kcm9pZFNjcm9sbENvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsQ0FBQTtFQUFBOzs7O0FBQUEsQ0FBQSxHQUNDO0VBQUEsTUFBQSxFQUNDO0lBQUEsUUFBQSxFQUFVO01BQUEsQ0FBQSxFQUFHLENBQUg7TUFBTSxDQUFBLEVBQUcsQ0FBVDtNQUFZLE1BQUEsRUFBUSxHQUFwQjtNQUF5QixDQUFBLEVBQUcsRUFBNUI7S0FBVjtJQUNBLFdBQUEsRUFBYTtNQUFBLENBQUEsRUFBRyxDQUFIO01BQU0sTUFBQSxFQUFRLEdBQWQ7S0FEYjtHQUREOzs7QUFNSyxPQUFPLENBQUM7OztFQUNBLGdDQUFDLE9BQUQ7O01BQUMsVUFBUTs7Ozs7Ozs7Ozs7O01BQ3JCLE9BQU8sQ0FBQyxpQkFBa0I7OztNQUMxQixPQUFPLENBQUMsYUFBYzs7O01BQ3RCLE9BQU8sQ0FBQyxPQUFRO1FBQUEsQ0FBQSxFQUFHLENBQUg7UUFBTSxDQUFBLEVBQUcsQ0FBVDtRQUFZLENBQUEsRUFBRyxDQUFmO1FBQWtCLENBQUEsRUFBRyxHQUFyQjs7O0lBQ2hCLHdEQUFNLE9BQU47SUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFuQixHQUE4QjtJQUM5QixJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFuQixHQUE0QjtJQUc1QixJQUFDLENBQUEs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QUFXLElBQUMsQ0FBQSxtQkFBRCxHQUF1QjtJQUFsQyxDQURMO0dBREE7Ozs7R0FoTjRDOzs7O0FDUDdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJCA9IFxuXHRib3VuZHM6XG5cdFx0dG9wQm91bmQ6IHg6IDAsIHk6IDAsIGhlaWdodDogNDAwLCBkOiBbXVxuXHRcdGJvdHRvbUJvdW5kOiB4OiAwLCBoZWlnaHQ6IDQwMFxuXHRcdCNsZWZ0Qm91bmQ6IHg6IDAsIHk6IDAsIHdpZHRoOiA0MDBcblx0XHQjcmlnaHRCb3VuZDogeTogMCwgd2lkdGg6IDQwMFxuXG5jbGFzcyBleHBvcnRzLkFuZHJvaWRTY3JvbGxDb21wb25lbnQgZXh0ZW5kcyBTY3JvbGxDb21wb25lbnRcblx0Y29uc3RydWN0b3I6IChvcHRpb25zPXt9KSAtPlxuXHRcdG9wdGlvbnMub3ZlcnNjcm9sbEdsb3cgPz0gdHJ1ZVxuXHRcdG9wdGlvbnMuZWRnZUVmZmVjdCA/PSB0cnVlXG5cdFx0b3B0aW9ucy5maWxsID89IHI6IDAsIGc6IDAsIGI6IDAsIGE6IC4yNFxuXHRcdHN1cGVyIG9wdGlvbnNcblx0XHRcblx0XHQjIERpc2FibGUgb3ZlcmRyYWcgYW5kIGJvdW5jZVxuXHRcdEBjb250ZW50LmRyYWdnYWJsZS5vdmVyZHJhZyA9IGZhbHNlXG5cdFx0QGNvbnRlbnQuZHJhZ2dhYmxlLmJvdW5jZSA9IGZhbHNlXG5cdFx0XG5cdFx0IyBDcmVhdGUgYm91bmRzXG5cdFx0QGJvdW5kcyA9IFtdXG5cdFx0QF9zZXRCb3VuZHMoKVxuXHRcdFxuXHRcdCMgT3ZlcnNjcm9sbCBhbmltYXRpb24gXG5cdFx0QG92ZXJzY3JvbGxFbmRWYWx1ZSA9IDBcblx0XHRAb3ZlcnNjcm9sbEVuZCA9IG5ldyBBbmltYXRpb25cblx0XHRcdGxheWVyOiBAXG5cdFx0XHRwcm9wZXJ0aWVzOlxuXHRcdFx0XHRvdmVyc2Nyb2xsRW5kVmFsdWU6IDFcblx0XHRcdGN1cnZlOiBcImJlaXplci1jdXJ2ZSgwLjAsIDAuMCwgMC4yLCAxKVwiXG5cdFx0XHR0aW1lOiAuMzAwXG5cdFx0XG5cdFx0IyBTZXR1cCBldmVudHNcblx0XHRAb24oRXZlbnRzLlRvdWNoU3RhcnQsIEBfdG91Y2hTdGFydClcblx0XHRAb24oRXZlbnRzLlRvdWNoTW92ZSwgQF90b3VjaE1vdmUpXG5cdFx0QG9uKEV2ZW50cy5Ub3VjaEVuZCwgQF90b3VjaEVuZClcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIFwidG91Y2hlbmRcIiwgQF90b3VjaEVuZFxuXHRcdFxuXHQjIEVWRU5UU1xuXHRfdG91Y2hTdGFydDogKGUpID0+XG5cdFx0IyBUb3VjaGVkIGlzIHRydWVcblx0XHRAdG91Y2hlZCA9IHRydWVcblx0XHRcblx0XHQjIFN0b3AgYW5pbWF0aW9uIC8gcmVzZXQgdmFsdWUgXG5cdFx0QG92ZXJzY3JvbGxFbmQuc3RvcCgpXG5cdFx0RnJhbWVyLkxvb3Aub2ZmIFwidXBkYXRlXCIsIEBfdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlXG5cdFx0QG92ZXJzY3JvbGxFbmRWYWx1ZSA9IDBcblx0XHRcblx0XHQjIFNldCB0b3VjaCB4IGFuZCB5XG5cdFx0aWYgVXRpbHMuaXNNb2JpbGUoKVxuXHRcdFx0QHRvdWNoID0gXG5cdFx0XHRcdHg6IGUudG91Y2hlc1swXS5wYWdlWFxuXHRcdFx0XHR5OiBlLnRvdWNoZXNbMF0ucGFnZVlcblx0XHRlbHNlXG5cdFx0XHRAdG91Y2ggPSBcblx0XHRcdFx0eDogZS5vZmZzZXRYXG5cdFx0XHRcdHk6IGUub2Zmc2V0WVxuXHRcdFx0XG5cdF90b3VjaE1vdmU6IChlKSA9PlxuXHRcdCMgT3ZlcnNjcm9sbFxuXHRcdGlmIEB0b3VjaGVkXG5cdFx0XHRAX292ZXJzY3JvbGxZKGUpIGlmIEBzY3JvbGxWZXJ0aWNhbCBhbmQgQG92ZXJzY3JvbGxHbG93IGlzIHRydWVcblx0XHRcblx0X3RvdWNoRW5kOiAoZSkgPT5cblx0XHQjIFRvdWNoZWQgaXMgZmFsc2UgXG5cdFx0QHRvdWNoZWQgPSBmYWxzZVxuXHRcdFxuXHRcdCMgU2V0IGVuZCB2YWx1ZXNcblx0XHRmb3IgYiBpbiBAYm91bmRzIHdoZW4gYi5pc092ZXJzY3JvbGxlZCBpcyB0cnVlXG5cdFx0XHRiLmVuZFkgPSBiLmRlbHRhWVxuXHRcdFx0Yi5lbmRTaWRlWSA9IGIuZGVsdGFTaWRlWVxuXHRcdFx0Yi5lbmRBbHBoYSA9IGIuZGVsdGFBbHBoYVxuXHRcdFxuXHRcdCMgT3ZlcnNjcm9sbCBhbmltYXRpb24gXG5cdFx0QG92ZXJzY3JvbGxFbmQuc3RhcnQoKVxuXHRcdEBvdmVyc2Nyb2xsRW5kLm9uQW5pbWF0aW9uRW5kIC0+XG5cdFx0XHRGcmFtZXIuTG9vcC5vZmYgXCJ1cGRhdGVcIiwgQG9wdGlvbnMubGF5ZXIuX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZVxuXHRcdFx0XG5cdFx0RnJhbWVyLkxvb3Aub24gXCJ1cGRhdGVcIiwgQF91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWVcblx0XHRcdFxuXHQjIEZVTkNUSU9OU1xuXHRfb3ZlcnNjcm9sbFk6IChlKSA9PlxuXHRcdHRvcCA9IEBib3VuZHNbMF1cblx0XHRib3R0b20gPSBAYm91bmRzWzBdXG5cdFx0ZXZlbnRYID0gaWYgVXRpbHMuaXNNb2JpbGUoKSB0aGVuIGUudG91Y2hlc1swXS5wYWdlWCBlbHNlIGUub2Zmc2V0WFxuXHRcdGV2ZW50WSA9IGlmIFV0aWxzLmlzTW9iaWxlKCkgdGhlbiBlLnRvdWNoZXNbMF0ucGFnZVkgZWxzZSBlLm9mZnNldFlcblx0XHRcblx0XHRpZiBAc2Nyb2xsWSBpcyAwXG5cdFx0XHRiID0gQGJvdW5kc1swXVxuXHRcdFx0Yi5pc092ZXJzY3JvbGxlZCA9IHRydWVcblx0XHRcdFxuXHRcdFx0IyBEZWx0YXNcblx0XHRcdGQgPSBiLmRcblx0XHRcdFxuXHRcdFx0ZFs1XSA9IGIuZGVsdGFZID0gVXRpbHMubW9kdWxhdGUgZXZlbnRZIC0gQHRvdWNoLnksIFswLCBiLmhlaWdodF0sIFswLCBiLmhlaWdodF0sIHRydWVcblx0XHRcdGRbM10gPSBkWzddID0gYi5kZWx0YVNpZGVZID0gVXRpbHMubW9kdWxhdGUgYi5kZWx0YVksIFswLCBiLmhlaWdodF0sIFswLCBiLmhlaWdodCAqIC4yMF0sIHRydWVcblx0XHRcdGRbMl0gPSBiLmRlbHRhTGVmdFNpZGVYID0gVXRpbHMubW9kdWxhdGUgZXZlbnRYLCBbMCwgYi53aWR0aF0sIFstKGIud2lkdGgvNCksIDBdLCB0cnVlXG5cdFx0XHRkWzZdID0gYi5kZWx0YVJpZ2h0U2lkZVggPSBVdGlscy5tb2R1bGF0ZSBldmVudFgsIFswLCBiLndpZHRoXSwgW2Iud2lkdGgsIGIud2lkdGggKyAoYi53aWR0aC80KV0sIHRydWVcblx0XHRcdGIuZGVsdGFBbHBoYSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbMCwgYi5oZWlnaHRdLCBbMCwgQGZpbGwuYV0sIHRydWVcblx0XHRcdFxuXHRcdFx0IyBVcGRhdGUgU1ZHXG5cdFx0XHRAX3VwZGF0ZVNWRyhiLCBkLCBiLmRlbHRhQWxwaGEpXG5cdFx0XHRcblx0XHRlbHNlIGlmIEBzY3JvbGxZIGlzIE1hdGguZmxvb3IoQGNvbnRlbnQuaGVpZ2h0IC0gQGhlaWdodClcblx0XHRcdGIgPSBAYm91bmRzWzFdXG5cdFx0XHRiLmlzT3ZlcnNjcm9sbGVkID0gdHJ1ZVxuXHRcdFx0XG5cdFx0XHQjIERlbHRhc1xuXHRcdFx0ZCA9IGIuZFxuXHRcdFx0XG5cdFx0XHRkWzVdID0gYi5kZWx0YVkgPSBVdGlscy5tb2R1bGF0ZSBAdG91Y2gueSAtIGV2ZW50WSwgW2IuaGVpZ2h0LCAwXSwgWzAsIGIuaGVpZ2h0XSwgdHJ1ZVxuXHRcdFx0ZFszXSA9IGRbN10gPSBiLmRlbHRhU2lkZVkgPSBVdGlscy5tb2R1bGF0ZSBiLmRlbHRhWSwgW2IuaGVpZ2h0LCAwXSwgW2IuaGVpZ2h0LCBiLmhlaWdodCAtIChiLmhlaWdodCAqIC4yMCldLCB0cnVlXG5cdFx0XHRkWzJdID0gYi5kZWx0YUxlZnRTaWRlWCA9IFV0aWxzLm1vZHVsYXRlIGV2ZW50WCwgWzAsIGIud2lkdGhdLCBbLShiLndpZHRoLzQpLCAwXSwgdHJ1ZVxuXHRcdFx0ZFs2XSA9IGIuZGVsdGFSaWdodFNpZGVYID0gVXRpbHMubW9kdWxhdGUgZXZlbnRYLCBbMCwgYi53aWR0aF0sIFtiLndpZHRoLCBiLndpZHRoICsgKGIud2lkdGgvNCldLCB0cnVlXG5cdFx0XHRiLmRlbHRhQWxwaGEgPSBVdGlscy5tb2R1bGF0ZSBiLmRlbHRhWSwgW2IuaGVpZ2h0LCAwXSwgWzAsIEBmaWxsLmFdLCB0cnVlXG5cdFx0XHRcblx0XHRcdCMgVXBkYXRlIFNWR1xuXHRcdFx0QF91cGRhdGVTVkcoYiwgZCwgYi5kZWx0YUFscGhhKVxuXHRcdFxuXHRcdGVsc2UgXG5cdFx0XHR0b3AuaXNPdmVyc2Nyb2xsZWQgPSBmYWxzZVxuXHRcdFx0Ym90dG9tLmlzT3ZlcnNjcm9sbGVkID0gZmFsc2Vcblx0XHRcdFxuXHRfdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlOiA9PlxuXHRcdGZvciBiIGluIEBib3VuZHMgd2hlbiBiLmlzT3ZlcnNjcm9sbGVkIGlzIHRydWVcblx0XHRcdG9wdGlvbnMgPSBzd2l0Y2ggXG5cdFx0XHRcdHdoZW4gYi5uYW1lIGlzIFwidG9wQm91bmRcIlxuXHRcdFx0XHRcdGQgPSBiLmRcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRkWzVdID0gYi5kZWx0YVkgPSBVdGlscy5tb2R1bGF0ZSBAb3ZlcnNjcm9sbEVuZFZhbHVlLCBbMCwgMV0sIFtiLmVuZFksIDBdLCB0cnVlXG5cdFx0XHRcdFx0ZFszXSA9IGRbN10gPSBiLmRlbHRhU2lkZVkgPSBVdGlscy5tb2R1bGF0ZSBiLmRlbHRhWSwgW2IuZW5kWSwgMF0sIFtiLmVuZFNpZGVZLCAwXSwgdHJ1ZVxuXHRcdFx0XHRcdGIuZGVsdGFBbHBoYSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbYi5lbmRZLCAwXSwgW2IuZW5kQWxwaGEsIDBdLCB0cnVlXG5cdFx0XHRcdFx0XG5cdFx0XHRcdHdoZW4gYi5uYW1lIGlzIFwiYm90dG9tQm91bmRcIlxuXHRcdFx0XHRcdGQgPSBiLmRcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRkWzVdID0gYi5kZWx0YVkgPSBVdGlscy5tb2R1bGF0ZSBAb3ZlcnNjcm9sbEVuZFZhbHVlLCBbMCwgMV0sIFtiLmVuZFksIGIuaGVpZ2h0XSwgdHJ1ZVxuXHRcdFx0XHRcdGRbM10gPSBkWzddID0gYi5kZWx0YVNpZGVZID0gVXRpbHMubW9kdWxhdGUgYi5kZWx0YVksIFtiLmVuZFksIGIuaGVpZ2h0XSwgW2IuZW5kU2lkZVksIGIuaGVpZ2h0XSwgdHJ1ZVxuXHRcdFx0XHRcdGIuZGVsdGFBbHBoYSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbYi5lbmRZLCBiLmhlaWdodF0sIFtiLmVuZEFscGhhLCAwXSwgdHJ1ZVxuXHRcdFx0XHRcdFxuXHRcdFx0IyBVcGRhdGUgU1ZHXG5cdFx0XHRAX3VwZGF0ZVNWRyhiLCBkLCBiLmRlbHRhQWxwaGEpXG5cdFx0XG5cdF9zZXRCb3VuZHM6ID0+XG5cdFx0Zm9yIG5hbWUsIGJvdW5kIG9mICQuYm91bmRzXG5cdFx0XHRpID0gXy5rZXlzKCQuYm91bmRzKS5pbmRleE9mIFwiI3tuYW1lfVwiXG5cdFx0XHRcblx0XHRcdG9wdGlvbnMgPSBzd2l0Y2hcblx0XHRcdFx0d2hlbiBpIGlzIDBcblx0XHRcdFx0XHRib3VuZC53aWR0aCA9IEB3aWR0aFxuXHRcdFx0XHRcdGJvdW5kLmQgPSBbMCwgMCwgMCwgMCwgYm91bmQud2lkdGgvMiwgMCwgYm91bmQud2lkdGgsIDAsIGJvdW5kLndpZHRoLCAwXVxuXHRcdFx0XHR3aGVuIGkgaXMgMVxuXHRcdFx0XHRcdGJvdW5kLnkgPSBAaGVpZ2h0IC0gYm91bmQuaGVpZ2h0XG5cdFx0XHRcdFx0Ym91bmQud2lkdGggPSBAd2lkdGhcblx0XHRcdFx0XHRib3VuZC5kID0gWzAsIGJvdW5kLmhlaWdodCwgMCwgYm91bmQuaGVpZ2h0LCBib3VuZC53aWR0aC8yLCBib3VuZC5oZWlnaHQsIGJvdW5kLndpZHRoLCBib3VuZC5oZWlnaHQsIGJvdW5kLndpZHRoLCBib3VuZC5oZWlnaHRdXG5cdFx0XHRcdFx0XG5cdFx0XHQjIENyZWF0ZSBib3VuZFx0XHRcblx0XHRcdEBfY3JlYXRlQm91bmQobmFtZSwgYm91bmQpXG5cdFx0XHRcdFx0XG5cdF9jcmVhdGVCb3VuZDogKG5hbWUsIGJvdW5kKSA9PlxuXHRcdGIgPSBuZXcgTGF5ZXIgXG5cdFx0XHR4OiBib3VuZC54XG5cdFx0XHR5OiBib3VuZC55XG5cdFx0XHR3aWR0aDogYm91bmQud2lkdGhcblx0XHRcdGhlaWdodDogYm91bmQuaGVpZ2h0XG5cdFx0XHRuYW1lOiBuYW1lXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwiXCIgXG5cdFx0XHRwYXJlbnQ6IEBcblxuXHRcdCMgU2V0IGRcblx0XHRiLmQgPSBib3VuZC5kXG5cdFx0XHRcblx0XHQjIFNldCBpc092ZXJzY3JvbGxlZFxuXHRcdGIuaXNPdmVyc2Nyb2xsZWQgPSBmYWxzZVxuXHRcdFx0XG5cdFx0IyBQdXNoIHRvIGFycmF5XG5cdFx0QGJvdW5kcy5wdXNoIGJcblx0XHRcblx0XHQjIENyZWF0ZSBTVkdcblx0XHRAX2NyZWF0ZVNWRyhiKVxuXHRcdFxuXHRfY3JlYXRlU1ZHOiAoYm91bmQpID0+XG5cdFx0Ym91bmQuc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJzdmdcIlxuXHRcdGJvdW5kLnN2Zy5zZXRBdHRyaWJ1dGUgXCJ3aWR0aFwiLCBib3VuZC53aWR0aFxuXHRcdGJvdW5kLnN2Zy5zZXRBdHRyaWJ1dGUgXCJoZWlnaHRcIiwgYm91bmQuaGVpZ2h0XG5cdFx0XG5cdFx0Ym91bmQucGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiXG5cblx0XHQjIEFwcGVuZCBcblx0XHRib3VuZC5zdmcuYXBwZW5kQ2hpbGQgYm91bmQucGF0aCBcblx0XHRib3VuZC5fZWxlbWVudC5hcHBlbmRDaGlsZCBib3VuZC5zdmdcblxuXHRcdCMgVXBkYXRlIFNWR1xuXHRcdEBfdXBkYXRlU1ZHKGJvdW5kLCBib3VuZC5kLCBAZmlsbC5hKVxuXHRcdFxuXHRfdXBkYXRlU1ZHOiAoYm91bmQsIGQsIGFscGhhKSA9PlxuXHRcdGJvdW5kLnBhdGguc2V0QXR0cmlidXRlIFwiZFwiLCBcIk0je2RbMF19LCN7ZFsxXX0gTCN7ZFsyXX0sICN7ZFszXX0gUSN7ZFs0XX0sI3tkWzVdfSAje2RbNl19LCN7ZFs3XX0gTCN7ZFs4XX0sICN7ZFs5XX1cIlxuXHRcdGJvdW5kLnBhdGguc2V0QXR0cmlidXRlIFwiZmlsbFwiLCBcInJnYmEoI3tAZmlsbC5yfSwgI3tAZmlsbC5nfSwgI3tAZmlsbC5ifSwgI3thbHBoYX0pXCJcblx0XHRcdFx0XHRcblx0IyBERUZJTlRJT05TXG5cdEBkZWZpbmUgXCJmaWxsXCIsXG5cdFx0Z2V0OiAtPiBAX2ZpbGxcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQF9maWxsID0gdmFsdWUgXG5cdFx0XG5cdEBkZWZpbmUgXCJ0b3VjaGVkXCIsXG5cdFx0Z2V0OiAtPiBAX3RvdWNoZWRcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQF90b3VjaGVkID0gdmFsdWVcblx0XHRcblx0QGRlZmluZSBcInRvdWNoXCIsXG5cdFx0Z2V0OiAtPiBAX3RvdWNoIFxuXHRcdHNldDogKHZhbHVlKSAtPiBAX3RvdWNoID0gdmFsdWVcblxuXHRAZGVmaW5lIFwib3ZlcnNjcm9sbEdsb3dcIixcblx0XHRnZXQ6IC0+IEBfb3ZlcnNjcm9sbEdsb3cgXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBfb3ZlcnNjcm9sbEdsb3cgPSB2YWx1ZVxuXHRcdFxuXHRAZGVmaW5lIFwib3ZlcnNjcm9sbEVuZFZhbHVlXCIsXHRcblx0Z2V0OiAtPiBAX292ZXJzY3JvbGxFbmRWYWx1ZVxuXHRzZXQ6ICh2YWx1ZSkgLT4gQF9vdmVyc2Nyb2xsRW5kVmFsdWUgPSB2YWx1ZSIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciAkLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSB7XG4gIGJvdW5kczoge1xuICAgIHRvcEJvdW5kOiB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIGhlaWdodDogNDAwLFxuICAgICAgZDogW11cbiAgICB9LFxuICAgIGJvdHRvbUJvdW5kOiB7XG4gICAgICB4OiAwLFxuICAgICAgaGVpZ2h0OiA0MDBcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydHMuQW5kcm9pZFNjcm9sbENvbXBvbmVudCA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50KG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVNWRyA9IGJpbmQodGhpcy5fdXBkYXRlU1ZHLCB0aGlzKTtcbiAgICB0aGlzLl9jcmVhdGVTVkcgPSBiaW5kKHRoaXMuX2NyZWF0ZVNWRywgdGhpcyk7XG4gICAgdGhpcy5fY3JlYXRlQm91bmQgPSBiaW5kKHRoaXMuX2NyZWF0ZUJvdW5kLCB0aGlzKTtcbiAgICB0aGlzLl9zZXRCb3VuZHMgPSBiaW5kKHRoaXMuX3NldEJvdW5kcywgdGhpcyk7XG4gICAgdGhpcy5fdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlID0gYmluZCh0aGlzLl91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWUsIHRoaXMpO1xuICAgIHRoaXMuX292ZXJzY3JvbGxZID0gYmluZCh0aGlzLl9vdmVyc2Nyb2xsWSwgdGhpcyk7XG4gICAgdGhpcy5fdG91Y2hFbmQgPSBiaW5kKHRoaXMuX3RvdWNoRW5kLCB0aGlzKTtcbiAgICB0aGlzLl90b3VjaE1vdmUgPSBiaW5kKHRoaXMuX3RvdWNoTW92ZSwgdGhpcyk7XG4gICAgdGhpcy5fdG91Y2hTdGFydCA9IGJpbmQodGhpcy5fdG91Y2hTdGFydCwgdGhpcyk7XG4gICAgaWYgKG9wdGlvbnMub3ZlcnNjcm9sbEdsb3cgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5vdmVyc2Nyb2xsR2xvdyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmVkZ2VFZmZlY3QgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5lZGdlRWZmZWN0ID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZmlsbCA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zLmZpbGwgPSB7XG4gICAgICAgIHI6IDAsXG4gICAgICAgIGc6IDAsXG4gICAgICAgIGI6IDAsXG4gICAgICAgIGE6IC4yNFxuICAgICAgfTtcbiAgICB9XG4gICAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLmNvbnRlbnQuZHJhZ2dhYmxlLm92ZXJkcmFnID0gZmFsc2U7XG4gICAgdGhpcy5jb250ZW50LmRyYWdnYWJsZS5ib3VuY2UgPSBmYWxzZTtcbiAgICB0aGlzLmJvdW5kcyA9IFtdO1xuICAgIHRoaXMuX3NldEJvdW5kcygpO1xuICAgIHRoaXMub3ZlcnNjcm9sbEVuZFZhbHVlID0gMDtcbiAgICB0aGlzLm92ZXJzY3JvbGxFbmQgPSBuZXcgQW5pbWF0aW9uKHtcbiAgICAgIGxheWVyOiB0aGlzLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICBvdmVyc2Nyb2xsRW5kVmFsdWU6IDFcbiAgICAgIH0sXG4gICAgICBjdXJ2ZTogXCJiZWl6ZXItY3VydmUoMC4wLCAwLjAsIDAuMiwgMSlcIixcbiAgICAgIHRpbWU6IC4zMDBcbiAgICB9KTtcbiAgICB0aGlzLm9uKEV2ZW50cy5Ub3VjaFN0YXJ0LCB0aGlzLl90b3VjaFN0YXJ0KTtcbiAgICB0aGlzLm9uKEV2ZW50cy5Ub3VjaE1vdmUsIHRoaXMuX3RvdWNoTW92ZSk7XG4gICAgdGhpcy5vbihFdmVudHMuVG91Y2hFbmQsIHRoaXMuX3RvdWNoRW5kKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgdGhpcy5fdG91Y2hFbmQpO1xuICB9XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX3RvdWNoU3RhcnQgPSBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy50b3VjaGVkID0gdHJ1ZTtcbiAgICB0aGlzLm92ZXJzY3JvbGxFbmQuc3RvcCgpO1xuICAgIEZyYW1lci5Mb29wLm9mZihcInVwZGF0ZVwiLCB0aGlzLl91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWUpO1xuICAgIHRoaXMub3ZlcnNjcm9sbEVuZFZhbHVlID0gMDtcbiAgICBpZiAoVXRpbHMuaXNNb2JpbGUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG91Y2ggPSB7XG4gICAgICAgIHg6IGUudG91Y2hlc1swXS5wYWdlWCxcbiAgICAgICAgeTogZS50b3VjaGVzWzBdLnBhZ2VZXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy50b3VjaCA9IHtcbiAgICAgICAgeDogZS5vZmZzZXRYLFxuICAgICAgICB5OiBlLm9mZnNldFlcbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl90b3VjaE1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKHRoaXMudG91Y2hlZCkge1xuICAgICAgaWYgKHRoaXMuc2Nyb2xsVmVydGljYWwgJiYgdGhpcy5vdmVyc2Nyb2xsR2xvdyA9PT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3ZlcnNjcm9sbFkoZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl90b3VjaEVuZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYiwgaiwgbGVuLCByZWY7XG4gICAgdGhpcy50b3VjaGVkID0gZmFsc2U7XG4gICAgcmVmID0gdGhpcy5ib3VuZHM7XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBiID0gcmVmW2pdO1xuICAgICAgaWYgKCEoYi5pc092ZXJzY3JvbGxlZCA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBiLmVuZFkgPSBiLmRlbHRhWTtcbiAgICAgIGIuZW5kU2lkZVkgPSBiLmRlbHRhU2lkZVk7XG4gICAgICBiLmVuZEFscGhhID0gYi5kZWx0YUFscGhhO1xuICAgIH1cbiAgICB0aGlzLm92ZXJzY3JvbGxFbmQuc3RhcnQoKTtcbiAgICB0aGlzLm92ZXJzY3JvbGxFbmQub25BbmltYXRpb25FbmQoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRnJhbWVyLkxvb3Aub2ZmKFwidXBkYXRlXCIsIHRoaXMub3B0aW9ucy5sYXllci5fdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gRnJhbWVyLkxvb3Aub24oXCJ1cGRhdGVcIiwgdGhpcy5fdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlKTtcbiAgfTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LnByb3RvdHlwZS5fb3ZlcnNjcm9sbFkgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGIsIGJvdHRvbSwgZCwgZXZlbnRYLCBldmVudFksIHRvcDtcbiAgICB0b3AgPSB0aGlzLmJvdW5kc1swXTtcbiAgICBib3R0b20gPSB0aGlzLmJvdW5kc1swXTtcbiAgICBldmVudFggPSBVdGlscy5pc01vYmlsZSgpID8gZS50b3VjaGVzWzBdLnBhZ2VYIDogZS5vZmZzZXRYO1xuICAgIGV2ZW50WSA9IFV0aWxzLmlzTW9iaWxlKCkgPyBlLnRvdWNoZXNbMF0ucGFnZVkgOiBlLm9mZnNldFk7XG4gICAgaWYgKHRoaXMuc2Nyb2xsWSA9PT0gMCkge1xuICAgICAgYiA9IHRoaXMuYm91bmRzWzBdO1xuICAgICAgYi5pc092ZXJzY3JvbGxlZCA9IHRydWU7XG4gICAgICBkID0gYi5kO1xuICAgICAgZFs1XSA9IGIuZGVsdGFZID0gVXRpbHMubW9kdWxhdGUoZXZlbnRZIC0gdGhpcy50b3VjaC55LCBbMCwgYi5oZWlnaHRdLCBbMCwgYi5oZWlnaHRdLCB0cnVlKTtcbiAgICAgIGRbM10gPSBkWzddID0gYi5kZWx0YVNpZGVZID0gVXRpbHMubW9kdWxhdGUoYi5kZWx0YVksIFswLCBiLmhlaWdodF0sIFswLCBiLmhlaWdodCAqIC4yMF0sIHRydWUpO1xuICAgICAgZFsyXSA9IGIuZGVsdGFMZWZ0U2lkZVggPSBVdGlscy5tb2R1bGF0ZShldmVudFgsIFswLCBiLndpZHRoXSwgWy0oYi53aWR0aCAvIDQpLCAwXSwgdHJ1ZSk7XG4gICAgICBkWzZdID0gYi5kZWx0YVJpZ2h0U2lkZVggPSBVdGlscy5tb2R1bGF0ZShldmVudFgsIFswLCBiLndpZHRoXSwgW2Iud2lkdGgsIGIud2lkdGggKyAoYi53aWR0aCAvIDQpXSwgdHJ1ZSk7XG4gICAgICBiLmRlbHRhQWxwaGEgPSBVdGlscy5tb2R1bGF0ZShiLmRlbHRhWSwgWzAsIGIuaGVpZ2h0XSwgWzAsIHRoaXMuZmlsbC5hXSwgdHJ1ZSk7XG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlU1ZHKGIsIGQsIGIuZGVsdGFBbHBoYSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNjcm9sbFkgPT09IE1hdGguZmxvb3IodGhpcy5jb250ZW50LmhlaWdodCAtIHRoaXMuaGVpZ2h0KSkge1xuICAgICAgYiA9IHRoaXMuYm91bmRzWzFdO1xuICAgICAgYi5pc092ZXJzY3JvbGxlZCA9IHRydWU7XG4gICAgICBkID0gYi5kO1xuICAgICAgZFs1XSA9IGIuZGVsdGFZID0gVXRpbHMubW9kdWxhdGUodGhpcy50b3VjaC55IC0gZXZlbnRZLCBbYi5oZWlnaHQsIDBdLCBbMCwgYi5oZWlnaHRdLCB0cnVlKTtcbiAgICAgIGRbM10gPSBkWzddID0gYi5kZWx0YVNpZGVZID0gVXRpbHMubW9kdWxhdGUoYi5kZWx0YVksIFtiLmhlaWdodCwgMF0sIFtiLmhlaWdodCwgYi5oZWlnaHQgLSAoYi5oZWlnaHQgKiAuMjApXSwgdHJ1ZSk7XG4gICAgICBkWzJdID0gYi5kZWx0YUxlZnRTaWRlWCA9IFV0aWxzLm1vZHVsYXRlKGV2ZW50WCwgWzAsIGIud2lkdGhdLCBbLShiLndpZHRoIC8gNCksIDBdLCB0cnVlKTtcbiAgICAgIGRbNl0gPSBiLmRlbHRhUmlnaHRTaWRlWCA9IFV0aWxzLm1vZHVsYXRlKGV2ZW50WCwgWzAsIGIud2lkdGhdLCBbYi53aWR0aCwgYi53aWR0aCArIChiLndpZHRoIC8gNCldLCB0cnVlKTtcbiAgICAgIGIuZGVsdGFBbHBoYSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbYi5oZWlnaHQsIDBdLCBbMCwgdGhpcy5maWxsLmFdLCB0cnVlKTtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVTVkcoYiwgZCwgYi5kZWx0YUFscGhhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9wLmlzT3ZlcnNjcm9sbGVkID0gZmFsc2U7XG4gICAgICByZXR1cm4gYm90dG9tLmlzT3ZlcnNjcm9sbGVkID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYiwgZCwgaiwgbGVuLCBvcHRpb25zLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5ib3VuZHM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgYiA9IHJlZltqXTtcbiAgICAgIGlmICghKGIuaXNPdmVyc2Nyb2xsZWQgPT09IHRydWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgb3B0aW9ucyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgc3dpdGNoIChmYWxzZSkge1xuICAgICAgICAgIGNhc2UgYi5uYW1lICE9PSBcInRvcEJvdW5kXCI6XG4gICAgICAgICAgICBkID0gYi5kO1xuICAgICAgICAgICAgZFs1XSA9IGIuZGVsdGFZID0gVXRpbHMubW9kdWxhdGUodGhpcy5vdmVyc2Nyb2xsRW5kVmFsdWUsIFswLCAxXSwgW2IuZW5kWSwgMF0sIHRydWUpO1xuICAgICAgICAgICAgZFszXSA9IGRbN10gPSBiLmRlbHRhU2lkZVkgPSBVdGlscy5tb2R1bGF0ZShiLmRlbHRhWSwgW2IuZW5kWSwgMF0sIFtiLmVuZFNpZGVZLCAwXSwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gYi5kZWx0YUFscGhhID0gVXRpbHMubW9kdWxhdGUoYi5kZWx0YVksIFtiLmVuZFksIDBdLCBbYi5lbmRBbHBoYSwgMF0sIHRydWUpO1xuICAgICAgICAgIGNhc2UgYi5uYW1lICE9PSBcImJvdHRvbUJvdW5kXCI6XG4gICAgICAgICAgICBkID0gYi5kO1xuICAgICAgICAgICAgZFs1XSA9IGIuZGVsdGFZID0gVXRpbHMubW9kdWxhdGUodGhpcy5vdmVyc2Nyb2xsRW5kVmFsdWUsIFswLCAxXSwgW2IuZW5kWSwgYi5oZWlnaHRdLCB0cnVlKTtcbiAgICAgICAgICAgIGRbM10gPSBkWzddID0gYi5kZWx0YVNpZGVZID0gVXRpbHMubW9kdWxhdGUoYi5kZWx0YVksIFtiLmVuZFksIGIuaGVpZ2h0XSwgW2IuZW5kU2lkZVksIGIuaGVpZ2h0XSwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gYi5kZWx0YUFscGhhID0gVXRpbHMubW9kdWxhdGUoYi5kZWx0YVksIFtiLmVuZFksIGIuaGVpZ2h0XSwgW2IuZW5kQWxwaGEsIDBdLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSkuY2FsbCh0aGlzKTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl91cGRhdGVTVkcoYiwgZCwgYi5kZWx0YUFscGhhKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl9zZXRCb3VuZHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYm91bmQsIGksIG5hbWUsIG9wdGlvbnMsIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSAkLmJvdW5kcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChuYW1lIGluIHJlZikge1xuICAgICAgYm91bmQgPSByZWZbbmFtZV07XG4gICAgICBpID0gXy5rZXlzKCQuYm91bmRzKS5pbmRleE9mKFwiXCIgKyBuYW1lKTtcbiAgICAgIG9wdGlvbnMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHN3aXRjaCAoZmFsc2UpIHtcbiAgICAgICAgICBjYXNlIGkgIT09IDA6XG4gICAgICAgICAgICBib3VuZC53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgICAgICByZXR1cm4gYm91bmQuZCA9IFswLCAwLCAwLCAwLCBib3VuZC53aWR0aCAvIDIsIDAsIGJvdW5kLndpZHRoLCAwLCBib3VuZC53aWR0aCwgMF07XG4gICAgICAgICAgY2FzZSBpICE9PSAxOlxuICAgICAgICAgICAgYm91bmQueSA9IHRoaXMuaGVpZ2h0IC0gYm91bmQuaGVpZ2h0O1xuICAgICAgICAgICAgYm91bmQud2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICAgICAgcmV0dXJuIGJvdW5kLmQgPSBbMCwgYm91bmQuaGVpZ2h0LCAwLCBib3VuZC5oZWlnaHQsIGJvdW5kLndpZHRoIC8gMiwgYm91bmQuaGVpZ2h0LCBib3VuZC53aWR0aCwgYm91bmQuaGVpZ2h0LCBib3VuZC53aWR0aCwgYm91bmQuaGVpZ2h0XTtcbiAgICAgICAgfVxuICAgICAgfSkuY2FsbCh0aGlzKTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9jcmVhdGVCb3VuZChuYW1lLCBib3VuZCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LnByb3RvdHlwZS5fY3JlYXRlQm91bmQgPSBmdW5jdGlvbihuYW1lLCBib3VuZCkge1xuICAgIHZhciBiO1xuICAgIGIgPSBuZXcgTGF5ZXIoe1xuICAgICAgeDogYm91bmQueCxcbiAgICAgIHk6IGJvdW5kLnksXG4gICAgICB3aWR0aDogYm91bmQud2lkdGgsXG4gICAgICBoZWlnaHQ6IGJvdW5kLmhlaWdodCxcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiXCIsXG4gICAgICBwYXJlbnQ6IHRoaXNcbiAgICB9KTtcbiAgICBiLmQgPSBib3VuZC5kO1xuICAgIGIuaXNPdmVyc2Nyb2xsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmJvdW5kcy5wdXNoKGIpO1xuICAgIHJldHVybiB0aGlzLl9jcmVhdGVTVkcoYik7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX2NyZWF0ZVNWRyA9IGZ1bmN0aW9uKGJvdW5kKSB7XG4gICAgYm91bmQuc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJzdmdcIik7XG4gICAgYm91bmQuc3ZnLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIGJvdW5kLndpZHRoKTtcbiAgICBib3VuZC5zdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIGJvdW5kLmhlaWdodCk7XG4gICAgYm91bmQucGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICBib3VuZC5zdmcuYXBwZW5kQ2hpbGQoYm91bmQucGF0aCk7XG4gICAgYm91bmQuX2VsZW1lbnQuYXBwZW5kQ2hpbGQoYm91bmQuc3ZnKTtcbiAgICByZXR1cm4gdGhpcy5fdXBkYXRlU1ZHKGJvdW5kLCBib3VuZC5kLCB0aGlzLmZpbGwuYSk7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX3VwZGF0ZVNWRyA9IGZ1bmN0aW9uKGJvdW5kLCBkLCBhbHBoYSkge1xuICAgIGJvdW5kLnBhdGguc2V0QXR0cmlidXRlKFwiZFwiLCBcIk1cIiArIGRbMF0gKyBcIixcIiArIGRbMV0gKyBcIiBMXCIgKyBkWzJdICsgXCIsIFwiICsgZFszXSArIFwiIFFcIiArIGRbNF0gKyBcIixcIiArIGRbNV0gKyBcIiBcIiArIGRbNl0gKyBcIixcIiArIGRbN10gKyBcIiBMXCIgKyBkWzhdICsgXCIsIFwiICsgZFs5XSk7XG4gICAgcmV0dXJuIGJvdW5kLnBhdGguc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcInJnYmEoXCIgKyB0aGlzLmZpbGwuciArIFwiLCBcIiArIHRoaXMuZmlsbC5nICsgXCIsIFwiICsgdGhpcy5maWxsLmIgKyBcIiwgXCIgKyBhbHBoYSArIFwiKVwiKTtcbiAgfTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmRlZmluZShcImZpbGxcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmlsbDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9maWxsID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmRlZmluZShcInRvdWNoZWRcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdG91Y2hlZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl90b3VjaGVkID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmRlZmluZShcInRvdWNoXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RvdWNoO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RvdWNoID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmRlZmluZShcIm92ZXJzY3JvbGxHbG93XCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX292ZXJzY3JvbGxHbG93O1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX292ZXJzY3JvbGxHbG93ID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmRlZmluZShcIm92ZXJzY3JvbGxFbmRWYWx1ZVwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vdmVyc2Nyb2xsRW5kVmFsdWU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fb3ZlcnNjcm9sbEVuZFZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQW5kcm9pZFNjcm9sbENvbXBvbmVudDtcblxufSkoU2Nyb2xsQ29tcG9uZW50KTtcbiJdfQ==
