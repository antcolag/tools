 import { injectProperties } from "./tools.js"
import {
	defer,
	applyWithConst,
	apply,
	noop,
	property
} from "./utils.js"

const WAIT = Symbol('wait')
const READ = Symbol('read')

const HANDLERS = {
	read,
	send
}

export default function readable() {
	return injectProperties.call(this, HANDLERS)
}

function send(...args){
	return fulfill.apply(this, args)
}

async function read(timer){
	this[WAIT] || init.call(this);
	return await Promise.race([
		this[WAIT],
		new Promise( defer.bind( void 0, timer,
			timer? applyWithConst(apply) : noop
		))
	])
}

function fulfill(...args) {
	this[READ] && this[READ](args)
	init.call(this);
}

function init(){
	this[WAIT] = new Promise(property.bind(this, WAIT))
}