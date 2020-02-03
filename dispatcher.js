import {
	pipe,
	noop,
	apply,
	properties
} from "./utils.js"

class Handler {
	constructor(id, handler = pipe, ...names){
		this.id = typeof id == 'string' ? new RegExp(id) : id
		this.handler = handler
		this.names = names
	}

	match(path) {
		var opt = this.id.exec(path);
		return opt && ['string', ...this.names].reduce(
			(prev, curr, i) => properties.call(prev, curr, opt[i]),
			{}
		)
	}

	call(path, ...args) {
		var opt = this.match(path);
		return opt && this.handler(opt, ...args)
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
	constructor(methods, trigger = apply) {
		this[METHODS] = methods;
		this.trigger = trigger;
		this.invoke = this.invoke.bind(this)
	}

	invoke(opt, path, ...args) {
		return new Proxy(this[METHODS], {
			get: getter.bind(this, opt, args),
			set: noop
		})
	}
}

function getter(opt, args, self, p) {
	return this.trigger(
		self[p].bind(this, opt, ...args)
	)
}