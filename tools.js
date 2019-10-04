/**
 * Object extension tools.
 * @module
 * @see module:utils
 */

import { property } from "./utils.js"

/**
 * build the argument for Object.defineProperty
 * for non getter/setters
 * @param {bool} writable 
 * @param {bool} enumerable 
 * @param {*} value 
 */
export const PropertyDefinitionBuilder = (writable, enumerable, value) => ({
	writable,
	enumerable,
	value
})

/**
 * make the argument for Object.defineProperty for build prototype-like property
 * @function
 * @param {*} value
 */
export const constDefiner = PropertyDefinitionBuilder.bind(void 0, false, false)

/**
 * add property if there isn't
 * @param {*} name 
 * @param {*} value 
 * @param {*} filter 
 */
export function buildProperty(name, value, filter = constDefiner){
	if(!(name in this)){
		Object.defineProperty(this, name, filter(value))
	}
}

/**
 * inject properties to an object
 * @param {*} name 
 * @param {*} value 
 * @param {*} filter 
 */
export function injectProperties(settings, filter = constDefiner) {
	const handler = (prev, curr) => property.call(prev, curr, filter(settings[curr]))
	return Object.defineProperties(this, Object.keys(settings).reduce(handler, {}))
}

export const lisperato = (function(){

	const l = (x, ...args) => {
		return cons(x, args[0] && l(...args))
	}

	const cons = (_car, _cdr) => {
		return (f) => {
			return f(_car, _cdr);
		}
	}

	const car = (_cons) => {
		return _cons((_car, _cdr) => _car)
	}

	const cdr = (_cons) => {
		return _cons((_car, _cdr) => _cdr)
	}

	const namespace = {
		l,
		cons,
		car,
		cdr,
	}

	return new Proxy({}, {
		get: function detect(target, name) {
			if(name in namespace) {
				return namespace[name]
			}
			var multi = name.match(/^c([ad]).*r$/) || []

			if(multi[1]){
				return (x) => detect(void 0, name.replace(new RegExp(multi[1]), ''))(namespace[`c${multi[1]}r`](x))
			}
		}
	})
})()
