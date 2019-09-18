Tools
===
userfull es6 mini library

What it does provide
---
In this library you can find utilities for
* generic purpuse like pipe noop ecc -> utils.js
* generator for object conposition -> tools.js
* observer pattern interface -> observe.js
* reactive pattern interface -> reactive.js
* a mini test suite -> test.js
* debuging handlers -> debug.js

Examples
---
I think that the ```observable``` and the ```reactive``` interfaces deserve a more in depth view

> ## Observer
> ```javascript
> import observable from "./observe.js"
>
> // define MyObservableClass
> class MyObservableClass {
> 	doStuff(...args){
> 		this.fire('doing', ...args, '-> doing')
> 		this.fire('done', ...args, '-> done')
> 	}
> }
> // add observable inteface to
> // MyObservableClass's prototype
> observable.call(MyObservableClass.prototype)
>
> // create instance
> let myObservableInstance = new MyObservableClass()
>
> // add an event handler for both the events
> myObservableInstance
> .on('doing done', (...args) => {
> 	console.log(`handle ${args.join(' ')}`)
> })
>
> // do stuff (will fire the 'doing' event)
> myObservableInstance.doStuff('some buisnes')
>
> myObservableInstance // add another handler
> .on('doing', (...args) => {
> 	console.log(`another handler for ${args.join(' ')}`)
> })
>
> // multiple parameter
> myObservableInstance
> .doStuff('some', 'other', 'buisnes')
> ```
> ## Reactive
> ```javascript
> import reactive from "./reactive.js"
>
> // define MyReactiveClass
> class MyReactiveClass {
> 	constructor() {
> 		// make magicProperty bindable
> 		this.bindable("magicProperty")
> 	}
> }
> // add reactive inteface to MyReactiveClass's prototype
> reactive.call(MyReactiveClass.prototype)
>
> // create instance
> let myReactiveInstance = new MyReactiveClass()
> let myObj = {} // given an object
> // you can easly bind the
> // magicProperty of myReactiveInstance
> // to myObj's magicProperty
> myReactiveInstance.bind('magicProperty', myObj)
>
> myReactiveInstance.magicProperty = 'hello reactive!'
> // will print 'hello reactive!'
> console.log(myObj.magicProperty)
>
> // you can of course use it with different properties
> let element = document.querySelector('#my-element')
> if(element) {
> 	myReactiveInstance
> 	.bind('magicProperty', element, 'innerHTML')
> 	// now the html content of #my-element
> 	// will be updated when the magicProperty change
> }
> myReactiveInstance
> .magicProperty = 'hello again!'
>
> // and you can surely use it with functions
> myReactiveInstance
> .bind('magicProperty', console.log.bind(console))
> // now we will also print the magicProperty value
> // in console when the magicProperty change
> myReactiveInstance.magicProperty = 'woooow!!'
> ```
> ## Test
> ```javascript
> // the mini test suite is super easy to use and have
> // all the essential function that a test suite shuld have
> import * as test from "./test.js";
>
> // given a test case function
> let testCase = (arg) => test.ASSERT_T(arg)
>
> // you can test it by passing its reference
> // to a new Test instance
> // arguments will be forwarder from run to the testCase function
> new test.Test("test descriptrion", testCase ).run('arguments')
> // if all goes right a green message will be shown in the console
>
> new test.Test("test descriptrion", testCase ).run()
> // otherwise a red message will be printed
> ```