Test
===
Mini test suite

ASSERT
---
compare two values vith strict equal operator, if they are not equal, will [croak](debug.md#croak) an exception
```javascript
import * as test from './test.js'

var myvalue1 = false
var myvalue2 = true

// ok
test.ASSERT(myvalue1, false)

// ko, will throw true
test.ASSERT(myvalue2, false)
```

---

ASSERT_T
---
Assert true but not strictly, if you pass a falsy value will throw that value
```javascript
import * as test from './test.js'

var myvalue1 = 1
var myvalue2 = NaN

// ok
test.ASSERT_T(myvalue1)

// ko, will throw NaN
test.ASSERT_T(myvalue2)
```

---

ASSERT_F
---
Assert false but not strictly, if you pass a truthy value will throw that value
```javascript
import * as test from './test.js'

var myvalue1 = NaN
var myvalue2 = 1

// ok
test.ASSERT_F(myvalue1)

// ko, will throw 1
test.ASSERT_F(myvalue2)
```
---

Test
---
test suite

---

Test.print
---
set the print method of a Test instance