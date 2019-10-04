/**
 * Object extension tools.
 * @module
 */

 import {
	injectProperties
} from "./tools.js"

import {
	defer,
	applyWithConst,
	apply,
	property
} from "./utils.js"

const BUFFER = Symbol('buffer')
const WAIT = Symbol('wait')
const BROADCAST = Symbol('broadcast')

const HANDLERS = {
	read,
	send
}

export default function readable() {
	return injectProperties.call(this, HANDLERS)
}

function send(...args){
	this[BROADCAST] && this[BROADCAST](args)
	init.call(this)
	this[BUFFER] = args
}

async function read(){
	if(arguments[0] < 0){
		return Promise.resolve(this[BUFFER])
	}
	if(!this[WAIT]){
		init.call(this)
	}
	return await (arguments.length ? Promise.race([
		this[WAIT],
		new Promise(
			defer.bind(
				void 0,
				arguments[0],
				applyWithConst(apply)
			)
		)
	]) : this[WAIT])
}

function init(){
	this[WAIT] = new Promise(property.bind(this, BROADCAST))
}
