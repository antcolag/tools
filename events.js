import observable from "./observe.js"

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