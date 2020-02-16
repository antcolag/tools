Dom
===

It provides a couple of userfull tools:

- *emmet*: will build a dom from an emmet like string
- *html*: will print a dom from an html like string

Example
---

```javascript
import * as dom from from './dom.js'
console.log(
	dom.html `<div>${document.createElement('span')}</div>`,
	dom.emmet `div>${document.createElement('span')}.emmet>{hello world!}`
)
// in the console you can see the builded DocumentFragment instancies
```

DomPrinter
---

You can use an instance of this class if you have to handle the concrete building of the dom, the default builder is a wrapper for

`document.createRange().createContextualWrapper( /* your string */ )`

so it will render a *DocumentFragment* instance in the browser.

If you have to build different objects you can set a different *builder* in the class. The result must anyway implement some basic Element's methods ie querySelectorAll, setAttributeNode and append.

Example
---
```javascript
import {DomPrinter} from from './dom.js'

// define myPrinter: is an instance of DomPrinter
// with the default builder redefined
var myPrinter = new DomPrinter((str) => {
	// the body of the new builder function
	return Object.assign(
		document.createElement('div'),
		{
			innerHTML: str,
			className: "new-builder-wrapper"
		}
	)
})

// this element will be printed inside
// a div with 'new-builder-wrapper' className
myPrinter.emmet `p{lorem ipsum...}`
```
