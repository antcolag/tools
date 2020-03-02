Tools
===
userfull es6 mini library

## What it does provide

In this library you can find utilities for
* generic purpuse -> *[utils.mjs](doc/utils.md)*
* generator for object conposition -> *[tools.mjs](doc/tools.md)*
* observer pattern interface -> *[observe.mjs](doc/observe.md)*
* reactive pattern interface -> *[reactive.mjs](doc/reactive.md)*
* a mini test suite -> *[test.mjs](doc/test.md)*
* debuging handlers -> *[debug.mjs](doc/debug.md)*
* dom printing -> *[dom.mjs](doc/dom.md)*

# Examples

I think that the test suite, the dom utilities, and the ```observable``` and ```reactive``` interfaces deserve quick but in depth view

Test suite
---

This mini test class is super easy to use but work super well!

you can define your test scenario and if something goes wrong (ie if something is thrown, like an unhandled runtime error), then the test will ***fail*** and a **fail** message will be printed the console. Otherwise it will ***pass*** and a **passed** message in console will be printed.
```javascript
import Test from "./test.mjs";
// ASSERT will throw an error if strict equal comparison fails
import { ASSERT } from "./debug.mjs"; 

// the function to be tested
const sum = (...arg) => {
	// ...
	// if something goes wrong
	// throw it with no mercy!!
	if(!arg.length){
		throw new Error("no arguments!");
	}
	// simply sum the arguments
	return arg.reduce((prev, curr) => {
		return curr + prev
	}, 0)
}

// define your test
const test = new Test("2 + 2 should return 4", (N) => {
	ASSERT(sum(2, 2), 4)

	// test the 1 + 2 + 3 + ... + N serie
	var args = []
	for(var i = 1; i <= N; i++) {
		args.push(i)
	}
	ASSERT(sum.apply(this, args), N * (N + 1) / 2 )
})

// run it!
test.run(100)
```

Dom utilities
---

A set of a fiew userfull utilities for building user interfaces

```javascript
// import the library
import * from dom from "./dom.mjs";

// you can use your own elements
const myTitle = document.createElement('h2')

// print a dom fragment in the body
document.body.appendChild(dom.html `
	<article>
		${myTitle}
	</article>
`)

// of course you can handle your element after it has been printed 
myTitle.innerHTML = 'hello world'
```
And it work with an ***emmet-like*** sintax too!

```javascript
const myTitle2 = document.createElement('h2')

// print a dom fragment in the body... in emmet dialect!
document.body.appendChild(
	dom.emmet `article>${myTitle2}.title>span{hello }`
)

// of course you can still handle your element after
myTitle2.innerHTML += 'emmet!'
```

Observer
---

It implements the observer pattern in the objects where is injected.

For example:

```javascript
import observable from "./observe.mjs"

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
import reactive from "./reactive.mjs"

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
