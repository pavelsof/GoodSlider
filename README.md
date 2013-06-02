GoodSlider
==========
Yet another lightweight horizontal jQuery slider

Dependencies and Compatibility
---
Needs jQuery 1.8+ for fuel. No problems performing on Firefox, Chrome, Opera and IE 9+. 

Basic Usage and Settings
---
If you do something like this:
```javascript
slider = new GoodSlider();
```
then you will have a GoodSlider running on its default settings, which means that GoodSlider will find the first DOM element with class `.slider` and will start sliding those of its children, which are classed as `.item`. Pass an object to overwrite the default settings, which are (alphabetically ordered): 
* `animation`: an object containing settings related to the slider movement animation. 
    * `duration`: See the documentation for jQuery [animate()](http://api.jquery.com/animate/). 
    * `easing`: See the documentation for jQuery [animate()](http://api.jquery.com/animate/). 
* `automation`: an object containing settings you will use it if you want automatic sliding. 
    * `interval`: In milliseconds. The default value is false, meaning that there no automatic sliding will take place. 
    * `direction`: Either `to_right` or `to_left`. The latter is the default value. 
* `callbacks`: an object containing user-defined callbacks. There is only one such callback (for now!). 
    * `movement`: Called when the slider movement ends completely. No default value. 
* `elements`: an object containing jQuery selectors or objects of the slider’s important DOM elements. 
    * `container`: GoodSlider will look for items to slide in this DOM element only. The latter will not be affected in any way, so you can pass `body` if you want.  The default value is `.slider:first`. 
    * `items`: These will be wrapped in a dynamically generated DOM element and put to the slide. The default value is `.item`. 
    * `left_arrow`: An event handler will be attached to this element. It must be within the container element. The default value is `.arrow_left`. 
    * `right_arrow`: Same as above, but for the other direction. The default value is `.arrow_right`. 
* `endless`: Boolean determining whether the slider will stop when going to its extreme left or right items. The default value is `false`. 
* `height`: Pass a string like `200px` if you want to fix the slider’s height to 200 px. The default value is `false`, meaning that GoodSlider will take the height of its items. 
* `visible_items`: An integer determining the number of items which will be visible. The default value is `5`. 

So, if you do something like this:
```javascript
slider = new GoodSlider({
    animation: {
        duration: 100
    }, 
    visible_items: 7
});
```
then you will have a GoodSlider with more visible items and faster animation. 

Positions
---
E.g. the third from the right, the central one, the ones which are two away from the central one, etc. The user slides to and fro, but the positions remain in their places, affecting the items which happen to fall in there. To add a position, do something like this: 
```javascript
slider.add_position('R2', {css_class: 'D2'});
```
The first argument is the position’s identifier, which consists of a letter and a number. The letter denotes where you start counting from (`L`, `R`, `C` for left, right, or centre; case-insensitive), and the number is the count. 

The second argument is a settings object, which (for now) contains a single property: the CSS class of the item, which will be in the position in question. In combination with CSS transitions, GoodSlider’s positions makes it easy to create awesome sliders. See `/test` for a demo. 

Methods
---
An alphabetically ordered list of GoodSlider’s methods. 
* `add_position(id, settings)`: Read more about positions, their IDs and settings above. 
* `move(direction)`: Slides the slider one step forward. The parameter must be either `to_right` or `to_left`. 
* `remove_position(id)`: Read more about positions and their IDs above. 
* `die()`: Destroys the slider. You need to re-init in order to make it work again. 

Licence
---
GoodSlider is published under the [Apache License](http://www.apache.org/licenses/LICENSE-2.0). 
