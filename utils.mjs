/**
 * Object extension tools.
 * @module
 */

/**
 * do nothing
 */
export function noop(){}

/**
 * Pipes value
 * @param {any} v
 * @returns {any} the same value in input
 */
export function pipe(v){
	return v
}

/**
 * Pipes the arguments array
 * @param {...any} v
 * @returns {...any}
 */
export function fullpipe(){
	return arguments
}

/**
 * returns true
 */
export function yes(){
	return true
}

/**
 * returns false
 */
export function no(){
	return false
}

/**
 * continue the execution after t milliseconds
 * @param {number} t
 * @returns {Promise}
 */
export function delay(t) {
	return new Promise((resolve)=>setTimeout(resolve, t))
}

/**
 * defer a function
 * @param {function} f
 * @param {number} t
 * @param {...any} args
 * @returns {Promise}
 */
export async function defer(t, f, ...args) {
	await delay(t)
	return f(...args)
}

/**
 * Debunce an handler
 * @param {function} f
 * @param {number} t
 */
export function debounce(f, t = 0) {
	var last, self
	return function debouncing (...args){
		self = this
		if(last){
			last = args
			return
		}
		last = args
		defer(t, () => {
			f.apply(self, last)
			last = void 0
		})
	}
}

/**
 * use it with string.match as regex pattern to build an object
 * from the given properties
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
 * apply a function to arguments
 * @param {function} f
 * @param {...any} args
 */
export function apply(f, ...args) {
	return f(...args)
}

/**
 * return a function that apply a handler to arguments
 * @param {function} f
 * @param {...any} values
 */
export function applyWithConst(f, ...values){
	return (obj) => f(obj, ...values)
}

/**
 * performs a strict equal comparison
 * @param {any} obj
 * @param {any} value
 */
export function equals(obj, value){
	return obj === value
}

/**
 * performs a strict different comparison
 * @param {any} obj
 * @param {any} value
 */
export function different(obj, value){
	return obj !== value
}

/**
 * return a value provider function
 * @param val value to be returned
 */

export function constant(val) {
	return apply.bind(void 0, pipe, val)
}

/**
 * generator for comparison functions with constant values
 * @function
 * @param {any} value
 * @param {any} costant
 */
export const compareWhitConst = applyWithConst.bind(void 0, equals)

/**
 * @function
 * @param {any} value
 */
export const isNull = compareWhitConst(null)

/**
 * @function
 * @param {any} value
 */
export const isUndefined = compareWhitConst(void 0)

/**
 * @function
 * @param {any} value
 */
export const isTrue = compareWhitConst(true)

/**
 * @function
 * @param {any} value
 */
export const isFalse = compareWhitConst(false)

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

/* TODO use Symbol.species */
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

/* just for joke */
export const lisperato = new Proxy({
	l(x, ...args){
		return this.cons(x, args[0] && this.l(...args))
	},
	cons(_car, _cdr){
		return (f) => {
			return f(_car, _cdr);
		}
	},
	car(_cons){
		return _cons((_car, _cdr) => _car)
	},
	cdr(_cons){
		return _cons((_car, _cdr) => _cdr)
	},
	exec(p, s) {
		return this.cdr(p)
		? this.exec(this.cdr(p), this.car(p)(s))
		: this.car(p)(s)
	},
	[Symbol.toPrimitive](hint){
		switch (hint){
		case "number":
			return Number.MAX_VALUE;
		case "string":
			return '[Object ' + this.toString() + ']'
		default:
		}
		return this
	},
	toString() {
		return "lisperato!"
	}
}, {
	get(namespace, name) {
		if(name in namespace) {
			return namespace[name]
		}
		var multi = name.match(/^c([ad]).*r$/) || []
		if(multi[1]){ // abra cadadr-a
			return (x) => this.get(
				namespace,
				name.replace(new RegExp(multi[1]), '')
			)(namespace[`c${multi[1]}r`](x))
		}
	},
	set(namespace){
		throw new TypeError(`Write on a ${namespace} instance is not allowed`)
	}
})
