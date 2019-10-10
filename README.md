Tools
===
userfull es6 mini library

## What it does provide

In this library you can find utilities for
* generic purpuse -> utils.js
* generator for object conposition -> tools.js
* observer pattern interface -> observe.js
* reactive pattern interface -> reactive.js
* a mini test suite -> test.js
* debuging handlers -> debug.js

*documentation reference can be found [here](docs/index.md)*

# Examples

I think that the ```observable``` and the ```reactive``` interfaces deserve a more in depth view

Observer
---

It implements the observer pattern in the objects where is injected.

For example:

```javascript
import observable from "./observe.js"

// take your class
class FireworkClass {
	now(...args){
		// do some magic stuff
		// then...
		this.fire('fireworks!', ...args)
		this.schedule()
	}
	// never stop the fireworks <3
	schedule() {
		setTimeout(
			this.now.bind(this),
			Math.random() * 500
		)
	}
}
// and inject the interface
observable.call(FireworkClass.prototype)
```
The `observable.call(FireworkClass.prototype)` will add the function for handle events
- on
- off
- once
- fire

***fire*** will dispatch the event
```javascript

// ...

// create instance
let firework = new FireworkClass()

// add an event handler for both the events
firework.on('fireworks!', (...args) => {
	console.log('this fireworks are beautiful', ...args)
})

// ...

// let's do the fireworks now!
firework.now( /* [...args] */ )
```

Reactive
---
Sincronize variation between different objects
```javascript
import reactive from "./reactive.js"

// define MyReactiveClass
class MyReactiveClass {
	constructor() {
		// make magicProperty bindable
		this.bindable("magicProperty")
	}
}
// add reactive inteface to MyReactiveClass's prototype
reactive.call(MyReactiveClass.prototype)
```
After you have injected the interface, the instances can have some ***bindable*** properties
```javascript
// create instance
let myReactiveInstance = new MyReactiveClass()
let myObj = {} // given an object
// you can bind the
// magicProperty of myReactiveInstance
// to myObj's magicProperty
myReactiveInstance.bind('magicProperty', myObj)

myReactiveInstance.magicProperty = 'hello reactive!'
// will print 'hello reactive!'
console.log(myObj.magicProperty)
```
This can be userfull when building user interfaces because...
```javascript
// you can of course bind a reactive object
// with different properties another object
let element = document.querySelector('#my-element')
if(element) {
	myReactiveInstance.bind(
		'magicProperty',
		element,
		'innerHTML'
	)
	// the html content of #my-element
	// will be updated when the magicProperty change
}
myReactiveInstance.magicProperty = 'hello again!'
```
sometimes can be userfull also to bind a method of an object to a bindable reactive's property
```javascript
// and you can surely use it with functions
myReactiveInstance.bind(
	'magicProperty',
	console.log.bind(console)
)

// now we will also print the magicProperty value
// in console when the magicProperty change
myReactiveInstance.magicProperty = 'woooow!!'
```

Test
---

This mini test suite is super easy to and but work super well!

you can define your test scenario and if something goes wrong you can throw it, then the test will ***fail*** and a **fail** message will be printed the console. Otherwise it will ***pass*** and a **passed** message in console will be printed.
```javascript
import Test from "./test.js";

// create a test scenario
const testScenario = (...something) => {
	// ...
	// if something goes wrong
	// throw it with no mercy!!
	throw something;
}
new Test("My test description", testScenario).run(1,2,3)
```