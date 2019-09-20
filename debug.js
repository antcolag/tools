export function croak(v){
	if(!DEBUGGING){
		return
	}
	throw v
}

export function type_check(result, value, ...tests) {
	return tests.some((test) => {
			switch(true) {
			case typeof test == 'string':
				return result
				? test == value
				: tests != value;
			case (value instanceof test):
			case value.constructor == test:
				return result
			}
		}
	)
}

export function good(value, ...tests) {
	return type_check(true, ...tests)
	|| croak(value.constructor)
}

export function crap(value, ...tests) {
	return type_check(false, ...tests)
	|| croak(value.constructor)
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
