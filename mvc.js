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

export const NAME = Symbol('name')
class Unit {
	constructor(name){
		this[NAME] = name
	}
}
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
observe.call(View.prototype)
injectProperties.call(View.prototype, {
	print: new DomPrinter()
})

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