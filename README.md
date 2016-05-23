# Android ScrollComponent
Framer ScrollComponent for Android.

![alt text](https://github.com/joshmtucker/Android-ScrollComponent/blob/master/AndroidScrollComponent.framer/images/readmeDemo.gif "Example of AndroidScrollComponent")

## Setup
### Modules folder
Put *AndroidScrollComponent.coffee* in your project's modules folder.
### Framer Studio
In your Framer Studio project, include the module.
```coffeescript
{AndroidScrollComponent} = require "AndroidScrollComponent"
```
## Add an Android ScrollComponent
Because AndroidScrollComponent extends ScrollComponent, create it using the same properties you would for a ScrollComponent. 
```coffeescript
scroll = new AndroidScrollComponent
  x: 0
  y: 0
  width: Screen.width
  height: Screen.height - appBar.height
```
### Additional properties
#### overscrollGlow
*Boolean* – Enable or disable the overscroll glow
```coffeescript
scroll.overscrollGlow = true # Enables overscroll glow (enabled by default)
scroll.overscrollGlow = false # Disables overscroll glow
```
#### fill
*Object* – The RGBA value for the overscroll glow
```coffeescript
# Default is is {r: 0, g: 0, b: 0, a: .24}
# Alpha e.g. "a" should be the highest value or ending value of the glow. Overscroll glow starts from 0

scroll.fill = {r: 33, g: 150, b: 243, a: .24}
```
##### Why does the color need to be in object format?
In order to change the value of the *a* e.g. alpha when overscrolling, the color must be in object format.

## Future improvements
### Left and right overscroll bounds
If you check the *AndroidScrollComponent* source, you notice I commented out some code that relates to having left and right overscroll bounds. Left and right bounds aren't often used so I omitted it for now, but could always add it in later.
### Overscroll glow bounce
This refers to when you touchEnd while scrolling and the scrollView hits the contraints or e.g. bounds. Android will animate the overscroll glow in and out when this occurs. Will add this in at some point.
### Code improvements
I'll continue to refine some areas around modulating the SVG layers and creating the bounds in general. **My code is always open for improvement.** Please feel free to pull request or critique my code; you'll only make it better!

## Contact me
I'm always available in the [FramerJS Facebook Group](https://www.facebook.com/groups/framerjs/ "FramerJS Facebook Group"). You can also find me on Twitter - [@joshmtucker](https://twitter.com/joshmtucker "@joshmtucker on Twitter").

