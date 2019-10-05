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

export const BUFFER = Symbol('buffer')
export const WAIT = Symbol('wait')
export const BROADCAST = Symbol('broadcast')
export const CLEAR = Symbol('clear')

export const HANDLERS = {
	read,
	broadcast
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
	this[WAIT] = new Promise((resolve, reject) => {
		this[BROADCAST] = resolve;
		this[CLEAR] = reject
	})
	this[WAIT].catch( e => {
		this[BUFFER] = e
	})
}


function flush(){
	this[BROADCAST] && this[BROADCAST](this[BUFFER])
}

function detach() {
	flush.call(this);

}