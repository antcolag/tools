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

	passed(o) {
		console.log(...result `${this.description} PASSED ${o} green`)
	}

	failed(e) {
		console.error(...result `${this.description} FAILED ${e} red`)
	}

	run(...args) {
		try{
			this.passed(this.handler(...args))
		} catch(e) {
			this.failed(e)
		}
	}

	async defer(...args) {
		await defer(this.run.bind(this), 0, ...args)
	}
}

export default Test;

function result(...args) {
	return [`${args[1]}:%c${args[0][1]}%c-> ${args[2]}`, `color:${args[0][2]}`, "color:initial"]
}