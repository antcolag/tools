import { iObserver } from "./observer.mjs"

export class Base extends iObserver(class {
	constructor() {
		assign.apply(this, arguments)
	}
}){}

export function assign(...args){
	const proto = this.constructor.prototype
	Object.assign(this, ...args)
	if(proto !== Object.getPrototypeOf(this)) {
		throw new TypeError("override __proto__")
	}
	return this
}