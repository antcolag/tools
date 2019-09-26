import {
	noop,
	pipe
} from "./utils.js"

import {
	good,
	DEBUG,
	ASSERT_T,
} from "./debug.js"

import observable from "./observe.js"

import reactive from "./reactive.js"

DEBUG(true)

var COUNTER = 0

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
			finish.bind(this, "PASSED"),
			finish.bind(this, "FAILED")
		));
		promise.finally((x)=> this.fire("complete", x))
		return promise
	}

	async die(...args) {
		const fail = new Test("", this.test)
		COUNTER--
		fail.print = noop
		this.print = this.print.bind(this, 'die test')
		this.test = failtester
		try {
			const result = await fail.run(...args)
			return await this.run(result, fail.state == "FAILED");
		} finally {
			this.print = this.constructor.prototype.print
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

function finish(state, result) {
	this.state = state;
	this.fire(state, this.result = result)
	this.print `test end ${state}`
	return result;
}

function consolePrinter(...args) {
	var color = "red"
	var status = args[args.length - 1]
	if(status == "PASSED") {
		color = "green"
	}
	args.pop()
	args.pop()
	var logmsg = args.length? '[' + args.join("][") + ']' : ''
	logmsg = `${this.description} [test ${this.id}]${logmsg}`
	return console.log(
		`%c${status}%c -> ${this.result}: ${logmsg}`,
		`color:${color}`, "color:initial"
	)
}

function failtester (r, v) {
	ASSERT_T(v)
	return r
}
