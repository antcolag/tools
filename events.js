import observable from "./observe.js"
import {
	injectProperties
} from "./tools.js"

/**
 * it emulate the browser's EventTarget interface
 * intended for old browsers and nodejs
 */
class EventTargetPolyfill {
	constructor() {
		var obs = new observable()
		injectProperties.call(this, {
			addEventListener: addEventListener.bind(this, obs),
			removeEventListener: removeEventListener.bind(this, obs),
			dispatchEvent: dispatchEvent.bind(this, obs)
		})
	}
	get [Symbol.toStringTag]() {
		return "EventTarget"
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

const EventTargetClass = typeof EventTarget === 'undefined' ? EventTargetPolyfill : EventTarget

/**
 * import safely: for old browsers polyfill
 */
export default EventTargetClass

export class Event {
	constructor(event) {
		this.type = event
	}
}

export class CustomEvent extends Event {
	constructor(event, params = {}) {
		super(event)
		params = Object.assign({
			bubbles: false,
			cancelable: false,
			detail: null },
			params
		)
	}
}
