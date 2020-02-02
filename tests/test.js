
import Test from "../test.js";
import * as dom from "../dom.js";
import readable from "../readable.js";
import reactive from "../reactive.js";
import {
	pipe,
} from "../utils.js";
import {
	good,
	crap,
	ASSERT,
	ASSERT_T,
} from "../debug.js";

new Test("tests shuld work", async function (arg) {
	var tests = new Test(
		"reactive and events shuld work",
		() => {
			var r = new reactive()
			r.bindable('foo')
			r.bindable('bar');
			var o = {}
			r.bind('foo', o)
			r.bind('bar', o)
			r.bind('foo', (x) => document.body.appendChild(dom.emmet `p{updating foo ${x}}`))
			r.bind('bar', (x) => document.body.appendChild(dom.emmet `p{updating bar ${x}}`))

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
		"shuld fail if description is not a String",
		() => new Test(-1).run()
	).die(true)

	readable.call(console)
	var i = 0;
	var timer = setInterval(()=>{
		console.log(`...${++i}`)
	}, 100)
	await new Test(
		"readable shuld work (.2 sec timer)",
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
		"readable shuld work (no timer)",
		pipe
	).run(await console.read())


	clearInterval(timer)

	await new Test(
		"emmet shuld work",
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
		"escaped emmet shuld work",
		document.body.append.bind(document.body)
	).run(dom.emmet `article>${myTitle2}.title>{\\\\\\} } + span{hello ${567}} ^ ${myTitle}>{weeee}`)
	myTitle2.innerHTML += 'emmet!'

	return arg
}).run(true)