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
### observer

```javascript
class MyObservableClass {}


reactive.call(MyObservableClass.prototype)
```