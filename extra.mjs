import reactive from "./reactive.mjs"
import readable from "./readable.mjs"
import observe from "./observe.mjs"
import {
	constant,
	fullpipe,
	isUndefined,
	pipe,
	noop,
	different,
	debounce
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
export class EventBroker { }
observe.call(EventBroker.prototype)

/**
 * it handle the data logic of the app
 * it takes an array of names that will be
 * expoted by reactive's bindable,
 * functions will be executed
 * @param {...type} self
 * @param {...any} props
 */

export function Model(self, ...props){
	self = class Model extends self {
		constructor(...args){
			super(...args)
			props.forEach( id => this.bindable(id))
			var debounced = debounce(() => {
				this.fire('update', this)
			})
			props.forEach( id => this.bind(id, debounced))
		}
	}
	reactive.call(self.prototype)
	observe.call(self.prototype)
	return self;
}

/**
 * it hanlde the rendering of the data
 * it takes the render function, that
 * should return the rendered data
 * @param {function} render
 */

 const RENDER = Symbol("render")
export class View extends EventBroker {
	constructor(render = constant('')){
		super()
		this[RENDER] = render
	}

	render(){
		return this[RENDER](...arguments)
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
export class Router extends EventBroker {
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
}

function reducer(args, path, pre, x){
	return pre || x.call(args, path, x)
}

const HANDLER = Symbol('handler');
class Handler {
	constructor(id, handler = pipe){
		this.id = typeof id == 'string' ? new RegExp(id) : id
		this[HANDLER] = handler
	}

	call(args, path) {
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
