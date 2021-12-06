# Debug

The module contains collection of functions for type checking and to handle
statements like throw and debug, as functions.

It also exposes a ```DEBUGGING``` that can be used to controll some behaviour
of your functions. Can be changed using the DEBUG function exposesd in the
module.

## ASSERT

compare two values vith strict equal operator, if they are not equal, will [croak](debug.md#croak) an exception
```javascript
import { ASSERT } from './debug.js'

var myvalue = true

// ok
ASSERT(myvalue, true)

// ko, will throw false
ASSERT(myvalue, false)
```


## ASSERT_T

Assert true but not strictly, if you pass a falsy value will throw that value
```javascript
import { ASSERT_T } from from './debug.js'

var myvalue1 = 1
var myvalue2 = NaN

// ok
ASSERT_T(myvalue1)

// ko, will throw NaN
ASSERT_T(myvalue2)
```

## ASSERT_F

Assert false but not strictly, if you pass a truthy value will throw that value
```javascript
import { ASSERT_F } from from './debug.js'

var myvalue1 = NaN
var myvalue2 = 1

// ok
ASSERT_F(myvalue1)

// ko, will throw 1
ASSERT_F(myvalue2)
```


## DEBUGGING

Userfull to check the debugging status
```javascript
import { DEBUGGING } from './debug.js'
if(DEBUGGING){
	console.warn('debugging mode')
}
else {
	console.log('normal mode')
}
```

## croak

Functional wrapper for ```throw```
```javascript
import { croak } from './debug.js'
// will throw the string 'wrong value'
croak('wrong value')
```


## pause

Functional wrapper for ```debugger``` directive
```javascript
import { pause } from './debug.js'
// will stop the execution and start the debugger
pause()
```
---

## DEBUG

Sets the debugging status
```javascript
import { DEBUG } from './debug.js'
DEBUG(false)
console.log('are in debugging mode?', debug.DEBUGGING)
DEBUG(true)
console.log('are in debugging mode?', debug.DEBUGGING)
```

## Good and crap

Functions for type checking

```javascript
const num = 1

// throw if type of num is not Number
good(num, Number)

// throw if type of num is object
crap(num, Object)

// more than one type can be checked
good(1, Boolean, Number)

crap(1, Boolean, Object)
