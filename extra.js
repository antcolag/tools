import {
	BINDS,
	default as reactive
 } from "./reactive.js"

import readable from "./readable.js"

import observe from "./observe.js"

import {
	good
} from "./debug.js"

import {
	fullpipe,
	isUndefined,
	pipe,
	noop,
	apply,
	properties
} from "./utils.js"

import {
	injectProperties
} from "./tools.js"

import {
	DomPrinter
} from "./dom.js"

/**
 * Base class for controllers, models and Views
 */

class Unit { }

observe.call(Unit.prototype)

/**
 * it handle the data logic of the app
 * it takes an array of names that will be
 * expoted by reactive's bindable,
 * functions will be executed
 * @param {...any} props
 */
export class Model extends Unit {
	constructor(...props){
		super()
		props.forEach( id => {
			if(typeof id == "function") {
				this.assign = id;
				return;
			}
			this.bindable(id)
		})
		if(!this.assign){
			this.assign = Model.simple
		}
	}

	async update(...args){
		try {
			return this.fire('update', await this.assign(...args));
		} catch (e){
			return this.fire('reject', e)
		} finally {
			this.fire('done', ...args)
		}
	}

	static struct(...args){
		good(this, Model);
		return Object.assign(this, ...args)
	}

	static simple(...args){
		good(this, Model);
		Object
		.keys(this[BINDS])
		.forEach( (id, i) =>{
			this[id] = args[i]
		})
		return this
	}
}

reactive.call(Model.prototype)

/**
 * it hanlde the rendering of the data
 * it takes the render function, that
 * should return the rendered data
 * @param {function} render
 */
export class View extends Unit {
	constructor(render){
		super()
		if(render){
			good(render, 'function')
			this.render = render
		}
	}

	static set builder(hanlder) {
		this.prototype.print.builder = hanlder
	}
}

injectProperties.call(View.prototype, {
	print: new DomPrinter()
})

const HANDLERS = Symbol('handlers');
export class Controller extends Unit {
	constructor() {
		this[HANDLERS] = [];
	}

	add() {
		this[HANDLERS].push(new Handler(...arguments))
	}

	trigger(path, ...args){
		return this.fire('trigger', this[HANDLERS].reduce(
			(pre, x) => pre = pre || x.call(path, ...args),
			null
		))
	}
}

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

const METHODS = Symbol('methods')
export class Resource {
	constructor(methods, trigger = apply) {
		this[METHODS] = methods;
		this.trigger = trigger;
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
	return this.trigger(
		self[p].bind(this, opt, path, ...args)
	)
}

/**
 * it hanlde the communication and data
 * transition in the application context
 * it takes an hanlder
 * that controlls the data transmition
 * @param {function} handler
 */

export class Broker extends Unit {
	constructor(handler = fullpipe){
		super()
		this.handler = handler
	}

	async loop(resolve, reject = noop){
		var data = this.read(-1);
		if(!isUndefined(data)){
			resolve(...data);
		}
		while(true){
			try {
				resolve(
					...await this.read()
				)
			} catch(e) {
				if(e === resolve) {
					break
				}
				reject(e)
			}
		}
	}

	async broadcast(...args) {
		args = await this.handler(...args)
		if(!args[Symbol.iterator]){
			args = [args];
		}
		this.fire('broadcast', ...args)
		return super.broadcast(...args)
	}
}

readable.call(Broker.prototype)
