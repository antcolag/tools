/**
 * This module provide the functionality for creating HTML fragments
 * from template strings
 * @module
 */

import { croak } from "./debug.js"

/**
 * Autodetect if the input string is Emmet or HTML, then parse
 */
export default function auto(strings, ...args){
	if(strings instanceof Array){
		return (/</.test(strings.join(''))? html : emmet)(...arguments)
	}
	return auto([strings], ...args)
}

/**
 * parse an HTML template string and return a document fragment
 * @param {string[]} template
 * @param {...Node} args
 */
export function html() {
	return new DomPrinter().html(...arguments)
}

/**
 * parse an Emmet template string and return a document fragment
 * @param {string[]} template
 * @param {...Node} args
 */
export function emmet(){
	return new DomPrinter().emmet(...arguments)
}

/**
 * this class provides the functions for build
 * a dom with a custom html interpreter
 */
export class DomPrinter {
	constructor(builder = createFragment) {
		this.builder = builder
	}

	html(strings, ...data) {
		[strings, data] = filter(strings, data);
		return buildDom(
			this.builder,
			randomAttr(),
			...[strings, ...data]
		)
	}

	emmet(strings, ...data){
		[strings, data] = filter(strings, data);
		var random = randomAttr();
		var emmetTempString = strings.join( `emmet[${random}]` )
		var stream = new TokenStream(
			new StringStream(emmetTempString)
		)
		var tokenString = new TagTokenStream(stream)
		return buildDom(this.builder, random, [
			new TagGroup(tokenString, true).toString()
		], ...data);
	}
}

function filter(strings, data){
	var resultString = []
	var resultData = []
	var resultStringIndex = 0
	for(var i = 0; i < strings.length - 1; i++){
		if(Node && !(data[i] instanceof Node)){
			resultString[resultStringIndex] = (resultString[resultStringIndex] || '') + `${strings[i]}${data[i]}`

		} else {
			resultString[resultStringIndex] = (resultString[resultStringIndex] || '') + strings[i]
			resultStringIndex++
			resultData.push(data[i])
		}
	}
	if(strings[i]){
		if(resultString[resultStringIndex]){
			resultString[resultStringIndex] += strings[i]
		} else {
			resultString.push(strings[i])
		}
	}
	return [resultString, resultData]
}

function createFragment(string) {
	return document.createRange().createContextualFragment( string )
}

function buildDom(builder, random, strings, ...data) {
	var result = builder(strings.join( `<a ${random}></a>` ))
	var elements = result.querySelectorAll(
		`[${random}]`
	)
	data.reverse().forEach((node, i) => {
		var element = elements[
			elements.length - (i + 1)
		]
		element.replaceWith(node)
		node.append(...element.childNodes)
		Array.prototype.forEach.call(element.attributes, item => {
			if(item.nodeName == random) {
				return;
			}
			node.setAttributeNode(item.cloneNode())
		})
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

	toString(){
		var pair = this.value.match(/^\[(.+)\]$/)
		return ` ${pair[1]}`
	}
}

class TagName extends Token {}

class Group extends Token {}

class Relationship extends Token {}

class Multiplier extends Token {
	constructor(value = '*1'){
		super(value)
	}

	check(){
		return this.current < this.end
	}

	init(){
		this.current = 0;
		this.end = parseInt(this.value.match(/^\*([0-9]+)$/)[1])
	}
	next(){
		return ++this.current
	}

	detect(value){
		var matched = value.match(Multiplier.regex)
		return matched? value.replace(
			Multiplier.regex,
			new MulValue(matched[1].length, matched[3] || 1, this)
		) : value
	}
}

Multiplier.regex = /(\$+)(@([0-9\-]+))?/

class MulValue {
	constructor(size, value, multiplier){
		this.start = parseInt(value);
		this.size = size
		this.multiplier = multiplier
	}

	toString(){
		var sign = this.start > 0 ? 1 : -1
		return ((this.start + this.multiplier.current) * sign + '')
		.padStart(this.size, '0')
	}
}

class TextBlock extends Token {
	toString(){
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

			case /\[/.test(next):
				return new Attribute(
					this.readStringAttribute()
				)

			case /[\^>+]/.test(next):
				return new Relationship(
					this.stream.next()
				)

			case /\*/.test(next):
				return new Multiplier(
					this.stream.read(s => /[*\-0-9]/.test(s))
				)

			case /\{/.test(next):
				return new TextBlock(
					this.readText()
				)

			case /\(/.test(next):
			case /\)/.test(next):
				return new Group(
					this.stream.next()
				)
			default:
				croak(
					'Error parsing '
					+ next
					+ ' '
					+ this.stream.current
				)
		}
	}

	readText(){
		var text = ""
		var escaped = false
		const test = s => {
			if(!escaped && /}/.test(s)){
				return
			}
			escaped = false
			if(/\\/.test(s)){
				escaped = true
				return
			}
			return s
		}

		while(text += this.stream.read(test)) {
			var picked = this.stream.pick()
			if(!escaped){
				text += picked
			}
			this.stream.next()
			if(picked && !escaped && /}/.test(picked)) {
				return text
			}
		}
	}

	readStringIdentifier(){
		return this.stream.read(s => /[_0-9a-zA-Z$-]/.test(s))
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
				switch(next.value){
				case '>':
					next = new TagGroup(stream)
					this.content[
						this.content.length - 1
					].content.push(next)

				continue;
				case '^':
					if(!top) {
						return;
					}
				case '+':
					continue;
				}
			}
			this.content.push(next)
		}
	}

	toString(){
		this.content.forEach(item => {
			if(!item.hint){
				item.hint = this.hint;
			}
		})
		var result = "";
		var m = this.multiplier || new Multiplier();
		for(var i = m.init(); m.check(i); i = m.next(i)){
			result += this.content.map(
				item => item.toString(this.multiplier)
			).join('')
		}
		return result;
	}
}

class Tag extends TagGroup {
	constructor(...args){
		super();
		this.tagName = args.find(
			x => x instanceof TagName
		) || new TagName()
		this.attributes = args.filter(x => x instanceof Attribute)
		var text = args.filter(x => x instanceof TextBlock)
		this.content.splice(this.content.length, 0, ...text)
		this.multiplier = args.find(x => x instanceof Multiplier)
	}

	toString(supermul){
		this.tagName.value = this.tagName.value || this.hint || 'div'

		this.content.forEach(item => {
			if(!item.hint){
				item.hint = Tag.findHint(this.tagName);
			}
		})
		var result = "";
		var m = this.multiplier || new Multiplier();

		var result;
		for(m.init(); m.check(); m.next()){
			result += `<${
				m.detect(this.tagName.value)
			}${
				this.attributes.map(
					x => new Attribute(m.detect(x.value))
				).join('')
			}>${
				this.content.map(x => {
					if(x instanceof TextBlock) {
						return new TextBlock(
							x.value.match(/(.*?\$+@?-?[0-9]*|.*$)/g)
							.map( y => (supermul || m).detect(y)).join('')
						)
					} else {
						return x.toString(supermul || m)
					}
				}).join('')
			}</${
				m.detect(this.tagName.value)
			}>`
		}
		return result;
	}

	static findHint(tagName) {
		const hints = {
			'li': ['ul', 'ol'],
			'span': ['a','p']
		}

		for(let i in hints){
			if(hints[i].some(x => x == tagName.value)){
				return i;
			}
		}
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
