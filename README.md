# Tools

Collection of JavaScript functions that I found useful,
collected in few ES6 modules.

## What it provide

In this library you can find utilities for
* [HTML printing](docs/dom.md)
* [test suite](docs/test.md)
* [debuging library](docs/debug.md)
* [observer pattern interface](docs/observe.md)
* [reactive pattern interface](docs/reactive.md)
* [base utils](docs/utils.md)
* [base tools](docs/tools.md)

# Some examples

The following examples assume that the repository is cloned in the current
direcotry.

## Test suite

A class for test handling is provided in the test.mjs module

```javascript
import Test from "./tools/test.mjs";

// Throw an error if strict equal comparison fails
import { ASSERT } from "./tools/debug.mjs"; 

// The function to be tested, it simply sums the arguments if there are any,
// otherwise it will throw
const sum = (...arg) => {
	if(!arg.length){
		throw new Error("no arguments!");
	}
	return arg.reduce((prev, curr) => {
		return curr + prev
	}, 0)
}

// Define your test case
const test = new Test(
	// Add a description
	"2 + 2 should return 4",
	
	// define the test case
	(N) => {
		ASSERT(sum(2, 2), 4)

		// You can run the test using different arguments
		// ie test the 1 + 2 + 3 + ... + N serie
		var args = []
		for(var i = 1; i <= N; i++) {
			args.push(i)
		}

		ASSERT(sum.apply(this, args), N * (N + 1) / 2 )
	}
)

// run with 100 as argument
test.run(100)

// Throws an error if called with no arguments
test.die()
```

## Dom utilities

A set of functions for building html fragments

```javascript
// import the library
import * from dom from "./tools/dom.mjs";

document.body.appendChild(dom.html `<span>ipsum</span>`)

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

// prints a dom fragment in the body... in emmet dialect!
document.body.appendChild(
	dom.emmet `article>${myTitle2}.title>span{hello }`
)

// of course you can still handle your element after
myTitle2.innerHTML += 'emmet!'
```

## Observer

Injects an observer patterns interface in objects by adding the following
function to handle events
- `on` to append an handler to a event
- `off` to remove an handler
- `once` to append an handler to an event and call it once
- `fire` to call all the handler associated to an event

```javascript
import observable from "./tools/observe.mjs"

// the following class will trigger the event "firework" repeatedly
class Firework {
	#counter = 0
	// trigger the event using "fire" and then reschedule
	now(){
		this.fire('fireworks', ++this.#counter)
		this.schedule()
	}

	schedule() {
		setTimeout(
			this.now.bind(this),
			Math.random() * 500
		)
	}
}

// you can inject the interface to the prototype
observable.call(Firework.prototype)

// create instance of Firework
let firework = new Firework()

// add an event handler for both the events
firework.on('fireworks', (counter) => {
	console.log('firework event triggered!', counter)
})

firework.now()
```

## Reactive

Sincronize variation between different objects

```javascript
import reactive from "./tools/reactive.mjs"

// The instances from the following class expose a property named "magic"
// that can be used to update property of other objects
class MyReactive {
	constructor() {
		// expose magic as bindable. Assumes that the interface is injected
		this.bindable("magic")
	}
}
// add reactive inteface to MyReactive's prototype
reactive.call(MyReactive.prototype)

// create an instance and a target object
let myReactive = new MyReactive(), myTarget = {}

// you can bind the "magic" of myReactive to myTarget's "magic" property
myReactive.bind('magic', myTarget)

// changes on myReactive.magic will be reflected to myTarget.magic
myReactive.magic = 'hello reactive!'

// the following statement will print 'hello reactive!'
console.log(myTarget.magic)

// You can use reactive to update the text inside HTML elements
let element = document.querySelector('#my-element')
if(element) {
	myReactive.bind(
		'magic',
		element,
		'innerHTML'
	)
}
myReactive.magic = 'hello again!'

// You can also bind the property changes to a function
myReactive.bind(
	'magic',
	console.log.bind(console)
)
// will call console.log
myReactive.magic = 'woooow!!'
```
