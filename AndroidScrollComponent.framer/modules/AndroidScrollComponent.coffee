$ = 
	bounds:
		topBound: x: 0, y: 0, height: 400, d: []
		bottomBound: x: 0, height: 400
		#leftBound: x: 0, y: 0, width: 400
		#rightBound: y: 0, width: 400

class exports.AndroidScrollComponent extends ScrollComponent
	constructor: (options={}) ->
<<<<<<< HEAD
		options.overscrollGlow ?= true
		options.edgeEffect ?= true
		options.fill ?= r: 0, g: 0, b: 0, a: .24
=======
		options.edgeEffect ?= true
		options.effectColor ?= r: 0, g: 0, b: 0, a: .24
>>>>>>> master
		super options
		
		# Disable overdrag and bounce
		@content.draggable.overdrag = false
		@content.draggable.bounce = false
		
		# Create bounds
		@bounds = []
		@_setBounds()
		
		# Overscroll animation 
		@effectAnimationValue = 0
		@effectAnimation = new Animation
			layer: @
			properties:
				effectAnimationValue: 1
			curve: "beizer-curve(0.0, 0.0, 0.2, 1)"
			time: .300
		
		# Setup events
		@on(Events.TouchStart, @_touchStart)
		@on(Events.TouchMove, @_touchMove)
		@on(Events.TouchEnd, @_touchEnd)
		document.addEventListener "touchend", @_touchEnd
		
	# EVENTS
	_touchStart: (e) =>
		# Touched is true
		@clickOrTouch = true
		
		# Stop animation / reset value 
		@effectAnimation.stop()
		Framer.Loop.off "update", @_updateOverscrollEndValue
		@effectAnimationValue = 0
		
		# Set touch x and y
		if Utils.isMobile()
			@touch = 
				x: e.touches[0].pageX
				y: e.touches[0].pageY
		else
			@touch = 
				x: e.offsetX
				y: e.offsetY
			
	_touchMove: (e) =>
		# Overscroll
		if @clickOrTouch
			@_overscrollY(e) if @scrollVertical and @edgeEffect is true
		
	_touchEnd: (e) =>
		# Touched is false 
		@clickOrTouch = false
		
		# Set end values
		for b in @bounds when b.isOverscrolled is true
			b.endY = b.deltaY
			b.endSideY = b.deltaSideY
			b.endAlpha = b.deltaAlpha
		
		# Overscroll animation 
		@effectAnimation.start()
		@effectAnimation.onAnimationEnd ->
			Framer.Loop.off "update", @options.layer._updateOverscrollEndValue
			
		Framer.Loop.on "update", @_updateOverscrollEndValue
			
	# FUNCTIONS
	_overscrollY: (e) =>
		top = @bounds[0]
		bottom = @bounds[0]
		eventX = if Utils.isMobile() then e.touches[0].pageX else e.offsetX
		eventY = if Utils.isMobile() then e.touches[0].pageY else e.offsetY
		
		if @scrollY is 0
			b = @bounds[0]
			b.isOverscrolled = true
			
			# Deltas
			d = b.d
			
			d[5] = b.deltaY = Utils.modulate eventY - @touch.y, [0, b.height], [0, b.height], true
			d[3] = d[7] = b.deltaSideY = Utils.modulate b.deltaY, [0, b.height], [0, b.height * .20], true
			d[2] = b.deltaLeftSideX = Utils.modulate eventX, [0, b.width], [-(b.width/4), 0], true
			d[6] = b.deltaRightSideX = Utils.modulate eventX, [0, b.width], [b.width, b.width + (b.width/4)], true
			b.deltaAlpha = Utils.modulate b.deltaY, [0, b.height], [0, @effectColor.a], true
			
			# Update SVG
			@_updateSVG(b, d, b.deltaAlpha)
			
		else if @scrollY is Math.floor(@content.height - @height)
			b = @bounds[1]
			b.isOverscrolled = true
			
			# Deltas
			d = b.d
			
			d[5] = b.deltaY = Utils.modulate @touch.y - eventY, [b.height, 0], [0, b.height], true
			d[3] = d[7] = b.deltaSideY = Utils.modulate b.deltaY, [b.height, 0], [b.height, b.height - (b.height * .20)], true
			d[2] = b.deltaLeftSideX = Utils.modulate eventX, [0, b.width], [-(b.width/4), 0], true
			d[6] = b.deltaRightSideX = Utils.modulate eventX, [0, b.width], [b.width, b.width + (b.width/4)], true
			b.deltaAlpha = Utils.modulate b.deltaY, [b.height, 0], [0, @effectColor.a], true
			
			# Update SVG
			@_updateSVG(b, d, b.deltaAlpha)
		
		else 
			top.isOverscrolled = false
			bottom.isOverscrolled = false
			
	_updateOverscrollEndValue: =>
		for b in @bounds when b.isOverscrolled is true
			options = switch 
				when b.name is "topBound"
					d = b.d
					
					d[5] = b.deltaY = Utils.modulate @effectAnimationValue, [0, 1], [b.endY, 0], true
					d[3] = d[7] = b.deltaSideY = Utils.modulate b.deltaY, [b.endY, 0], [b.endSideY, 0], true
					b.deltaAlpha = Utils.modulate b.deltaY, [b.endY, 0], [b.endAlpha, 0], true
					
				when b.name is "bottomBound"
					d = b.d
					
					d[5] = b.deltaY = Utils.modulate @effectAnimationValue, [0, 1], [b.endY, b.height], true
					d[3] = d[7] = b.deltaSideY = Utils.modulate b.deltaY, [b.endY, b.height], [b.endSideY, b.height], true
					b.deltaAlpha = Utils.modulate b.deltaY, [b.endY, b.height], [b.endAlpha, 0], true
					
			# Update SVG
			@_updateSVG(b, d, b.deltaAlpha)
		
	_setBounds: =>
		for name, bound of $.bounds
			i = _.keys($.bounds).indexOf "#{name}"
			
			options = switch
				when i is 0
					bound.width = @width
					bound.d = [0, 0, 0, 0, bound.width/2, 0, bound.width, 0, bound.width, 0]
				when i is 1
					bound.y = @height - bound.height
					bound.width = @width
					bound.d = [0, bound.height, 0, bound.height, bound.width/2, bound.height, bound.width, bound.height, bound.width, bound.height]
					
			# Create bound		
			@_createBound(name, bound)
					
	_createBound: (name, bound) =>
		b = new Layer 
			x: bound.x
			y: bound.y
			width: bound.width
			height: bound.height
			name: name
			backgroundColor: "" 
			parent: @

		# Set d
		b.d = bound.d
			
		# Set isOverscrolled
		b.isOverscrolled = false
			
		# Push to array
		@bounds.push b
		
		# Create SVG
		@_createSVG(b)
		
	_createSVG: (bound) =>
		bound.svg = document.createElementNS "http://www.w3.org/2000/svg", "svg"
		bound.svg.setAttribute "width", bound.width
		bound.svg.setAttribute "height", bound.height
		
		bound.path = document.createElementNS "http://www.w3.org/2000/svg", "path"
<<<<<<< HEAD

=======
		bound.path.setAttribute "fill", "rgba(#{@effectColor.r}, #{@effectColor.g}, #{@effectColor.b}, #{@effectColor.a})"
		bound.path.setAttribute "d", "M#{bound.d[0]},#{bound.d[1]} L#{bound.d[2]}, #{bound.d[3]} Q#{bound.d[4]},#{bound.d[5]} #{bound.d[6]},#{bound.d[7]} L#{bound.d[8]}, #{bound.d[9]}"
		
>>>>>>> master
		# Append 
		bound.svg.appendChild bound.path 
		bound._element.appendChild bound.svg

		# Update SVG
		@_updateSVG(bound, bound.d, @fill.a)
		
	_updateSVG: (bound, d, alpha) =>
		bound.path.setAttribute "d", "M#{d[0]},#{d[1]} L#{d[2]}, #{d[3]} Q#{d[4]},#{d[5]} #{d[6]},#{d[7]} L#{d[8]}, #{d[9]}"
		bound.path.setAttribute "fill", "rgba(#{@effectColor.r}, #{@effectColor.g}, #{@effectColor.b}, #{alpha})"
					
	# DEFINTIONS
	@define "effectColor",
		get: -> @_effectColor
		set: (value) -> @_effectColor = value 
		
<<<<<<< HEAD
	@define "touched",
		get: -> @_touched
		set: (value) -> @_touched = value
=======
	@define "d", 
		get: -> @_d 
		set: (value) -> @_d = value
		
	@define "clickOrTouch",
		get: -> @_clickOrTouch
		set: (value) -> @_clickOrTouch = value
>>>>>>> master
		
	@define "touch",
		get: -> @_touch 
		set: (value) -> @_touch = value

	@define "edgeEffect",
		get: -> @_edgeEffect 
		set: (value) -> @_edgeEffect = value
		
	@define "effectAnimationValue",	
	get: -> @_effectAnimationValue
	set: (value) -> @_effectAnimationValue = value