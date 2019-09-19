export function croak(v){
	if(!DEBUGGING){
		return
	}
	throw v
}

export function crap(value, test) {
	return value.constructor === test || croak(test)
}

export function pause() {
	if(!DEBUGGING){
		return
	}
	debugger
}

export function DEBUG(v) {
	DEBUGGING = v
}

export function ASSERT(expr, val) {
	return val === expr || croak(expr)
}

export function ASSERT_T(expr) {
	return ASSERT(true, !!expr)
}

export function ASSERT_F(expr) {
	return ASSERT(false, !!expr)
}

export let DEBUGGING = false
