/**
 * Object extension tools.
 * @module utils
 */


/**
 * do nothing
 */
export function noop(){}


/**
 * Pipes value
 * @param {any} v
 */
export function pipe(v){
	return v
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
export async function defer(f, t, ...args) {
	await delay(t)
	return f(...args)
}


/**
 * Debunce an handler
 * @param {function} f
 * @param {number} t
 */
export function debounce(f, t = 100) {
	var last, self
	return function debouncing (...args){
		self = this
		if(last){
			last = args
			return
		}
		last = args
		defer(() => {
			f.apply(self, last)
			last = void 0
		}, t)
	}
}


/**
 * apply a function to arguments
 * @
 * @param {function} f
 * @param {...any} args
 */
export function apply(f, args) {
	return f(...args)
}


/**
 * return a function that apply a handler to arguments
 * @
 * @param {function} f
 * @param {...any} values
 */
export function applyWithConst(f, ...values){
	return (obj) => f(obj, ...values)
}


/**
 * performs a strict equal comparison
 * @
 * @param {any} obj
 * @param {any} value
 */
export function equals(obj, value){
	return obj === value
}


/**
 * generator for comparison functions with constant values
 * @function
 * @param {any} value
 * @param {any} costant
 */
export const compareWhitConst = applyWithConst.bind(void 0, equals)

export const isNull = compareWhitConst(null)
export const isUndefined = compareWhitConst(void 0)
export const isTrue = compareWhitConst(true)
export const isFalse = compareWhitConst(false)