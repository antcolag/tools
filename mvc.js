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
	fullpipe
} from "./utils.js"
import {
	injectProperties
} from "./tools.js"
import {
	DomPrinter
} from "./dom.js"

/**
 * Base class for controller and Views
 * @param {string} name
 */
export const NAME = Symbol('name')
class Unit {
	constructor(name){
		this[NAME] = name
	}
}

/**
 * it handle the data logic of the app
 * it takes an array of names that will be
 * expoted by reactive's bindable,
 * functions will be executed
 * @param {...any} props
 */
export class Model {
	constructor(...props){
		props.forEach( id => {
			if(typeof id == "function") {
				id = id.apply(this)
			}
			if(void 0 != id) {
				this.bindable(id)
			}
		})
	}

	update(...args){
		Object
		.keys(this[BINDS])
		.forEach( (id, i) =>{
			this[id] = args[i]
		})
	}
}
reactive.call(Model.prototype)

/**
 * it hanlde the rendering of the data
 * it takes the render function, that
 * should return the rendered data,
 * possibly takes a model and a name
 * @param {function} render
 */
const MODEL = Symbol('model')
export class View extends Unit {
	constructor(render, model, name){
		super(name)
		if(render){
			good(render, 'function')
			this.render = render
		}

		if(model){
			this.model = model
		}
	}

	set model(model){
		good(model, Model)
		this[MODEL] = model
	}

	get model(){
		return this[MODEL]
	}
}

injectProperties.call(View.prototype, {
	print: new DomPrinter()
})

observe.call(Unit.prototype)


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
	constructor(model, name, handler = fullpipe){
		super(name)
		this.handler = handler
		if(model){
			this.model = model
		}
	}

	set model(model){
		good(model, Model)
		this.read(-1)
		.then(loop.bind(this, model))
	}
}
readable.call(Controller.prototype)

async function loop(model, data) {
	if(data){
		update.call(this, model, ...data)
	}
	while(true){
		try {
			update.call(
				this,
				model,
				...await this.read()
			)
		} catch(e) {
			break
		}
	}
}

function update(model, ...args) {
	model.update(...this.handler(...args))
}