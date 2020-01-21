import {
	pipe,
	noop,
	apply
} from "./utils.js"

class Handler {
	constructor(id, handler = pipe, ...names){
		this.id = typeof id == 'string' ? new RegExp(id) : id
		this.handler = handler
		this.names = names
	}

	match(path) {
		var m = this.id.exec(path);
		if(!m){
			return null;
		}
		var result = {}
		for(var i in this.names) {
			result[this.names[i]] = m[i+1]
		}
		return result
	}

	call(path, ...args) {
		var opt = this.match(path);
		if(!opt){
			return;
		}
		return this.handler(opt, path, ...args)
	}
}


const HANDLERS = Symbol('handlers');
export class Dispatcher {
	constructor() {
		this[HANDLERS] = [];
	}

	add() {
		this[HANDLERS].push(new Handler(...arguments))
	}

	trigger(path, ...args){
		return this[HANDLERS].reduce(
			(pre, x) => pre = pre || x.call(path, ...args),
			null
		)
	}
}

const METHODS = Symbol('methods')
export class Resource {
	constructor(methods, filter = apply) {
		this[METHODS] = methods;
		this.filter = filter;
		this.invoke = this.invoke.bind(this)
	}

	invoke(opt, path, ...args) {
		return new Proxy(this[METHODS], {
			get: getter.bind(this, opt, path, args),
			set: noop
		})
	}
}

function getter(opt, path, args, self, p) {
	return this.filter(
		self[p].bind(this, opt, path, ...args)
	)
}