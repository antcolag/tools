/**
 * Object extension tools.
 * @module tools
 * @see module:utils
 */

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
 * add property
 * @param {*} name 
 * @param {*} value 
 * @param {*} filter 
 */
export function buildProperty(name, value, filter = constDefiner){
	Object.defineProperty(this, name, filter(value))
}

function pushProperty(name, value) {
	this[name] = value
	return this
}

export function injectProperties(settings, filter = constDefiner) {
	const handler = (prev, curr) => pushProperty.call(prev, curr, filter(settings[curr]))
	return Object.defineProperties(this, Object.keys(settings).reduce(handler, {}))
}
