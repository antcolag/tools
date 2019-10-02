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
			finish.bind(this, "PASSED", args),
			finish.bind(this, "FAILED", args)
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
	if(status == "PASSED") {
		color = "green"
	}
	args.pop()
	args.pop()
	var par = args[args.length - 1]
	args.pop()
	var logmsg = args.length? '[' + args.join("][") + ']' : ''
	return console.log(
		`\t${this.id}) %c${status}%c -> ${this.description}:%c ${this.result} %c${logmsg} {${par}}`,
		`color:${color}`, "color:initial;font-style: oblique",
		"color:blue;text-transform: none", "color:initial"
	)
}
