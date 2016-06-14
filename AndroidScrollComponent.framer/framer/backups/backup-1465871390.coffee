{AndroidScrollComponent} = require "AndroidScrollComponent"

# App Bar
appBar = new Layer 
	width: Screen.width
	height: 145.6
	backgroundColor: "#2196F3"

# App Bar Title	
appBar.title = document.createElement "div"
appBar.title.innerHTML = "List"
appBar.title.style.color = "white"
appBar.title.style.font = "500 normal 52px Roboto"
appBar.title.style.paddingLeft = "187.2px"
appBar.title.style.lineHeight = "145.6px"
appBar._element.appendChild(appBar.title)
			
scroll = new AndroidScrollComponent
	y: appBar.maxY
	width: Screen.width
	height: Screen.height - appBar.height
	scrollHorizontal: false
	# Fill must be done in this format to work
	fill: {r: 33, g: 150, b: 243, a: .24}

# Used for avatar colors
colors = Utils.cycle(["#03A9F4", "#0F9D58", "#FF9800"])

# Create list items	
for i in [0...20]
	item = new Layer 
		y: 145.6 * i
		width: scroll.width
		height: 145.6
		backgroundColor: "white"
		name: "item #{i+1}"
		parent: scroll.content
		
	item.title = document.createElement "div"
	item.title.innerHTML = "Item #{i+1}"
	item.title.style.color = "#212121"
	item.title.style.font = "400 normal 39px Roboto"
	item.title.style.paddingLeft = "187.2px"
	item.title.style.lineHeight = "145.6px"

	item._element.appendChild(item.title)
		
	item.avatar = new Layer 
		x: 41.6
		midY: item.height/2
		width: 104
		height: 104
		borderRadius: 104
		name: "avatar"
		backgroundColor: colors()
		parent: item