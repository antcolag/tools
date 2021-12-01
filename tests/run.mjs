import Test from "../test.mjs";
import * as dom from "../dom.mjs";
import readable from "../readable.mjs";
import reactive from "../reactive.mjs";
import * as extra from "../extra.mjs";
import {
	delay,
	RegObj,
	debounce,
	merge,
	Semaphore,
	Timer
} from "../utils.mjs";
import {
	pipe,
	noop
} from "../operation.mjs";
import {
	good,
	croak,
	crap,
	ASSERT,
	ASSERT_T,
} from "../debug.mjs";
import {
	View,
	EventBroker
} from "../extra.mjs";

import {
	emmet as emmetDomBuilder,
	html as htmlDomBuilder,
	auto as autoDomBuilder
} from "../dom.mjs"
import { DomPrinter } from "../dom.mjs";

const isBrowser = typeof Document != 'undefined' && document.body
const p =  typeof performance === "undefined" ? Date : performance
const now = p.now.bind(p)

if(!globalThis.document) {
	try {
		globalThis.document = {
			body: {
				append() {
					console.log(...arguments)
				}
			},
			createElement: pipe
		}
	} finally {}
}

export const tests = {
	/** test the test suite, both run and die */
	testTestSuite: async function() {
		await new Test("tests should work", noop).run(true)

		await new Test(
			"should fail if description is not a String",
			async () => await new Test(-1).run()
		).die(true)
	},

	testReactive: async function(){
		var test1 = new Test(
			"reactive and events should work init",
			() => {
				var r = new reactive()
				r.bindable('foo')
				r.bindable('bar');
				var o = {}
				r.bind('foo', o)
				r.bind('bar', o)

				Object.assign(r, {foo:1,bar:2})
				return ASSERT_T(o.foo == r.foo && o.bar == r.bar)
			}
		)
		var test2 = new Test(
			"reactive and events should work end",
			async function () {
				test1.bind("result", this, "reactiveResult")
				test1.on(
					"PASSED FAILED complete",
					ASSERT.bind(null, this.reactiveResult, test1.result)
				)
				await test1.run(true)
			}
		)

		await test2.run()
	},

	testGoodCrap: async function() {
		await new Test(
			"good and crap pass",
			() => {
				good(1, Boolean, Number)

				crap(1, Boolean, Object)

				good(()=>{}, "function")
			}
		).run(true)

		await new Test(
			"good die",
			good.bind(null, 1, Boolean)
		).die(true)

		await new Test(
			"crap die",
			crap.bind(null, 1, Number)
		).die(true)
	},

	testReadable: async function() {
		readable.call(console)
		var i = 0;
		var timer = setInterval(()=>{
			console.log(`...${++i}`)
		}, 100)
		await new Test(
			"readable should work (.2 sec timer)",
			pipe
		).run(await console.read(200))

		clearInterval(timer)

		timer = setInterval(()=>{
			console.log(`...${++i}`)
		}, 100)

		var timer2 = setInterval(()=>{
			console.broadcast('foo', 'bar')
		}, 200)

		await new Test(
			"readable should work (no timer)",
			pipe
		).run(await console.read()).finally(() => clearInterval(timer2))

		clearInterval(timer)
	},

	testEmmet: async function() {
		if(isBrowser){
			await new Test(
				"emmet should work in browser",
				() => {
		
					var testDom = dom.emmet `a.b.c`
					ASSERT(testDom.children[0].className, "b c")

					emmetDomBuilder `p.paragraph#main > span {text}`
					htmlDomBuilder `<p class="paragraph" id="main">text</p>`

					autoDomBuilder `<ul><li class="data">html</li></ul>`
					autoDomBuilder `ul>.data{html}`
					document.body.append(dom.emmet `a#ciao[abbr="ola"]>
						bella.pe#tutti+#e+.pure*2>
							((agli#altri+mhu#ah.ua[lang="dsf$$"]
							+
							ha{x xx x$$$@-5})*3)*2
						^^ ^^ ^
						ale+section>
							div>
								pre{emmet generated}^
								${document.querySelector('h1')}
								+
								p{with fun}+ul>.azz*3{lista}`
					)
					document.body.append(
						dom.emmet `div$$.c-\${$$$@3chiaro?$$@-8!!!}*3`
					)
					document.body.append(
						(new dom.DomPrinter()).auto `div$$.c-\${
							$$$@3chiaro?$$@-8!!!
						}*3`
					)
					document.body.append(
						dom.emmet `ol>((.azz*2{lista grossa $$@1})*3)*5`
					)
					const myTitle3 = document.createElement('h2')
					document.body.append(dom.html `
						<article>
							${myTitle3}
						</article>
					`)
					myTitle3.innerHTML = 'hello world'
					ASSERT_T(document.querySelector('div02'))
					return ASSERT_T(document.querySelector('agli#altri'))
				}
			).run()

			await new Test('custom html element', async function() {
				var module = await import('./module.mjs')
				module.add({
					field: "foobar"
				})

				class CustomView extends View(function(id){
					return this.print.html `
					<h1>
					${
						this.model.field + " " + id
					}
					</h1>
					<slot name="test-slot">fallback text</slot>
					`
				}){
					constructor(model) {
						super()
						this.model = model
					}
				}

				globalThis
				.customElements
				.define('custom-elm', class extends HTMLElement {
					constructor() {
						super()
						this.attachShadow({
							mode: "open"
						})
						import('./module.mjs').then(x => {
							var view = new CustomView(x.getModel(this.dataset.id))
							this.shadowRoot.append(view.render(x.increment()))
						})
					}
				})
			}).run()

		} else {
			await new Test(
				"emmet should work in node",
				function() {
					const result = dom.emmet `
						a#id.class.name[data-att="attr"]{bella }>{pe ${"tutti"}}
					`
					ASSERT_T(result == '<a id="id" data-att="attr" class="class name">bella pe tutti</a>')
				}
			).run()
		}

		new Test('should fail when crating risky tags or attribute', async () => {
			await new Test('style run on onload', () => { 
				dom.emmet `
					style[onload="alert(-1)"] {
						#open-dev-console {
							position: absolute;
							top: 0;
							z-index: 100;
							marign: auto;
						\\}
					}
				`
			}).die()
			await new Test('script die on onload', () => {
				dom.emmet `
					script[type="module"] {
						import * as test from "../test.mjs"
						void (async () => await new test.Test(
							"script are interpretated inside emmet view, be careful",
							() => {return true\\}
						).run())();
					}
				`
			}).die()
		}).run()
	},

	testEmmeScriptElementOk: async function() {
		await new Test('script and style ok if sandbox enabled', async () => {
			const dom = new DomPrinter()
			dom.sandbox = {}
			const element = dom.emmet `
				script[type="module"].script-appended {
					import * as test from "../test.mjs"
					import * as dom from "../dom.mjs"

					void (async () => {
						await new test.Test(
							"nested script should run",
							() => {
								document.body.append(dom.auto \`.NESTED#DOM\`)
								document.body.querySelector(
									'.pipe-promise-element'
								).res(true)
								return true;

								/*

${
	unescape(JSON.stringify({x: 1111, a:'b'})).replace(/\}/, '\\}')
}


								*/
							\\}
						).run()
					\\})()
				}
			`
			if(isBrowser){
				const pipeElm = dom.auto `.pipe-promise-element`
				var sem = new Semaphore(), tim = new Timer((_, rej) => rej('timeout'))
				tim.start(1000)
				document.body.append(pipeElm)
				document.body.querySelector(
					'.pipe-promise-element'
				).res = sem.resolve
				try {
					document.body.append(element)
					await Promise.race([
						tim,
						sem
					])
					if(!document.querySelector('.NESTED#DOM')) {
						throw new Error('.NESTED#DOM not found')
					}
				} catch(e) {
					throw e
				}
			}
		}).run()
	},

	testEmmetCustomAttrOk: async function() {
		await new Test('unsandboxed printer custom attribute ok on onload', () => {
			const printer = new dom.DomPrinter()
			printer.sandbox = {}
			document.body.append(printer.emmet `a#ciao[bella="ola"]`)
		}).run()
	},

	testEmmetNestedTestTextMultiplier: async function() {
		const dom = new DomPrinter(pipe)
		const d = dom.auto `ul>{$$@2}*3`
		ASSERT_T(d)
		/*

			to test

				ul>{$$@2}*3
				<ul>
					02
					03
					04
				</ul>

				ul{$$@2}*3
				<ul>02</ul>
				<ul>03</ul>
				<ul>04</ul>


				ul{$$@-}*3
				<ul>03</ul>
				<ul>02</ul>
				<ul>01</ul>
		*/
	},

	testEscaped: async function() {
		const myTitle = document.createElement('h2')
		const myTitle2 = document.createElement('h2')
		
		await new Test(
			"escaped emmet should work",
			function () {
				const element1 = dom.emmet `
					article>${
						document.createElement('h2')
					}.title{\\\\\\} } + span{hello}`
				document.body.append(dom.emmet `
					article.UNIQUE-CLASS>${
						myTitle2
					}.title>{\\\\\\} } + span{hello ${567}} ^ ${
						myTitle
					}>{weeee}`
				)
			}
		).run()
		if(isBrowser) {
			myTitle2.innerHTML += 'emmet!'
		}
	},

	testEmmetCustomAttrKo: async function() {
		await new Test('sandboxed printer custom attribute ko on onload', () => {
			document.body.append(dom.emmet `a#ciao[bella="ola"]`)
		}).die()
	},


	testExtra: async function() {
		await new Test('some extra',async function(){
			class ConcreteModel extends extra.Model(Object, 'foo', 'bar', 'baz') {}
			var model = new ConcreteModel()
			var n = 0
			var i = 0
			model.on('updated', function(){
				n++;
			})
			model.bind('foo', function(x){
				if(x !== i) {
					throw "foo should be equal to x when assigned"
				}
			})
			model.foo = ++i
			await delay()
			model.foo = ++i
			model.bar = n
			model.baz = n
			await delay()
			Object.assign(model, {
				foo: ++i,
				bar: n,
				baz: n
			})
			await delay()
			if(n !== i) {
				throw `update fired ${n} times in Model instead of ${i}`
			}
			if(!isBrowser) {
				return true;
			}

			var view = new View(function(model){
				return this.print.emmet `div>li>${model.foo} ^ li>${model.bar}`
			})
			var view2 = new View(function(model){
				return view.render({
					foo: `{${model.foo}}`,
					bar: `{${model.bar}}`
				})
			})
			var view3 = new View(function(model){
				foo = document.createElement('span')
				bar = document.createElement('span')
				model.bind('foo', foo, 'innerHTML')
				model.bind('bar', bar, 'innerHTML')
				return view.render({
					foo: foo,
					bar: bar
				})
			}).render(model), foo, bar
			document.body.append(view3, view2.render(model))
			Object.assign(model, {
				foo: ++i,
				bar: n,
				baz: n
			})
			ASSERT_T(foo.innerText == i)
			ASSERT_T(bar.innerText == n)
			return true
		}).run()
	},

	testRegObj: async function() {
		return await new Test("reg obj", async () =>{
			ASSERT_T("foobar!".match(new RegObj(/\w+(bar\!)/, "baz")).baz == "bar!")
		}).run()
	},


	testEventBroker: async function() {
		return await new Test("event broker", async () =>{
			var evt = new EventBroker()
			var x = 0
			var handler = () => ++x
			evt.on('one', handler)
			evt.on('two', handler)
			evt.on('three', handler)

			await delay(100)
			evt.fireLast('one')
			evt.fireLast('two')
			evt.fireLast('three')

			await delay(100)

			ASSERT_T(x == 1)
		}).run()
	},

	testDebounce: async function() {
		await new Test('debounce', (count, interval, debouncing) => {
			var int, semaphore = new Semaphore();
			var f = debounce(function(count){
				if(count) {
					semaphore.reject()
				}
				semaphore.resolve()
			}, debouncing)

			int = setInterval(function(){
				if(!--count){
					clearInterval(int)
				}
				f(count)
			}, interval)
			return semaphore;
		}).run(10, 10, 200)
	},

	testMerge: async function() {
		var test = new Test("merge", function(method, X, Y, times = 100000) {
			var start = now()
			while(times--){
				var x = method(new X(), new Y())
			}
			var stop = now()
			x.toString()
			return stop - start
		})

		var x1 = {
			x: 1,
			y: 2,
			z: {
				x: 1,
				y: 2,
				z: {
					x: 1
				}
			}
		}, y1 = {
			x: 100,
			y2: 200,
			z: {
				x: 100,
				y: 200,
				z2: {
					x: 200
				}
			}
		}, x2 = {
			x: 1,
			y: 2,
			__proto__: {
				toString(){
					return "ok"
				}
			}
		}, y2 = {
			x: 100,
			y2: 200,
			__proto__: {
				toString(){
					return croak("bad string")
				}
			}
		}
		function m() {
			return merge(...arguments)
		}
		await test.run(m, function() {
			return x1
		}, function() {
			return y1
		})
		await test.run(m, function() {
			return x2
		}, function() {
			return y2
		})
		await test.die(m, class Z {}, function() {
			return {["__proto__"]: {toString(){throw "__proto__ pollution 1"}}}
		})
		await test.die(m, class Z {}, function() {
			return JSON.parse(`{"constructor": false, "__proto__": {"a": 1337}}`)
		})
	}
}

export async function run(arr = Object.keys(tests)){
	console.log(`init ${arr}`)
	for(var i of arr) {
		i != "run" && await runSingle(tests[i])
	}
	console.log(`done`)
}

async function runSingle(h) {
	console.log(`start ${h.name}`)
	await h()
	console.log(`stop ${h.name}`)
}

if(!isBrowser){
	run()
}