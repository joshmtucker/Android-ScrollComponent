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
    this._updateBounds = bind(this._updateBounds, this);
    this._updateOverscrollEndValue = bind(this._updateOverscrollEndValue, this);
    this._overscrollY = bind(this._overscrollY, this);
    this._touchEnd = bind(this._touchEnd, this);
    this._touchMove = bind(this._touchMove, this);
    this._touchStart = bind(this._touchStart, this);
    if (options.overscrollGlow == null) {
      options.overscrollGlow = true;
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
    this._updateBounds();
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

  AndroidScrollComponent.prototype._updateBounds = function() {
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
          case i !== 2:
            bound.height = this.height;
            return bound.d = [0, 0, 0, 0, bound.width, bound.height / 2, 0, bound.height, 0, bound.height];
          case i !== 3:
            bound.x = this.width - bound.width;
            bound.height = this.height;
            return bound.d = [bound.width, 0, bound.width, 0, 0, bound.height / 2, bound.width, bound.height, bound.width, bound.height];
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
    this._updateBounds = bind(this._updateBounds, this);
    this._updateOverscrollEndValue = bind(this._updateOverscrollEndValue, this);
    this._overscrollY = bind(this._overscrollY, this);
    this._touchEnd = bind(this._touchEnd, this);
    this._touchMove = bind(this._touchMove, this);
    this._touchStart = bind(this._touchStart, this);
    if (options.overscrollGlow == null) {
      options.overscrollGlow = true;
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
    this._updateBounds();
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

  AndroidScrollComponent.prototype._updateBounds = function() {
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
          case i !== 2:
            bound.height = this.height;
            return bound.d = [0, 0, 0, 0, bound.width, bound.height / 2, 0, bound.height, 0, bound.height];
          case i !== 3:
            bound.x = this.width - bound.width;
            bound.height = this.height;
            return bound.d = [bound.width, 0, bound.width, 0, 0, bound.height / 2, bound.width, bound.height, bound.width, bound.height];
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9zaG10dWNrZXIvR2l0SHViL0FuZHJvaWRTY3JvbGxDb21wb25lbnQvQW5kcm9pZFNjcm9sbENvbXBvbmVudC5mcmFtZXIvbW9kdWxlcy9BbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2pvc2htdHVja2VyL0dpdEh1Yi9BbmRyb2lkU2Nyb2xsQ29tcG9uZW50L0FuZHJvaWRTY3JvbGxDb21wb25lbnQuZnJhbWVyL21vZHVsZXMvQW5kcm9pZFNjcm9sbENvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsQ0FBQTtFQUFBOzs7O0FBQUEsQ0FBQSxHQUNDO0VBQUEsTUFBQSxFQUNDO0lBQUEsUUFBQSxFQUFVO01BQUEsQ0FBQSxFQUFHLENBQUg7TUFBTSxDQUFBLEVBQUcsQ0FBVDtNQUFZLE1BQUEsRUFBUSxHQUFwQjtNQUF5QixDQUFBLEVBQUcsRUFBNUI7S0FBVjtJQUNBLFdBQUEsRUFBYTtNQUFBLENBQUEsRUFBRyxDQUFIO01BQU0sTUFBQSxFQUFRLEdBQWQ7S0FEYjtHQUREOzs7QUFNSyxPQUFPLENBQUM7OztFQUNBLGdDQUFDLE9BQUQ7O01BQUMsVUFBUTs7Ozs7Ozs7Ozs7O01BQ3JCLE9BQU8sQ0FBQyxpQkFBa0I7OztNQUMxQixPQUFPLENBQUMsT0FBUTtRQUFBLENBQUEsRUFBRyxDQUFIO1FBQU0sQ0FBQSxFQUFHLENBQVQ7UUFBWSxDQUFBLEVBQUcsQ0FBZjtRQUFrQixDQUFBLEVBQUcsR0FBckI7OztJQUNoQix3REFBTSxPQUFOO0lBR0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBbkIsR0FBOEI7SUFDOUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBbkIsR0FBNEI7SUFHNUIsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLElBQUMsQ0FB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJCA9IFxuXHRib3VuZHM6XG5cdFx0dG9wQm91bmQ6IHg6IDAsIHk6IDAsIGhlaWdodDogNDAwLCBkOiBbXVxuXHRcdGJvdHRvbUJvdW5kOiB4OiAwLCBoZWlnaHQ6IDQwMFxuXHRcdCNsZWZ0Qm91bmQ6IHg6IDAsIHk6IDAsIHdpZHRoOiA0MDBcblx0XHQjcmlnaHRCb3VuZDogeTogMCwgd2lkdGg6IDQwMFxuXG5jbGFzcyBleHBvcnRzLkFuZHJvaWRTY3JvbGxDb21wb25lbnQgZXh0ZW5kcyBTY3JvbGxDb21wb25lbnRcblx0Y29uc3RydWN0b3I6IChvcHRpb25zPXt9KSAtPlxuXHRcdG9wdGlvbnMub3ZlcnNjcm9sbEdsb3cgPz0gdHJ1ZVxuXHRcdG9wdGlvbnMuZmlsbCA/PSByOiAwLCBnOiAwLCBiOiAwLCBhOiAuMjRcblx0XHRzdXBlciBvcHRpb25zXG5cdFx0XG5cdFx0IyBEaXNhYmxlIG92ZXJkcmFnIGFuZCBib3VuY2Vcblx0XHRAY29udGVudC5kcmFnZ2FibGUub3ZlcmRyYWcgPSBmYWxzZVxuXHRcdEBjb250ZW50LmRyYWdnYWJsZS5ib3VuY2UgPSBmYWxzZVxuXHRcdFxuXHRcdCMgQ3JlYXRlIGJvdW5kc1xuXHRcdEBib3VuZHMgPSBbXVxuXHRcdEBfdXBkYXRlQm91bmRzKClcblx0XHRcblx0XHQjIE92ZXJzY3JvbGwgYW5pbWF0aW9uIFxuXHRcdEBvdmVyc2Nyb2xsRW5kVmFsdWUgPSAwXG5cdFx0QG92ZXJzY3JvbGxFbmQgPSBuZXcgQW5pbWF0aW9uXG5cdFx0XHRsYXllcjogQFxuXHRcdFx0cHJvcGVydGllczpcblx0XHRcdFx0b3ZlcnNjcm9sbEVuZFZhbHVlOiAxXG5cdFx0XHRjdXJ2ZTogXCJiZWl6ZXItY3VydmUoMC4wLCAwLjAsIDAuMiwgMSlcIlxuXHRcdFx0dGltZTogLjMwMFxuXHRcdFxuXHRcdCMgU2V0dXAgZXZlbnRzXG5cdFx0QG9uKEV2ZW50cy5Ub3VjaFN0YXJ0LCBAX3RvdWNoU3RhcnQpXG5cdFx0QG9uKEV2ZW50cy5Ub3VjaE1vdmUsIEBfdG91Y2hNb3ZlKVxuXHRcdEBvbihFdmVudHMuVG91Y2hFbmQsIEBfdG91Y2hFbmQpXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcInRvdWNoZW5kXCIsIEBfdG91Y2hFbmRcblx0XHRcblx0IyBFVkVOVFNcblx0X3RvdWNoU3RhcnQ6IChlKSA9PlxuXHRcdCMgVG91Y2hlZCBpcyB0cnVlXG5cdFx0QHRvdWNoZWQgPSB0cnVlXG5cdFx0XG5cdFx0IyBTdG9wIGFuaW1hdGlvbiAvIHJlc2V0IHZhbHVlIFxuXHRcdEBvdmVyc2Nyb2xsRW5kLnN0b3AoKVxuXHRcdEZyYW1lci5Mb29wLm9mZiBcInVwZGF0ZVwiLCBAX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZVxuXHRcdEBvdmVyc2Nyb2xsRW5kVmFsdWUgPSAwXG5cdFx0XG5cdFx0IyBTZXQgdG91Y2ggeCBhbmQgeVxuXHRcdGlmIFV0aWxzLmlzTW9iaWxlKClcblx0XHRcdEB0b3VjaCA9IFxuXHRcdFx0XHR4OiBlLnRvdWNoZXNbMF0ucGFnZVhcblx0XHRcdFx0eTogZS50b3VjaGVzWzBdLnBhZ2VZXG5cdFx0ZWxzZVxuXHRcdFx0QHRvdWNoID0gXG5cdFx0XHRcdHg6IGUub2Zmc2V0WFxuXHRcdFx0XHR5OiBlLm9mZnNldFlcblx0XHRcdFxuXHRfdG91Y2hNb3ZlOiAoZSkgPT5cblx0XHQjIE92ZXJzY3JvbGxcblx0XHRpZiBAdG91Y2hlZFxuXHRcdFx0QF9vdmVyc2Nyb2xsWShlKSBpZiBAc2Nyb2xsVmVydGljYWwgYW5kIEBvdmVyc2Nyb2xsR2xvdyBpcyB0cnVlXG5cdFx0XG5cdF90b3VjaEVuZDogKGUpID0+XG5cdFx0IyBUb3VjaGVkIGlzIGZhbHNlIFxuXHRcdEB0b3VjaGVkID0gZmFsc2Vcblx0XHRcblx0XHQjIFNldCBlbmQgdmFsdWVzXG5cdFx0Zm9yIGIgaW4gQGJvdW5kcyB3aGVuIGIuaXNPdmVyc2Nyb2xsZWQgaXMgdHJ1ZVxuXHRcdFx0Yi5lbmRZID0gYi5kZWx0YVlcblx0XHRcdGIuZW5kU2lkZVkgPSBiLmRlbHRhU2lkZVlcblx0XHRcdGIuZW5kQWxwaGEgPSBiLmRlbHRhQWxwaGFcblx0XHRcblx0XHQjIE92ZXJzY3JvbGwgYW5pbWF0aW9uIFxuXHRcdEBvdmVyc2Nyb2xsRW5kLnN0YXJ0KClcblx0XHRAb3ZlcnNjcm9sbEVuZC5vbkFuaW1hdGlvbkVuZCAtPlxuXHRcdFx0RnJhbWVyLkxvb3Aub2ZmIFwidXBkYXRlXCIsIEBvcHRpb25zLmxheWVyLl91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWVcblx0XHRcdFxuXHRcdEZyYW1lci5Mb29wLm9uIFwidXBkYXRlXCIsIEBfdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlXG5cdFx0XHRcblx0IyBGVU5DVElPTlNcblx0X292ZXJzY3JvbGxZOiAoZSkgPT5cblx0XHR0b3AgPSBAYm91bmRzWzBdXG5cdFx0Ym90dG9tID0gQGJvdW5kc1swXVxuXHRcdGV2ZW50WCA9IGlmIFV0aWxzLmlzTW9iaWxlKCkgdGhlbiBlLnRvdWNoZXNbMF0ucGFnZVggZWxzZSBlLm9mZnNldFhcblx0XHRldmVudFkgPSBpZiBVdGlscy5pc01vYmlsZSgpIHRoZW4gZS50b3VjaGVzWzBdLnBhZ2VZIGVsc2UgZS5vZmZzZXRZXG5cdFx0XG5cdFx0aWYgQHNjcm9sbFkgaXMgMFxuXHRcdFx0YiA9IEBib3VuZHNbMF1cblx0XHRcdGIuaXNPdmVyc2Nyb2xsZWQgPSB0cnVlXG5cdFx0XHRcblx0XHRcdCMgRGVsdGFzXG5cdFx0XHRkID0gYi5kXG5cdFx0XHRcblx0XHRcdGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlIGV2ZW50WSAtIEB0b3VjaC55LCBbMCwgYi5oZWlnaHRdLCBbMCwgYi5oZWlnaHRdLCB0cnVlXG5cdFx0XHRkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbMCwgYi5oZWlnaHRdLCBbMCwgYi5oZWlnaHQgKiAuMjBdLCB0cnVlXG5cdFx0XHRkWzJdID0gYi5kZWx0YUxlZnRTaWRlWCA9IFV0aWxzLm1vZHVsYXRlIGV2ZW50WCwgWzAsIGIud2lkdGhdLCBbLShiLndpZHRoLzQpLCAwXSwgdHJ1ZVxuXHRcdFx0ZFs2XSA9IGIuZGVsdGFSaWdodFNpZGVYID0gVXRpbHMubW9kdWxhdGUgZXZlbnRYLCBbMCwgYi53aWR0aF0sIFtiLndpZHRoLCBiLndpZHRoICsgKGIud2lkdGgvNCldLCB0cnVlXG5cdFx0XHRiLmRlbHRhQWxwaGEgPSBVdGlscy5tb2R1bGF0ZSBiLmRlbHRhWSwgWzAsIGIuaGVpZ2h0XSwgWzAsIEBmaWxsLmFdLCB0cnVlXG5cdFx0XHRcblx0XHRcdCMgVXBkYXRlIFNWR1xuXHRcdFx0QF91cGRhdGVTVkcoYiwgZCwgYi5kZWx0YUFscGhhKVxuXHRcdFx0XG5cdFx0ZWxzZSBpZiBAc2Nyb2xsWSBpcyBNYXRoLmZsb29yKEBjb250ZW50LmhlaWdodCAtIEBoZWlnaHQpXG5cdFx0XHRiID0gQGJvdW5kc1sxXVxuXHRcdFx0Yi5pc092ZXJzY3JvbGxlZCA9IHRydWVcblx0XHRcdFxuXHRcdFx0IyBEZWx0YXNcblx0XHRcdGQgPSBiLmRcblx0XHRcdFxuXHRcdFx0ZFs1XSA9IGIuZGVsdGFZID0gVXRpbHMubW9kdWxhdGUgQHRvdWNoLnkgLSBldmVudFksIFtiLmhlaWdodCwgMF0sIFswLCBiLmhlaWdodF0sIHRydWVcblx0XHRcdGRbM10gPSBkWzddID0gYi5kZWx0YVNpZGVZID0gVXRpbHMubW9kdWxhdGUgYi5kZWx0YVksIFtiLmhlaWdodCwgMF0sIFtiLmhlaWdodCwgYi5oZWlnaHQgLSAoYi5oZWlnaHQgKiAuMjApXSwgdHJ1ZVxuXHRcdFx0ZFsyXSA9IGIuZGVsdGFMZWZ0U2lkZVggPSBVdGlscy5tb2R1bGF0ZSBldmVudFgsIFswLCBiLndpZHRoXSwgWy0oYi53aWR0aC80KSwgMF0sIHRydWVcblx0XHRcdGRbNl0gPSBiLmRlbHRhUmlnaHRTaWRlWCA9IFV0aWxzLm1vZHVsYXRlIGV2ZW50WCwgWzAsIGIud2lkdGhdLCBbYi53aWR0aCwgYi53aWR0aCArIChiLndpZHRoLzQpXSwgdHJ1ZVxuXHRcdFx0Yi5kZWx0YUFscGhhID0gVXRpbHMubW9kdWxhdGUgYi5kZWx0YVksIFtiLmhlaWdodCwgMF0sIFswLCBAZmlsbC5hXSwgdHJ1ZVxuXHRcdFx0XG5cdFx0XHQjIFVwZGF0ZSBTVkdcblx0XHRcdEBfdXBkYXRlU1ZHKGIsIGQsIGIuZGVsdGFBbHBoYSlcblx0XHRcblx0XHRlbHNlIFxuXHRcdFx0dG9wLmlzT3ZlcnNjcm9sbGVkID0gZmFsc2Vcblx0XHRcdGJvdHRvbS5pc092ZXJzY3JvbGxlZCA9IGZhbHNlXG5cdFx0XHRcblx0X3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZTogPT5cblx0XHRmb3IgYiBpbiBAYm91bmRzIHdoZW4gYi5pc092ZXJzY3JvbGxlZCBpcyB0cnVlXG5cdFx0XHRvcHRpb25zID0gc3dpdGNoIFxuXHRcdFx0XHR3aGVuIGIubmFtZSBpcyBcInRvcEJvdW5kXCJcblx0XHRcdFx0XHRkID0gYi5kXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0ZFs1XSA9IGIuZGVsdGFZID0gVXRpbHMubW9kdWxhdGUgQG92ZXJzY3JvbGxFbmRWYWx1ZSwgWzAsIDFdLCBbYi5lbmRZLCAwXSwgdHJ1ZVxuXHRcdFx0XHRcdGRbM10gPSBkWzddID0gYi5kZWx0YVNpZGVZID0gVXRpbHMubW9kdWxhdGUgYi5kZWx0YVksIFtiLmVuZFksIDBdLCBbYi5lbmRTaWRlWSwgMF0sIHRydWVcblx0XHRcdFx0XHRiLmRlbHRhQWxwaGEgPSBVdGlscy5tb2R1bGF0ZSBiLmRlbHRhWSwgW2IuZW5kWSwgMF0sIFtiLmVuZEFscGhhLCAwXSwgdHJ1ZVxuXHRcdFx0XHRcdFxuXHRcdFx0XHR3aGVuIGIubmFtZSBpcyBcImJvdHRvbUJvdW5kXCJcblx0XHRcdFx0XHRkID0gYi5kXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0ZFs1XSA9IGIuZGVsdGFZID0gVXRpbHMubW9kdWxhdGUgQG92ZXJzY3JvbGxFbmRWYWx1ZSwgWzAsIDFdLCBbYi5lbmRZLCBiLmhlaWdodF0sIHRydWVcblx0XHRcdFx0XHRkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbYi5lbmRZLCBiLmhlaWdodF0sIFtiLmVuZFNpZGVZLCBiLmhlaWdodF0sIHRydWVcblx0XHRcdFx0XHRiLmRlbHRhQWxwaGEgPSBVdGlscy5tb2R1bGF0ZSBiLmRlbHRhWSwgW2IuZW5kWSwgYi5oZWlnaHRdLCBbYi5lbmRBbHBoYSwgMF0sIHRydWVcblx0XHRcdFx0XHRcblx0XHRcdCMgVXBkYXRlIFNWR1xuXHRcdFx0QF91cGRhdGVTVkcoYiwgZCwgYi5kZWx0YUFscGhhKVxuXHRcdFxuXHRfdXBkYXRlQm91bmRzOiA9PlxuXHRcdGZvciBuYW1lLCBib3VuZCBvZiAkLmJvdW5kc1xuXHRcdFx0aSA9IF8ua2V5cygkLmJvdW5kcykuaW5kZXhPZiBcIiN7bmFtZX1cIlxuXHRcdFx0XG5cdFx0XHRvcHRpb25zID0gc3dpdGNoXG5cdFx0XHRcdHdoZW4gaSBpcyAwXG5cdFx0XHRcdFx0Ym91bmQud2lkdGggPSBAd2lkdGhcblx0XHRcdFx0XHRib3VuZC5kID0gWzAsIDAsIDAsIDAsIGJvdW5kLndpZHRoLzIsIDAsIGJvdW5kLndpZHRoLCAwLCBib3VuZC53aWR0aCwgMF1cblx0XHRcdFx0d2hlbiBpIGlzIDFcblx0XHRcdFx0XHRib3VuZC55ID0gQGhlaWdodCAtIGJvdW5kLmhlaWdodFxuXHRcdFx0XHRcdGJvdW5kLndpZHRoID0gQHdpZHRoXG5cdFx0XHRcdFx0Ym91bmQuZCA9IFswLCBib3VuZC5oZWlnaHQsIDAsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGgvMiwgYm91bmQuaGVpZ2h0LCBib3VuZC53aWR0aCwgYm91bmQuaGVpZ2h0LCBib3VuZC53aWR0aCwgYm91bmQuaGVpZ2h0XVxuXHRcdFx0XHR3aGVuIGkgaXMgMlxuXHRcdFx0XHRcdGJvdW5kLmhlaWdodCA9IEBoZWlnaHRcblx0XHRcdFx0XHRib3VuZC5kID0gWzAsIDAsIDAsIDAsIGJvdW5kLndpZHRoLCBib3VuZC5oZWlnaHQvMiwgMCwgYm91bmQuaGVpZ2h0LCAwLCBib3VuZC5oZWlnaHRdXG5cdFx0XHRcdHdoZW4gaSBpcyAzXG5cdFx0XHRcdFx0Ym91bmQueCA9IEB3aWR0aCAtIGJvdW5kLndpZHRoXG5cdFx0XHRcdFx0Ym91bmQuaGVpZ2h0ID0gQGhlaWdodFxuXHRcdFx0XHRcdGJvdW5kLmQgPSBbYm91bmQud2lkdGgsIDAsIGJvdW5kLndpZHRoLCAwLCAwLCBib3VuZC5oZWlnaHQvMiwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodF1cblx0XHRcdFx0XHRcblx0XHRcdCMgQ3JlYXRlIGJvdW5kXHRcdFxuXHRcdFx0QF9jcmVhdGVCb3VuZChuYW1lLCBib3VuZClcblx0XHRcdFx0XHRcblx0X2NyZWF0ZUJvdW5kOiAobmFtZSwgYm91bmQpID0+XG5cdFx0YiA9IG5ldyBMYXllciBcblx0XHRcdHg6IGJvdW5kLnhcblx0XHRcdHk6IGJvdW5kLnlcblx0XHRcdHdpZHRoOiBib3VuZC53aWR0aFxuXHRcdFx0aGVpZ2h0OiBib3VuZC5oZWlnaHRcblx0XHRcdGQ6IGJvdW5kLmRcblx0XHRcdG5hbWU6IG5hbWVcblx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJcIiBcblx0XHRcdHBhcmVudDogQFxuXHRcdFx0XG5cdFx0IyBTZXQgaXNPdmVyc2Nyb2xsZWRcblx0XHRiLmlzT3ZlcnNjcm9sbGVkID0gZmFsc2Vcblx0XHRcdFxuXHRcdCMgUHVzaCB0byBhcnJheVxuXHRcdEBib3VuZHMucHVzaCBiXG5cdFx0XG5cdFx0IyBDcmVhdGUgU1ZHXG5cdFx0QF9jcmVhdGVTVkcoYilcblx0XHRcblx0X2NyZWF0ZVNWRzogKGJvdW5kKSA9PlxuXHRcdGJvdW5kLnN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwic3ZnXCJcblx0XHRib3VuZC5zdmcuc2V0QXR0cmlidXRlIFwid2lkdGhcIiwgYm91bmQud2lkdGhcblx0XHRib3VuZC5zdmcuc2V0QXR0cmlidXRlIFwiaGVpZ2h0XCIsIGJvdW5kLmhlaWdodFxuXHRcdFxuXHRcdGJvdW5kLnBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIlxuXHRcdGJvdW5kLnBhdGguc2V0QXR0cmlidXRlIFwiZmlsbFwiLCBcInJnYmEoI3tAZmlsbC5yfSwgI3tAZmlsbC5nfSwgI3tAZmlsbC5ifSwgI3tAZmlsbC5hfSlcIlxuXHRcdGJvdW5kLnBhdGguc2V0QXR0cmlidXRlIFwiZFwiLCBcIk0je2JvdW5kLmRbMF19LCN7Ym91bmQuZFsxXX0gTCN7Ym91bmQuZFsyXX0sICN7Ym91bmQuZFszXX0gUSN7Ym91bmQuZFs0XX0sI3tib3VuZC5kWzVdfSAje2JvdW5kLmRbNl19LCN7Ym91bmQuZFs3XX0gTCN7Ym91bmQuZFs4XX0sICN7Ym91bmQuZFs5XX1cIlxuXHRcdFxuXHRcdCMgQXBwZW5kIFxuXHRcdGJvdW5kLnN2Zy5hcHBlbmRDaGlsZCBib3VuZC5wYXRoIFxuXHRcdGJvdW5kLl9lbGVtZW50LmFwcGVuZENoaWxkIGJvdW5kLnN2Z1xuXHRcdFxuXHRfdXBkYXRlU1ZHOiAoYm91bmQsIGQsIGFscGhhKSA9PlxuXHRcdGJvdW5kLnBhdGguc2V0QXR0cmlidXRlIFwiZFwiLCBcIk0je2RbMF19LCN7ZFsxXX0gTCN7ZFsyXX0sICN7ZFszXX0gUSN7ZFs0XX0sI3tkWzVdfSAje2RbNl19LCN7ZFs3XX0gTCN7ZFs4XX0sICN7ZFs5XX1cIlxuXHRcdGJvdW5kLnBhdGguc2V0QXR0cmlidXRlIFwiZmlsbFwiLCBcInJnYmEoI3tAZmlsbC5yfSwgI3tAZmlsbC5nfSwgI3tAZmlsbC5ifSwgI3thbHBoYX0pXCJcblx0XHRcdFx0XHRcblx0IyBERUZJTlRJT05TXG5cdEBkZWZpbmUgXCJmaWxsXCIsXG5cdFx0Z2V0OiAtPiBAX2ZpbGxcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQF9maWxsID0gdmFsdWUgXG5cdFx0XG5cdEBkZWZpbmUgXCJkXCIsIFxuXHRcdGdldDogLT4gQF9kIFxuXHRcdHNldDogKHZhbHVlKSAtPiBAX2QgPSB2YWx1ZVxuXHRcdFxuXHRAZGVmaW5lIFwidG91Y2hlZFwiLFxuXHRcdGdldDogLT4gQF90b3VjaGVkXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBfdG91Y2hlZCA9IHZhbHVlXG5cdFx0XG5cdEBkZWZpbmUgXCJ0b3VjaFwiLFxuXHRcdGdldDogLT4gQF90b3VjaCBcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQF90b3VjaCA9IHZhbHVlXG5cblx0QGRlZmluZSBcIm92ZXJzY3JvbGxHbG93XCIsXG5cdFx0Z2V0OiAtPiBAX292ZXJzY3JvbGxHbG93IFxuXHRcdHNldDogKHZhbHVlKSAtPiBAX292ZXJzY3JvbGxHbG93ID0gdmFsdWVcblx0XHRcblx0QGRlZmluZSBcIm92ZXJzY3JvbGxFbmRWYWx1ZVwiLFx0XG5cdGdldDogLT4gQF9vdmVyc2Nyb2xsRW5kVmFsdWVcblx0c2V0OiAodmFsdWUpIC0+IEBfb3ZlcnNjcm9sbEVuZFZhbHVlID0gdmFsdWUiLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgJCxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4kID0ge1xuICBib3VuZHM6IHtcbiAgICB0b3BCb3VuZDoge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICBoZWlnaHQ6IDQwMCxcbiAgICAgIGQ6IFtdXG4gICAgfSxcbiAgICBib3R0b21Cb3VuZDoge1xuICAgICAgeDogMCxcbiAgICAgIGhlaWdodDogNDAwXG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzLkFuZHJvaWRTY3JvbGxDb21wb25lbnQgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoQW5kcm9pZFNjcm9sbENvbXBvbmVudCwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gQW5kcm9pZFNjcm9sbENvbXBvbmVudChvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVTVkcgPSBiaW5kKHRoaXMuX3VwZGF0ZVNWRywgdGhpcyk7XG4gICAgdGhpcy5fY3JlYXRlU1ZHID0gYmluZCh0aGlzLl9jcmVhdGVTVkcsIHRoaXMpO1xuICAgIHRoaXMuX2NyZWF0ZUJvdW5kID0gYmluZCh0aGlzLl9jcmVhdGVCb3VuZCwgdGhpcyk7XG4gICAgdGhpcy5fdXBkYXRlQm91bmRzID0gYmluZCh0aGlzLl91cGRhdGVCb3VuZHMsIHRoaXMpO1xuICAgIHRoaXMuX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZSA9IGJpbmQodGhpcy5fdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlLCB0aGlzKTtcbiAgICB0aGlzLl9vdmVyc2Nyb2xsWSA9IGJpbmQodGhpcy5fb3ZlcnNjcm9sbFksIHRoaXMpO1xuICAgIHRoaXMuX3RvdWNoRW5kID0gYmluZCh0aGlzLl90b3VjaEVuZCwgdGhpcyk7XG4gICAgdGhpcy5fdG91Y2hNb3ZlID0gYmluZCh0aGlzLl90b3VjaE1vdmUsIHRoaXMpO1xuICAgIHRoaXMuX3RvdWNoU3RhcnQgPSBiaW5kKHRoaXMuX3RvdWNoU3RhcnQsIHRoaXMpO1xuICAgIGlmIChvcHRpb25zLm92ZXJzY3JvbGxHbG93ID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMub3ZlcnNjcm9sbEdsb3cgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5maWxsID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMuZmlsbCA9IHtcbiAgICAgICAgcjogMCxcbiAgICAgICAgZzogMCxcbiAgICAgICAgYjogMCxcbiAgICAgICAgYTogLjI0XG4gICAgICB9O1xuICAgIH1cbiAgICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIHRoaXMuY29udGVudC5kcmFnZ2FibGUub3ZlcmRyYWcgPSBmYWxzZTtcbiAgICB0aGlzLmNvbnRlbnQuZHJhZ2dhYmxlLmJvdW5jZSA9IGZhbHNlO1xuICAgIHRoaXMuYm91bmRzID0gW107XG4gICAgdGhpcy5fdXBkYXRlQm91bmRzKCk7XG4gICAgdGhpcy5vdmVyc2Nyb2xsRW5kVmFsdWUgPSAwO1xuICAgIHRoaXMub3ZlcnNjcm9sbEVuZCA9IG5ldyBBbmltYXRpb24oe1xuICAgICAgbGF5ZXI6IHRoaXMsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG92ZXJzY3JvbGxFbmRWYWx1ZTogMVxuICAgICAgfSxcbiAgICAgIGN1cnZlOiBcImJlaXplci1jdXJ2ZSgwLjAsIDAuMCwgMC4yLCAxKVwiLFxuICAgICAgdGltZTogLjMwMFxuICAgIH0pO1xuICAgIHRoaXMub24oRXZlbnRzLlRvdWNoU3RhcnQsIHRoaXMuX3RvdWNoU3RhcnQpO1xuICAgIHRoaXMub24oRXZlbnRzLlRvdWNoTW92ZSwgdGhpcy5fdG91Y2hNb3ZlKTtcbiAgICB0aGlzLm9uKEV2ZW50cy5Ub3VjaEVuZCwgdGhpcy5fdG91Y2hFbmQpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCB0aGlzLl90b3VjaEVuZCk7XG4gIH1cblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LnByb3RvdHlwZS5fdG91Y2hTdGFydCA9IGZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLnRvdWNoZWQgPSB0cnVlO1xuICAgIHRoaXMub3ZlcnNjcm9sbEVuZC5zdG9wKCk7XG4gICAgRnJhbWVyLkxvb3Aub2ZmKFwidXBkYXRlXCIsIHRoaXMuX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZSk7XG4gICAgdGhpcy5vdmVyc2Nyb2xsRW5kVmFsdWUgPSAwO1xuICAgIGlmIChVdGlscy5pc01vYmlsZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy50b3VjaCA9IHtcbiAgICAgICAgeDogZS50b3VjaGVzWzBdLnBhZ2VYLFxuICAgICAgICB5OiBlLnRvdWNoZXNbMF0ucGFnZVlcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnRvdWNoID0ge1xuICAgICAgICB4OiBlLm9mZnNldFgsXG4gICAgICAgIHk6IGUub2Zmc2V0WVxuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX3RvdWNoTW92ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAodGhpcy50b3VjaGVkKSB7XG4gICAgICBpZiAodGhpcy5zY3JvbGxWZXJ0aWNhbCAmJiB0aGlzLm92ZXJzY3JvbGxHbG93ID09PSB0cnVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vdmVyc2Nyb2xsWShlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX3RvdWNoRW5kID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciBiLCBqLCBsZW4sIHJlZjtcbiAgICB0aGlzLnRvdWNoZWQgPSBmYWxzZTtcbiAgICByZWYgPSB0aGlzLmJvdW5kcztcbiAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGIgPSByZWZbal07XG4gICAgICBpZiAoIShiLmlzT3ZlcnNjcm9sbGVkID09PSB0cnVlKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGIuZW5kWSA9IGIuZGVsdGFZO1xuICAgICAgYi5lbmRTaWRlWSA9IGIuZGVsdGFTaWRlWTtcbiAgICAgIGIuZW5kQWxwaGEgPSBiLmRlbHRhQWxwaGE7XG4gICAgfVxuICAgIHRoaXMub3ZlcnNjcm9sbEVuZC5zdGFydCgpO1xuICAgIHRoaXMub3ZlcnNjcm9sbEVuZC5vbkFuaW1hdGlvbkVuZChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBGcmFtZXIuTG9vcC5vZmYoXCJ1cGRhdGVcIiwgdGhpcy5vcHRpb25zLmxheWVyLl91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBGcmFtZXIuTG9vcC5vbihcInVwZGF0ZVwiLCB0aGlzLl91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWUpO1xuICB9O1xuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl9vdmVyc2Nyb2xsWSA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYiwgYm90dG9tLCBkLCBldmVudFgsIGV2ZW50WSwgdG9wO1xuICAgIHRvcCA9IHRoaXMuYm91bmRzWzBdO1xuICAgIGJvdHRvbSA9IHRoaXMuYm91bmRzWzBdO1xuICAgIGV2ZW50WCA9IFV0aWxzLmlzTW9iaWxlKCkgPyBlLnRvdWNoZXNbMF0ucGFnZVggOiBlLm9mZnNldFg7XG4gICAgZXZlbnRZID0gVXRpbHMuaXNNb2JpbGUoKSA/IGUudG91Y2hlc1swXS5wYWdlWSA6IGUub2Zmc2V0WTtcbiAgICBpZiAodGhpcy5zY3JvbGxZID09PSAwKSB7XG4gICAgICBiID0gdGhpcy5ib3VuZHNbMF07XG4gICAgICBiLmlzT3ZlcnNjcm9sbGVkID0gdHJ1ZTtcbiAgICAgIGQgPSBiLmQ7XG4gICAgICBkWzVdID0gYi5kZWx0YVkgPSBVdGlscy5tb2R1bGF0ZShldmVudFkgLSB0aGlzLnRvdWNoLnksIFswLCBiLmhlaWdodF0sIFswLCBiLmhlaWdodF0sIHRydWUpO1xuICAgICAgZFszXSA9IGRbN10gPSBiLmRlbHRhU2lkZVkgPSBVdGlscy5tb2R1bGF0ZShiLmRlbHRhWSwgWzAsIGIuaGVpZ2h0XSwgWzAsIGIuaGVpZ2h0ICogLjIwXSwgdHJ1ZSk7XG4gICAgICBkWzJdID0gYi5kZWx0YUxlZnRTaWRlWCA9IFV0aWxzLm1vZHVsYXRlKGV2ZW50WCwgWzAsIGIud2lkdGhdLCBbLShiLndpZHRoIC8gNCksIDBdLCB0cnVlKTtcbiAgICAgIGRbNl0gPSBiLmRlbHRhUmlnaHRTaWRlWCA9IFV0aWxzLm1vZHVsYXRlKGV2ZW50WCwgWzAsIGIud2lkdGhdLCBbYi53aWR0aCwgYi53aWR0aCArIChiLndpZHRoIC8gNCldLCB0cnVlKTtcbiAgICAgIGIuZGVsdGFBbHBoYSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbMCwgYi5oZWlnaHRdLCBbMCwgdGhpcy5maWxsLmFdLCB0cnVlKTtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVTVkcoYiwgZCwgYi5kZWx0YUFscGhhKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2Nyb2xsWSA9PT0gTWF0aC5mbG9vcih0aGlzLmNvbnRlbnQuaGVpZ2h0IC0gdGhpcy5oZWlnaHQpKSB7XG4gICAgICBiID0gdGhpcy5ib3VuZHNbMV07XG4gICAgICBiLmlzT3ZlcnNjcm9sbGVkID0gdHJ1ZTtcbiAgICAgIGQgPSBiLmQ7XG4gICAgICBkWzVdID0gYi5kZWx0YVkgPSBVdGlscy5tb2R1bGF0ZSh0aGlzLnRvdWNoLnkgLSBldmVudFksIFtiLmhlaWdodCwgMF0sIFswLCBiLmhlaWdodF0sIHRydWUpO1xuICAgICAgZFszXSA9IGRbN10gPSBiLmRlbHRhU2lkZVkgPSBVdGlscy5tb2R1bGF0ZShiLmRlbHRhWSwgW2IuaGVpZ2h0LCAwXSwgW2IuaGVpZ2h0LCBiLmhlaWdodCAtIChiLmhlaWdodCAqIC4yMCldLCB0cnVlKTtcbiAgICAgIGRbMl0gPSBiLmRlbHRhTGVmdFNpZGVYID0gVXRpbHMubW9kdWxhdGUoZXZlbnRYLCBbMCwgYi53aWR0aF0sIFstKGIud2lkdGggLyA0KSwgMF0sIHRydWUpO1xuICAgICAgZFs2XSA9IGIuZGVsdGFSaWdodFNpZGVYID0gVXRpbHMubW9kdWxhdGUoZXZlbnRYLCBbMCwgYi53aWR0aF0sIFtiLndpZHRoLCBiLndpZHRoICsgKGIud2lkdGggLyA0KV0sIHRydWUpO1xuICAgICAgYi5kZWx0YUFscGhhID0gVXRpbHMubW9kdWxhdGUoYi5kZWx0YVksIFtiLmhlaWdodCwgMF0sIFswLCB0aGlzLmZpbGwuYV0sIHRydWUpO1xuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZVNWRyhiLCBkLCBiLmRlbHRhQWxwaGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3AuaXNPdmVyc2Nyb2xsZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybiBib3R0b20uaXNPdmVyc2Nyb2xsZWQgPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBiLCBkLCBqLCBsZW4sIG9wdGlvbnMsIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLmJvdW5kcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBiID0gcmVmW2pdO1xuICAgICAgaWYgKCEoYi5pc092ZXJzY3JvbGxlZCA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBvcHRpb25zID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICBzd2l0Y2ggKGZhbHNlKSB7XG4gICAgICAgICAgY2FzZSBiLm5hbWUgIT09IFwidG9wQm91bmRcIjpcbiAgICAgICAgICAgIGQgPSBiLmQ7XG4gICAgICAgICAgICBkWzVdID0gYi5kZWx0YVkgPSBVdGlscy5tb2R1bGF0ZSh0aGlzLm92ZXJzY3JvbGxFbmRWYWx1ZSwgWzAsIDFdLCBbYi5lbmRZLCAwXSwgdHJ1ZSk7XG4gICAgICAgICAgICBkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbYi5lbmRZLCAwXSwgW2IuZW5kU2lkZVksIDBdLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiBiLmRlbHRhQWxwaGEgPSBVdGlscy5tb2R1bGF0ZShiLmRlbHRhWSwgW2IuZW5kWSwgMF0sIFtiLmVuZEFscGhhLCAwXSwgdHJ1ZSk7XG4gICAgICAgICAgY2FzZSBiLm5hbWUgIT09IFwiYm90dG9tQm91bmRcIjpcbiAgICAgICAgICAgIGQgPSBiLmQ7XG4gICAgICAgICAgICBkWzVdID0gYi5kZWx0YVkgPSBVdGlscy5tb2R1bGF0ZSh0aGlzLm92ZXJzY3JvbGxFbmRWYWx1ZSwgWzAsIDFdLCBbYi5lbmRZLCBiLmhlaWdodF0sIHRydWUpO1xuICAgICAgICAgICAgZFszXSA9IGRbN10gPSBiLmRlbHRhU2lkZVkgPSBVdGlscy5tb2R1bGF0ZShiLmRlbHRhWSwgW2IuZW5kWSwgYi5oZWlnaHRdLCBbYi5lbmRTaWRlWSwgYi5oZWlnaHRdLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiBiLmRlbHRhQWxwaGEgPSBVdGlscy5tb2R1bGF0ZShiLmRlbHRhWSwgW2IuZW5kWSwgYi5oZWlnaHRdLCBbYi5lbmRBbHBoYSwgMF0sIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9KS5jYWxsKHRoaXMpO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX3VwZGF0ZVNWRyhiLCBkLCBiLmRlbHRhQWxwaGEpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX3VwZGF0ZUJvdW5kcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBib3VuZCwgaSwgbmFtZSwgb3B0aW9ucywgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9ICQuYm91bmRzO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKG5hbWUgaW4gcmVmKSB7XG4gICAgICBib3VuZCA9IHJlZltuYW1lXTtcbiAgICAgIGkgPSBfLmtleXMoJC5ib3VuZHMpLmluZGV4T2YoXCJcIiArIG5hbWUpO1xuICAgICAgb3B0aW9ucyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgc3dpdGNoIChmYWxzZSkge1xuICAgICAgICAgIGNhc2UgaSAhPT0gMDpcbiAgICAgICAgICAgIGJvdW5kLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgICAgIHJldHVybiBib3VuZC5kID0gWzAsIDAsIDAsIDAsIGJvdW5kLndpZHRoIC8gMiwgMCwgYm91bmQud2lkdGgsIDAsIGJvdW5kLndpZHRoLCAwXTtcbiAgICAgICAgICBjYXNlIGkgIT09IDE6XG4gICAgICAgICAgICBib3VuZC55ID0gdGhpcy5oZWlnaHQgLSBib3VuZC5oZWlnaHQ7XG4gICAgICAgICAgICBib3VuZC53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgICAgICByZXR1cm4gYm91bmQuZCA9IFswLCBib3VuZC5oZWlnaHQsIDAsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGggLyAyLCBib3VuZC5oZWlnaHQsIGJvdW5kLndpZHRoLCBib3VuZC5oZWlnaHQsIGJvdW5kLndpZHRoLCBib3VuZC5oZWlnaHRdO1xuICAgICAgICAgIGNhc2UgaSAhPT0gMjpcbiAgICAgICAgICAgIGJvdW5kLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICAgICAgcmV0dXJuIGJvdW5kLmQgPSBbMCwgMCwgMCwgMCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCAvIDIsIDAsIGJvdW5kLmhlaWdodCwgMCwgYm91bmQuaGVpZ2h0XTtcbiAgICAgICAgICBjYXNlIGkgIT09IDM6XG4gICAgICAgICAgICBib3VuZC54ID0gdGhpcy53aWR0aCAtIGJvdW5kLndpZHRoO1xuICAgICAgICAgICAgYm91bmQuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgICAgICAgICByZXR1cm4gYm91bmQuZCA9IFtib3VuZC53aWR0aCwgMCwgYm91bmQud2lkdGgsIDAsIDAsIGJvdW5kLmhlaWdodCAvIDIsIGJvdW5kLndpZHRoLCBib3VuZC5oZWlnaHQsIGJvdW5kLndpZHRoLCBib3VuZC5oZWlnaHRdO1xuICAgICAgICB9XG4gICAgICB9KS5jYWxsKHRoaXMpO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX2NyZWF0ZUJvdW5kKG5hbWUsIGJvdW5kKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl9jcmVhdGVCb3VuZCA9IGZ1bmN0aW9uKG5hbWUsIGJvdW5kKSB7XG4gICAgdmFyIGI7XG4gICAgYiA9IG5ldyBMYXllcih7XG4gICAgICB4OiBib3VuZC54LFxuICAgICAgeTogYm91bmQueSxcbiAgICAgIHdpZHRoOiBib3VuZC53aWR0aCxcbiAgICAgIGhlaWdodDogYm91bmQuaGVpZ2h0LFxuICAgICAgZDogYm91bmQuZCxcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiXCIsXG4gICAgICBwYXJlbnQ6IHRoaXNcbiAgICB9KTtcbiAgICBiLmlzT3ZlcnNjcm9sbGVkID0gZmFsc2U7XG4gICAgdGhpcy5ib3VuZHMucHVzaChiKTtcbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlU1ZHKGIpO1xuICB9O1xuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl9jcmVhdGVTVkcgPSBmdW5jdGlvbihib3VuZCkge1xuICAgIGJvdW5kLnN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwic3ZnXCIpO1xuICAgIGJvdW5kLnN2Zy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCBib3VuZC53aWR0aCk7XG4gICAgYm91bmQuc3ZnLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBib3VuZC5oZWlnaHQpO1xuICAgIGJvdW5kLnBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIik7XG4gICAgYm91bmQucGF0aC5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIFwicmdiYShcIiArIHRoaXMuZmlsbC5yICsgXCIsIFwiICsgdGhpcy5maWxsLmcgKyBcIiwgXCIgKyB0aGlzLmZpbGwuYiArIFwiLCBcIiArIHRoaXMuZmlsbC5hICsgXCIpXCIpO1xuICAgIGJvdW5kLnBhdGguc2V0QXR0cmlidXRlKFwiZFwiLCBcIk1cIiArIGJvdW5kLmRbMF0gKyBcIixcIiArIGJvdW5kLmRbMV0gKyBcIiBMXCIgKyBib3VuZC5kWzJdICsgXCIsIFwiICsgYm91bmQuZFszXSArIFwiIFFcIiArIGJvdW5kLmRbNF0gKyBcIixcIiArIGJvdW5kLmRbNV0gKyBcIiBcIiArIGJvdW5kLmRbNl0gKyBcIixcIiArIGJvdW5kLmRbN10gKyBcIiBMXCIgKyBib3VuZC5kWzhdICsgXCIsIFwiICsgYm91bmQuZFs5XSk7XG4gICAgYm91bmQuc3ZnLmFwcGVuZENoaWxkKGJvdW5kLnBhdGgpO1xuICAgIHJldHVybiBib3VuZC5fZWxlbWVudC5hcHBlbmRDaGlsZChib3VuZC5zdmcpO1xuICB9O1xuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl91cGRhdGVTVkcgPSBmdW5jdGlvbihib3VuZCwgZCwgYWxwaGEpIHtcbiAgICBib3VuZC5wYXRoLnNldEF0dHJpYnV0ZShcImRcIiwgXCJNXCIgKyBkWzBdICsgXCIsXCIgKyBkWzFdICsgXCIgTFwiICsgZFsyXSArIFwiLCBcIiArIGRbM10gKyBcIiBRXCIgKyBkWzRdICsgXCIsXCIgKyBkWzVdICsgXCIgXCIgKyBkWzZdICsgXCIsXCIgKyBkWzddICsgXCIgTFwiICsgZFs4XSArIFwiLCBcIiArIGRbOV0pO1xuICAgIHJldHVybiBib3VuZC5wYXRoLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJyZ2JhKFwiICsgdGhpcy5maWxsLnIgKyBcIiwgXCIgKyB0aGlzLmZpbGwuZyArIFwiLCBcIiArIHRoaXMuZmlsbC5iICsgXCIsIFwiICsgYWxwaGEgKyBcIilcIik7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJmaWxsXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2ZpbGw7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmlsbCA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJkXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2Q7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZCA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJ0b3VjaGVkXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RvdWNoZWQ7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdG91Y2hlZCA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJ0b3VjaFwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl90b3VjaDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl90b3VjaCA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJvdmVyc2Nyb2xsR2xvd1wiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vdmVyc2Nyb2xsR2xvdztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vdmVyc2Nyb2xsR2xvdyA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJvdmVyc2Nyb2xsRW5kVmFsdWVcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fb3ZlcnNjcm9sbEVuZFZhbHVlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX292ZXJzY3JvbGxFbmRWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEFuZHJvaWRTY3JvbGxDb21wb25lbnQ7XG5cbn0pKFNjcm9sbENvbXBvbmVudCk7XG4iXX0=
