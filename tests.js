import {
	pipe,
	croak,
	DEBUGGING
} from "./tools.js"

DEBUGGING(true)

export function ASSERT(expr, val) {
	return val === expr || croak(expr)
}

export function ASSERT_T(expr) {
	return ASSERT(true, !!expr)
}

export function ASSERT_F(expr) {
	return ASSERT(false, !!expr)
}

export class Test {
	constructor(description, handler = pipe, ...opt) {
		this.options = opt;
		this.description = description;
		this.handler = handler;
		this.result = result;
	}

	async run(...args) {
		var promise = new Promise(resolver.bind(this, args))
		promise.then(passed.bind(this))
		promise.catch(failed.bind(this))
		try {
			return await promise;
		} catch(e) {
			return e;
		}
	}
}

export default Test;

function resolver(args, resolve) {
	return resolve(this.handler.call(this, ...args))
}

function passed(o) {
	return this.result `${this.description} PASSED ${o} green`
}

function failed(e) {
	return this.result `${this.description} FAILED ${e} red`
}

function result(...args) {
	return console.log(`${args[1]}:%c${args[0][1]}%c-> ${args[2]}`, `color:${args[0][2]}`, "color:initial")
}