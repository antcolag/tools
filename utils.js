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

export function debounce(f, t = 100) {
	var last, self
	return async function debouncing (...args){
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

export function apply(f, last) {
	return f(...args)
}

export function applyWithConst(f, ...values){
	return (obj) => f(obj, ...values)
}

export function equals(obj, value){
	return obj === value
}

export const compareWhitConst = applyWithConst.bind(void 0, equals)

export const isNull = compareWhitConst(null)
export const isUndefined = compareWhitConst(void 0)
export const isTrue = compareWhitConst(true)
export const isFalse = compareWhitConst(false)