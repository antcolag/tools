import reactive from "./reactive.mjs"
import readable from "./readable.mjs"
import observe from "./observe.mjs"
import {
	fullpipe
} from "./utils.mjs"

import {
	constant,
	pipe,
	isUndefined,
	noop
} from "./operation.mjs"
import {
	injectProperties
} from "./tools.mjs"
import {
	DomPrinter
} from "./dom.mjs"


/**
 * Base class for controllers, models and Views
 */
export class EventBroker {
	constructor(){
		observe.call(this)
	}
}

/**
 * it handle the data logic of the app
 * it takes an array of names that will be
 * expoted by reactive's bindable,
 * functions will be executed
 * @param {...type} self
 * @param {...any} props
 */

export function Model(self, ...props){
	class Model extends self {
		constructor(...args){
			super(...args)
			initModel.apply(this, props)
		}
	}
	reactive.call(Model.prototype)
	observe.call(Model.prototype)
	return Model;
}

Model.init = initModel

function initModel(...props){
	props.forEach( id => this.bindable(id))
	props.forEach( id => this.bind(id, this.fireLast.bind(this, 'updated')))
}
/**
 * it hanlde the rendering of the data
 * it takes the render function, that
 * should return the rendered data
 * @param {function} render
 */

export class ViewBase extends EventBroker {}

injectProperties.call(ViewBase.prototype, {
	print: new DomPrinter()
})

export function View(render = constant("")) {
	class View extends ViewBase {
		render(){
			return render.apply(this, arguments)
		}
	}
	return new.target ? new View : View
}

/**
 * you can add a route by invoking the add method
 * then you can fire the relative function by
 * calling the method trigger
 */
const HANDLERS = Symbol('handlers');
export class Router extends EventBroker {
	constructor(method = "reduce", handler = reducer) {
		super()
		this[HANDLERS] = [];
		this[HANDLERS].method = method
		this[HANDLERS].handler = handler
		this.fallback = noop
	}

	add() {
		const result = new Handler(...arguments)
		this[HANDLERS].push(result)
		return result
	}

	set fallback(handler) {
		this[HANDLERS].fallback = handler
	}

	get fallback() {
		return this[HANDLERS].fallback
	}

	remove() {
		do {
			var id = this[HANDLERS].indexOf(...arguments)
		} while(id >= 0 && this[HANDLERS].splice(id, 1))
		return this[HANDLERS].length
	}

	trigger(origin, ...args){
		this.fire('trigger', ...arguments)
		return this[HANDLERS][this[HANDLERS].method](
			this[HANDLERS].handler.bind(this, origin, args),
			null
		) || this[HANDLERS].fallback.apply(this, args)
	}
}

function reducer(path, args, pre, x){
	return pre || x.call(path, args, x)
}

const HANDLER = Symbol('handler');
class Handler {
	constructor(id, handler = pipe){
		this.id = typeof id == 'string' ? new RegExp(id) : id
		this[HANDLER] = handler
	}

	call(path, args) {
		var opt = this.id[Symbol.match](path);
		return opt && this[HANDLER](opt, ...args)
	}
}

/**
 * it allows you to handle a resource with the methods
 * you add to it on construction.
 * When invoked, it return your methods binded with the
 * arguments passed to invoke
 */
const REGISTERED = Symbol('registered')
const TRIGGER = Symbol("trigger")
export class Controller extends EventBroker {
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

export class Gateway extends EventBroker {
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

readable.call(Gateway.prototype)
