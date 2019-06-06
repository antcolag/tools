export function noop(){}

export function pipe(v){
	return v;
}

export function yes(){
	return true;
}

export function no(){
	return false;
}

export function applyWithConst(f, value){
	return (obj) => f(obj, value)
}

export function delay(t) {
	return new Promise((resolve)=>setTimeout(resolve, t))
}

export async function defer(f, t, ...args) {
	await delay(t);
	return f(...args)
}

export function pause() {
	debugger;
}

export const compareWhitConst = applyWithConst.bind(null, (obj, value) => obj === value)
export const isNull = compareWhitConst(null)
export const isUndefined = compareWhitConst(void 0)
export const isTrue = compareWhitConst(true)
export const isFalse = compareWhitConst(false)

export function croak(v){
	throw v
}

export function checkProp(name, value = {}){
	if(!this[name]){
		Object.defineProperty(this, name, constProp(value))
	}
}

export const defProp = (writable, enumerable, value) => ({
	writable,
	enumerable,
	value,
})

export const constProp = defProp.bind(null, false, false);

export function injector(settings, filter = constProp) {
	var handlers = {}
	for(var i in settings){
		handlers[i] = filter(settings[i])
	}
	Object.defineProperties(this, handlers)
}