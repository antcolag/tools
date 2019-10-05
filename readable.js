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
	Semaphore
} from "./utils.js"

export const BUFFER = Symbol('buffer')
export const WAIT = Symbol('wait')
export const BROADCAST = Symbol('broadcast')
export const CLEAR = Symbol('clear')

export const HANDLERS = {
	read,
	broadcast,
	detach
}

export default function readable(
		broadcast = HANDLERS.broadcast,
		read = HANDLERS.read
	) {
	var opt = {
		broadcast: broadcast,
		read: read
	}
	return injectProperties.call(this, opt)
}

function broadcast(){
	this[BUFFER] = arguments
	flush.apply(this, arguments)
	init.call(this)
}

async function read(){
	if(arguments[0] < 0){
		return this[BUFFER]
	}
	if(!this[WAIT]){
		init.call(this)
	}
	return await (arguments.length ? Promise.race([
		this[WAIT].promise,
		new Promise(
			defer.bind(
				void 0,
				arguments[0],
				applyWithConst(apply)
			)
		)
	]) : this[WAIT].promise)
}

function init(){
	this[WAIT] = new Semaphore()
	this[WAIT].promise.catch( e => {
		this[BUFFER] = e
	})
}


function flush(){
	this[WAIT].resolve && this[WAIT].resolve(this[BUFFER])
}

function detach() {
	flush.call(this);
}