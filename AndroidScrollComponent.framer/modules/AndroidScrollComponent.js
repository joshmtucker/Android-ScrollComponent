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
    if (options.edgeEffect == null) {
      options.edgeEffect = true;
    }
<<<<<<< HEAD
    if (options.edgeEffect == null) {
      options.edgeEffect = true;
    }
    if (options.fill == null) {
      options.fill = {
=======
    if (options.effectColor == null) {
      options.effectColor = {
>>>>>>> master
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
<<<<<<< HEAD
    this._setBounds();
    this.overscrollEndValue = 0;
    this.overscrollEnd = new Animation({
=======
    this._updateBounds();
    this.effectAnimationValue = 0;
    this.effectAnimation = new Animation({
>>>>>>> master
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
<<<<<<< HEAD
=======
    bound.path.setAttribute("fill", "rgba(" + this.effectColor.r + ", " + this.effectColor.g + ", " + this.effectColor.b + ", " + this.effectColor.a + ")");
    bound.path.setAttribute("d", "M" + bound.d[0] + "," + bound.d[1] + " L" + bound.d[2] + ", " + bound.d[3] + " Q" + bound.d[4] + "," + bound.d[5] + " " + bound.d[6] + "," + bound.d[7] + " L" + bound.d[8] + ", " + bound.d[9]);
>>>>>>> master
    bound.svg.appendChild(bound.path);
    bound._element.appendChild(bound.svg);
    return this._updateSVG(bound, bound.d, this.fill.a);
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

<<<<<<< HEAD
  AndroidScrollComponent.define("touched", {
=======
  AndroidScrollComponent.define("d", {
    get: function() {
      return this._d;
    },
    set: function(value) {
      return this._d = value;
    }
  });

  AndroidScrollComponent.define("clickOrTouch", {
>>>>>>> master
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
