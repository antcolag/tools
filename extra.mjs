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

 var renderonce = false
 const RENDERONCE = Symbol("renderonce")
 const LAST = Symbol("last")
 const RENDER = Symbol("render")
export class View extends Unit {
	constructor(render){
		super()
		if(render){
			good(render, 'function')
			this[RENDER] = render
		}
	}

	render(){
		if((this[RENDERONCE] || renderonce) && this[LAST]){
			return this[LAST]
		}
		return this[LAST] = this[RENDER](...arguments)
	}

	static set builder(hanlder) {
		this.prototype.print.builder = hanlder
	}

	static renderOnce(view){
		if(view){
			view[RENDERONCE] = true
		} {
			renderonce = true
		}
	}

	static renderAlways(view){
		if(view){
			view[RENDERONCE] = false
		} {
			renderonce = false
		}
	}

	static last(view){
		return view[LAST]
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
const TRIGGER = Symbol("trigger")
export class Controller extends Unit {
	constructor(init = {}, trigger = pipe){
		super()
		Object.assign(
			this[REGISTERED] = {},
			init
		)
		this[TRIGGER] = trigger;
	}

	static has(controller, method){
		return controller[REGISTERED].hasOwnProperty(method)
	}

	set(method, handler) {
		return this[REGISTERED][method] = handler
	}

	unset(method) {
		return delete this[REGISTERED][method];
	}

	has(method){
		return this[REGISTERED].hasOwnProperty(method)
	}

	invoke(...args) {
		var resource = this[TRIGGER](...args)
		this.fire('invoke', resource)
		return new Proxy(this[REGISTERED], {
			get: getter.bind(resource),
			set: noop
		})
	}
}

function getter(self, p) {
	var target = self[p] || self['*']
	return target.bind(this)
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
