import {
	buildProperty,
	injectProperties
} from "./tools.js"

export const OBSERVERS = Symbol("observers")

const HANDLERS = {
	on,
	once,
	off,
	fire
}

export function observable() {
	injectProperties.call(this, HANDLERS)
}

export default observable

function check(evt) {
	buildProperty.call(this, OBSERVERS, {})
	evt = evt.split(" ")
	evt.forEach(e => this[OBSERVERS][e] = this[OBSERVERS][e] || [])
	return evt
}

function on(evt, ...f) {
	evt = check.call(this, evt)
	if(evt.length > 1) {
		return evt.map(x => this.on(x, ...f))
	}
	evt = evt[0]
	this[OBSERVERS][evt] = this[OBSERVERS][evt].concat(f)
	return f
}

function once(evt, ...f) {
	return this.on(evt, ...f.map(x => {
		var handler = function() {
			x.apply(this, arguments)
			this.off(evt, handler)
		}
		return handler
	}))
}

function off(evt, ...f) {
	evt = check.call(this, evt)
	if(evt.length > 1) {
		return evt.map(x => this.off(x, ...f))
	}
	const list = this[OBSERVERS][evt[0]]
	return f.map(h => delete list[list.indexOf(h)])
}

function fire(evt, ...args) {
	evt = check.call(this, evt)
	if(evt.length > 1) {
		return evt.map(x => this.fire(x, ...args))
	}
	return this[OBSERVERS][evt].map(x => x.apply(this, args))
}
