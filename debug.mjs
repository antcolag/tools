/**
 * This module collects the debugging utilities userfull both
 * during development as well as on production, like type checks,
 * throwing errors and assertions
 * @module
 */

/**
 * Throws the parameter
 * @function
 * @param {any} value
 * @throws {any}
 */
export function croak(value){
	throw value
}

/**
 * Check if value is an instance of a given type
 * @function
 * @param {any} value - value to check
 * @param {...any} types - list of constructors, instances or string
 * @throws {any} - croaks the value type if check fails
 */
export const good = type_check.bind(void 0, true);

/**
 * Check if value is not an instance of a given type
 * @function
 * @param {any} value - value to check
 * @param {...any} types - list of constructors, instances or string
 * @throws {any} - croaks the value type if check fails
 */
export const crap = type_check.bind(void 0, false);

/**
 * pause the execution and start debugging
 * @function
 */
export function pause() {
	debugger
}

/**
 * Enable/disable debugging
 * @function
 * @param {any} value
 */
export function DEBUG(v) {
	DEBUGGING = v
}

/**
 * throws expr if is not strictly equal to val
 * @function
 * @param {any} expr
 * @param {any} val
 * @throws {any} - croacks the expr if check fails
 */
export function ASSERT(expr, val, msg) {
	return val === expr || croak(msg || expr)
}

/**
 * Assert expr is truthy
 * @function
 * @param {any} expr
 * @throws {any} - croacks the boolean value of expr if check fails
 */
export function ASSERT_T(expr, msg) {
	return ASSERT(!!expr, true, msg)
}

/**
 * Assert expr is falsy
 * @function
 * @param {any} expr
 * @throws {any} - croacks the boolean value of expr if check fails
 */
export function ASSERT_F(expr, msg) {
	return ASSERT(!!expr, false, msg)
}

/**
 * current debugging state
 */
export var DEBUGGING = false

/**
 * Checks if the type the value is compatible
 * with the types array of constructor types
 * If the proper param is false then it will
 * perform the opposite check
 * @function
 * @private
 * @param {any} proper
 * @param {any} value
 * @param {...any} types
 * @returns {boolean}
 */
function type_check(proper, value, ...types) {
	return types.some((type) => {
		switch(true) {
		case typeof type == 'string':
			return proper
			? type == typeof value
			: type != typeof value;
		case (value instanceof type):
		case value.constructor == type:
			return proper
		default:
			return !proper
		}
	}) || croak(value.constructor)
}