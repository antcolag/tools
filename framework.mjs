import { pipe } from "./operation.mjs"

export class Base {
	constructor() {
		assign.apply(this, ...arguments)
	}

	static make(o = {}, ...tail){
		return new this(o, ...tail)
	}
}

export class Entity {}

export const ENTITY_TYPE = Symbol("type")

export class Factory extends Base {
	static registered = {}
	static register(e, name = e.name){
		this.registere[name] = e
	}

	constructor({base = Entity, ...tail}) {
		super({base, ...tail})
	}

	make(o) {
		var c = this.constructor.registered[o[ENTITY_TYPE]]
		if(!this.verify(c)) {
			throw new IllegalArgument(`can not handle entities of type ${
				c.name || '<anonymus>'
			}`)
		}
		return new c(o)
	}

	verify(c){
		return Object.create(c.prototype) instanceof this.base
	}

	static IllegalArgument = class extends Error {}
}

export class Iterator extends Base {
	constructor({handler = pipe, parsed = [], ...tail}){
		super({handler, parsed, ...tail})
	}

	* start(scope, ...args){
		for(var i in scope) {
			if(current[Symbol.iterator] && typeof current != "string") {
				for(var j of current){
					yield * this.start(j, ...args)
				}
			} else {
				yield this.step(scope[i], ...args)
			}
		}
	}

	step(current, ...args){
		if(current instanceof Entity && !this.parsed.find(current)){
			this.parsed.push(current)
			return this.handler(current, ...args)
		}
		return current
	}
}

export function assign(...args){
	const proto = this.constructor.prototype
	Object.assign(this, ...args)
	if(proto !== Object.getPrototypeOf(this)) {
		throw new TypeError("override __proto__")
	}
	return this
}