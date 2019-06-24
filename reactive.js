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

export function ireactive() {
	injectProperties.call(this, HANDLERS)
}

export default ireactive

const buildBindable = (val, list, build) => {
	var recurring = 0
	var setter = (v) => {
		if(recurring++){
			return
		}
		list.forEach(f=>f(v))
		recurring = 0
		return val = v
	}
	return {
		...{
			set: setter,
			get: () => val,
		},
		...typeof build == "function"? build(val, list) : build
	}
}

function check(){
	buildProperty.call(this, BINDS, {})
	return this[BINDS]
}

function bindable(id, build) {
	var binds = check.call(this)
	if(binds[id]){
		return false
	}
	binds[id] = []
	var bindable = buildBindable(this[id], binds[id], build)
	return Object.defineProperty(this, id, bindable)
}

function bind(id, fun, name) {
	var binds = check.call(this)
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
	var binds = check.call(this)
	binds[id] = binds[id].filter((v)=>v!==key)
}
