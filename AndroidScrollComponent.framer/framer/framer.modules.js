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
      d: bound.d,
      name: name,
      backgroundColor: "",
      parent: this
    });
    b.isOverscrolled = false;
    this.bounds.push(b);
    return this._createSVG(b);
  };

  AndroidScrollComponent.prototype._createSVG = function(bound) {
    bound.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    bound.svg.setAttribute("width", bound.width);
    bound.svg.setAttribute("height", bound.height);
    bound.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    bound.path.setAttribute("fill", "rgba(" + this.fill.r + ", " + this.fill.g + ", " + this.fill.b + ", " + this.fill.a + ")");
    bound.path.setAttribute("d", "M" + bound.d[0] + "," + bound.d[1] + " L" + bound.d[2] + ", " + bound.d[3] + " Q" + bound.d[4] + "," + bound.d[5] + " " + bound.d[6] + "," + bound.d[7] + " L" + bound.d[8] + ", " + bound.d[9]);
    bound.svg.appendChild(bound.path);
    return bound._element.appendChild(bound.svg);
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

  AndroidScrollComponent.define("d", {
    get: function() {
      return this._d;
    },
    set: function(value) {
      return this._d = value;
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
      d: bound.d,
      name: name,
      backgroundColor: "",
      parent: this
    });
    b.isOverscrolled = false;
    this.bounds.push(b);
    return this._createSVG(b);
  };

  AndroidScrollComponent.prototype._createSVG = function(bound) {
    bound.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    bound.svg.setAttribute("width", bound.width);
    bound.svg.setAttribute("height", bound.height);
    bound.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    bound.path.setAttribute("fill", "rgba(" + this.fill.r + ", " + this.fill.g + ", " + this.fill.b + ", " + this.fill.a + ")");
    bound.path.setAttribute("d", "M" + bound.d[0] + "," + bound.d[1] + " L" + bound.d[2] + ", " + bound.d[3] + " Q" + bound.d[4] + "," + bound.d[5] + " " + bound.d[6] + "," + bound.d[7] + " L" + bound.d[8] + ", " + bound.d[9]);
    bound.svg.appendChild(bound.path);
    return bound._element.appendChild(bound.svg);
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

  AndroidScrollComponent.define("d", {
    get: function() {
      return this._d;
    },
    set: function(value) {
      return this._d = value;
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9zaG10dWNrZXIvR2l0SHViL0FuZHJvaWRTY3JvbGxDb21wb25lbnQvQW5kcm9pZFNjcm9sbENvbXBvbmVudC5mcmFtZXIvbW9kdWxlcy9BbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2pvc2htdHVja2VyL0dpdEh1Yi9BbmRyb2lkU2Nyb2xsQ29tcG9uZW50L0FuZHJvaWRTY3JvbGxDb21wb25lbnQuZnJhbWVyL21vZHVsZXMvQW5kcm9pZFNjcm9sbENvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsQ0FBQTtFQUFBOzs7O0FBQUEsQ0FBQSxHQUNDO0VBQUEsTUFBQSxFQUNDO0lBQUEsUUFBQSxFQUFVO01BQUEsQ0FBQSxFQUFHLENBQUg7TUFBTSxDQUFBLEVBQUcsQ0FBVDtNQUFZLE1BQUEsRUFBUSxHQUFwQjtNQUF5QixDQUFBLEVBQUcsRUFBNUI7S0FBVjtJQUNBLFdBQUEsRUFBYTtNQUFBLENBQUEsRUFBRyxDQUFIO01BQU0sTUFBQSxFQUFRLEdBQWQ7S0FEYjtHQUREOzs7QUFNSyxPQUFPLENBQUM7OztFQUNBLGdDQUFDLE9BQUQ7O01BQUMsVUFBUTs7Ozs7Ozs7Ozs7O01BQ3JCLE9BQU8sQ0FBQyxpQkFBa0I7OztNQUMxQixPQUFPLENBQUMsYUFBYzs7O01BQ3RCLE9BQU8sQ0FBQyxPQUFRO1FBQUEsQ0FBQSxFQUFHLENBQUg7UUFBTSxDQUFBLEVBQUcsQ0FBVDtRQUFZLENBQUEsRUFBRyxDQUFmO1FBQWtCLENBQUEsRUFBRyxHQUFyQjs7O0lBQ2hCLHdEQUFNLE9BQU47SUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFuQixHQUE4QjtJQUM5QixJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFuQixHQUE0QjtJQUc1QixJQUFDLENBQUEs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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIkID0gXG5cdGJvdW5kczpcblx0XHR0b3BCb3VuZDogeDogMCwgeTogMCwgaGVpZ2h0OiA0MDAsIGQ6IFtdXG5cdFx0Ym90dG9tQm91bmQ6IHg6IDAsIGhlaWdodDogNDAwXG5cdFx0I2xlZnRCb3VuZDogeDogMCwgeTogMCwgd2lkdGg6IDQwMFxuXHRcdCNyaWdodEJvdW5kOiB5OiAwLCB3aWR0aDogNDAwXG5cbmNsYXNzIGV4cG9ydHMuQW5kcm9pZFNjcm9sbENvbXBvbmVudCBleHRlbmRzIFNjcm9sbENvbXBvbmVudFxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnM9e30pIC0+XG5cdFx0b3B0aW9ucy5vdmVyc2Nyb2xsR2xvdyA/PSB0cnVlXG5cdFx0b3B0aW9ucy5lZGdlRWZmZWN0ID89IHRydWVcblx0XHRvcHRpb25zLmZpbGwgPz0gcjogMCwgZzogMCwgYjogMCwgYTogLjI0XG5cdFx0c3VwZXIgb3B0aW9uc1xuXHRcdFxuXHRcdCMgRGlzYWJsZSBvdmVyZHJhZyBhbmQgYm91bmNlXG5cdFx0QGNvbnRlbnQuZHJhZ2dhYmxlLm92ZXJkcmFnID0gZmFsc2Vcblx0XHRAY29udGVudC5kcmFnZ2FibGUuYm91bmNlID0gZmFsc2Vcblx0XHRcblx0XHQjIENyZWF0ZSBib3VuZHNcblx0XHRAYm91bmRzID0gW11cblx0XHRAX3NldEJvdW5kcygpXG5cdFx0XG5cdFx0IyBPdmVyc2Nyb2xsIGFuaW1hdGlvbiBcblx0XHRAb3ZlcnNjcm9sbEVuZFZhbHVlID0gMFxuXHRcdEBvdmVyc2Nyb2xsRW5kID0gbmV3IEFuaW1hdGlvblxuXHRcdFx0bGF5ZXI6IEBcblx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdG92ZXJzY3JvbGxFbmRWYWx1ZTogMVxuXHRcdFx0Y3VydmU6IFwiYmVpemVyLWN1cnZlKDAuMCwgMC4wLCAwLjIsIDEpXCJcblx0XHRcdHRpbWU6IC4zMDBcblx0XHRcblx0XHQjIFNldHVwIGV2ZW50c1xuXHRcdEBvbihFdmVudHMuVG91Y2hTdGFydCwgQF90b3VjaFN0YXJ0KVxuXHRcdEBvbihFdmVudHMuVG91Y2hNb3ZlLCBAX3RvdWNoTW92ZSlcblx0XHRAb24oRXZlbnRzLlRvdWNoRW5kLCBAX3RvdWNoRW5kKVxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJ0b3VjaGVuZFwiLCBAX3RvdWNoRW5kXG5cdFx0XG5cdCMgRVZFTlRTXG5cdF90b3VjaFN0YXJ0OiAoZSkgPT5cblx0XHQjIFRvdWNoZWQgaXMgdHJ1ZVxuXHRcdEB0b3VjaGVkID0gdHJ1ZVxuXHRcdFxuXHRcdCMgU3RvcCBhbmltYXRpb24gLyByZXNldCB2YWx1ZSBcblx0XHRAb3ZlcnNjcm9sbEVuZC5zdG9wKClcblx0XHRGcmFtZXIuTG9vcC5vZmYgXCJ1cGRhdGVcIiwgQF91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWVcblx0XHRAb3ZlcnNjcm9sbEVuZFZhbHVlID0gMFxuXHRcdFxuXHRcdCMgU2V0IHRvdWNoIHggYW5kIHlcblx0XHRpZiBVdGlscy5pc01vYmlsZSgpXG5cdFx0XHRAdG91Y2ggPSBcblx0XHRcdFx0eDogZS50b3VjaGVzWzBdLnBhZ2VYXG5cdFx0XHRcdHk6IGUudG91Y2hlc1swXS5wYWdlWVxuXHRcdGVsc2Vcblx0XHRcdEB0b3VjaCA9IFxuXHRcdFx0XHR4OiBlLm9mZnNldFhcblx0XHRcdFx0eTogZS5vZmZzZXRZXG5cdFx0XHRcblx0X3RvdWNoTW92ZTogKGUpID0+XG5cdFx0IyBPdmVyc2Nyb2xsXG5cdFx0aWYgQHRvdWNoZWRcblx0XHRcdEBfb3ZlcnNjcm9sbFkoZSkgaWYgQHNjcm9sbFZlcnRpY2FsIGFuZCBAb3ZlcnNjcm9sbEdsb3cgaXMgdHJ1ZVxuXHRcdFxuXHRfdG91Y2hFbmQ6IChlKSA9PlxuXHRcdCMgVG91Y2hlZCBpcyBmYWxzZSBcblx0XHRAdG91Y2hlZCA9IGZhbHNlXG5cdFx0XG5cdFx0IyBTZXQgZW5kIHZhbHVlc1xuXHRcdGZvciBiIGluIEBib3VuZHMgd2hlbiBiLmlzT3ZlcnNjcm9sbGVkIGlzIHRydWVcblx0XHRcdGIuZW5kWSA9IGIuZGVsdGFZXG5cdFx0XHRiLmVuZFNpZGVZID0gYi5kZWx0YVNpZGVZXG5cdFx0XHRiLmVuZEFscGhhID0gYi5kZWx0YUFscGhhXG5cdFx0XG5cdFx0IyBPdmVyc2Nyb2xsIGFuaW1hdGlvbiBcblx0XHRAb3ZlcnNjcm9sbEVuZC5zdGFydCgpXG5cdFx0QG92ZXJzY3JvbGxFbmQub25BbmltYXRpb25FbmQgLT5cblx0XHRcdEZyYW1lci5Mb29wLm9mZiBcInVwZGF0ZVwiLCBAb3B0aW9ucy5sYXllci5fdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlXG5cdFx0XHRcblx0XHRGcmFtZXIuTG9vcC5vbiBcInVwZGF0ZVwiLCBAX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZVxuXHRcdFx0XG5cdCMgRlVOQ1RJT05TXG5cdF9vdmVyc2Nyb2xsWTogKGUpID0+XG5cdFx0dG9wID0gQGJvdW5kc1swXVxuXHRcdGJvdHRvbSA9IEBib3VuZHNbMF1cblx0XHRldmVudFggPSBpZiBVdGlscy5pc01vYmlsZSgpIHRoZW4gZS50b3VjaGVzWzBdLnBhZ2VYIGVsc2UgZS5vZmZzZXRYXG5cdFx0ZXZlbnRZID0gaWYgVXRpbHMuaXNNb2JpbGUoKSB0aGVuIGUudG91Y2hlc1swXS5wYWdlWSBlbHNlIGUub2Zmc2V0WVxuXHRcdFxuXHRcdGlmIEBzY3JvbGxZIGlzIDBcblx0XHRcdGIgPSBAYm91bmRzWzBdXG5cdFx0XHRiLmlzT3ZlcnNjcm9sbGVkID0gdHJ1ZVxuXHRcdFx0XG5cdFx0XHQjIERlbHRhc1xuXHRcdFx0ZCA9IGIuZFxuXHRcdFx0XG5cdFx0XHRkWzVdID0gYi5kZWx0YVkgPSBVdGlscy5tb2R1bGF0ZSBldmVudFkgLSBAdG91Y2gueSwgWzAsIGIuaGVpZ2h0XSwgWzAsIGIuaGVpZ2h0XSwgdHJ1ZVxuXHRcdFx0ZFszXSA9IGRbN10gPSBiLmRlbHRhU2lkZVkgPSBVdGlscy5tb2R1bGF0ZSBiLmRlbHRhWSwgWzAsIGIuaGVpZ2h0XSwgWzAsIGIuaGVpZ2h0ICogLjIwXSwgdHJ1ZVxuXHRcdFx0ZFsyXSA9IGIuZGVsdGFMZWZ0U2lkZVggPSBVdGlscy5tb2R1bGF0ZSBldmVudFgsIFswLCBiLndpZHRoXSwgWy0oYi53aWR0aC80KSwgMF0sIHRydWVcblx0XHRcdGRbNl0gPSBiLmRlbHRhUmlnaHRTaWRlWCA9IFV0aWxzLm1vZHVsYXRlIGV2ZW50WCwgWzAsIGIud2lkdGhdLCBbYi53aWR0aCwgYi53aWR0aCArIChiLndpZHRoLzQpXSwgdHJ1ZVxuXHRcdFx0Yi5kZWx0YUFscGhhID0gVXRpbHMubW9kdWxhdGUgYi5kZWx0YVksIFswLCBiLmhlaWdodF0sIFswLCBAZmlsbC5hXSwgdHJ1ZVxuXHRcdFx0XG5cdFx0XHQjIFVwZGF0ZSBTVkdcblx0XHRcdEBfdXBkYXRlU1ZHKGIsIGQsIGIuZGVsdGFBbHBoYSlcblx0XHRcdFxuXHRcdGVsc2UgaWYgQHNjcm9sbFkgaXMgTWF0aC5mbG9vcihAY29udGVudC5oZWlnaHQgLSBAaGVpZ2h0KVxuXHRcdFx0YiA9IEBib3VuZHNbMV1cblx0XHRcdGIuaXNPdmVyc2Nyb2xsZWQgPSB0cnVlXG5cdFx0XHRcblx0XHRcdCMgRGVsdGFzXG5cdFx0XHRkID0gYi5kXG5cdFx0XHRcblx0XHRcdGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlIEB0b3VjaC55IC0gZXZlbnRZLCBbYi5oZWlnaHQsIDBdLCBbMCwgYi5oZWlnaHRdLCB0cnVlXG5cdFx0XHRkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbYi5oZWlnaHQsIDBdLCBbYi5oZWlnaHQsIGIuaGVpZ2h0IC0gKGIuaGVpZ2h0ICogLjIwKV0sIHRydWVcblx0XHRcdGRbMl0gPSBiLmRlbHRhTGVmdFNpZGVYID0gVXRpbHMubW9kdWxhdGUgZXZlbnRYLCBbMCwgYi53aWR0aF0sIFstKGIud2lkdGgvNCksIDBdLCB0cnVlXG5cdFx0XHRkWzZdID0gYi5kZWx0YVJpZ2h0U2lkZVggPSBVdGlscy5tb2R1bGF0ZSBldmVudFgsIFswLCBiLndpZHRoXSwgW2Iud2lkdGgsIGIud2lkdGggKyAoYi53aWR0aC80KV0sIHRydWVcblx0XHRcdGIuZGVsdGFBbHBoYSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbYi5oZWlnaHQsIDBdLCBbMCwgQGZpbGwuYV0sIHRydWVcblx0XHRcdFxuXHRcdFx0IyBVcGRhdGUgU1ZHXG5cdFx0XHRAX3VwZGF0ZVNWRyhiLCBkLCBiLmRlbHRhQWxwaGEpXG5cdFx0XG5cdFx0ZWxzZSBcblx0XHRcdHRvcC5pc092ZXJzY3JvbGxlZCA9IGZhbHNlXG5cdFx0XHRib3R0b20uaXNPdmVyc2Nyb2xsZWQgPSBmYWxzZVxuXHRcdFx0XG5cdF91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWU6ID0+XG5cdFx0Zm9yIGIgaW4gQGJvdW5kcyB3aGVuIGIuaXNPdmVyc2Nyb2xsZWQgaXMgdHJ1ZVxuXHRcdFx0b3B0aW9ucyA9IHN3aXRjaCBcblx0XHRcdFx0d2hlbiBiLm5hbWUgaXMgXCJ0b3BCb3VuZFwiXG5cdFx0XHRcdFx0ZCA9IGIuZFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlIEBvdmVyc2Nyb2xsRW5kVmFsdWUsIFswLCAxXSwgW2IuZW5kWSwgMF0sIHRydWVcblx0XHRcdFx0XHRkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbYi5lbmRZLCAwXSwgW2IuZW5kU2lkZVksIDBdLCB0cnVlXG5cdFx0XHRcdFx0Yi5kZWx0YUFscGhhID0gVXRpbHMubW9kdWxhdGUgYi5kZWx0YVksIFtiLmVuZFksIDBdLCBbYi5lbmRBbHBoYSwgMF0sIHRydWVcblx0XHRcdFx0XHRcblx0XHRcdFx0d2hlbiBiLm5hbWUgaXMgXCJib3R0b21Cb3VuZFwiXG5cdFx0XHRcdFx0ZCA9IGIuZFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlIEBvdmVyc2Nyb2xsRW5kVmFsdWUsIFswLCAxXSwgW2IuZW5kWSwgYi5oZWlnaHRdLCB0cnVlXG5cdFx0XHRcdFx0ZFszXSA9IGRbN10gPSBiLmRlbHRhU2lkZVkgPSBVdGlscy5tb2R1bGF0ZSBiLmRlbHRhWSwgW2IuZW5kWSwgYi5oZWlnaHRdLCBbYi5lbmRTaWRlWSwgYi5oZWlnaHRdLCB0cnVlXG5cdFx0XHRcdFx0Yi5kZWx0YUFscGhhID0gVXRpbHMubW9kdWxhdGUgYi5kZWx0YVksIFtiLmVuZFksIGIuaGVpZ2h0XSwgW2IuZW5kQWxwaGEsIDBdLCB0cnVlXG5cdFx0XHRcdFx0XG5cdFx0XHQjIFVwZGF0ZSBTVkdcblx0XHRcdEBfdXBkYXRlU1ZHKGIsIGQsIGIuZGVsdGFBbHBoYSlcblx0XHRcblx0X3NldEJvdW5kczogPT5cblx0XHRmb3IgbmFtZSwgYm91bmQgb2YgJC5ib3VuZHNcblx0XHRcdGkgPSBfLmtleXMoJC5ib3VuZHMpLmluZGV4T2YgXCIje25hbWV9XCJcblx0XHRcdFxuXHRcdFx0b3B0aW9ucyA9IHN3aXRjaFxuXHRcdFx0XHR3aGVuIGkgaXMgMFxuXHRcdFx0XHRcdGJvdW5kLndpZHRoID0gQHdpZHRoXG5cdFx0XHRcdFx0Ym91bmQuZCA9IFswLCAwLCAwLCAwLCBib3VuZC53aWR0aC8yLCAwLCBib3VuZC53aWR0aCwgMCwgYm91bmQud2lkdGgsIDBdXG5cdFx0XHRcdHdoZW4gaSBpcyAxXG5cdFx0XHRcdFx0Ym91bmQueSA9IEBoZWlnaHQgLSBib3VuZC5oZWlnaHRcblx0XHRcdFx0XHRib3VuZC53aWR0aCA9IEB3aWR0aFxuXHRcdFx0XHRcdGJvdW5kLmQgPSBbMCwgYm91bmQuaGVpZ2h0LCAwLCBib3VuZC5oZWlnaHQsIGJvdW5kLndpZHRoLzIsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodF1cblx0XHRcdFx0XHRcblx0XHRcdCMgQ3JlYXRlIGJvdW5kXHRcdFxuXHRcdFx0QF9jcmVhdGVCb3VuZChuYW1lLCBib3VuZClcblx0XHRcdFx0XHRcblx0X2NyZWF0ZUJvdW5kOiAobmFtZSwgYm91bmQpID0+XG5cdFx0YiA9IG5ldyBMYXllciBcblx0XHRcdHg6IGJvdW5kLnhcblx0XHRcdHk6IGJvdW5kLnlcblx0XHRcdHdpZHRoOiBib3VuZC53aWR0aFxuXHRcdFx0aGVpZ2h0OiBib3VuZC5oZWlnaHRcblx0XHRcdGQ6IGJvdW5kLmRcblx0XHRcdG5hbWU6IG5hbWVcblx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJcIiBcblx0XHRcdHBhcmVudDogQFxuXHRcdFx0XG5cdFx0IyBTZXQgaXNPdmVyc2Nyb2xsZWRcblx0XHRiLmlzT3ZlcnNjcm9sbGVkID0gZmFsc2Vcblx0XHRcdFxuXHRcdCMgUHVzaCB0byBhcnJheVxuXHRcdEBib3VuZHMucHVzaCBiXG5cdFx0XG5cdFx0IyBDcmVhdGUgU1ZHXG5cdFx0QF9jcmVhdGVTVkcoYilcblx0XHRcblx0X2NyZWF0ZVNWRzogKGJvdW5kKSA9PlxuXHRcdGJvdW5kLnN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwic3ZnXCJcblx0XHRib3VuZC5zdmcuc2V0QXR0cmlidXRlIFwid2lkdGhcIiwgYm91bmQud2lkdGhcblx0XHRib3VuZC5zdmcuc2V0QXR0cmlidXRlIFwiaGVpZ2h0XCIsIGJvdW5kLmhlaWdodFxuXHRcdFxuXHRcdGJvdW5kLnBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIlxuXHRcdGJvdW5kLnBhdGguc2V0QXR0cmlidXRlIFwiZmlsbFwiLCBcInJnYmEoI3tAZmlsbC5yfSwgI3tAZmlsbC5nfSwgI3tAZmlsbC5ifSwgI3tAZmlsbC5hfSlcIlxuXHRcdGJvdW5kLnBhdGguc2V0QXR0cmlidXRlIFwiZFwiLCBcIk0je2JvdW5kLmRbMF19LCN7Ym91bmQuZFsxXX0gTCN7Ym91bmQuZFsyXX0sICN7Ym91bmQuZFszXX0gUSN7Ym91bmQuZFs0XX0sI3tib3VuZC5kWzVdfSAje2JvdW5kLmRbNl19LCN7Ym91bmQuZFs3XX0gTCN7Ym91bmQuZFs4XX0sICN7Ym91bmQuZFs5XX1cIlxuXHRcdFxuXHRcdCMgQXBwZW5kIFxuXHRcdGJvdW5kLnN2Zy5hcHBlbmRDaGlsZCBib3VuZC5wYXRoIFxuXHRcdGJvdW5kLl9lbGVtZW50LmFwcGVuZENoaWxkIGJvdW5kLnN2Z1xuXHRcdFxuXHRfdXBkYXRlU1ZHOiAoYm91bmQsIGQsIGFscGhhKSA9PlxuXHRcdGJvdW5kLnBhdGguc2V0QXR0cmlidXRlIFwiZFwiLCBcIk0je2RbMF19LCN7ZFsxXX0gTCN7ZFsyXX0sICN7ZFszXX0gUSN7ZFs0XX0sI3tkWzVdfSAje2RbNl19LCN7ZFs3XX0gTCN7ZFs4XX0sICN7ZFs5XX1cIlxuXHRcdGJvdW5kLnBhdGguc2V0QXR0cmlidXRlIFwiZmlsbFwiLCBcInJnYmEoI3tAZmlsbC5yfSwgI3tAZmlsbC5nfSwgI3tAZmlsbC5ifSwgI3thbHBoYX0pXCJcblx0XHRcdFx0XHRcblx0IyBERUZJTlRJT05TXG5cdEBkZWZpbmUgXCJmaWxsXCIsXG5cdFx0Z2V0OiAtPiBAX2ZpbGxcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQF9maWxsID0gdmFsdWUgXG5cdFx0XG5cdEBkZWZpbmUgXCJkXCIsIFxuXHRcdGdldDogLT4gQF9kIFxuXHRcdHNldDogKHZhbHVlKSAtPiBAX2QgPSB2YWx1ZVxuXHRcdFxuXHRAZGVmaW5lIFwidG91Y2hlZFwiLFxuXHRcdGdldDogLT4gQF90b3VjaGVkXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBfdG91Y2hlZCA9IHZhbHVlXG5cdFx0XG5cdEBkZWZpbmUgXCJ0b3VjaFwiLFxuXHRcdGdldDogLT4gQF90b3VjaCBcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQF90b3VjaCA9IHZhbHVlXG5cblx0QGRlZmluZSBcIm92ZXJzY3JvbGxHbG93XCIsXG5cdFx0Z2V0OiAtPiBAX292ZXJzY3JvbGxHbG93IFxuXHRcdHNldDogKHZhbHVlKSAtPiBAX292ZXJzY3JvbGxHbG93ID0gdmFsdWVcblx0XHRcblx0QGRlZmluZSBcIm92ZXJzY3JvbGxFbmRWYWx1ZVwiLFx0XG5cdGdldDogLT4gQF9vdmVyc2Nyb2xsRW5kVmFsdWVcblx0c2V0OiAodmFsdWUpIC0+IEBfb3ZlcnNjcm9sbEVuZFZhbHVlID0gdmFsdWUiLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgJCxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4kID0ge1xuICBib3VuZHM6IHtcbiAgICB0b3BCb3VuZDoge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICBoZWlnaHQ6IDQwMCxcbiAgICAgIGQ6IFtdXG4gICAgfSxcbiAgICBib3R0b21Cb3VuZDoge1xuICAgICAgeDogMCxcbiAgICAgIGhlaWdodDogNDAwXG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzLkFuZHJvaWRTY3JvbGxDb21wb25lbnQgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoQW5kcm9pZFNjcm9sbENvbXBvbmVudCwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gQW5kcm9pZFNjcm9sbENvbXBvbmVudChvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVTVkcgPSBiaW5kKHRoaXMuX3VwZGF0ZVNWRywgdGhpcyk7XG4gICAgdGhpcy5fY3JlYXRlU1ZHID0gYmluZCh0aGlzLl9jcmVhdGVTVkcsIHRoaXMpO1xuICAgIHRoaXMuX2NyZWF0ZUJvdW5kID0gYmluZCh0aGlzLl9jcmVhdGVCb3VuZCwgdGhpcyk7XG4gICAgdGhpcy5fc2V0Qm91bmRzID0gYmluZCh0aGlzLl9zZXRCb3VuZHMsIHRoaXMpO1xuICAgIHRoaXMuX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZSA9IGJpbmQodGhpcy5fdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlLCB0aGlzKTtcbiAgICB0aGlzLl9vdmVyc2Nyb2xsWSA9IGJpbmQodGhpcy5fb3ZlcnNjcm9sbFksIHRoaXMpO1xuICAgIHRoaXMuX3RvdWNoRW5kID0gYmluZCh0aGlzLl90b3VjaEVuZCwgdGhpcyk7XG4gICAgdGhpcy5fdG91Y2hNb3ZlID0gYmluZCh0aGlzLl90b3VjaE1vdmUsIHRoaXMpO1xuICAgIHRoaXMuX3RvdWNoU3RhcnQgPSBiaW5kKHRoaXMuX3RvdWNoU3RhcnQsIHRoaXMpO1xuICAgIGlmIChvcHRpb25zLm92ZXJzY3JvbGxHbG93ID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMub3ZlcnNjcm9sbEdsb3cgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5lZGdlRWZmZWN0ID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMuZWRnZUVmZmVjdCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmZpbGwgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucy5maWxsID0ge1xuICAgICAgICByOiAwLFxuICAgICAgICBnOiAwLFxuICAgICAgICBiOiAwLFxuICAgICAgICBhOiAuMjRcbiAgICAgIH07XG4gICAgfVxuICAgIEFuZHJvaWRTY3JvbGxDb21wb25lbnQuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgdGhpcy5jb250ZW50LmRyYWdnYWJsZS5vdmVyZHJhZyA9IGZhbHNlO1xuICAgIHRoaXMuY29udGVudC5kcmFnZ2FibGUuYm91bmNlID0gZmFsc2U7XG4gICAgdGhpcy5ib3VuZHMgPSBbXTtcbiAgICB0aGlzLl9zZXRCb3VuZHMoKTtcbiAgICB0aGlzLm92ZXJzY3JvbGxFbmRWYWx1ZSA9IDA7XG4gICAgdGhpcy5vdmVyc2Nyb2xsRW5kID0gbmV3IEFuaW1hdGlvbih7XG4gICAgICBsYXllcjogdGhpcyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgb3ZlcnNjcm9sbEVuZFZhbHVlOiAxXG4gICAgICB9LFxuICAgICAgY3VydmU6IFwiYmVpemVyLWN1cnZlKDAuMCwgMC4wLCAwLjIsIDEpXCIsXG4gICAgICB0aW1lOiAuMzAwXG4gICAgfSk7XG4gICAgdGhpcy5vbihFdmVudHMuVG91Y2hTdGFydCwgdGhpcy5fdG91Y2hTdGFydCk7XG4gICAgdGhpcy5vbihFdmVudHMuVG91Y2hNb3ZlLCB0aGlzLl90b3VjaE1vdmUpO1xuICAgIHRoaXMub24oRXZlbnRzLlRvdWNoRW5kLCB0aGlzLl90b3VjaEVuZCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsIHRoaXMuX3RvdWNoRW5kKTtcbiAgfVxuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl90b3VjaFN0YXJ0ID0gZnVuY3Rpb24oZSkge1xuICAgIHRoaXMudG91Y2hlZCA9IHRydWU7XG4gICAgdGhpcy5vdmVyc2Nyb2xsRW5kLnN0b3AoKTtcbiAgICBGcmFtZXIuTG9vcC5vZmYoXCJ1cGRhdGVcIiwgdGhpcy5fdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlKTtcbiAgICB0aGlzLm92ZXJzY3JvbGxFbmRWYWx1ZSA9IDA7XG4gICAgaWYgKFV0aWxzLmlzTW9iaWxlKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvdWNoID0ge1xuICAgICAgICB4OiBlLnRvdWNoZXNbMF0ucGFnZVgsXG4gICAgICAgIHk6IGUudG91Y2hlc1swXS5wYWdlWVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudG91Y2ggPSB7XG4gICAgICAgIHg6IGUub2Zmc2V0WCxcbiAgICAgICAgeTogZS5vZmZzZXRZXG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LnByb3RvdHlwZS5fdG91Y2hNb3ZlID0gZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLnRvdWNoZWQpIHtcbiAgICAgIGlmICh0aGlzLnNjcm9sbFZlcnRpY2FsICYmIHRoaXMub3ZlcnNjcm9sbEdsb3cgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX292ZXJzY3JvbGxZKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LnByb3RvdHlwZS5fdG91Y2hFbmQgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGIsIGosIGxlbiwgcmVmO1xuICAgIHRoaXMudG91Y2hlZCA9IGZhbHNlO1xuICAgIHJlZiA9IHRoaXMuYm91bmRzO1xuICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgYiA9IHJlZltqXTtcbiAgICAgIGlmICghKGIuaXNPdmVyc2Nyb2xsZWQgPT09IHRydWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgYi5lbmRZID0gYi5kZWx0YVk7XG4gICAgICBiLmVuZFNpZGVZID0gYi5kZWx0YVNpZGVZO1xuICAgICAgYi5lbmRBbHBoYSA9IGIuZGVsdGFBbHBoYTtcbiAgICB9XG4gICAgdGhpcy5vdmVyc2Nyb2xsRW5kLnN0YXJ0KCk7XG4gICAgdGhpcy5vdmVyc2Nyb2xsRW5kLm9uQW5pbWF0aW9uRW5kKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEZyYW1lci5Mb29wLm9mZihcInVwZGF0ZVwiLCB0aGlzLm9wdGlvbnMubGF5ZXIuX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIEZyYW1lci5Mb29wLm9uKFwidXBkYXRlXCIsIHRoaXMuX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZSk7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX292ZXJzY3JvbGxZID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciBiLCBib3R0b20sIGQsIGV2ZW50WCwgZXZlbnRZLCB0b3A7XG4gICAgdG9wID0gdGhpcy5ib3VuZHNbMF07XG4gICAgYm90dG9tID0gdGhpcy5ib3VuZHNbMF07XG4gICAgZXZlbnRYID0gVXRpbHMuaXNNb2JpbGUoKSA/IGUudG91Y2hlc1swXS5wYWdlWCA6IGUub2Zmc2V0WDtcbiAgICBldmVudFkgPSBVdGlscy5pc01vYmlsZSgpID8gZS50b3VjaGVzWzBdLnBhZ2VZIDogZS5vZmZzZXRZO1xuICAgIGlmICh0aGlzLnNjcm9sbFkgPT09IDApIHtcbiAgICAgIGIgPSB0aGlzLmJvdW5kc1swXTtcbiAgICAgIGIuaXNPdmVyc2Nyb2xsZWQgPSB0cnVlO1xuICAgICAgZCA9IGIuZDtcbiAgICAgIGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlKGV2ZW50WSAtIHRoaXMudG91Y2gueSwgWzAsIGIuaGVpZ2h0XSwgWzAsIGIuaGVpZ2h0XSwgdHJ1ZSk7XG4gICAgICBkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbMCwgYi5oZWlnaHRdLCBbMCwgYi5oZWlnaHQgKiAuMjBdLCB0cnVlKTtcbiAgICAgIGRbMl0gPSBiLmRlbHRhTGVmdFNpZGVYID0gVXRpbHMubW9kdWxhdGUoZXZlbnRYLCBbMCwgYi53aWR0aF0sIFstKGIud2lkdGggLyA0KSwgMF0sIHRydWUpO1xuICAgICAgZFs2XSA9IGIuZGVsdGFSaWdodFNpZGVYID0gVXRpbHMubW9kdWxhdGUoZXZlbnRYLCBbMCwgYi53aWR0aF0sIFtiLndpZHRoLCBiLndpZHRoICsgKGIud2lkdGggLyA0KV0sIHRydWUpO1xuICAgICAgYi5kZWx0YUFscGhhID0gVXRpbHMubW9kdWxhdGUoYi5kZWx0YVksIFswLCBiLmhlaWdodF0sIFswLCB0aGlzLmZpbGwuYV0sIHRydWUpO1xuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZVNWRyhiLCBkLCBiLmRlbHRhQWxwaGEpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zY3JvbGxZID09PSBNYXRoLmZsb29yKHRoaXMuY29udGVudC5oZWlnaHQgLSB0aGlzLmhlaWdodCkpIHtcbiAgICAgIGIgPSB0aGlzLmJvdW5kc1sxXTtcbiAgICAgIGIuaXNPdmVyc2Nyb2xsZWQgPSB0cnVlO1xuICAgICAgZCA9IGIuZDtcbiAgICAgIGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlKHRoaXMudG91Y2gueSAtIGV2ZW50WSwgW2IuaGVpZ2h0LCAwXSwgWzAsIGIuaGVpZ2h0XSwgdHJ1ZSk7XG4gICAgICBkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbYi5oZWlnaHQsIDBdLCBbYi5oZWlnaHQsIGIuaGVpZ2h0IC0gKGIuaGVpZ2h0ICogLjIwKV0sIHRydWUpO1xuICAgICAgZFsyXSA9IGIuZGVsdGFMZWZ0U2lkZVggPSBVdGlscy5tb2R1bGF0ZShldmVudFgsIFswLCBiLndpZHRoXSwgWy0oYi53aWR0aCAvIDQpLCAwXSwgdHJ1ZSk7XG4gICAgICBkWzZdID0gYi5kZWx0YVJpZ2h0U2lkZVggPSBVdGlscy5tb2R1bGF0ZShldmVudFgsIFswLCBiLndpZHRoXSwgW2Iud2lkdGgsIGIud2lkdGggKyAoYi53aWR0aCAvIDQpXSwgdHJ1ZSk7XG4gICAgICBiLmRlbHRhQWxwaGEgPSBVdGlscy5tb2R1bGF0ZShiLmRlbHRhWSwgW2IuaGVpZ2h0LCAwXSwgWzAsIHRoaXMuZmlsbC5hXSwgdHJ1ZSk7XG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlU1ZHKGIsIGQsIGIuZGVsdGFBbHBoYSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvcC5pc092ZXJzY3JvbGxlZCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIGJvdHRvbS5pc092ZXJzY3JvbGxlZCA9IGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LnByb3RvdHlwZS5fdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGIsIGQsIGosIGxlbiwgb3B0aW9ucywgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuYm91bmRzO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGIgPSByZWZbal07XG4gICAgICBpZiAoIShiLmlzT3ZlcnNjcm9sbGVkID09PSB0cnVlKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHN3aXRjaCAoZmFsc2UpIHtcbiAgICAgICAgICBjYXNlIGIubmFtZSAhPT0gXCJ0b3BCb3VuZFwiOlxuICAgICAgICAgICAgZCA9IGIuZDtcbiAgICAgICAgICAgIGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlKHRoaXMub3ZlcnNjcm9sbEVuZFZhbHVlLCBbMCwgMV0sIFtiLmVuZFksIDBdLCB0cnVlKTtcbiAgICAgICAgICAgIGRbM10gPSBkWzddID0gYi5kZWx0YVNpZGVZID0gVXRpbHMubW9kdWxhdGUoYi5kZWx0YVksIFtiLmVuZFksIDBdLCBbYi5lbmRTaWRlWSwgMF0sIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIGIuZGVsdGFBbHBoYSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbYi5lbmRZLCAwXSwgW2IuZW5kQWxwaGEsIDBdLCB0cnVlKTtcbiAgICAgICAgICBjYXNlIGIubmFtZSAhPT0gXCJib3R0b21Cb3VuZFwiOlxuICAgICAgICAgICAgZCA9IGIuZDtcbiAgICAgICAgICAgIGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlKHRoaXMub3ZlcnNjcm9sbEVuZFZhbHVlLCBbMCwgMV0sIFtiLmVuZFksIGIuaGVpZ2h0XSwgdHJ1ZSk7XG4gICAgICAgICAgICBkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbYi5lbmRZLCBiLmhlaWdodF0sIFtiLmVuZFNpZGVZLCBiLmhlaWdodF0sIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIGIuZGVsdGFBbHBoYSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbYi5lbmRZLCBiLmhlaWdodF0sIFtiLmVuZEFscGhhLCAwXSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pLmNhbGwodGhpcyk7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5fdXBkYXRlU1ZHKGIsIGQsIGIuZGVsdGFBbHBoYSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LnByb3RvdHlwZS5fc2V0Qm91bmRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJvdW5kLCBpLCBuYW1lLCBvcHRpb25zLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gJC5ib3VuZHM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAobmFtZSBpbiByZWYpIHtcbiAgICAgIGJvdW5kID0gcmVmW25hbWVdO1xuICAgICAgaSA9IF8ua2V5cygkLmJvdW5kcykuaW5kZXhPZihcIlwiICsgbmFtZSk7XG4gICAgICBvcHRpb25zID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICBzd2l0Y2ggKGZhbHNlKSB7XG4gICAgICAgICAgY2FzZSBpICE9PSAwOlxuICAgICAgICAgICAgYm91bmQud2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICAgICAgcmV0dXJuIGJvdW5kLmQgPSBbMCwgMCwgMCwgMCwgYm91bmQud2lkdGggLyAyLCAwLCBib3VuZC53aWR0aCwgMCwgYm91bmQud2lkdGgsIDBdO1xuICAgICAgICAgIGNhc2UgaSAhPT0gMTpcbiAgICAgICAgICAgIGJvdW5kLnkgPSB0aGlzLmhlaWdodCAtIGJvdW5kLmhlaWdodDtcbiAgICAgICAgICAgIGJvdW5kLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgICAgIHJldHVybiBib3VuZC5kID0gWzAsIGJvdW5kLmhlaWdodCwgMCwgYm91bmQuaGVpZ2h0LCBib3VuZC53aWR0aCAvIDIsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodF07XG4gICAgICAgIH1cbiAgICAgIH0pLmNhbGwodGhpcyk7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5fY3JlYXRlQm91bmQobmFtZSwgYm91bmQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX2NyZWF0ZUJvdW5kID0gZnVuY3Rpb24obmFtZSwgYm91bmQpIHtcbiAgICB2YXIgYjtcbiAgICBiID0gbmV3IExheWVyKHtcbiAgICAgIHg6IGJvdW5kLngsXG4gICAgICB5OiBib3VuZC55LFxuICAgICAgd2lkdGg6IGJvdW5kLndpZHRoLFxuICAgICAgaGVpZ2h0OiBib3VuZC5oZWlnaHQsXG4gICAgICBkOiBib3VuZC5kLFxuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogXCJcIixcbiAgICAgIHBhcmVudDogdGhpc1xuICAgIH0pO1xuICAgIGIuaXNPdmVyc2Nyb2xsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmJvdW5kcy5wdXNoKGIpO1xuICAgIHJldHVybiB0aGlzLl9jcmVhdGVTVkcoYik7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX2NyZWF0ZVNWRyA9IGZ1bmN0aW9uKGJvdW5kKSB7XG4gICAgYm91bmQuc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJzdmdcIik7XG4gICAgYm91bmQuc3ZnLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIGJvdW5kLndpZHRoKTtcbiAgICBib3VuZC5zdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIGJvdW5kLmhlaWdodCk7XG4gICAgYm91bmQucGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICBib3VuZC5wYXRoLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJyZ2JhKFwiICsgdGhpcy5maWxsLnIgKyBcIiwgXCIgKyB0aGlzLmZpbGwuZyArIFwiLCBcIiArIHRoaXMuZmlsbC5iICsgXCIsIFwiICsgdGhpcy5maWxsLmEgKyBcIilcIik7XG4gICAgYm91bmQucGF0aC5zZXRBdHRyaWJ1dGUoXCJkXCIsIFwiTVwiICsgYm91bmQuZFswXSArIFwiLFwiICsgYm91bmQuZFsxXSArIFwiIExcIiArIGJvdW5kLmRbMl0gKyBcIiwgXCIgKyBib3VuZC5kWzNdICsgXCIgUVwiICsgYm91bmQuZFs0XSArIFwiLFwiICsgYm91bmQuZFs1XSArIFwiIFwiICsgYm91bmQuZFs2XSArIFwiLFwiICsgYm91bmQuZFs3XSArIFwiIExcIiArIGJvdW5kLmRbOF0gKyBcIiwgXCIgKyBib3VuZC5kWzldKTtcbiAgICBib3VuZC5zdmcuYXBwZW5kQ2hpbGQoYm91bmQucGF0aCk7XG4gICAgcmV0dXJuIGJvdW5kLl9lbGVtZW50LmFwcGVuZENoaWxkKGJvdW5kLnN2Zyk7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX3VwZGF0ZVNWRyA9IGZ1bmN0aW9uKGJvdW5kLCBkLCBhbHBoYSkge1xuICAgIGJvdW5kLnBhdGguc2V0QXR0cmlidXRlKFwiZFwiLCBcIk1cIiArIGRbMF0gKyBcIixcIiArIGRbMV0gKyBcIiBMXCIgKyBkWzJdICsgXCIsIFwiICsgZFszXSArIFwiIFFcIiArIGRbNF0gKyBcIixcIiArIGRbNV0gKyBcIiBcIiArIGRbNl0gKyBcIixcIiArIGRbN10gKyBcIiBMXCIgKyBkWzhdICsgXCIsIFwiICsgZFs5XSk7XG4gICAgcmV0dXJuIGJvdW5kLnBhdGguc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBcInJnYmEoXCIgKyB0aGlzLmZpbGwuciArIFwiLCBcIiArIHRoaXMuZmlsbC5nICsgXCIsIFwiICsgdGhpcy5maWxsLmIgKyBcIiwgXCIgKyBhbHBoYSArIFwiKVwiKTtcbiAgfTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmRlZmluZShcImZpbGxcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmlsbDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9maWxsID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmRlZmluZShcImRcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmRlZmluZShcInRvdWNoZWRcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdG91Y2hlZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl90b3VjaGVkID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmRlZmluZShcInRvdWNoXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RvdWNoO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RvdWNoID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmRlZmluZShcIm92ZXJzY3JvbGxHbG93XCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX292ZXJzY3JvbGxHbG93O1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX292ZXJzY3JvbGxHbG93ID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmRlZmluZShcIm92ZXJzY3JvbGxFbmRWYWx1ZVwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vdmVyc2Nyb2xsRW5kVmFsdWU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fb3ZlcnNjcm9sbEVuZFZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gQW5kcm9pZFNjcm9sbENvbXBvbmVudDtcblxufSkoU2Nyb2xsQ29tcG9uZW50KTtcbiJdfQ==
