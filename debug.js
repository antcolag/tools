export function croak(v){
	if(!DEBUGGING){
		return
	}
	throw v
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

export let DEBUGGING = false
