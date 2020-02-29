/**
 * Object extension tools.
 * @module
 * @see module:utils
 */

import {
	properties
} from "./utils.mjs"

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
 * makes the argument for Object.defineProperty for build a constant property
 * @function
 * @param {*} value
 */
export const InternalConstDefiner = PropertyDefinitionBuilder.bind(void 0, false, false)

/**
 * makes the argument for Object.defineProperty for build a variable property
 * @function
 * @param {*} value
 */
export const variableDefiner = PropertyDefinitionBuilder.bind(void 0, true, false)

/**
 * makes the argument for Object.defineProperty for build a constant enumerable property
 * @function
 * @param {*} value
 */
export const constDefiner = PropertyDefinitionBuilder.bind(void 0, false, true)

/**
 * add property if there isn't
 * @param {*} name
 * @param {*} value
 * @param {*} filter
 */
export function buildProperty(name, value, filter = InternalConstDefiner){
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
export function injectProperties(settings, filter = variableDefiner) {
	const handler = (prev, curr) => properties.call(prev, curr, filter(settings[curr]))
	return Object.defineProperties(this, Object.keys(settings).reduce(handler, {}))
}
