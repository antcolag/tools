/**
 * Pipes value
 * @param {any} v
 * @returns {any} the same value in input
 */
export function pipe(v){
	return v
}

/**
 * do nothing
 */
export function noop(){}

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
 * apply a function to arguments
 * @param {function} f
 * @param {...any} args
 */
export function apply(f, ...args) {
	return f.apply(this, args)
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

export function or(a, b){
	return a || b
}

export function and(a, b){
	return a && b
}

export function not(a){
	return !a
}

export function sum(a, b){
	return a + b
}

export function inverse(f) {
	return function(...args) {
		return f.apply(this, args.reverse())
	}
}