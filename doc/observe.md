Observe
===


It exploit the [injectProperties](utils.md#The-injectProperties-function) and add the
- *on*: run the handler every time of the event occurs
- *once*: run the handler once 
- *off*: remove the handler from the handlers chain
- *fire*: dispatch the handler

methods to the object you choose

Examples
---

```javascript
import observe from "./observe.js"

// create your object
var myobj = {}
// inject observe
observe.call(myobj)

// now you can add an event listener in this way
myobj.on('evt', (...args) => alert(...args))

// and dispatch the event with your arguments in this way
myobj.fire('evt', 'arguments')
```