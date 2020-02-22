import {
	BINDS,
	default as reactive
 } from "./reactive.mjs"

import readable from "./readable.mjs"

import observe from "./observe.mjs"

import {
	good
} from "./debug.mjs"

import {
	fullpipe,
	isUndefined,
	pipe,
	noop,
	apply,
	properties,
	different
} from "./utils.mjs"

import {
	injectProperties
} from "./tools.mjs"

import {
	DomPrinter
} from "./dom.mjs"


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
const HANDLER = Symbol('handler');
export class Model extends Unit {
	constructor(...props){
		super()
		props.forEach( id => {
			if(typeof id == "function") {
				this[HANDLER] = id;
				return;
			}
			this.bindable(id)
		})
		if(!this[HANDLER]){
			this[HANDLER] = Model.inline
		}
	}

	async update(...args){
		try {
			return this.fire('update',
				await this[HANDLER](...args)
			);
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

	static inline(...args){
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

/**
 * you can add a route by invoking the add method
 * then you can fire the relative function by
 * calling the method trigger
 */
const HANDLERS = Symbol('handlers');
const ORIGIN = Symbol('origin');
export class Router extends Unit {
	constructor() {
		super()
		this[HANDLERS] = [];
	}

	add() {
		const result = new Handler(...arguments)
		this[HANDLERS].push(result)
		return result
	}

	remove() {
		this[HANDLERS] = this[HANDLERS].filter(
			different.bind(void 0, ...arguments)
		)
		return this[HANDLERS].length
	}

	trigger(origin, ...args){
		this.fire('trigger', ...arguments)
		return this[HANDLERS].reduce(
			reducer.bind(this, args, origin),
			null
		)
	}

	static origin(data){
		return data[ORIGIN]
	}
}

function reducer(args, path, pre, x){
	return pre || x.call(args, path, x)
}

/* TODO Symbol.search */
class Handler {
	constructor(id, handler = pipe, ...names){
		this.id = typeof id == 'string' ? new RegExp(id) : id
		this.names = names
		this.names.splice(0,0, ORIGIN)
		this[HANDLER] = handler
		if(this[HANDLER] instanceof Controller){
			this[HANDLER] = Controller.invoke.bind(void 0, this[HANDLER])
		}
	}

	match(path) {
		var opt = path.match(this.id);
		return opt && this.names.length ? this.names.reduce(
			matcher.bind(opt),
			{}
		) : opt
	}

	call(args, path) {
		var opt = this.match(path);
		return opt && this[HANDLER](opt, ...args)
	}
}

function matcher(prev, curr, i) {
	return properties.call(prev, curr, this[i])
}

/**
 * it allows you to handle a resource with the methods
 * you add to it on construction.
 * When invoked, it return your methods binded with the
 * arguments passed to invoke
 */
const REGISTERED = Symbol('registered')
const ALLOWED = Symbol("allowed")
const METHOD = Symbol("method")
export class Controller extends Unit {
	constructor(init = {"*": "*"},trigger = apply){
		super()
		this[ALLOWED] = {}
		this[REGISTERED] = {}
		this.trigger = trigger;
		for(let method in init){
			let result = init[method];
			switch(typeof init[method]) {
			case "string":
				init[method] = [init[method]]
			default:
				result = (...args) => serve.call(this, method, ...args)
				this[ALLOWED][method] = init[method]
			case "function":
				this[REGISTERED][method] = result;
			}
		}
	}

	static method(data) {
		return data[METHOD]
	}

	static has(controller, method){
		return controller[REGISTERED].hasOwnProperty(method)
	}

	static invoke(self, ...args) {
		self.fire('invoke', ...args)
		return new Proxy(self[REGISTERED], {
			get: getter.bind(self, args),
			set: noop
		})
	}
}

async function getter(args, self, p) {
	var target = self[p] || self['*']
	return await this.trigger(
		target.bind(this, ...args)
	)
}

function allowed(method, action){
	if(!this[ALLOWED][method].some(
		x => x == action || x == "*"
	)){
		throw new Error("method not allowed")
	}
}

function serve(method, data = {}, ...rest) {
	data[METHOD] = method
	data.action = data.action || "visit"
	allowed.call(this, method, data.action)
	if(typeof this[data.action] == "function"){
		return this[data.action](data, ...rest)
	}
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
		this[HANDLER] = handler
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
		args = await this[HANDLER](...args)
		if(!args[Symbol.iterator]){
			args = [args];
		}
		this.fire('broadcast', ...args)
		return super.broadcast(...args)
	}
}

readable.call(Broker.prototype)
