Debug
===

Debugging utilities wrapped in hendlers.
Most of the debugging functionality are skipped
when the ```DEBUGGING``` member of the module is falsy

ASSERT
---
compare two values vith strict equal operator, if they are not equal, will [croak](debug.md#croak) an exception
```javascript
import { ASSERT } from './debug.js'

var myvalue = true

// ok
ASSERT(myvalue, true)

// ko, will throw false
ASSERT(myvalue, false)
```
---

ASSERT_T
---
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
---

ASSERT_F
---
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
---

DEBUGGING
---
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
---

croak
---
Functional wrapper for ```throw```
```javascript
import { croak } from './debug.js'
// will throw the string 'wrong value'
croak('wrong value')
```
---

pause
---
Functional wrapper for ```debugger``` directive
```javascript
import { pause } from './debug.js'
// will stop the execution and start the debugger
pause()
```
---

DEBUG
---
Sets the debugging status
```javascript
import { DEBUG } from './debug.js'
DEBUG(false)
console.log('debugging?', debug.DEBUGGING)
DEBUG(true)
console.log('debugging?', debug.DEBUGGING)
```
---
