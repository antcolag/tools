import {
	BINDS,
	default as reactive
 } from "./reactive.js"
import readable from "./readable.js"
import observe from "./observe.js"

import {
	good
} from "./debug.js"

export const NAME = Symbol('name')
class Unit {
	constructor(name){
		this[NAME] = name
	}
}
export class Model {
	constructor(...props){
		props.forEach( id =>{
			this.bindable(id)
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

export class Controller extends Unit {
	constructor(model, name){
		super(name)
		if(model){
			this.model = model
		}
	}

	set model(model){
		good(model, Model)
		this.read(-1)
		.then((data) => {
			if(data){
				model
				.update(...data)
			}
			loop.call(this, model)
		})
	}
}
readable.call(Controller.prototype)

async function loop(model) {
	while(true){
		try {
			model
			.update(...await this.read())
		} catch(e) {
			break
		}
	}
}
