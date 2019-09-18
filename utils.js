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


export function applyWithConst(f, value){
	return (obj) => f(obj, value)
}

export const compareWhitConst = applyWithConst.bind(void 0, (obj, value) => obj === value)

export const isNull = compareWhitConst(null)
export const isUndefined = compareWhitConst(void 0)
export const isTrue = compareWhitConst(true)
export const isFalse = compareWhitConst(false)