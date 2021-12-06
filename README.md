# Tools A Functional E6 Library

The library is a collection of JavaScript functions that I found useful, grouped in ES6
modules.

## In this library you can find utilities for

* [HTML printing](docs/dom.md)
* [test suite](docs/test.md)
* [debugging library](docs/debug.md)
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

// The ASSERT function throws an error if strict equal comparison fails
import { ASSERT } from "./tools/debug.mjs"; 

// The function to be tested, it simply sums the arguments if there are any,
// otherwise it will throw an error
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
		// ie test the 1 + 2 + 3 + ... + N series
		var args = []
		for(var i = 1; i <= N; i++) {
			args.push(i)
		}

		ASSERT(sum.apply(this, args), N * (N + 1) / 2 )
	}
)

// Run with 100 as argument
test.run(100)

// Verify that your test case throws an error if called with no arguments
test.die()
```

## Dom utilities

A set of functions to build HTML fragments

```javascript
// Import the library
import * from dom from "./tools/dom.mjs";

document.body.appendChild(dom.html `<span>ipsum</span>`)

// You can use your own elements
const myTitle = document.createElement('h2')

// The following statement prints a DocumentFagment in the body
document.body.appendChild(dom.html `
	<article>
		${myTitle}
	</article>
`)

// You can handle myTitle element after it has been printed too
myTitle.innerHTML = 'hello world'
```
And it also works with an ***emmet-like*** sintax too!

```javascript
const myTitle2 = document.createElement('h2')

// The following statement prints a dom fragment in the body... in emmet dialect
document.body.appendChild(
	dom.emmet `article>${myTitle2}.title>span{hello }`
)

// You can still handle your element after
myTitle2.innerHTML += 'emmet!'
```

## Observer

It is an observer pattern interface injectable in objects.
The following functions are injected to myObj when `observable.call(myObj)`
is called
- `on` to append a handler to a event
- `off` to remove a handler
- `once` to append a handler to an event and call it once
- `fire` to call all the handlers associated to an event

```javascript
import observable from "./tools/observe.mjs"

// the following class will trigger the event "firework" repeatedly
class Firework {
	#counter = 0
	// triggers the event using "fire" and then reschedule it
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

This interface can be used to keep the state of different objects synchronized

```javascript
import reactive from "./tools/reactive.mjs"

// The instances from the following class expose a property named "foo"
// that can be used to update a property of other objects
class MyReactive {
	constructor() {
		// Exposes foo as bindable. Assumes that the interface is injected
		this.bindable("foo")
	}
}
// Adds reactive interface to MyReactive's prototype
reactive.call(MyReactive.prototype)

// Creates an instance and a target object
let myReactive = new MyReactive(), myTarget = {}

// You can bind the "foo" of myReactive to myTarget's "foo" property
myReactive.bind('foo', myTarget)

// Changes on myReactive.foo will be reflected to myTarget.foo
myReactive.foo = 'hello reactive!'

// The following statement will print 'hello reactive!'
console.log(myTarget.foo)

// You can use reactive to update the text inside HTML elements
let element = document.querySelector('#my-element')
if(element) {
	myReactive.bind(
		'foo',
		element,
		'innerHTML'
	)
}
myReactive.foo = 'hello again!'

// You can also bind the property changes to a function
myReactive.bind(
	'foo',
	console.log.bind(console)
)
// The following assignment will call console.log
myReactive.foo = 'woooow!!'
```
