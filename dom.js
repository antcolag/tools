import { croak } from "./debug.js"

export function html() {
	return buildDom(
		randomAttr(),
		...arguments
	)
}

function buildDom(random, strings, ...data) {
	var result = document
	.createRange()
	.createContextualFragment(
		strings.join( `<a ${random}></a>` )
	)
	var elements = result.querySelectorAll(
		`[${random}]`
	)
	data.reverse().forEach((node, i) => {
		var element = elements[
			elements.length - (i + 1)
		]
		var content = element.childNodes
		element.replaceWith(node)
		node.append(...content)
	})
	return result
}

function randomAttr(random = randomInt()) {
	return `data-random-builder${random}`
}

function randomInt(){
	return Math.floor(
		Math.random() * Number.MAX_SAFE_INTEGER
	)
}

export function emmet(strings, ...data){
	var random = randomAttr();
	var emmetTempString = strings.join( `emmet[${random}]` )
	var stream = new TokenStream(
		new StringStream(emmetTempString)
	)
	var tokenString = new TagTokenStream(stream)
	return buildDom(random, [new TagGroup(tokenString, true).render()], ...data);
}

class Token {
	constructor(value){
		this.value = value
	}
}

class Attribute extends Token {
	static fast(value){
		var type;
		switch(value[0]){
			case ".":
				type = 'class';
				break;
			case "#":
				type = 'id';
				break;
			default:
				croak(value);
		}
		value = value.replace(value[0], `${type}="`)
		return new this(`[${value}"]`)
	}

	render(){
		var pair = this.value.match(/^\[(.+)(="(.+)")?\]$/)
		return ` ${pair[1]}=${pair[3]}`
	}
}

class TagName extends Token {}

class Group extends Token {}

class Relationship extends Token {}

class Multiplier extends Token {
	constructor(value){
		super(value)
		this.strategy = Multiplier.detect(value)
	}

	check(){
		return this.strategy.check(...arguments)
	}

	init(){
		return this.strategy.init(...arguments)
	}
	next(){
		return this.strategy.next(...arguments)
	}
	current(){
		return this.strategy.value
	}

	static detect(value = ''){
		var regex = value.match(/^(@([0-9]+|-))?\*([0-9]+)$/) || []
		return new (this.strategies.find( x => x.detect(regex[2])))(regex[2], regex[3] || 1)
	}
}

Multiplier.strategies = [
	class Normal {
		static detect(modifier){
			if(!modifier || /[0-9]+/.test(modifier)){
				return true;
			}
		}
		constructor(modifier, value){
			this.start = parseInt(modifier || '1')
			this.max = parseInt(value)
			this.init();
		}
		init(){
			return this.value = this.start;
		}

		next(){
			return ++this.value;
		}

		check(){
			return this.value <= this.max;
		}
	},

	class Negative {
		static detect(modifier, value){
			if(/-/.test(modifier)){
				return new this(value)
			}
		}
		constructor(value){
			this.start = 0;
			this.min = parseInt(value)
			this.init();
		}
		init(){
			return this.value = this.start;
		}

		next(){
			return --this.value;
		}

		check(){
			this.value >= this.min;
		}
	}
]


class TextBlock extends Token {
	render(){
		return this.value.replace(/^\{(.*)\}$/, '$1');
	}
}

class TokenStream {
	constructor(stream){
		this.stream = stream
	}

	pick() {
		if(!this.current){
			this.current = this.detect(this.stream)
		}
		return this.current
	}

	next(){
		var current = this.pick()
		this.current = undefined;
		return current
	}

	detect(){
		var next = this.stream.pick();
		if(!next){
			return next;
		}
		switch(true){
			case /\s/.test(next):
				this.stream.read(s => /\s/.test(s))
				return this.detect()
			case /[a-zA-Z]/.test(next):
				return new TagName(
					this.readStringIdentifier()
				)
			case /[.#]/.test(next):
				return Attribute.fast(
					this.stream.next() +
					this.readStringIdentifier()
				)

			case /[[]/.test(next):
				return new Attribute(
					this.readStringAttribute()
				)

			case /[\^>+]/.test(next):
				return new Relationship(
					this.stream.next()
				)

			case /[*@]/.test(next):
				return new Multiplier(
					this.stream.read(s => /[@*\-0-9]/.test(s))
				)

			case /[{]/.test(next):
				return new TextBlock(
					this.readText()
				)

			case /[(]/.test(next):
			case /[)]/.test(next):
				return new Group(
					this.stream.next()
				)
			default:
				croak('Error parsing ' + next + ' ' + this.stream.current)
		}
	}

	readText(){
		var text = ""
		const test = s => {
			if((/}/).test(s)){
				return
			}
			return true
		}

		while(text += this.stream.read(test)) {
			text += this.stream.next()
			var picked = this.stream.pick()
			if(!picked || /[\^+)*]/.test(picked)) {
				return text
			} else {
				text += this.stream.next()
			}
		}
	}

	readStringIdentifier(){
		return this.stream.read(s => /[0-9a-zA-Z$-]/.test(s))
	}

	readStringAttribute(){
		var value = this.stream.next()
		value += this.readStringIdentifier()
		if(this.stream.pick() == "="){
			for(let i = 2; i > 0; i--){
				value += this.stream.read(s => s != '"')
				value += this.stream.next()
			}
		}
		if(this.stream.pick() != ']') {
			croak(value + this.stream.pick())
		}
		value += this.stream.next()

		return value
	}
}


class StringStream {
	constructor(s) {
		this.stream = s.split('')
		this.current = 0
	}

	pick(){
		return this.stream[0]
	}

	next(){
		this.current++
		return this.stream.shift();
	}

	read(f){
		var result = "";
		while(this.pick() && f(this.pick())){
			result += this.next()
		}
		return result;
	}
}

class TagGroup {
	constructor(stream, top) {
		this.content = []
		while(stream && stream.pick()){
			var next = stream.pick();
			if(next.value == ')'){
				return;
			}
			stream.next();

			if(next instanceof Relationship){
				switch(true){
				case next.value == '>':
					next = new TagGroup(stream)
					this.content[this.content.length -1].content.push(next)

				continue;
				case next.value == '^':
					if(!top) {
						return;
					}
					stream.next();
				case next.value == '+':
					continue;
				}
			}
			this.content.push(next)
		}
	}

	render(){

		this.content.forEach(item => {
			if(!item.hint){
				item.hint = this.hint;
			}
		})
		var result = "";
		var m = this.multiplier || new Multiplier();
		for(var i = m.init(); m.check(i); i = m.next(i)){
			result += this.content.map(item => item.render()).join('')
		}
		return result;
	}
}

class Tag extends TagGroup {
	constructor(...args){
		super();
		this.tagName = args.find(x => x instanceof TagName) || new TagName()
		this.atributes = args.filter(x => x instanceof Attribute)
		var text = args.filter(x => x instanceof TextBlock)
		this.content.splice(this.content.length, 0, ...text)
		this.multiplier = args.find(x => x instanceof Multiplier)
	}

	render(){
		this.tagName.value = this.tagName.value || this.hint || 'div'

		this.content.forEach(item => {
			if(!item.hint){
				item.hint = this.hint;
			}
		})
		var result = "";
		var m = this.multiplier || new Multiplier();

		var result;
		for(var i = m.init(); m.check(i); i = m.next(i)){
			result += `<${
				this.tagName.value.replace('$', i)
			}${
				this.atributes.map(x => new Attribute(x.value.replace('$', i))).map(x => x.render())
			}>${
				this.content.map(x => x instanceof TextBlock? new TextBlock(x.value.replace('$', i)) : x).map(item => item.render(m))
			}</${
				this.tagName.value.replace('$', i)
			}>`
		}
		return result;
	}
}

class TagTokenStream {
	constructor(stream){
		this.stream = stream
	}

	pick(){
		if(this.current){
			return this.current;
		}
		var picked = this.stream.pick()
		if(!picked){
			return;
		}

		switch(true){
		case picked instanceof Group:
			this.stream.next();
			if(picked.value == ')'){
				this.current = picked;
				return picked;
			}
			this.current = new TagGroup(this);
			this.addMultiplier(picked)
		return this.current

		case picked instanceof TextBlock:
			this.current = this.stream.next();
		return this.current;

		case this.isTag(picked):
			var args = []
			while(this.isTag(picked)){
				args.push(this.stream.next())
				picked = this.stream.pick()
			}
			this.current = new Tag(...args)
			this.addMultiplier(picked)
		break;
		default:
			var next = this.stream.next();
			this.current = next
		}
		return this.current
	}

	next() {
		var current = this.pick();
		this.current = undefined;
		return current;
	}

	isTag(picked){
		switch(true){
		case picked instanceof Attribute:
		case picked instanceof TagName:
		case picked instanceof TextBlock:
		return true
		}
	}

	addMultiplier(picked){
		picked = this.stream.pick()
		if(picked instanceof Multiplier){
			this.current.multiplier = this.stream.next()
		}
	}
}

