Tools
===

This module provides a set of functions to build the interface generators used
for reactive, readable and observable.

The injectProperties function
---

### Example

```javascript
var myobj = {}

injectProperties.call(myobj, {
	aNewMethod(){ /* do something */}
})

// myobj now have a non iterable 'aNewMethod' method
myobj.aNewMethod()
```
