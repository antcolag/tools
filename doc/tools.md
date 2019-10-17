Tools
===

This module provides a set of functionalities userfull for build interface generators.

The injectProperties function
---

Is userfull for add methods and properties.
The injectProperties is the foundation of reactive, observable and readable interfaces.

### Example

```javascript
var myobj = {}

injectProperties.call(myobj, {
	aNewMethod(){ /* do something */}
})

// myobj now have a non iterable 'aNewMethod' method
myobj.aNewMethod()
```

Despite the apparence it can be very userfull for inject interfaces directly in a class prototype, like they where defined inside the class

```javascript
const myInterface = {
	foo() { /* ... */ },
	bar() { /* ... */ }
}

class First { /* ... */ }
class Second { /* ... */ }

injectProperties.call(First.prototype, myInterface)
injectProperties.call(Second.prototype, myInterface)
```

Now all the instances of First as well as all the instances of Second will have a non iterable reference to foo and bar method in their class prototype hierarchy. Prety cool, isn't?