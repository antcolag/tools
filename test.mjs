/**
 * Object extension tools.
 * @module
 * @see module:tools
 * @see module:reactive
 * @see module:observe
 */

import {
	noop,
	pipe
} from "./operation.mjs"

import {
	good,
	DEBUG,
	ASSERT_T,
} from "./debug.mjs"

import observable from "./observe.mjs"

import reactive from "./reactive.mjs"

DEBUG(true)

var COUNTER = 0

export const states = {
	FAILED: "FAILED",
	PASSED: "PASSED"
}

export class Test {
	constructor(description, test = pipe, ...opt) {
		good(description, String)
		good(test, Function)
		this.id = ++COUNTER
		this.options = opt;
		this.description = description;
		this.test = test;
		this.bindable("result")
	}

	run(...args) {
		var promise = new Promise(resolver.bind(
			this,
			args,
			finish.bind(this, states.PASSED, args),
			finish.bind(this, states.FAILED, args)
		));
		promise.finally((x)=> this.fire("complete", x))
		return promise
	}

	async die(...args) {
		const fail = new Test("", this.test)
		COUNTER--
		fail.print = noop
		this.test = ASSERT_T
		try {
			const result = await fail.run(...args)
			this.print = this.print.bind(this, `die: ${result}`)
			return await this.run(fail.state == "FAILED");
		} finally {
			this.print = this.constructor.prototype.print
			this.test = fail.test
		}
	}
}

Test.prototype.print = consolePrinter;

observable.call(Test.prototype)
reactive.call(Test.prototype)

export default Test;

async function resolver(args, ok, ko, resolve) {
	try {
		return resolve(ok(await this.test.apply(this, args)))
	} catch(e) {
		return resolve(ko(e))
	}
}

function finish(state, args, result) {
	this.state = state;
	this.fire(state, this.result = result)
	this.print.bind(this, args) `${state}`
	return result;
}

function consolePrinter(...args) {
	var color = "red"
	var status = args[args.length - 1]
	if(status == states.PASSED) {
		color = "green"
	}
	args.pop()
	args.pop()
	var par = args[args.length - 1]
	args.pop()
	var logmsg = args.length? ' [' + args.join() + ']' : ''
	console[status == states.PASSED ? 'log' : 'error'](
		`${this.id}) %c${status}%c -> ${this.description}${logmsg}%c (${par}):`,
		`color:${color}`, "color:initial;font-style: oblique", "color:initial", this.result
	)
}
