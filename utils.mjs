/**
 * Object extension tools.
 * @module
 */

import {
	apply,
	noop,
	inverse,
	or
} from "./operation.mjs"

/**
 * Pipes the arguments array
 * @param {...any} v
 * @returns {...any}
 */
export function fullpipe(){
	return arguments
}

export function random(min = 0, max = 2 << 15) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}



export class Semaphore extends Promise {
	constructor(args = noop) {
		var res, rej;
		super((resolve, reject) => {
			return args(
				res = resolve,
				rej = reject
			)
		})
		this.resolve = res
		this.reject = rej
	}

	static get [Symbol.species]() {
		return Promise;
	}

	get [Symbol.toStringTag]() {
		return 'Semaphore';
	}
}


export class Timer extends Semaphore {
	started
	id

	constructor(handler = apply) {
		super()
		this.handler = handler
	}

	start(t = 0) {
		this.id = setTimeout(() => this.handler(this.resolve, this.reject), t)
		this.started = Date.now()
		return Date.now() + t
	}

	stop() {
		this.id = clearInterval(this.id)
		this.started = void 0
	}
}

/**
 * continue the execution after t milliseconds
 * @param {number} t
 * @returns {Promise}
 */
export function delay(t) {
	var timer = new Timer()
	timer.start(t)
	return timer
}


/**
 * defer a function
 * @param {function} f
 * @param {number} t
 * @param {...any} args
 * @returns {Promise}
 */
export function defer(f, t, ...args) {
	var timer = delay(t)
	timer.then(() => f.apply(this, args))
	return timer
}

/**
 * Debunce an handler
 * @param {function} f
 * @param {number} t
 */
export function debounce(f, t = 0) {
	var last, self, timer;
	init()
	return function debouncing (...args){
		self = this
		last = args
		timer.stop()
		timer.start(t)
	}
	function init() {
		timer = new Timer()
		timer.then(() => {
			f.apply(self, last)
			init()
		});
	}
}

/**
 * use it with string.match as regex pattern to build an object
 * from the given properties
 * @example console.log(
 * 	"foobar!".match(new RegObj(/\w+(bar\!)/, "baz"))
 * ) // prints {baz: "bar!"}
 * @param {any} id
 * @param {...string} names
 */

const ORIGIN = Symbol('origin');
export class RegObj {
	constructor(id, ...names){
		this.id = typeof id == 'string' ? new RegExp(id) : id
		this.names = names
		this.names.splice(0,0, ORIGIN)
	}

	[Symbol.match](path){
		var opt = path.toString().match(this.id);
		return opt && this.names.length ? this.names.reduce(
			(prev, curr, i) => properties.call(prev, curr, opt[i]),
			{}
		) : opt
	}

	static origin(data){
		return data[ORIGIN]
	}
}

/**
 * it sets one or more copule of key value pair
 * passed plain to a function
 * ie
 * var o = {}
 * properties.call(o, 'foo', true, 'bar', false)
 * console.log(o) -> {foo:true, bar:false}
 *
 * @param {*} name
 * @param {*} value
 * @param {*} filter
 */
export function properties(name, value, ...args) {
	this[name] = value
	return args.length? properties.apply(this, args) : this
}

/**
 * deep merge two objects. skips symbols and non enumerable entries
 * @param obj1 
 * @param obj2 
 */
export function merge(obj1, obj2, handler = inverse(or)){
	var keys = [...new Set(
		typeof obj2 == "string"? Array.prototype : Object.keys(obj2 || Object.prototype)
	)]
	return keys.length ? keys.reduce((prev = {}, curr) => {
		if(curr == "__proto__"){
			throw new TypeError("Prototype pollution")
		}
		if(curr == "constructor"){
			throw new TypeError("Ovverride constructor")
		}
		prev[curr] = merge(obj1 && obj1[curr], obj2 && obj2[curr], handler)
		return prev
	}, obj1) : handler(obj1, obj2)
}
