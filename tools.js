export function noop(){}

export function pipe(v){
	return v
}

export function yes(){
	return true
}

export function no(){
	return false
}

export function delay(t) {
	return new Promise((resolve)=>setTimeout(resolve, t))
}

export async function defer(f, t, ...args) {
	await delay(t)
	return f(...args)
}

export function croak(v){
	if(!DEBUG){
		return
	}
	throw v
}

export function pause() {
	if(!DEBUG){
		return
	}
	debugger
}

export function applyWithConst(f, value){
	return (obj) => f(obj, value)
}

export const compareWhitConst = applyWithConst.bind(void 0, (obj, value) => obj === value)

export const isNull = compareWhitConst(null)
export const isUndefined = compareWhitConst(void 0)
export const isTrue = compareWhitConst(true)
export const isFalse = compareWhitConst(false)

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
	var handler = (prev, curr) => pushProperty.call(prev, curr, filter(settings[curr]))
	Object.defineProperties(this, Object.keys(settings).reduce(handler, {}))
}

export function DEBUGGING(v) {
	DEBUG = v
}

export var DEBUG = false