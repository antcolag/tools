/**
 * Object extension tools.
 * @module
 */

 import {
	injectProperties
} from "./tools.mjs"

import {
	defer,
	Semaphore,
	noop
} from "./utils.mjs"

export const BUFFER = Symbol('buffer')
export const WAIT = Symbol('wait')

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

function read(time){
	if(time < 0){
		return this[BUFFER]
	}
	if(!this[WAIT]){
		init.call(this)
	}
	return (time ? Semaphore.race([
		this[WAIT],
		defer(noop)
	]) : this[WAIT])
}

function init(){
	this[WAIT] = new Semaphore()
	this[WAIT].catch( e => {
		this[BUFFER] = e
	})
}

function flush(){
	this[WAIT]
	&& this[WAIT].resolve
	&& this[WAIT].resolve(this[BUFFER])
}

function detach() {
	this[WAIT].reject && this[WAIT].reject(this[BUFFER])
}
