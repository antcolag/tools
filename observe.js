/**
 * Observable interface
 * @module
 * @see module:tools
 */
 import {
	buildProperty,
	injectProperties
} from "./tools.js"

/**
 * Identifier the property for storing event handlers
 * @constant
 */
export const OBSERVERS = Symbol("observers")

/**
 * Interface definition
 * @interface observable
 */
const HANDLERS = {
	on,
	once,
	off,
	fire
}

/**
 * Interface definition
 * @lends observable
 */
export function observable() {
	return injectProperties.call(this, HANDLERS)
}
export default observable

/**
 * Builds the event list if not exist
 * @private
 * @param events
 * @function
 */
function check(events) {
	buildProperty.call(this, OBSERVERS, {})
	events = events.split(" ")
	events.forEach(e => this[OBSERVERS][e] = this[OBSERVERS][e] || [])
	return events
}

/**
 * Append one or more handlers to one or more events
 * @param {string} event - one or more space separated events
 * @param {...function} handlers - space separated events
 * @function
 */
function on(event, ...handlers) {
	event = check.call(this, event)
	if(event.length > 1) {
		return event.map(x => this.on(x, ...handlers))
	}
	event = event[0]
	this[OBSERVERS][event] = this[OBSERVERS][event].concat(handlers)
	return handlers
}

/**
 * Append one shot handlers to one or more events
 * @param {string} events - space separated events
 * @param {...function} handlers - space separated events
 * @function
 */
function once(events, ...handlers) {
	return this.on(events, ...handlers.map(x => {
		var handler = function() {
			x.apply(this, arguments)
			this.off(events, handler)
		}
		return handler
	}))
}

/**
 * Remove handlers from one or more events
 * @param {string} events - space separated events
 * @param {...function} handlers - space separated events
 * @function
 */
function off(events, ...f) {
	events = check.call(this, events)
	if(events.length > 1) {
		return events.map(x => this.off(x, ...f))
	}
	const list = this[OBSERVERS][events[0]]
	return f.map(h => delete list[list.indexOf(h)])
}

/**
 * Fire events passing args arguments
 * @param {string} events - space separated events
 * @param {...any} args - arguments for the hendlers
 * @function
 */
function fire(events, ...args) {
	events = check.call(this, events)
	if(events.length > 1) {
		return events.map(x => this.fire(x, ...args))
	}
	return this[OBSERVERS][events].map(x => x.apply(this, args))
}

/**
 * it emulate the browser's EventTarget interface
 * intended for old browsers and nodejs
 */
export class EventTarget {
	constructor() {
		var obs = new observable()
		injectProperties.call(this, {
			addEventListener: addEventListener.bind(this, obs),
			removeEventListener: removeEventListener.bind(this, obs),
			dispatchEvent: dispatchEvent.bind(this, obs)
		})
	}
}

function addEventListener(obs, ...args) {
	obs.on.call(this, ...args)
};

function removeEventListener(obs, ...args) {
	obs.off.call(this, ...args)
};

function dispatchEvent(obs, event) {
	obs.fire.call(this, event.type, event)
};

/**
 * import safely: for old browsers polyfill
 */
export function EventTargetPolyfill() {
	return EventTarget
}
