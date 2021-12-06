Reactive
===
Binds properies between objects.


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

bindable
---
*declare a bindable property*
```javascript
var instance = reactive.call({})
instance.bindable("property")
```
---
bind
---
*binds an object to a reactive instance*
```javascript
var other = {}
instance.bind("property", other)
```
---
unbind
---
*unbinds a property from the reactive instance*
```javascript
instance.unbind("property", other)
```


How to use
---
Declare the bindable properties and then bind the object you want keep
syncronized

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
It cannot export property that use getters or setters already

```javascript
// this will not work
document.querySelector("a").bindable("innerHTML")

// this will auto update the innerHTML when o.innerHTML
// changes
var o = new reactive()
o.bindable("innerHTML")
o.bind("innerHTML", document.querySelector("a"))
o.innerHTML = "hello reactive!"
```