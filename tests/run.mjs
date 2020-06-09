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
	debounce,
	merge
} from "../utils.mjs";
import {
	Semaphore
} from "../utils.mjs";

const isBrowser = typeof Document != 'undefined' && document.body
const now = typeof performance === "undefined" ? Date.now : performance.now.bind(performance)

export async function testTest() {
	return await new Test("tests should work", noop).run(true)
}

export async function testReactive(){
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
}


export async function testGoodCrap() {


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

	await new Test(
		"should fail if description is not a String",
		() => new Test(-1).run()
	).die(true)
}

export async function testReadable() {
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
}



export async function testEmmet() {
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
}


export async function testExtra() {
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
}

export async function testRegObj() {
	return await new Test("reg obj", async () =>{
		ASSERT_T("foobar!".match(new RegObj(/\w+(bar\!)/, "baz")).baz == "bar!")
	})
}


export async function testEventBroker() {
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
	})
}

export async function testDebounce() {
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
}

export async function testRandom() {
	const randomTest = new Test('random', async function(tot, i1 = 0, i2 = 1 << 15, handler = noop){
		function randomInteger(min = 0, max = 2 << 15) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
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
}

export async function testMerge() {
	var testMerge = new Test("merge", function(method, X, Y, times = 100000) {
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
	await testMerge.run(m, function() {
		return x1
	}, function() {
		return y1
	})
	await testMerge.run(m, function() {
		return x2
	}, function() {
		return y2
	})
}

export async function run(arr = Object.keys(this)){
	for(var i of arr) {
		i != "run" && await this[i]()
	}
}