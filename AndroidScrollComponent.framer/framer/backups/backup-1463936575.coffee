$ = 
	bounds:
		topBound: x: 0, y: 0, height: 400, d: []
		#bottomBound: x: 0, height: 400
		#leftBound: x: 0, y: 0, width: 400
		#rightBound: y: 0, width: 400

class AndroidScrollComponent extends ScrollComponent
	constructor: (options={}) ->
		options.fill ?= r: 0, g: 0, b: 0, a: .24
		super options
		
		# Disable overdrag and bounce
		@content.draggable.overdrag = false
		@content.draggable.bounce = false
		
		# Create bounds
		@bounds = []
		@_updateBounds()
		
		# EVENTS
		
	# FUNCTIONS
	_updateBounds: =>
		for name, bound of $.bounds
			i = _.keys($.bounds).indexOf "#{name}"
			
			options = switch
				when i is 0
					bound.width = @width
					bound.d = [0, 0, 0, 0, bound.width/2, bound.height, bound.width, 0, bound.width, 0]
				when i is 1
					bound.y = @height - bound.height
					bound.width = @width
					bound.d = [0, bound.height, 0, bound.height, bound.width/2, 0, bound.width, bound.height, bound.width, bound.height]
				when i is 2
					bound.height = @height
					bound.d = [0, 0, 0, 0, bound.width, bound.height/2, 0, bound.height, 0, bound.height]
				when i is 3
					bound.x = @width - bound.width
					bound.height = @height
					bound.d = [bound.width, 0, bound.width, 0, 0, bound.height/2, bound.width, bound.height, bound.width, bound.height]
					
			# Create bound		
			@_createBound(name, bound)
					
	_createBound: (name, bound) =>
		b = new Layer 
			x: bound.x
			y: bound.y
			width: bound.width
			height: bound.height
			d: bound.d
			name: name
			backgroundColor: "" 
			parent: @
			
		# Push to array
		@bounds.push b
		
		# Create SVG
		@_createSVG(b)
		
	_createSVG: (bound) =>
		bound.svg = document.createElementNS "http://www.w3.org/2000/svg", "svg"
		bound.svg.setAttribute "width", bound.width
		bound.svg.setAttribute "height", bound.height
		
		bound.path = document.createElementNS "http://www.w3.org/2000/svg", "path"
		bound.path.setAttribute "fill", "rgba(#{@fill.r}, #{@fill.g}, #{@fill.b}, #{@fill.a})"
		bound.path.setAttribute "d", "M#{bound.d[0]},#{bound.d[1]} L#{bound.d[2]}, #{bound.d[3]} Q#{bound.d[4]},#{bound.d[5]} #{bound.d[6]},#{bound.d[7]} L#{bound.d[8]}, #{bound.d[9]}"
		
		# Append 
		bound.svg.appendChild bound.path 
		bound._element.appendChild bound.svg
				
	# DEFINTIONS
	@define "fill",
		get: -> @_fill
		set: (value) -> @_fill = value 
		
	@define "d", 
		get: -> @_d 
		set: (value) -> @_d = value
		
scroll = new AndroidScrollComponent
	width: Screen.width
	height: Screen.height
	scrollHorizontal: false
	
for i in [0...20]
	item = new Layer 
		y: 192 * i
		width: scroll.width
		height: 192
		backgroundColor: Utils.randomColor(1)
		parent: scroll.content