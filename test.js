import { pipe } from "./utils.js"

import {
	DEBUG
} from "./debug.js"

import observable from "./observe.js"

import reactive from "./reactive.js"

DEBUG(true)

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
		return await promise
		.then(
			finish.bind(this, "PASSED"),
			finish.bind(this, "FAILED")
		)
	}
}

Test.prototype.print = consolePrinter;

observable.call(Test.prototype)
reactive.call(Test.prototype)

export default Test;

function resolver(args, resolve) {
	return resolve(this.test.apply(this, args))
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
	return console.log(
		`${this.description}: %c${args[1]}%c -> ${this.result}`,
		`color:${color}`, "color:initial"
	)
}