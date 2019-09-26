/**
 * Object extension tools.
 * @module tools
 * @see module:utils
 */

 export const PropertyDefinitionBuilder = (writable, enumerable, value) => ({
	writable,
	enumerable,
	value
})

export const constDefiner = PropertyDefinitionBuilder.bind(void 0, false, false)

export function buildProperty(name, value, filter = constDefiner){
	if(!this[name]){
		Object.defineProperty(this, name, filter(value))
	}
}

function pushProperty(name, value) {
	this[name] = value
	return this
}

export function injectProperties(settings, filter = constDefiner) {
	const handler = (prev, curr) => pushProperty.call(prev, curr, filter(settings[curr]))
	return Object.defineProperties(this, Object.keys(settings).reduce(handler, {}))
}
