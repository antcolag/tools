import {
	pipe,
	croak,
	defer
} from "./tools.js"

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
	}

	run(...args) {
		var promise = new Promise(resolver.bind(this, args))
		promise.then(passed.bind(this))
		promise.catch(failed.bind(this))
		return promise;
	}

	async defer(...args) {
		await defer(this.run.bind(this), 0, ...args)
	}
}

export default Test;

function resolver(args, resolve) {
	return resolve(this.handler.bind(this, ...args))
}

function passed(o) {
	console.log(...result `${this.description} PASSED ${o} green`)
}

function failed(e) {
	console.error(...result `${this.description} FAILED ${e} red`)
}

function result(...args) {
	return [`${args[1]}:%c${args[0][1]}%c-> ${args[2]}`, `color:${args[0][2]}`, "color:initial"]
}