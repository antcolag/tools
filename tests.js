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
		this.bindable("result")
	}

	async run(...args) {
		const promise = new Promise(resolver.bind(this, args))
		promise.finally(()=> this.fire("complete", this))
		try {
			return await promise
			.then(finish.bind(this, "PASSED"), finish.bind(this, "FAILED"))
		} catch(e) {
			return e
		}
	}
}

Test.prototype.print = consolePrinter;

iobservable.call(Test.prototype)
ireactive.call(Test.prototype)

export default Test;

function resolver(args, resolve) {
	return resolve(this.test.call(this, ...args))
}

function finish(state, result) {
	this.fire(state, this.result = result)
	this.print `test end ${state}`
	return result;
}

function consolePrinter(...args) {
	var color = "red"
	if(args[1] == "PASSED") {
		color = "green"
	}
	return console.log(`${this.description}: %c${args[1]}%c -> ${this.result}`, `color:${color}`, "color:initial")
}