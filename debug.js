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

export function DEBUGGING(v) {
	DEBUG = v
}

export let DEBUG = false
