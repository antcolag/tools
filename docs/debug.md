Debug
===

Debugging utilities wrapped in hendlers.
Most of the debugging functionality are skipped
when the ```DEBUGGING``` member of the module is falsy


DEBUGGING
---
Userfull to check the debugging status
```javascript
import * as debug from './debug.js'
if(debug.DEBUGGING){
	console.warn('debugging mode')
}
else {
	console.log('normal mode')
}
```
---

DEBUG
---
Sets the debugging status
```javascript
import * as debug from './debug.js'
const check = () => console.log('debugging?', debug.DEBUGGING)
debug.DEBUG(false)
check()
debug.DEBUG(true)
check()
```
---

croak
---
Functional wrapper for ```throw```
```javascript
import * as debug from './debug.js'
// will throw the string 'wrong value'
debug.croak('wrong value')
```
---

pause
---
Functional wrapper for ```debugger``` directive
```javascript
import * as debug from './debug.js'
// will stop the execution and start the debugger
debug.pause()
```
