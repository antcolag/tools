import {
	injectProperties
} from "./tools.js"

import {
	defer,
	applyWithConst,
	apply,
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

async function read(){
	this[WAIT] || init.call(this);
	return await (arguments[0] ? Promise.race([
		this[WAIT],
		new Promise(
			defer.bind(void 0, arguments[0], applyWithConst(apply)
		))
	]) : this[WAIT])
}

function fulfill(...args) {
	this[READ] && this[READ](args)
	init.call(this);
}

function init(){
	this[WAIT] = new Promise(property.bind(this, WAIT))
}