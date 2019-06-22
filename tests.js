import {
	pipe,
	croak,
	DEBUGGING
} from "./tools.js"

import iobservable from "./observe.js"

import ireactive from "./reactive.js"

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
	constructor(description, test = pipe, ...opt) {
		this.options = opt;
		this.description = description;
		this.test = test;
		this.print = consolePrinter;
		this.bindable('result')
	}

	async run(...args) {
		var promise = new Promise(resolver.bind(this, args))
		promise.finally(()=> this.fire("finish", this))
		try {
			promise = await promise
			finish.call(this, "PASSED", promise)
			return promise;
		} catch(e) {
			finish.call(this, "FAILED", e)
			return e
		}
	}
}

iobservable.call(Test.prototype)
ireactive.call(Test.prototype)

export default Test;

function resolver(args, resolve) {
	return resolve(this.test.call(this, ...args))
}

function finish(state, result) {
	this.fire(state, this.result = result)
	this.print `test end ${state}`
}

function consolePrinter(...args) {
	var color = "red"
	if(args[1] == "PASSED") {
		color = "green"
	}
	return console.log(`${this.description}: %c${args[1]}%c -> ${this.result}`, `color:${color}`, "color:initial")
}