import Test from "../test.mjs";
import * as dom from "../dom.mjs";
import readable from "../readable.mjs";
import reactive from "../reactive.mjs";
import * as extra from "../extra.mjs";
import {
	pipe,
	random,
	delay,
	noop,
	RegObj
} from "../utils.mjs";
import {
	good,
	crap,
	ASSERT,
	ASSERT_T,
} from "../debug.mjs";
import {
	View,
	EventBroker
} from "../extra.mjs";
import {
	debounce
} from "../utils.mjs";
import {
	Semaphore
} from "../utils.mjs";

const isBrowser = typeof Document != 'undefined' && document.body

new Test("tests should work", async function (arg) {
	var tests = new Test(
		"reactive and events should work",
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
	tests.bind("result", this, "reactiveResult")
	tests.on(
		"PASSED FAILED complete",
		ASSERT.bind(null, this.reactiveResult, tests.result)
	)
	await tests.run(true)

	good(1, Boolean, Number)

	crap(1, Boolean, Object)

	good(()=>{}, "function")

	await new Test(
		"good should die if not pass",
		good.bind(null, 1, Boolean)
	).die(true)

	await new Test(
		"crap should die if not pass",
		crap.bind(null, 1, Number)
	).die(true)

	await new Test(
		"should fail if description is not a String",
		() => new Test(-1).run()
	).die(true)

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

	if(isBrowser){
		await new Test(
			"emmet should work in browser",
			() => {
	
			var testDom = dom.emmet `a.b.c`
			ASSERT(testDom.children[0].className, "b c")
			document.body.appendChild(dom.emmet `a#ciao[bella="ola"]>
				bella.pe#tutti+#e+.pure*2>
					((agli#altri+mhu#ah.ua[sdfd="dsf$$"]+ha{$$$@-5})*3)*2
				^^ ^^ ^
				ale+section>
					div>
						pre{emmet generated}^
						${document.querySelector('h1')}+p{with fun}+ul>
						.azz*3`
			)
			document.body.appendChild(dom.emmet `div$$.c-\${$$$@3chiaro?$$@-8!!!}*3`)
	
			return ASSERT_T(document.querySelector('agli#altri'))
		}).run()
	
		const myTitle3 = document.createElement('h2')
		document.body.appendChild(dom.html `
			<article>
				${myTitle3}
			</article>
		`)
		myTitle3.innerHTML = 'hello world'
		const myTitle = document.createElement('h2')
		const myTitle2 = document.createElement('h2')
	
		await new Test(
			"escaped emmet should work",
			document.body.append.bind(document.body)
		).run(dom.emmet `article>${myTitle2}.title>{\\\\\\} } + span{hello ${567}} ^ ${myTitle}>{weeee}`)
		myTitle2.innerHTML += 'emmet!'

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

			globalThis.customElements.define('custom-elm', class extends HTMLElement {
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
			ASSERT_T
		).run(dom.emmet `a#id.class.name[data-att="attr"]{bella }>{pe ${"tutti"}}` == '<a id="id" data-att="attr" class="class name">bella pe tutti</a>')
	}

	await new Test('some extra', async function(){
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

	ASSERT_T("foobar!".match(new RegObj(/\w+(bar\!)/, "baz")).baz == "bar!")

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

	const randomTest = new Test('random', async function(tot, i1 = 0, i2 = 1 << 15, handler = noop){
		function randomInteger(min = 0, max = 2 << 15) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		var now = typeof performance === "undefined" ? 	now = Date.now : performance.now.bind(performance)
		var s0 = now();
		for(var i = 0; i < tot; i++){
			handler(randomInteger(i1, i2))
		}
		var e0 = now();

		var s1 = now();
		for(var i = 0; i < tot; i++){
			handler(random(i1, i2))
		}
		var e1 = now();

		var t0 = e0 - s0, t1 = e1 - s1, r = t0 - t1
		if(r < 0){
			throw r
		}
		return r
	})

	await randomTest.run(1000)
	await randomTest.run(10000)
	await randomTest.run(100000)
	await randomTest.run(1000000, -1200, 3456)

	return arg
}).run(true)