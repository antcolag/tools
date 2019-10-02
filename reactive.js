/**
 * Object extension tools.
 * @module
 * @see module:tools
 */

 import {
	buildProperty,
	injectProperties
} from "./tools.js"

export const BINDS = Symbol("binds")

const HANDLERS = {
	bindable,
	bind,
	unbind
}

export function reactive() {
	return injectProperties.call(this, HANDLERS)
}

export default reactive

function buildBinder (val, list, build) {
	var recurring = 0
	const setter = (v) => {
		if(recurring++){
			return
		}
		list.forEach(f=>f(v))
		recurring = 0
		return val = v
	}
	return {
		set: setter,
		get: () => val,
		...typeof build == "function"? build(val, list) : build
	}
}

function check(){
	buildProperty.call(this, BINDS, {})
	return this[BINDS]
}

function bindable(id, build) {
	const binds = check.call(this)
	if(binds[id]){
		return false
	}
	binds[id] = []
	const buildedBinder = buildBinder(this[id], binds[id], build)
	return Object.defineProperty(this, id, buildedBinder)
}

function bind(id, fun, name) {
	const binds = check.call(this)
	if(!binds[id]){
		return false
	}
	if(typeof fun == "object"){
		if(!name){
			name = id
		}
		let who = fun
		fun = (x) => who[name] = x
	}
	binds[id].push(fun)
	return fun
}

function unbind(id, key) {
	const binds = check.call(this)
	binds[id] = binds[id].filter((v) => v!==key)
}
