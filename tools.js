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
