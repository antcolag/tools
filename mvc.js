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
	isUndefined
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
 * should return the rendered data,
 * possibly takes a model
 * @param {function} render
 */
export class View extends Unit {
	constructor(render, model){
		super()
		if(render){
			good(render, 'function')
			this.render = render
		}

		if(model){
			this.model = model
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
 * it hanlde the communication and data
 * transition in the application context
 * it takes a model, a name and an hanlder
 * that controlls the data transmition
 * @param {Model} model
 * @param {String} name
 * @param {function} handler
 */
export class Controller extends Unit {
	constructor(model, handler = fullpipe){
		super()
		this.handler = handler
		if(model){
			this.model = model
		}
	}

	loop(model){
		good(model, Model)
		var data = this.read(-1);
		if(!isUndefined(data)){
			model.update(...data);
		}
		while(true){
			try {
				model.update(
					...await this.read()
				)
			} catch(e) {
				if(e instanceof Model && e !== model) {
					continue
				}
				break
			}
		}
	}

	async broadcast(...args){
		args = await this.handler(...args)
		if(!args[Symbol.iterator]){
			args = [args];
		}
		this.fire('broadcast', ...args)
		return super.broadcast(...arg)
	}
}

readable.call(Controller.prototype)
