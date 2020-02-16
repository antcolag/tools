Reactive
===
This extension provide a way to build a bind betwin the properies of two or more objcets.

Description
---
Is userfull when you need to mantain aligned the properties of a set of objects. But is perfect for build graphic interfaces because it semplify the binding between a model object and the UI for visualize data.

Initialization
---
```javascript
// you can initialize an existing object
var myObj = reactive.call({})

// of course you can use it with prototype objects
class Type {}
reactive.call(Type.prototype)

// or you can create an instance of reactive
var myReact = new reactive

// then make a property bindable
myObj.bindable("property")
```

Provides
---
> bindable
> ---
> *declare a bindable property*
> ```javascript
> var instance = reactive.call({})
> instance.bindable("property")
> ```
> ---
> bind
> ---
> *binds an object to a reactive instance*
> ```javascript
> var other = {}
> instance.bind("property", other)
> ```
> ---
> unbind
> ---
> *unbinds a property from the reactive instance*
>```javascript
> instance.unbind("property", other)
> ```


How to use
---
You only need to inject his instance in the object you want to enhance, declare the bindable properties and then bind the object you want to mantain aligned

```javascript
// you can initialize an existing object
var myObj = reactive.call({})

// then make a property bindable
myObj.bindable("property")

var yourObj = {}
myObj.bind("property", yourObj)

// works with objects as well as with functions
myObj.bind("property", console.log.bind(console))

// this statement will update yourObj as well
myObj.property = 'new value'

console.log(yourObj.property)

// removes the binding
myObj.unbind("property", yourObj)
```

Note
---
It explots getters and setters for properties you want to share, so it cannot export property that already use getters or setters like the magic properties of the built in object of the browsers (ie you cannot make innerHTML on an HTMLElement bindable, but you can bind the innerHTML property of an HTMLElement to an object you build)

```javascript
// this will not work
document.querySelector("a").bindable("innerHTML")

// this will auto update the innerHTML of the first
// HTMLAnchorElement in the document when o.innerHTML
// changes
var o = new reactive()
o.bindable("innerHTML")
o.bind("innerHTML", document.querySelector("a"))
o.innerHTML = "hello reactive!"
```