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
    if (options.edgeEffect == null) {
      options.edgeEffect = true;
    }
    if (options.effectColor == null) {
      options.effectColor = {
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
    this.effectAnimationValue = 0;
    this.effectAnimation = new Animation({
      layer: this,
      properties: {
        effectAnimationValue: 1
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
    this.clickOrTouch = true;
    this.effectAnimation.stop();
    Framer.Loop.off("update", this._updateOverscrollEndValue);
    this.effectAnimationValue = 0;
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
    if (this.clickOrTouch) {
      if (this.scrollVertical && this.edgeEffect === true) {
        return this._overscrollY(e);
      }
    }
  };

  AndroidScrollComponent.prototype._touchEnd = function(e) {
    var b, j, len, ref;
    this.clickOrTouch = false;
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
    this.effectAnimation.start();
    this.effectAnimation.onAnimationEnd(function() {
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
      b.deltaAlpha = Utils.modulate(b.deltaY, [0, b.height], [0, this.effectColor.a], true);
      return this._updateSVG(b, d, b.deltaAlpha);
    } else if (this.scrollY === Math.floor(this.content.height - this.height)) {
      b = this.bounds[1];
      b.isOverscrolled = true;
      d = b.d;
      d[5] = b.deltaY = Utils.modulate(this.touch.y - eventY, [b.height, 0], [0, b.height], true);
      d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [b.height, 0], [b.height, b.height - (b.height * .20)], true);
      d[2] = b.deltaLeftSideX = Utils.modulate(eventX, [0, b.width], [-(b.width / 4), 0], true);
      d[6] = b.deltaRightSideX = Utils.modulate(eventX, [0, b.width], [b.width, b.width + (b.width / 4)], true);
      b.deltaAlpha = Utils.modulate(b.deltaY, [b.height, 0], [0, this.effectColor.a], true);
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
            d[5] = b.deltaY = Utils.modulate(this.effectAnimationValue, [0, 1], [b.endY, 0], true);
            d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [b.endY, 0], [b.endSideY, 0], true);
            return b.deltaAlpha = Utils.modulate(b.deltaY, [b.endY, 0], [b.endAlpha, 0], true);
          case b.name !== "bottomBound":
            d = b.d;
            d[5] = b.deltaY = Utils.modulate(this.effectAnimationValue, [0, 1], [b.endY, b.height], true);
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
    bound.path.setAttribute("fill", "rgba(" + this.effectColor.r + ", " + this.effectColor.g + ", " + this.effectColor.b + ", " + this.effectColor.a + ")");
    bound.path.setAttribute("d", "M" + bound.d[0] + "," + bound.d[1] + " L" + bound.d[2] + ", " + bound.d[3] + " Q" + bound.d[4] + "," + bound.d[5] + " " + bound.d[6] + "," + bound.d[7] + " L" + bound.d[8] + ", " + bound.d[9]);
    bound.svg.appendChild(bound.path);
    return bound._element.appendChild(bound.svg);
  };

  AndroidScrollComponent.prototype._updateSVG = function(bound, d, alpha) {
    bound.path.setAttribute("d", "M" + d[0] + "," + d[1] + " L" + d[2] + ", " + d[3] + " Q" + d[4] + "," + d[5] + " " + d[6] + "," + d[7] + " L" + d[8] + ", " + d[9]);
    return bound.path.setAttribute("fill", "rgba(" + this.effectColor.r + ", " + this.effectColor.g + ", " + this.effectColor.b + ", " + alpha + ")");
  };

  AndroidScrollComponent.define("effectColor", {
    get: function() {
      return this._effectColor;
    },
    set: function(value) {
      return this._effectColor = value;
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

  AndroidScrollComponent.define("clickOrTouch", {
    get: function() {
      return this._clickOrTouch;
    },
    set: function(value) {
      return this._clickOrTouch = value;
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

  AndroidScrollComponent.define("edgeEffect", {
    get: function() {
      return this._edgeEffect;
    },
    set: function(value) {
      return this._edgeEffect = value;
    }
  });

  AndroidScrollComponent.define("effectAnimationValue", {
    get: function() {
      return this._effectAnimationValue;
    },
    set: function(value) {
      return this._effectAnimationValue = value;
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
    if (options.edgeEffect == null) {
      options.edgeEffect = true;
    }
    if (options.effectColor == null) {
      options.effectColor = {
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
    this.effectAnimationValue = 0;
    this.effectAnimation = new Animation({
      layer: this,
      properties: {
        effectAnimationValue: 1
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
    this.clickOrTouch = true;
    this.effectAnimation.stop();
    Framer.Loop.off("update", this._updateOverscrollEndValue);
    this.effectAnimationValue = 0;
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
    if (this.clickOrTouch) {
      if (this.scrollVertical && this.edgeEffect === true) {
        return this._overscrollY(e);
      }
    }
  };

  AndroidScrollComponent.prototype._touchEnd = function(e) {
    var b, j, len, ref;
    this.clickOrTouch = false;
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
    this.effectAnimation.start();
    this.effectAnimation.onAnimationEnd(function() {
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
      b.deltaAlpha = Utils.modulate(b.deltaY, [0, b.height], [0, this.effectColor.a], true);
      return this._updateSVG(b, d, b.deltaAlpha);
    } else if (this.scrollY === Math.floor(this.content.height - this.height)) {
      b = this.bounds[1];
      b.isOverscrolled = true;
      d = b.d;
      d[5] = b.deltaY = Utils.modulate(this.touch.y - eventY, [b.height, 0], [0, b.height], true);
      d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [b.height, 0], [b.height, b.height - (b.height * .20)], true);
      d[2] = b.deltaLeftSideX = Utils.modulate(eventX, [0, b.width], [-(b.width / 4), 0], true);
      d[6] = b.deltaRightSideX = Utils.modulate(eventX, [0, b.width], [b.width, b.width + (b.width / 4)], true);
      b.deltaAlpha = Utils.modulate(b.deltaY, [b.height, 0], [0, this.effectColor.a], true);
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
            d[5] = b.deltaY = Utils.modulate(this.effectAnimationValue, [0, 1], [b.endY, 0], true);
            d[3] = d[7] = b.deltaSideY = Utils.modulate(b.deltaY, [b.endY, 0], [b.endSideY, 0], true);
            return b.deltaAlpha = Utils.modulate(b.deltaY, [b.endY, 0], [b.endAlpha, 0], true);
          case b.name !== "bottomBound":
            d = b.d;
            d[5] = b.deltaY = Utils.modulate(this.effectAnimationValue, [0, 1], [b.endY, b.height], true);
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
    bound.path.setAttribute("fill", "rgba(" + this.effectColor.r + ", " + this.effectColor.g + ", " + this.effectColor.b + ", " + this.effectColor.a + ")");
    bound.path.setAttribute("d", "M" + bound.d[0] + "," + bound.d[1] + " L" + bound.d[2] + ", " + bound.d[3] + " Q" + bound.d[4] + "," + bound.d[5] + " " + bound.d[6] + "," + bound.d[7] + " L" + bound.d[8] + ", " + bound.d[9]);
    bound.svg.appendChild(bound.path);
    return bound._element.appendChild(bound.svg);
  };

  AndroidScrollComponent.prototype._updateSVG = function(bound, d, alpha) {
    bound.path.setAttribute("d", "M" + d[0] + "," + d[1] + " L" + d[2] + ", " + d[3] + " Q" + d[4] + "," + d[5] + " " + d[6] + "," + d[7] + " L" + d[8] + ", " + d[9]);
    return bound.path.setAttribute("fill", "rgba(" + this.effectColor.r + ", " + this.effectColor.g + ", " + this.effectColor.b + ", " + alpha + ")");
  };

  AndroidScrollComponent.define("effectColor", {
    get: function() {
      return this._effectColor;
    },
    set: function(value) {
      return this._effectColor = value;
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

  AndroidScrollComponent.define("clickOrTouch", {
    get: function() {
      return this._clickOrTouch;
    },
    set: function(value) {
      return this._clickOrTouch = value;
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

  AndroidScrollComponent.define("edgeEffect", {
    get: function() {
      return this._edgeEffect;
    },
    set: function(value) {
      return this._edgeEffect = value;
    }
  });

  AndroidScrollComponent.define("effectAnimationValue", {
    get: function() {
      return this._effectAnimationValue;
    },
    set: function(value) {
      return this._effectAnimationValue = value;
    }
  });

  return AndroidScrollComponent;

})(ScrollComponent);

},{}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9zaG10dWNrZXIvR2l0SHViL0FuZHJvaWRTY3JvbGxDb21wb25lbnQvQW5kcm9pZFNjcm9sbENvbXBvbmVudC5mcmFtZXIvbW9kdWxlcy9BbmRyb2lkU2Nyb2xsQ29tcG9uZW50LmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2pvc2htdHVja2VyL0dpdEh1Yi9BbmRyb2lkU2Nyb2xsQ29tcG9uZW50L0FuZHJvaWRTY3JvbGxDb21wb25lbnQuZnJhbWVyL21vZHVsZXMvQW5kcm9pZFNjcm9sbENvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsQ0FBQTtFQUFBOzs7O0FBQUEsQ0FBQSxHQUNDO0VBQUEsTUFBQSxFQUNDO0lBQUEsUUFBQSxFQUFVO01BQUEsQ0FBQSxFQUFHLENBQUg7TUFBTSxDQUFBLEVBQUcsQ0FBVDtNQUFZLE1BQUEsRUFBUSxHQUFwQjtNQUF5QixDQUFBLEVBQUcsRUFBNUI7S0FBVjtJQUNBLFdBQUEsRUFBYTtNQUFBLENBQUEsRUFBRyxDQUFIO01BQU0sTUFBQSxFQUFRLEdBQWQ7S0FEYjtHQUREOzs7QUFNSyxPQUFPLENBQUM7OztFQUNBLGdDQUFDLE9BQUQ7O01BQUMsVUFBUTs7Ozs7Ozs7Ozs7O01BQ3JCLE9BQU8sQ0FBQyxhQUFjOzs7TUFDdEIsT0FBTyxDQUFDLGNBQWU7UUFBQSxDQUFBLEVBQUcsQ0FBSDtRQUFNLENBQUEsRUFBRyxDQUFUO1FBQVksQ0FBQSxFQUFHLENBQWY7UUFBa0IsQ0FBQSxFQUFHLEdBQXJCOzs7SUFDdkIsd0RBQU0sT0FBTjtJQUdBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQW5CLEdBQThCO0lBQzlCLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQW5CLEdBQTRCO0lBRzVCLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixJQUFDLENBQUEsYUFBRCxDQUFBO0lBR0EsSUFBQyxDQUFBLG9CQUFELEdBQXdCO0lBQ3hCLElBQUMsQ0FBQSxlQUFELEdBQXVCLElBQUEsU0FBQSxDQUN0QjtNQUFBLEtBQUEsRUFBTyxJQUFQO01BQ0EsVUFBQSxFQUNDO1FBQUEsb0JBQUEsRUFBc0IsQ0FBdEI7T0FGRDtNQUdBLEtBQUEsRUFBTyxnQ0FIUDtNQUlBLElBQUEsRUFBTSxJQUpOO0tBRHNCO0lBUXZCLElBQUMsQ0FBQSxFQUFELENBQUksTUFBTSxDQUFDLFVBQVgsRUFBdUIsSUFBQyxDQUFBLFdBQXhCO0lBQ0EsSUFBQyxDQUFBLEVBQUQsQ0FBSSxNQUFNLENBQUMsU0FBWCxFQUFzQixJQUFDLENBQUEsVUFBdkI7SUFDQSxJQUFDLENBQUEsRUFBRCxDQUFJLE1BQU0sQ0FBQyxRQUFYLEVBQXFCLElBQUMsQ0FBQSxTQUF0QjtJQUNBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixVQUExQixFQUFzQyxJQUFDLENBQUEsU0FBdkM7RUExQlk7O21DQTZCYixXQUFBLEdBQWEsU0FBQyxDQUFEO0lBRVosSUFBQyxDQUFBLFlBQUQsR0FBZ0I7SUFHaEIsSUFBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFBO0lBQ0EsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFaLENBQWdCLFFBQWhCLEVBQTBCLElBQUMsQ0FBQSx5QkFBM0I7SUFDQSxJQUFDLENBQUEsb0JBQUQsR0FBd0I7SUFHeEIsSUFBRyxLQUFLLENBQUMsUUFBTixDQUFBLENBQUg7YUFDQyxJQUFDLENBQUEsS0FBRCxHQUNDO1FBQUEsQ0FBQSxFQUFHLENBQUMsQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBaEI7UUFDQSxDQUFBLEVBQUcsQ0FBQyxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQURoQjtRQUZGO0tBQUEsTUFBQTthQUtDLElBQUMsQ0FBQSxLQUFELEdBQ0M7UUFBQSxDQUFBLEVBQUcsQ0FBQyxDQUFDLE9BQUw7UUFDQSxDQUFBLEVBQUcsQ0FBQyxDQUFDLE9BREw7UUFORjs7RUFWWTs7bUNBbUJiLFVBQUEsR0FBWSxTQUFDLENBQUQ7SUFFWCxJQUFHLElBQUMsQ0FBQSxZQUFKO01BQ0MsSUFBb0IsSUFBQyxDQUFBLGNBQUQsSUFBb0IsSUFBQyxDQUFBLFVBQUQsS0FBZSxJQUF2RDtlQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsQ0FBZCxFQUFBO09BREQ7O0VBRlc7O21DQUtaLFNBQUEsR0FBVyxTQUFDLENBQUQ7QUFFVixRQUFBO0lBQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7QUFHaEI7QUFBQSxTQUFBLHFDQUFBOztZQUFzQixDQUFDLENBQUMsY0FBRixLQUFvQjs7O01BQ3pDLENBQUMsQ0FBQyxJQUFGLEdBQVMsQ0FBQyxDQUFDO01BQ1gsQ0FBQyxDQUFDLFFBQUYsR0FBYSxDQUFDLENBQUM7TUFDZixDQUFDLENBQUMsUUFBRixHQUFhLENBQUMsQ0FBQztBQUhoQjtJQU1BLElBQUMsQ0FBQSxlQUFlLENBQUMsS0FBakIsQ0FBQTtJQUNBLElBQUMsQ0FBQSxlQUFlLENBQUMsY0FBakIsQ0FBZ0MsU0FBQTthQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQVosQ0FBZ0IsUUFBaEIsRUFBMEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXpDO0lBRCtCLENBQWhDO1dBR0EsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFaLENBQWUsUUFBZixFQUF5QixJQUFDLENBQUEseUJBQTFCO0VBZlU7O21DQWtCWCxZQUFBLEdBQWMsU0FBQyxDQUFEO0FBQ2IsUUFBQTtJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsTUFBTyxDQUFBLENBQUE7SUFDZCxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBO0lBQ2pCLE1BQUEsR0FBWSxLQUFLLENBQUMsUUFBTixDQUFBLENBQUgsR0FBeUIsQ0FBQyxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUF0QyxHQUFpRCxDQUFDLENBQUM7SUFDNUQsTUFBQSxHQUFZLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBSCxHQUF5QixDQUFDLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQXRDLEdBQWlELENBQUMsQ0FBQztJQUU1RCxJQUFHLElBQUMsQ0FBQSxPQUFELEtBQVksQ0FBZjtNQUNDLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBTyxDQUFBLENBQUE7TUFDWixDQUFDLENBQUMsY0FBRixHQUFtQjtNQUduQixDQUFBLEdBQUksQ0FBQyxDQUFDO01BRU4sQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUMsQ0FBQyxNQUFGLEdBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBZSxNQUFBLEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxDQUEvQixFQUFrQyxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUMsTUFBTixDQUFsQyxFQUFpRCxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUMsTUFBTixDQUFqRCxFQUFnRSxJQUFoRTtNQUNsQixDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUMsQ0FBQyxVQUFGLEdBQWUsS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFDLENBQUMsTUFBakIsRUFBeUIsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFDLE1BQU4sQ0FBekIsRUFBd0MsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFDLE1BQUYsR0FBVyxHQUFmLENBQXhDLEVBQTZELElBQTdEO01BQzdCLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxDQUFDLENBQUMsY0FBRixHQUFtQixLQUFLLENBQUMsUUFBTixDQUFlLE1BQWYsRUFBdUIsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFDLEtBQU4sQ0FBdkIsRUFBcUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUYsR0FBUSxDQUFULENBQUYsRUFBZSxDQUFmLENBQXJDLEVBQXdELElBQXhEO01BQzFCLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxDQUFDLENBQUMsZUFBRixHQUFvQixLQUFLLENBQUMsUUFBTixDQUFlLE1BQWYsRUFBdUIsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFDLEtBQU4sQ0FBdkIsRUFBcUMsQ0FBQyxDQUFDLENBQUMsS0FBSCxFQUFVLENBQUMsQ0FBQyxLQUFGLEdBQVUsQ0FBQyxDQUFDLENBQUMsS0FBRixHQUFRLENBQVQsQ0FBcEIsQ0FBckMsRUFBdUUsSUFBdkU7TUFDM0IsQ0FBQyxDQUFDLFVBQUYsR0FBZSxLQUFLLENBQUMsUUFBTixDQUFlLENBQUMsQ0FBQyxNQUFqQixFQUF5QixDQUFDLENBQUQsRUFBSSxDQUFDLENBQUMsTUFBTixDQUF6QixFQUF3QyxDQUFDLENBQUQsRUFBSSxJQUFDLENBQUEsV0FBVyxDQUFDLENBQWpCLENBQXhDLEVBQTZELElBQTdEO2FBR2YsSUFBQyxDQUFBLFVBQUQsQ0FBWSxDQUFaLEVBQWUsQ0FBZixFQUFrQixDQUFDLENBQUMsVUFBcEIsRUFkRDtLQUFBLE1BZ0JLLElBQUcsSUFBQyxDQUFBLE9BQUQsS0FBWSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxHQUFrQixJQUFDLENBQUEsTUFBOUIsQ0FBZjtNQUNKLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBTyxDQUFBLENBQUE7TUFDWixDQUFDLENBQUMsY0FBRixHQUFtQjtNQUduQixDQUFBLEdBQUksQ0FBQyxDQUFDO01BRU4sQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUMsQ0FBQyxNQUFGLEdBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFDLENBQUEsS0FBSyxDQUFDLENBQVAsR0FBVyxNQUExQixFQUFrQyxDQUFDLENBQUMsQ0FBQyxNQUFILEVBQVcsQ0FBWCxDQUFsQyxFQUFpRCxDQUFDLENBQUQsRUFBSSxDQUFDLENBQUMsTUFBTixDQUFqRCxFQUFnRSxJQUFoRTtNQUNsQixDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUMsQ0FBQyxVQUFGLEdBQWUsS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFDLENBQUMsTUFBakIsRUFBeUIsQ0FBQyxDQUFDLENBQUMsTUFBSCxFQUFXLENBQVgsQ0FBekIsRUFBd0MsQ0FBQyxDQUFDLENBQUMsTUFBSCxFQUFXLENBQUMsQ0FBQyxNQUFGLEdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBRixHQUFXLEdBQVosQ0FBdEIsQ0FBeEMsRUFBaUYsSUFBakY7TUFDN0IsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUMsQ0FBQyxjQUFGLEdBQW1CLEtBQUssQ0FBQyxRQUFOLENBQWUsTUFBZixFQUF1QixDQUFDLENBQUQsRUFBSSxDQUFDLENBQUMsS0FBTixDQUF2QixFQUFxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRixHQUFRLENBQVQsQ0FBRixFQUFlLENBQWYsQ0FBckMsRUFBd0QsSUFBeEQ7TUFDMUIsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUMsQ0FBQyxlQUFGLEdBQW9CLEtBQUssQ0FBQyxRQUFOLENBQWUsTUFBZixFQUF1QixDQUFDLENBQUQsRUFBSSxDQUFDLENBQUMsS0FBTixDQUF2QixFQUFxQyxDQUFDLENBQUMsQ0FBQyxLQUFILEVBQVUsQ0FBQyxDQUFDLEtBQUYsR0FBVSxDQUFDLENBQUMsQ0FBQyxLQUFGLEdBQVEsQ0FBVCxDQUFwQixDQUFyQyxFQUF1RSxJQUF2RTtNQUMzQixDQUFDLENBQUMsVUFBRixHQUFlLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBQyxDQUFDLE1BQWpCLEVBQXlCLENBQUMsQ0FBQyxDQUFDLE1BQUgsRUFBVyxDQUFYLENBQXpCLEVBQXdDLENBQUMsQ0FBRCxFQUFJLElBQUMsQ0FBQSxXQUFXLENBQUMsQ0FBakIsQ0FBeEMsRUFBNkQsSUFBN0Q7YUFHZixJQUFDLENBQUEsVUFBRCxDQUFZLENBQVosRUFBZSxDQUFmLEVBQWtCLENBQUMsQ0FBQyxVQUFwQixFQWRJO0tBQUEsTUFBQTtNQWlCSixHQUFHLENBQUMsY0FBSixHQUFxQjthQUNyQixNQUFNLENBQUMsY0FBUCxHQUF3QixNQWxCcEI7O0VBdEJROzttQ0EwQ2QseUJBQUEsR0FBMkIsU0FBQTtBQUMxQixRQUFBO0FBQUE7QUFBQTtTQUFBLHFDQUFBOztZQUFzQixDQUFDLENBQUMsY0FBRixLQUFvQjs7O01BQ3pDLE9BQUE7QUFBVSxnQkFBQSxLQUFBO0FBQUEsZUFDSixDQUFDLENBQUMsSUFBRixLQUFVLFVBRE47WUFFUixDQUFBLEdBQUksQ0FBQyxDQUFDO1lBRU4sQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUMsQ0FBQyxNQUFGLEdBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFDLENBQUEsb0JBQWhCLEVBQXNDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBdEMsRUFBOEMsQ0FBQyxDQUFDLENBQUMsSUFBSCxFQUFTLENBQVQsQ0FBOUMsRUFBMkQsSUFBM0Q7WUFDbEIsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxDQUFDLENBQUMsVUFBRixHQUFlLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBQyxDQUFDLE1BQWpCLEVBQXlCLENBQUMsQ0FBQyxDQUFDLElBQUgsRUFBUyxDQUFULENBQXpCLEVBQXNDLENBQUMsQ0FBQyxDQUFDLFFBQUgsRUFBYSxDQUFiLENBQXRDLEVBQXVELElBQXZEO21CQUM3QixDQUFDLENBQUMsVUFBRixHQUFlLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBQyxDQUFDLE1BQWpCLEVBQXlCLENBQUMsQ0FBQyxDQUFDLElBQUgsRUFBUyxDQUFULENBQXpCLEVBQXNDLENBQUMsQ0FBQyxDQUFDLFFBQUgsRUFBYSxDQUFiLENBQXRDLEVBQXVELElBQXZEO0FBTlAsZUFRSixDQUFDLENBQUMsSUFBRixLQUFVLGFBUk47WUFTUixDQUFBLEdBQUksQ0FBQyxDQUFDO1lBRU4sQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUMsQ0FBQyxNQUFGLEdBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFDLENBQUEsb0JBQWhCLEVBQXNDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBdEMsRUFBOEMsQ0FBQyxDQUFDLENBQUMsSUFBSCxFQUFTLENBQUMsQ0FBQyxNQUFYLENBQTlDLEVBQWtFLElBQWxFO1lBQ2xCLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sQ0FBQyxDQUFDLFVBQUYsR0FBZSxLQUFLLENBQUMsUUFBTixDQUFlLENBQUMsQ0FBQyxNQUFqQixFQUF5QixDQUFDLENBQUMsQ0FBQyxJQUFILEVBQVMsQ0FBQyxDQUFDLE1BQVgsQ0FBekIsRUFBNkMsQ0FBQyxDQUFDLENBQUMsUUFBSCxFQUFhLENBQUMsQ0FBQyxNQUFmLENBQTdDLEVBQXFFLElBQXJFO21CQUM3QixDQUFDLENBQUMsVUFBRixHQUFlLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBQyxDQUFDLE1BQWpCLEVBQXlCLENBQUMsQ0FBQyxDQUFDLElBQUgsRUFBUyxDQUFDLENBQUMsTUFBWCxDQUF6QixFQUE2QyxDQUFDLENBQUMsQ0FBQyxRQUFILEVBQWEsQ0FBYixDQUE3QyxFQUE4RCxJQUE5RDtBQWJQOzttQkFnQlYsSUFBQyxDQUFBLFVBQUQsQ0FBWSxDQUFaLEVBQWUsQ0FBZixFQUFrQixDQUFDLENBQUMsVUFBcEI7QUFqQkQ7O0VBRDBCOzttQ0FvQjNCLGFBQUEsR0FBZSxTQUFBO0FBQ2QsUUFBQTtBQUFBO0FBQUE7U0FBQSxXQUFBOztNQUNDLENBQUEsR0FBSSxDQUFDLENBQUMsSUFBRixDQUFPLENBQUMsQ0FBQyxNQUFULENBQWdCLENBQUMsT0FBakIsQ0FBeUIsRUFBQSxHQUFHLElBQTVCO01BRUosT0FBQTtBQUFVLGdCQUFBLEtBQUE7QUFBQSxlQUNKLENBQUEsS0FBSyxDQUREO1lBRVIsS0FBSyxDQUFDLEtBQU4sR0FBYyxJQUFDLENBQUE7bUJBQ2YsS0FBSyxDQUFDLENBQU4sR0FBVSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxLQUFLLENBQUMsS0FBTixHQUFZLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLEtBQUssQ0FBQyxLQUFyQyxFQUE0QyxDQUE1QyxFQUErQyxLQUFLLENBQUMsS0FBckQsRUFBNEQsQ0FBNUQ7QUFIRixlQUlKLENBQUEsS0FBSyxDQUpEO1lBS1IsS0FBSyxDQUFDLENBQU4sR0FBVSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBQUssQ0FBQztZQUMxQixLQUFLLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQTttQkFDZixLQUFLLENBQUMsQ0FBTixHQUFVLENBQUMsQ0FBRCxFQUFJLEtBQUssQ0FBQyxNQUFWLEVBQWtCLENBQWxCLEVBQXFCLEtBQUssQ0FBQyxNQUEzQixFQUFtQyxLQUFLLENBQUMsS0FBTixHQUFZLENBQS9DLEVBQWtELEtBQUssQ0FBQyxNQUF4RCxFQUFnRSxLQUFLLENBQUMsS0FBdEUsRUFBNkUsS0FBSyxDQUFDLE1BQW5GLEVBQTJGLEtBQUssQ0FBQyxLQUFqRyxFQUF3RyxLQUFLLENBQUMsTUFBOUc7QUFQRixlQVFKLENBQUEsS0FBSyxDQVJEO1lBU1IsS0FBSyxDQUFDLE1BQU4sR0FBZSxJQUFDLENBQUE7bUJBQ2hCLEtBQUssQ0FBQyxDQUFOLEdBQVUsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsS0FBSyxDQUFDLEtBQW5CLEVBQTBCLEtBQUssQ0FBQyxNQUFOLEdBQWEsQ0FBdkMsRUFBMEMsQ0FBMUMsRUFBNkMsS0FBSyxDQUFDLE1BQW5ELEVBQTJELENBQTNELEVBQThELEtBQUssQ0FBQyxNQUFwRTtBQVZGLGVBV0osQ0FBQSxLQUFLLENBWEQ7WUFZUixLQUFLLENBQUMsQ0FBTixHQUFVLElBQUMsQ0FBQSxLQUFELEdBQVMsS0FBSyxDQUFDO1lBQ3pCLEtBQUssQ0FBQyxNQUFOLEdBQWUsSUFBQyxDQUFBO21CQUNoQixLQUFLLENBQUMsQ0FBTixHQUFVLENBQUMsS0FBSyxDQUFDLEtBQVAsRUFBYyxDQUFkLEVBQWlCLEtBQUssQ0FBQyxLQUF2QixFQUE4QixDQUE5QixFQUFpQyxDQUFqQyxFQUFvQyxLQUFLLENBQUMsTUFBTixHQUFhLENBQWpELEVBQW9ELEtBQUssQ0FBQyxLQUExRCxFQUFpRSxLQUFLLENBQUMsTUFBdkUsRUFBK0UsS0FBSyxDQUFDLEtBQXJGLEVBQTRGLEtBQUssQ0FBQyxNQUFsRztBQWRGOzttQkFpQlYsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLEVBQW9CLEtBQXBCO0FBcEJEOztFQURjOzttQ0F1QmYsWUFBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLEtBQVA7QUFDYixRQUFBO0lBQUEsQ0FBQSxHQUFRLElBQUEsS0FBQSxDQUNQO01BQUEsQ0FBQSxFQUFHLEtBQUssQ0FBQyxDQUFUO01BQ0EsQ0FBQSxFQUFHLEtBQUssQ0FBQyxDQURUO01BRUEsS0FBQSxFQUFPLEtBQUssQ0FBQyxLQUZiO01BR0EsTUFBQSxFQUFRLEtBQUssQ0FBQyxNQUhkO01BSUEsQ0FBQSxFQUFHLEtBQUssQ0FBQyxDQUpUO01BS0EsSUFBQSxFQUFNLElBTE47TUFNQSxlQUFBLEVBQWlCLEVBTmpCO01BT0EsTUFBQSxFQUFRLElBUFI7S0FETztJQVdSLENBQUMsQ0FBQyxjQUFGLEdBQW1CO0lBR25CLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLENBQWI7V0FHQSxJQUFDLENBQUEsVUFBRCxDQUFZLENBQVo7RUFsQmE7O21DQW9CZCxVQUFBLEdBQVksU0FBQyxLQUFEO0lBQ1gsS0FBSyxDQUFDLEdBQU4sR0FBWSxRQUFRLENBQUMsZUFBVCxDQUF5Qiw0QkFBekIsRUFBdUQsS0FBdkQ7SUFDWixLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVYsQ0FBdUIsT0FBdkIsRUFBZ0MsS0FBSyxDQUFDLEtBQXRDO0lBQ0EsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFWLENBQXVCLFFBQXZCLEVBQWlDLEtBQUssQ0FBQyxNQUF2QztJQUVBLEtBQUssQ0FBQyxJQUFOLEdBQWEsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsNEJBQXpCLEVBQXVELE1BQXZEO0lBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFYLENBQXdCLE1BQXhCLEVBQWdDLE9BQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLENBQXJCLEdBQXVCLElBQXZCLEdBQTJCLElBQUMsQ0FBQSxXQUFXLENBQUMsQ0FBeEMsR0FBMEMsSUFBMUMsR0FBOEMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxDQUEzRCxHQUE2RCxJQUE3RCxHQUFpRSxJQUFDLENBQUEsV0FBVyxDQUFDLENBQTlFLEdBQWdGLEdBQWhIO0lBQ0EsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFYLENBQXdCLEdBQXhCLEVBQTZCLEdBQUEsR0FBSSxLQUFLLENBQUMsQ0FBRSxDQUFBLENBQUEsQ0FBWixHQUFlLEdBQWYsR0FBa0IsS0FBSyxDQUFDLENBQUUsQ0FBQSxDQUFBLENBQTFCLEdBQTZCLElBQTdCLEdBQWlDLEtBQUssQ0FBQyxDQUFFLENBQUEsQ0FBQSxDQUF6QyxHQUE0QyxJQUE1QyxHQUFnRCxLQUFLLENBQUMsQ0FBRSxDQUFBLENBQUEsQ0FBeEQsR0FBMkQsSUFBM0QsR0FBK0QsS0FBSyxDQUFDLENBQUUsQ0FBQSxDQUFBLENBQXZFLEdBQTBFLEdBQTFFLEdBQTZFLEtBQUssQ0FBQyxDQUFFLENBQUEsQ0FBQSxDQUFyRixHQUF3RixHQUF4RixHQUEyRixLQUFLLENBQUMsQ0FBRSxDQUFBLENBQUEsQ0FBbkcsR0FBc0csR0FBdEcsR0FBeUcsS0FBSyxDQUFDLENBQUUsQ0FBQSxDQUFBLENBQWpILEdBQW9ILElBQXBILEdBQXdILEtBQUssQ0FBQyxDQUFFLENBQUEsQ0FBQSxDQUFoSSxHQUFtSSxJQUFuSSxHQUF1SSxLQUFLLENBQUMsQ0FBRSxDQUFBLENBQUEsQ0FBNUs7SUFHQSxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVYsQ0FBc0IsS0FBSyxDQUFDLElBQTVCO1dBQ0EsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFmLENBQTJCLEtBQUssQ0FBQyxHQUFqQztFQVhXOzttQ0FhWixVQUFBLEdBQVksU0FBQyxLQUFELEVBQVEsQ0FBUixFQUFXLEtBQVg7SUFDWCxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVgsQ0FBd0IsR0FBeEIsRUFBNkIsR0FBQSxHQUFJLENBQUUsQ0FBQSxDQUFBLENBQU4sR0FBUyxHQUFULEdBQVksQ0FBRSxDQUFBLENBQUEsQ0FBZCxHQUFpQixJQUFqQixHQUFxQixDQUFFLENBQUEsQ0FBQSxDQUF2QixHQUEwQixJQUExQixHQUE4QixDQUFFLENBQUEsQ0FBQSxDQUFoQyxHQUFtQyxJQUFuQyxHQUF1QyxDQUFFLENBQUEsQ0FBQSxDQUF6QyxHQUE0QyxHQUE1QyxHQUErQyxDQUFFLENBQUEsQ0FBQSxDQUFqRCxHQUFvRCxHQUFwRCxHQUF1RCxDQUFFLENBQUEsQ0FBQSxDQUF6RCxHQUE0RCxHQUE1RCxHQUErRCxDQUFFLENBQUEsQ0FBQSxDQUFqRSxHQUFvRSxJQUFwRSxHQUF3RSxDQUFFLENBQUEsQ0FBQSxDQUExRSxHQUE2RSxJQUE3RSxHQUFpRixDQUFFLENBQUEsQ0FBQSxDQUFoSDtXQUNBLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWCxDQUF3QixNQUF4QixFQUFnQyxPQUFBLEdBQVEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxDQUFyQixHQUF1QixJQUF2QixHQUEyQixJQUFDLENBQUEsV0FBVyxDQUFDLENBQXhDLEdBQTBDLElBQTFDLEdBQThDLElBQUMsQ0FBQSxXQUFXLENBQUMsQ0FBM0QsR0FBNkQsSUFBN0QsR0FBaUUsS0FBakUsR0FBdUUsR0FBdkc7RUFGVzs7RUFLWixzQkFBQyxDQUFBLE1BQUQsQ0FBUSxhQUFSLEVBQ0M7SUFBQSxHQUFBLEVBQUssU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKLENBQUw7SUFDQSxHQUFBLEVBQUssU0FBQyxLQUFEO2FBQVcsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7SUFBM0IsQ0FETDtHQUREOztFQUlBLHNCQUFDLENBQUEsTUFBRCxDQUFRLEdBQVIsRUFDQztJQUFBLEdBQUEsRUFBSyxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUosQ0FBTDtJQUNBLEdBQUEsRUFBSyxTQUFDLEtBQUQ7YUFBVyxJQUFDLENBQUEsRUFBRCxHQUFNO0lBQWpCLENBREw7R0FERDs7RUFJQSxzQkFBQyxDQUFBLE1BQUQsQ0FBUSxjQUFSLEVBQ0M7SUFBQSxHQUFBLEVBQUssU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKLENBQUw7SUFDQSxHQUFBLEVBQUssU0FBQyxLQUFEO2FBQVcsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFBNUIsQ0FETDtHQUREOztFQUlBLHNCQUFDLENBQUEsTUFBRCxDQUFRLE9BQVIsRUFDQztJQUFBLEdBQUEsRUFBSyxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUosQ0FBTDtJQUNBLEdBQUEsRUFBSyxTQUFDLEtBQUQ7YUFBVyxJQUFDLENBQUEsTUFBRCxHQUFVO0lBQXJCLENBREw7R0FERDs7RUFJQSxzQkFBQyxDQUFBLE1BQUQsQ0FBUSxZQUFSLEVBQ0M7SUFBQSxHQUFBLEVBQUssU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKLENBQUw7SUFDQSxHQUFBLEVBQUssU0FBQyxLQUFEO2FBQVcsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUExQixDQURMO0dBREQ7O0VBSUEsc0JBQUMsQ0FBQSxNQUFELENBQVEsc0JBQVIsRUFDQTtJQUFBLEdBQUEsRUFBSyxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUosQ0FBTDtJQUNBLEdBQUEsRUFBSyxTQUFDLEtBQUQ7YUFBVyxJQUFDLENBQUEscUJBQUQsR0FBeUI7SUFBcEMsQ0FETDtHQURBOzs7O0dBdk40Qzs7OztBQ1A3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIkID0gXG5cdGJvdW5kczpcblx0XHR0b3BCb3VuZDogeDogMCwgeTogMCwgaGVpZ2h0OiA0MDAsIGQ6IFtdXG5cdFx0Ym90dG9tQm91bmQ6IHg6IDAsIGhlaWdodDogNDAwXG5cdFx0I2xlZnRCb3VuZDogeDogMCwgeTogMCwgd2lkdGg6IDQwMFxuXHRcdCNyaWdodEJvdW5kOiB5OiAwLCB3aWR0aDogNDAwXG5cbmNsYXNzIGV4cG9ydHMuQW5kcm9pZFNjcm9sbENvbXBvbmVudCBleHRlbmRzIFNjcm9sbENvbXBvbmVudFxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnM9e30pIC0+XG5cdFx0b3B0aW9ucy5lZGdlRWZmZWN0ID89IHRydWVcblx0XHRvcHRpb25zLmVmZmVjdENvbG9yID89IHI6IDAsIGc6IDAsIGI6IDAsIGE6IC4yNFxuXHRcdHN1cGVyIG9wdGlvbnNcblx0XHRcblx0XHQjIERpc2FibGUgb3ZlcmRyYWcgYW5kIGJvdW5jZVxuXHRcdEBjb250ZW50LmRyYWdnYWJsZS5vdmVyZHJhZyA9IGZhbHNlXG5cdFx0QGNvbnRlbnQuZHJhZ2dhYmxlLmJvdW5jZSA9IGZhbHNlXG5cdFx0XG5cdFx0IyBDcmVhdGUgYm91bmRzXG5cdFx0QGJvdW5kcyA9IFtdXG5cdFx0QF91cGRhdGVCb3VuZHMoKVxuXHRcdFxuXHRcdCMgT3ZlcnNjcm9sbCBhbmltYXRpb24gXG5cdFx0QGVmZmVjdEFuaW1hdGlvblZhbHVlID0gMFxuXHRcdEBlZmZlY3RBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uXG5cdFx0XHRsYXllcjogQFxuXHRcdFx0cHJvcGVydGllczpcblx0XHRcdFx0ZWZmZWN0QW5pbWF0aW9uVmFsdWU6IDFcblx0XHRcdGN1cnZlOiBcImJlaXplci1jdXJ2ZSgwLjAsIDAuMCwgMC4yLCAxKVwiXG5cdFx0XHR0aW1lOiAuMzAwXG5cdFx0XG5cdFx0IyBTZXR1cCBldmVudHNcblx0XHRAb24oRXZlbnRzLlRvdWNoU3RhcnQsIEBfdG91Y2hTdGFydClcblx0XHRAb24oRXZlbnRzLlRvdWNoTW92ZSwgQF90b3VjaE1vdmUpXG5cdFx0QG9uKEV2ZW50cy5Ub3VjaEVuZCwgQF90b3VjaEVuZClcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIFwidG91Y2hlbmRcIiwgQF90b3VjaEVuZFxuXHRcdFxuXHQjIEVWRU5UU1xuXHRfdG91Y2hTdGFydDogKGUpID0+XG5cdFx0IyBUb3VjaGVkIGlzIHRydWVcblx0XHRAY2xpY2tPclRvdWNoID0gdHJ1ZVxuXHRcdFxuXHRcdCMgU3RvcCBhbmltYXRpb24gLyByZXNldCB2YWx1ZSBcblx0XHRAZWZmZWN0QW5pbWF0aW9uLnN0b3AoKVxuXHRcdEZyYW1lci5Mb29wLm9mZiBcInVwZGF0ZVwiLCBAX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZVxuXHRcdEBlZmZlY3RBbmltYXRpb25WYWx1ZSA9IDBcblx0XHRcblx0XHQjIFNldCB0b3VjaCB4IGFuZCB5XG5cdFx0aWYgVXRpbHMuaXNNb2JpbGUoKVxuXHRcdFx0QHRvdWNoID0gXG5cdFx0XHRcdHg6IGUudG91Y2hlc1swXS5wYWdlWFxuXHRcdFx0XHR5OiBlLnRvdWNoZXNbMF0ucGFnZVlcblx0XHRlbHNlXG5cdFx0XHRAdG91Y2ggPSBcblx0XHRcdFx0eDogZS5vZmZzZXRYXG5cdFx0XHRcdHk6IGUub2Zmc2V0WVxuXHRcdFx0XG5cdF90b3VjaE1vdmU6IChlKSA9PlxuXHRcdCMgT3ZlcnNjcm9sbFxuXHRcdGlmIEBjbGlja09yVG91Y2hcblx0XHRcdEBfb3ZlcnNjcm9sbFkoZSkgaWYgQHNjcm9sbFZlcnRpY2FsIGFuZCBAZWRnZUVmZmVjdCBpcyB0cnVlXG5cdFx0XG5cdF90b3VjaEVuZDogKGUpID0+XG5cdFx0IyBUb3VjaGVkIGlzIGZhbHNlIFxuXHRcdEBjbGlja09yVG91Y2ggPSBmYWxzZVxuXHRcdFxuXHRcdCMgU2V0IGVuZCB2YWx1ZXNcblx0XHRmb3IgYiBpbiBAYm91bmRzIHdoZW4gYi5pc092ZXJzY3JvbGxlZCBpcyB0cnVlXG5cdFx0XHRiLmVuZFkgPSBiLmRlbHRhWVxuXHRcdFx0Yi5lbmRTaWRlWSA9IGIuZGVsdGFTaWRlWVxuXHRcdFx0Yi5lbmRBbHBoYSA9IGIuZGVsdGFBbHBoYVxuXHRcdFxuXHRcdCMgT3ZlcnNjcm9sbCBhbmltYXRpb24gXG5cdFx0QGVmZmVjdEFuaW1hdGlvbi5zdGFydCgpXG5cdFx0QGVmZmVjdEFuaW1hdGlvbi5vbkFuaW1hdGlvbkVuZCAtPlxuXHRcdFx0RnJhbWVyLkxvb3Aub2ZmIFwidXBkYXRlXCIsIEBvcHRpb25zLmxheWVyLl91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWVcblx0XHRcdFxuXHRcdEZyYW1lci5Mb29wLm9uIFwidXBkYXRlXCIsIEBfdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlXG5cdFx0XHRcblx0IyBGVU5DVElPTlNcblx0X292ZXJzY3JvbGxZOiAoZSkgPT5cblx0XHR0b3AgPSBAYm91bmRzWzBdXG5cdFx0Ym90dG9tID0gQGJvdW5kc1swXVxuXHRcdGV2ZW50WCA9IGlmIFV0aWxzLmlzTW9iaWxlKCkgdGhlbiBlLnRvdWNoZXNbMF0ucGFnZVggZWxzZSBlLm9mZnNldFhcblx0XHRldmVudFkgPSBpZiBVdGlscy5pc01vYmlsZSgpIHRoZW4gZS50b3VjaGVzWzBdLnBhZ2VZIGVsc2UgZS5vZmZzZXRZXG5cdFx0XG5cdFx0aWYgQHNjcm9sbFkgaXMgMFxuXHRcdFx0YiA9IEBib3VuZHNbMF1cblx0XHRcdGIuaXNPdmVyc2Nyb2xsZWQgPSB0cnVlXG5cdFx0XHRcblx0XHRcdCMgRGVsdGFzXG5cdFx0XHRkID0gYi5kXG5cdFx0XHRcblx0XHRcdGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlIGV2ZW50WSAtIEB0b3VjaC55LCBbMCwgYi5oZWlnaHRdLCBbMCwgYi5oZWlnaHRdLCB0cnVlXG5cdFx0XHRkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbMCwgYi5oZWlnaHRdLCBbMCwgYi5oZWlnaHQgKiAuMjBdLCB0cnVlXG5cdFx0XHRkWzJdID0gYi5kZWx0YUxlZnRTaWRlWCA9IFV0aWxzLm1vZHVsYXRlIGV2ZW50WCwgWzAsIGIud2lkdGhdLCBbLShiLndpZHRoLzQpLCAwXSwgdHJ1ZVxuXHRcdFx0ZFs2XSA9IGIuZGVsdGFSaWdodFNpZGVYID0gVXRpbHMubW9kdWxhdGUgZXZlbnRYLCBbMCwgYi53aWR0aF0sIFtiLndpZHRoLCBiLndpZHRoICsgKGIud2lkdGgvNCldLCB0cnVlXG5cdFx0XHRiLmRlbHRhQWxwaGEgPSBVdGlscy5tb2R1bGF0ZSBiLmRlbHRhWSwgWzAsIGIuaGVpZ2h0XSwgWzAsIEBlZmZlY3RDb2xvci5hXSwgdHJ1ZVxuXHRcdFx0XG5cdFx0XHQjIFVwZGF0ZSBTVkdcblx0XHRcdEBfdXBkYXRlU1ZHKGIsIGQsIGIuZGVsdGFBbHBoYSlcblx0XHRcdFxuXHRcdGVsc2UgaWYgQHNjcm9sbFkgaXMgTWF0aC5mbG9vcihAY29udGVudC5oZWlnaHQgLSBAaGVpZ2h0KVxuXHRcdFx0YiA9IEBib3VuZHNbMV1cblx0XHRcdGIuaXNPdmVyc2Nyb2xsZWQgPSB0cnVlXG5cdFx0XHRcblx0XHRcdCMgRGVsdGFzXG5cdFx0XHRkID0gYi5kXG5cdFx0XHRcblx0XHRcdGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlIEB0b3VjaC55IC0gZXZlbnRZLCBbYi5oZWlnaHQsIDBdLCBbMCwgYi5oZWlnaHRdLCB0cnVlXG5cdFx0XHRkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbYi5oZWlnaHQsIDBdLCBbYi5oZWlnaHQsIGIuaGVpZ2h0IC0gKGIuaGVpZ2h0ICogLjIwKV0sIHRydWVcblx0XHRcdGRbMl0gPSBiLmRlbHRhTGVmdFNpZGVYID0gVXRpbHMubW9kdWxhdGUgZXZlbnRYLCBbMCwgYi53aWR0aF0sIFstKGIud2lkdGgvNCksIDBdLCB0cnVlXG5cdFx0XHRkWzZdID0gYi5kZWx0YVJpZ2h0U2lkZVggPSBVdGlscy5tb2R1bGF0ZSBldmVudFgsIFswLCBiLndpZHRoXSwgW2Iud2lkdGgsIGIud2lkdGggKyAoYi53aWR0aC80KV0sIHRydWVcblx0XHRcdGIuZGVsdGFBbHBoYSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbYi5oZWlnaHQsIDBdLCBbMCwgQGVmZmVjdENvbG9yLmFdLCB0cnVlXG5cdFx0XHRcblx0XHRcdCMgVXBkYXRlIFNWR1xuXHRcdFx0QF91cGRhdGVTVkcoYiwgZCwgYi5kZWx0YUFscGhhKVxuXHRcdFxuXHRcdGVsc2UgXG5cdFx0XHR0b3AuaXNPdmVyc2Nyb2xsZWQgPSBmYWxzZVxuXHRcdFx0Ym90dG9tLmlzT3ZlcnNjcm9sbGVkID0gZmFsc2Vcblx0XHRcdFxuXHRfdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlOiA9PlxuXHRcdGZvciBiIGluIEBib3VuZHMgd2hlbiBiLmlzT3ZlcnNjcm9sbGVkIGlzIHRydWVcblx0XHRcdG9wdGlvbnMgPSBzd2l0Y2ggXG5cdFx0XHRcdHdoZW4gYi5uYW1lIGlzIFwidG9wQm91bmRcIlxuXHRcdFx0XHRcdGQgPSBiLmRcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRkWzVdID0gYi5kZWx0YVkgPSBVdGlscy5tb2R1bGF0ZSBAZWZmZWN0QW5pbWF0aW9uVmFsdWUsIFswLCAxXSwgW2IuZW5kWSwgMF0sIHRydWVcblx0XHRcdFx0XHRkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbYi5lbmRZLCAwXSwgW2IuZW5kU2lkZVksIDBdLCB0cnVlXG5cdFx0XHRcdFx0Yi5kZWx0YUFscGhhID0gVXRpbHMubW9kdWxhdGUgYi5kZWx0YVksIFtiLmVuZFksIDBdLCBbYi5lbmRBbHBoYSwgMF0sIHRydWVcblx0XHRcdFx0XHRcblx0XHRcdFx0d2hlbiBiLm5hbWUgaXMgXCJib3R0b21Cb3VuZFwiXG5cdFx0XHRcdFx0ZCA9IGIuZFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlIEBlZmZlY3RBbmltYXRpb25WYWx1ZSwgWzAsIDFdLCBbYi5lbmRZLCBiLmhlaWdodF0sIHRydWVcblx0XHRcdFx0XHRkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlIGIuZGVsdGFZLCBbYi5lbmRZLCBiLmhlaWdodF0sIFtiLmVuZFNpZGVZLCBiLmhlaWdodF0sIHRydWVcblx0XHRcdFx0XHRiLmRlbHRhQWxwaGEgPSBVdGlscy5tb2R1bGF0ZSBiLmRlbHRhWSwgW2IuZW5kWSwgYi5oZWlnaHRdLCBbYi5lbmRBbHBoYSwgMF0sIHRydWVcblx0XHRcdFx0XHRcblx0XHRcdCMgVXBkYXRlIFNWR1xuXHRcdFx0QF91cGRhdGVTVkcoYiwgZCwgYi5kZWx0YUFscGhhKVxuXHRcdFxuXHRfdXBkYXRlQm91bmRzOiA9PlxuXHRcdGZvciBuYW1lLCBib3VuZCBvZiAkLmJvdW5kc1xuXHRcdFx0aSA9IF8ua2V5cygkLmJvdW5kcykuaW5kZXhPZiBcIiN7bmFtZX1cIlxuXHRcdFx0XG5cdFx0XHRvcHRpb25zID0gc3dpdGNoXG5cdFx0XHRcdHdoZW4gaSBpcyAwXG5cdFx0XHRcdFx0Ym91bmQud2lkdGggPSBAd2lkdGhcblx0XHRcdFx0XHRib3VuZC5kID0gWzAsIDAsIDAsIDAsIGJvdW5kLndpZHRoLzIsIDAsIGJvdW5kLndpZHRoLCAwLCBib3VuZC53aWR0aCwgMF1cblx0XHRcdFx0d2hlbiBpIGlzIDFcblx0XHRcdFx0XHRib3VuZC55ID0gQGhlaWdodCAtIGJvdW5kLmhlaWdodFxuXHRcdFx0XHRcdGJvdW5kLndpZHRoID0gQHdpZHRoXG5cdFx0XHRcdFx0Ym91bmQuZCA9IFswLCBib3VuZC5oZWlnaHQsIDAsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGgvMiwgYm91bmQuaGVpZ2h0LCBib3VuZC53aWR0aCwgYm91bmQuaGVpZ2h0LCBib3VuZC53aWR0aCwgYm91bmQuaGVpZ2h0XVxuXHRcdFx0XHR3aGVuIGkgaXMgMlxuXHRcdFx0XHRcdGJvdW5kLmhlaWdodCA9IEBoZWlnaHRcblx0XHRcdFx0XHRib3VuZC5kID0gWzAsIDAsIDAsIDAsIGJvdW5kLndpZHRoLCBib3VuZC5oZWlnaHQvMiwgMCwgYm91bmQuaGVpZ2h0LCAwLCBib3VuZC5oZWlnaHRdXG5cdFx0XHRcdHdoZW4gaSBpcyAzXG5cdFx0XHRcdFx0Ym91bmQueCA9IEB3aWR0aCAtIGJvdW5kLndpZHRoXG5cdFx0XHRcdFx0Ym91bmQuaGVpZ2h0ID0gQGhlaWdodFxuXHRcdFx0XHRcdGJvdW5kLmQgPSBbYm91bmQud2lkdGgsIDAsIGJvdW5kLndpZHRoLCAwLCAwLCBib3VuZC5oZWlnaHQvMiwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodF1cblx0XHRcdFx0XHRcblx0XHRcdCMgQ3JlYXRlIGJvdW5kXHRcdFxuXHRcdFx0QF9jcmVhdGVCb3VuZChuYW1lLCBib3VuZClcblx0XHRcdFx0XHRcblx0X2NyZWF0ZUJvdW5kOiAobmFtZSwgYm91bmQpID0+XG5cdFx0YiA9IG5ldyBMYXllciBcblx0XHRcdHg6IGJvdW5kLnhcblx0XHRcdHk6IGJvdW5kLnlcblx0XHRcdHdpZHRoOiBib3VuZC53aWR0aFxuXHRcdFx0aGVpZ2h0OiBib3VuZC5oZWlnaHRcblx0XHRcdGQ6IGJvdW5kLmRcblx0XHRcdG5hbWU6IG5hbWVcblx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJcIiBcblx0XHRcdHBhcmVudDogQFxuXHRcdFx0XG5cdFx0IyBTZXQgaXNPdmVyc2Nyb2xsZWRcblx0XHRiLmlzT3ZlcnNjcm9sbGVkID0gZmFsc2Vcblx0XHRcdFxuXHRcdCMgUHVzaCB0byBhcnJheVxuXHRcdEBib3VuZHMucHVzaCBiXG5cdFx0XG5cdFx0IyBDcmVhdGUgU1ZHXG5cdFx0QF9jcmVhdGVTVkcoYilcblx0XHRcblx0X2NyZWF0ZVNWRzogKGJvdW5kKSA9PlxuXHRcdGJvdW5kLnN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwic3ZnXCJcblx0XHRib3VuZC5zdmcuc2V0QXR0cmlidXRlIFwid2lkdGhcIiwgYm91bmQud2lkdGhcblx0XHRib3VuZC5zdmcuc2V0QXR0cmlidXRlIFwiaGVpZ2h0XCIsIGJvdW5kLmhlaWdodFxuXHRcdFxuXHRcdGJvdW5kLnBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIlxuXHRcdGJvdW5kLnBhdGguc2V0QXR0cmlidXRlIFwiZmlsbFwiLCBcInJnYmEoI3tAZWZmZWN0Q29sb3Iucn0sICN7QGVmZmVjdENvbG9yLmd9LCAje0BlZmZlY3RDb2xvci5ifSwgI3tAZWZmZWN0Q29sb3IuYX0pXCJcblx0XHRib3VuZC5wYXRoLnNldEF0dHJpYnV0ZSBcImRcIiwgXCJNI3tib3VuZC5kWzBdfSwje2JvdW5kLmRbMV19IEwje2JvdW5kLmRbMl19LCAje2JvdW5kLmRbM119IFEje2JvdW5kLmRbNF19LCN7Ym91bmQuZFs1XX0gI3tib3VuZC5kWzZdfSwje2JvdW5kLmRbN119IEwje2JvdW5kLmRbOF19LCAje2JvdW5kLmRbOV19XCJcblx0XHRcblx0XHQjIEFwcGVuZCBcblx0XHRib3VuZC5zdmcuYXBwZW5kQ2hpbGQgYm91bmQucGF0aCBcblx0XHRib3VuZC5fZWxlbWVudC5hcHBlbmRDaGlsZCBib3VuZC5zdmdcblx0XHRcblx0X3VwZGF0ZVNWRzogKGJvdW5kLCBkLCBhbHBoYSkgPT5cblx0XHRib3VuZC5wYXRoLnNldEF0dHJpYnV0ZSBcImRcIiwgXCJNI3tkWzBdfSwje2RbMV19IEwje2RbMl19LCAje2RbM119IFEje2RbNF19LCN7ZFs1XX0gI3tkWzZdfSwje2RbN119IEwje2RbOF19LCAje2RbOV19XCJcblx0XHRib3VuZC5wYXRoLnNldEF0dHJpYnV0ZSBcImZpbGxcIiwgXCJyZ2JhKCN7QGVmZmVjdENvbG9yLnJ9LCAje0BlZmZlY3RDb2xvci5nfSwgI3tAZWZmZWN0Q29sb3IuYn0sICN7YWxwaGF9KVwiXG5cdFx0XHRcdFx0XG5cdCMgREVGSU5USU9OU1xuXHRAZGVmaW5lIFwiZWZmZWN0Q29sb3JcIixcblx0XHRnZXQ6IC0+IEBfZWZmZWN0Q29sb3Jcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQF9lZmZlY3RDb2xvciA9IHZhbHVlIFxuXHRcdFxuXHRAZGVmaW5lIFwiZFwiLCBcblx0XHRnZXQ6IC0+IEBfZCBcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQF9kID0gdmFsdWVcblx0XHRcblx0QGRlZmluZSBcImNsaWNrT3JUb3VjaFwiLFxuXHRcdGdldDogLT4gQF9jbGlja09yVG91Y2hcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQF9jbGlja09yVG91Y2ggPSB2YWx1ZVxuXHRcdFxuXHRAZGVmaW5lIFwidG91Y2hcIixcblx0XHRnZXQ6IC0+IEBfdG91Y2ggXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBfdG91Y2ggPSB2YWx1ZVxuXG5cdEBkZWZpbmUgXCJlZGdlRWZmZWN0XCIsXG5cdFx0Z2V0OiAtPiBAX2VkZ2VFZmZlY3QgXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBfZWRnZUVmZmVjdCA9IHZhbHVlXG5cdFx0XG5cdEBkZWZpbmUgXCJlZmZlY3RBbmltYXRpb25WYWx1ZVwiLFx0XG5cdGdldDogLT4gQF9lZmZlY3RBbmltYXRpb25WYWx1ZVxuXHRzZXQ6ICh2YWx1ZSkgLT4gQF9lZmZlY3RBbmltYXRpb25WYWx1ZSA9IHZhbHVlIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyICQsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9LFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuJCA9IHtcbiAgYm91bmRzOiB7XG4gICAgdG9wQm91bmQ6IHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgaGVpZ2h0OiA0MDAsXG4gICAgICBkOiBbXVxuICAgIH0sXG4gICAgYm90dG9tQm91bmQ6IHtcbiAgICAgIHg6IDAsXG4gICAgICBoZWlnaHQ6IDQwMFxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0cy5BbmRyb2lkU2Nyb2xsQ29tcG9uZW50ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKEFuZHJvaWRTY3JvbGxDb21wb25lbnQsIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIEFuZHJvaWRTY3JvbGxDb21wb25lbnQob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlU1ZHID0gYmluZCh0aGlzLl91cGRhdGVTVkcsIHRoaXMpO1xuICAgIHRoaXMuX2NyZWF0ZVNWRyA9IGJpbmQodGhpcy5fY3JlYXRlU1ZHLCB0aGlzKTtcbiAgICB0aGlzLl9jcmVhdGVCb3VuZCA9IGJpbmQodGhpcy5fY3JlYXRlQm91bmQsIHRoaXMpO1xuICAgIHRoaXMuX3VwZGF0ZUJvdW5kcyA9IGJpbmQodGhpcy5fdXBkYXRlQm91bmRzLCB0aGlzKTtcbiAgICB0aGlzLl91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWUgPSBiaW5kKHRoaXMuX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZSwgdGhpcyk7XG4gICAgdGhpcy5fb3ZlcnNjcm9sbFkgPSBiaW5kKHRoaXMuX292ZXJzY3JvbGxZLCB0aGlzKTtcbiAgICB0aGlzLl90b3VjaEVuZCA9IGJpbmQodGhpcy5fdG91Y2hFbmQsIHRoaXMpO1xuICAgIHRoaXMuX3RvdWNoTW92ZSA9IGJpbmQodGhpcy5fdG91Y2hNb3ZlLCB0aGlzKTtcbiAgICB0aGlzLl90b3VjaFN0YXJ0ID0gYmluZCh0aGlzLl90b3VjaFN0YXJ0LCB0aGlzKTtcbiAgICBpZiAob3B0aW9ucy5lZGdlRWZmZWN0ID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMuZWRnZUVmZmVjdCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmVmZmVjdENvbG9yID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMuZWZmZWN0Q29sb3IgPSB7XG4gICAgICAgIHI6IDAsXG4gICAgICAgIGc6IDAsXG4gICAgICAgIGI6IDAsXG4gICAgICAgIGE6IC4yNFxuICAgICAgfTtcbiAgICB9XG4gICAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLmNvbnRlbnQuZHJhZ2dhYmxlLm92ZXJkcmFnID0gZmFsc2U7XG4gICAgdGhpcy5jb250ZW50LmRyYWdnYWJsZS5ib3VuY2UgPSBmYWxzZTtcbiAgICB0aGlzLmJvdW5kcyA9IFtdO1xuICAgIHRoaXMuX3VwZGF0ZUJvdW5kcygpO1xuICAgIHRoaXMuZWZmZWN0QW5pbWF0aW9uVmFsdWUgPSAwO1xuICAgIHRoaXMuZWZmZWN0QW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbih7XG4gICAgICBsYXllcjogdGhpcyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgZWZmZWN0QW5pbWF0aW9uVmFsdWU6IDFcbiAgICAgIH0sXG4gICAgICBjdXJ2ZTogXCJiZWl6ZXItY3VydmUoMC4wLCAwLjAsIDAuMiwgMSlcIixcbiAgICAgIHRpbWU6IC4zMDBcbiAgICB9KTtcbiAgICB0aGlzLm9uKEV2ZW50cy5Ub3VjaFN0YXJ0LCB0aGlzLl90b3VjaFN0YXJ0KTtcbiAgICB0aGlzLm9uKEV2ZW50cy5Ub3VjaE1vdmUsIHRoaXMuX3RvdWNoTW92ZSk7XG4gICAgdGhpcy5vbihFdmVudHMuVG91Y2hFbmQsIHRoaXMuX3RvdWNoRW5kKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgdGhpcy5fdG91Y2hFbmQpO1xuICB9XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX3RvdWNoU3RhcnQgPSBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5jbGlja09yVG91Y2ggPSB0cnVlO1xuICAgIHRoaXMuZWZmZWN0QW5pbWF0aW9uLnN0b3AoKTtcbiAgICBGcmFtZXIuTG9vcC5vZmYoXCJ1cGRhdGVcIiwgdGhpcy5fdXBkYXRlT3ZlcnNjcm9sbEVuZFZhbHVlKTtcbiAgICB0aGlzLmVmZmVjdEFuaW1hdGlvblZhbHVlID0gMDtcbiAgICBpZiAoVXRpbHMuaXNNb2JpbGUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMudG91Y2ggPSB7XG4gICAgICAgIHg6IGUudG91Y2hlc1swXS5wYWdlWCxcbiAgICAgICAgeTogZS50b3VjaGVzWzBdLnBhZ2VZXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy50b3VjaCA9IHtcbiAgICAgICAgeDogZS5vZmZzZXRYLFxuICAgICAgICB5OiBlLm9mZnNldFlcbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl90b3VjaE1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKHRoaXMuY2xpY2tPclRvdWNoKSB7XG4gICAgICBpZiAodGhpcy5zY3JvbGxWZXJ0aWNhbCAmJiB0aGlzLmVkZ2VFZmZlY3QgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX292ZXJzY3JvbGxZKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LnByb3RvdHlwZS5fdG91Y2hFbmQgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGIsIGosIGxlbiwgcmVmO1xuICAgIHRoaXMuY2xpY2tPclRvdWNoID0gZmFsc2U7XG4gICAgcmVmID0gdGhpcy5ib3VuZHM7XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBiID0gcmVmW2pdO1xuICAgICAgaWYgKCEoYi5pc092ZXJzY3JvbGxlZCA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBiLmVuZFkgPSBiLmRlbHRhWTtcbiAgICAgIGIuZW5kU2lkZVkgPSBiLmRlbHRhU2lkZVk7XG4gICAgICBiLmVuZEFscGhhID0gYi5kZWx0YUFscGhhO1xuICAgIH1cbiAgICB0aGlzLmVmZmVjdEFuaW1hdGlvbi5zdGFydCgpO1xuICAgIHRoaXMuZWZmZWN0QW5pbWF0aW9uLm9uQW5pbWF0aW9uRW5kKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEZyYW1lci5Mb29wLm9mZihcInVwZGF0ZVwiLCB0aGlzLm9wdGlvbnMubGF5ZXIuX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIEZyYW1lci5Mb29wLm9uKFwidXBkYXRlXCIsIHRoaXMuX3VwZGF0ZU92ZXJzY3JvbGxFbmRWYWx1ZSk7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX292ZXJzY3JvbGxZID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciBiLCBib3R0b20sIGQsIGV2ZW50WCwgZXZlbnRZLCB0b3A7XG4gICAgdG9wID0gdGhpcy5ib3VuZHNbMF07XG4gICAgYm90dG9tID0gdGhpcy5ib3VuZHNbMF07XG4gICAgZXZlbnRYID0gVXRpbHMuaXNNb2JpbGUoKSA/IGUudG91Y2hlc1swXS5wYWdlWCA6IGUub2Zmc2V0WDtcbiAgICBldmVudFkgPSBVdGlscy5pc01vYmlsZSgpID8gZS50b3VjaGVzWzBdLnBhZ2VZIDogZS5vZmZzZXRZO1xuICAgIGlmICh0aGlzLnNjcm9sbFkgPT09IDApIHtcbiAgICAgIGIgPSB0aGlzLmJvdW5kc1swXTtcbiAgICAgIGIuaXNPdmVyc2Nyb2xsZWQgPSB0cnVlO1xuICAgICAgZCA9IGIuZDtcbiAgICAgIGRbNV0gPSBiLmRlbHRhWSA9IFV0aWxzLm1vZHVsYXRlKGV2ZW50WSAtIHRoaXMudG91Y2gueSwgWzAsIGIuaGVpZ2h0XSwgWzAsIGIuaGVpZ2h0XSwgdHJ1ZSk7XG4gICAgICBkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbMCwgYi5oZWlnaHRdLCBbMCwgYi5oZWlnaHQgKiAuMjBdLCB0cnVlKTtcbiAgICAgIGRbMl0gPSBiLmRlbHRhTGVmdFNpZGVYID0gVXRpbHMubW9kdWxhdGUoZXZlbnRYLCBbMCwgYi53aWR0aF0sIFstKGIud2lkdGggLyA0KSwgMF0sIHRydWUpO1xuICAgICAgZFs2XSA9IGIuZGVsdGFSaWdodFNpZGVYID0gVXRpbHMubW9kdWxhdGUoZXZlbnRYLCBbMCwgYi53aWR0aF0sIFtiLndpZHRoLCBiLndpZHRoICsgKGIud2lkdGggLyA0KV0sIHRydWUpO1xuICAgICAgYi5kZWx0YUFscGhhID0gVXRpbHMubW9kdWxhdGUoYi5kZWx0YVksIFswLCBiLmhlaWdodF0sIFswLCB0aGlzLmVmZmVjdENvbG9yLmFdLCB0cnVlKTtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVTVkcoYiwgZCwgYi5kZWx0YUFscGhhKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2Nyb2xsWSA9PT0gTWF0aC5mbG9vcih0aGlzLmNvbnRlbnQuaGVpZ2h0IC0gdGhpcy5oZWlnaHQpKSB7XG4gICAgICBiID0gdGhpcy5ib3VuZHNbMV07XG4gICAgICBiLmlzT3ZlcnNjcm9sbGVkID0gdHJ1ZTtcbiAgICAgIGQgPSBiLmQ7XG4gICAgICBkWzVdID0gYi5kZWx0YVkgPSBVdGlscy5tb2R1bGF0ZSh0aGlzLnRvdWNoLnkgLSBldmVudFksIFtiLmhlaWdodCwgMF0sIFswLCBiLmhlaWdodF0sIHRydWUpO1xuICAgICAgZFszXSA9IGRbN10gPSBiLmRlbHRhU2lkZVkgPSBVdGlscy5tb2R1bGF0ZShiLmRlbHRhWSwgW2IuaGVpZ2h0LCAwXSwgW2IuaGVpZ2h0LCBiLmhlaWdodCAtIChiLmhlaWdodCAqIC4yMCldLCB0cnVlKTtcbiAgICAgIGRbMl0gPSBiLmRlbHRhTGVmdFNpZGVYID0gVXRpbHMubW9kdWxhdGUoZXZlbnRYLCBbMCwgYi53aWR0aF0sIFstKGIud2lkdGggLyA0KSwgMF0sIHRydWUpO1xuICAgICAgZFs2XSA9IGIuZGVsdGFSaWdodFNpZGVYID0gVXRpbHMubW9kdWxhdGUoZXZlbnRYLCBbMCwgYi53aWR0aF0sIFtiLndpZHRoLCBiLndpZHRoICsgKGIud2lkdGggLyA0KV0sIHRydWUpO1xuICAgICAgYi5kZWx0YUFscGhhID0gVXRpbHMubW9kdWxhdGUoYi5kZWx0YVksIFtiLmhlaWdodCwgMF0sIFswLCB0aGlzLmVmZmVjdENvbG9yLmFdLCB0cnVlKTtcbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVTVkcoYiwgZCwgYi5kZWx0YUFscGhhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9wLmlzT3ZlcnNjcm9sbGVkID0gZmFsc2U7XG4gICAgICByZXR1cm4gYm90dG9tLmlzT3ZlcnNjcm9sbGVkID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl91cGRhdGVPdmVyc2Nyb2xsRW5kVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYiwgZCwgaiwgbGVuLCBvcHRpb25zLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5ib3VuZHM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgYiA9IHJlZltqXTtcbiAgICAgIGlmICghKGIuaXNPdmVyc2Nyb2xsZWQgPT09IHRydWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgb3B0aW9ucyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgc3dpdGNoIChmYWxzZSkge1xuICAgICAgICAgIGNhc2UgYi5uYW1lICE9PSBcInRvcEJvdW5kXCI6XG4gICAgICAgICAgICBkID0gYi5kO1xuICAgICAgICAgICAgZFs1XSA9IGIuZGVsdGFZID0gVXRpbHMubW9kdWxhdGUodGhpcy5lZmZlY3RBbmltYXRpb25WYWx1ZSwgWzAsIDFdLCBbYi5lbmRZLCAwXSwgdHJ1ZSk7XG4gICAgICAgICAgICBkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbYi5lbmRZLCAwXSwgW2IuZW5kU2lkZVksIDBdLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiBiLmRlbHRhQWxwaGEgPSBVdGlscy5tb2R1bGF0ZShiLmRlbHRhWSwgW2IuZW5kWSwgMF0sIFtiLmVuZEFscGhhLCAwXSwgdHJ1ZSk7XG4gICAgICAgICAgY2FzZSBiLm5hbWUgIT09IFwiYm90dG9tQm91bmRcIjpcbiAgICAgICAgICAgIGQgPSBiLmQ7XG4gICAgICAgICAgICBkWzVdID0gYi5kZWx0YVkgPSBVdGlscy5tb2R1bGF0ZSh0aGlzLmVmZmVjdEFuaW1hdGlvblZhbHVlLCBbMCwgMV0sIFtiLmVuZFksIGIuaGVpZ2h0XSwgdHJ1ZSk7XG4gICAgICAgICAgICBkWzNdID0gZFs3XSA9IGIuZGVsdGFTaWRlWSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbYi5lbmRZLCBiLmhlaWdodF0sIFtiLmVuZFNpZGVZLCBiLmhlaWdodF0sIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIGIuZGVsdGFBbHBoYSA9IFV0aWxzLm1vZHVsYXRlKGIuZGVsdGFZLCBbYi5lbmRZLCBiLmhlaWdodF0sIFtiLmVuZEFscGhhLCAwXSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pLmNhbGwodGhpcyk7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5fdXBkYXRlU1ZHKGIsIGQsIGIuZGVsdGFBbHBoYSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBBbmRyb2lkU2Nyb2xsQ29tcG9uZW50LnByb3RvdHlwZS5fdXBkYXRlQm91bmRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGJvdW5kLCBpLCBuYW1lLCBvcHRpb25zLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gJC5ib3VuZHM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAobmFtZSBpbiByZWYpIHtcbiAgICAgIGJvdW5kID0gcmVmW25hbWVdO1xuICAgICAgaSA9IF8ua2V5cygkLmJvdW5kcykuaW5kZXhPZihcIlwiICsgbmFtZSk7XG4gICAgICBvcHRpb25zID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICBzd2l0Y2ggKGZhbHNlKSB7XG4gICAgICAgICAgY2FzZSBpICE9PSAwOlxuICAgICAgICAgICAgYm91bmQud2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICAgICAgcmV0dXJuIGJvdW5kLmQgPSBbMCwgMCwgMCwgMCwgYm91bmQud2lkdGggLyAyLCAwLCBib3VuZC53aWR0aCwgMCwgYm91bmQud2lkdGgsIDBdO1xuICAgICAgICAgIGNhc2UgaSAhPT0gMTpcbiAgICAgICAgICAgIGJvdW5kLnkgPSB0aGlzLmhlaWdodCAtIGJvdW5kLmhlaWdodDtcbiAgICAgICAgICAgIGJvdW5kLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgICAgIHJldHVybiBib3VuZC5kID0gWzAsIGJvdW5kLmhlaWdodCwgMCwgYm91bmQuaGVpZ2h0LCBib3VuZC53aWR0aCAvIDIsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodF07XG4gICAgICAgICAgY2FzZSBpICE9PSAyOlxuICAgICAgICAgICAgYm91bmQuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgICAgICAgICByZXR1cm4gYm91bmQuZCA9IFswLCAwLCAwLCAwLCBib3VuZC53aWR0aCwgYm91bmQuaGVpZ2h0IC8gMiwgMCwgYm91bmQuaGVpZ2h0LCAwLCBib3VuZC5oZWlnaHRdO1xuICAgICAgICAgIGNhc2UgaSAhPT0gMzpcbiAgICAgICAgICAgIGJvdW5kLnggPSB0aGlzLndpZHRoIC0gYm91bmQud2lkdGg7XG4gICAgICAgICAgICBib3VuZC5oZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICAgICAgICAgIHJldHVybiBib3VuZC5kID0gW2JvdW5kLndpZHRoLCAwLCBib3VuZC53aWR0aCwgMCwgMCwgYm91bmQuaGVpZ2h0IC8gMiwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodCwgYm91bmQud2lkdGgsIGJvdW5kLmhlaWdodF07XG4gICAgICAgIH1cbiAgICAgIH0pLmNhbGwodGhpcyk7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5fY3JlYXRlQm91bmQobmFtZSwgYm91bmQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX2NyZWF0ZUJvdW5kID0gZnVuY3Rpb24obmFtZSwgYm91bmQpIHtcbiAgICB2YXIgYjtcbiAgICBiID0gbmV3IExheWVyKHtcbiAgICAgIHg6IGJvdW5kLngsXG4gICAgICB5OiBib3VuZC55LFxuICAgICAgd2lkdGg6IGJvdW5kLndpZHRoLFxuICAgICAgaGVpZ2h0OiBib3VuZC5oZWlnaHQsXG4gICAgICBkOiBib3VuZC5kLFxuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogXCJcIixcbiAgICAgIHBhcmVudDogdGhpc1xuICAgIH0pO1xuICAgIGIuaXNPdmVyc2Nyb2xsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmJvdW5kcy5wdXNoKGIpO1xuICAgIHJldHVybiB0aGlzLl9jcmVhdGVTVkcoYik7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5wcm90b3R5cGUuX2NyZWF0ZVNWRyA9IGZ1bmN0aW9uKGJvdW5kKSB7XG4gICAgYm91bmQuc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJzdmdcIik7XG4gICAgYm91bmQuc3ZnLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIGJvdW5kLndpZHRoKTtcbiAgICBib3VuZC5zdmcuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIGJvdW5kLmhlaWdodCk7XG4gICAgYm91bmQucGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICBib3VuZC5wYXRoLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJyZ2JhKFwiICsgdGhpcy5lZmZlY3RDb2xvci5yICsgXCIsIFwiICsgdGhpcy5lZmZlY3RDb2xvci5nICsgXCIsIFwiICsgdGhpcy5lZmZlY3RDb2xvci5iICsgXCIsIFwiICsgdGhpcy5lZmZlY3RDb2xvci5hICsgXCIpXCIpO1xuICAgIGJvdW5kLnBhdGguc2V0QXR0cmlidXRlKFwiZFwiLCBcIk1cIiArIGJvdW5kLmRbMF0gKyBcIixcIiArIGJvdW5kLmRbMV0gKyBcIiBMXCIgKyBib3VuZC5kWzJdICsgXCIsIFwiICsgYm91bmQuZFszXSArIFwiIFFcIiArIGJvdW5kLmRbNF0gKyBcIixcIiArIGJvdW5kLmRbNV0gKyBcIiBcIiArIGJvdW5kLmRbNl0gKyBcIixcIiArIGJvdW5kLmRbN10gKyBcIiBMXCIgKyBib3VuZC5kWzhdICsgXCIsIFwiICsgYm91bmQuZFs5XSk7XG4gICAgYm91bmQuc3ZnLmFwcGVuZENoaWxkKGJvdW5kLnBhdGgpO1xuICAgIHJldHVybiBib3VuZC5fZWxlbWVudC5hcHBlbmRDaGlsZChib3VuZC5zdmcpO1xuICB9O1xuXG4gIEFuZHJvaWRTY3JvbGxDb21wb25lbnQucHJvdG90eXBlLl91cGRhdGVTVkcgPSBmdW5jdGlvbihib3VuZCwgZCwgYWxwaGEpIHtcbiAgICBib3VuZC5wYXRoLnNldEF0dHJpYnV0ZShcImRcIiwgXCJNXCIgKyBkWzBdICsgXCIsXCIgKyBkWzFdICsgXCIgTFwiICsgZFsyXSArIFwiLCBcIiArIGRbM10gKyBcIiBRXCIgKyBkWzRdICsgXCIsXCIgKyBkWzVdICsgXCIgXCIgKyBkWzZdICsgXCIsXCIgKyBkWzddICsgXCIgTFwiICsgZFs4XSArIFwiLCBcIiArIGRbOV0pO1xuICAgIHJldHVybiBib3VuZC5wYXRoLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgXCJyZ2JhKFwiICsgdGhpcy5lZmZlY3RDb2xvci5yICsgXCIsIFwiICsgdGhpcy5lZmZlY3RDb2xvci5nICsgXCIsIFwiICsgdGhpcy5lZmZlY3RDb2xvci5iICsgXCIsIFwiICsgYWxwaGEgKyBcIilcIik7XG4gIH07XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJlZmZlY3RDb2xvclwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lZmZlY3RDb2xvcjtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lZmZlY3RDb2xvciA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJkXCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2Q7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZCA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJjbGlja09yVG91Y2hcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2xpY2tPclRvdWNoO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NsaWNrT3JUb3VjaCA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJ0b3VjaFwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl90b3VjaDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl90b3VjaCA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJlZGdlRWZmZWN0XCIsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2VkZ2VFZmZlY3Q7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZWRnZUVmZmVjdCA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgQW5kcm9pZFNjcm9sbENvbXBvbmVudC5kZWZpbmUoXCJlZmZlY3RBbmltYXRpb25WYWx1ZVwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lZmZlY3RBbmltYXRpb25WYWx1ZTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lZmZlY3RBbmltYXRpb25WYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEFuZHJvaWRTY3JvbGxDb21wb25lbnQ7XG5cbn0pKFNjcm9sbENvbXBvbmVudCk7XG4iXX0=
