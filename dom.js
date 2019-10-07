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
	var emmetTempString = strings.join( `a[${random}]` )
	var stream = new TokenStream(
		new StringStream(emmetTempString)
	)
	return new TagTokenStream(stream);
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
}

class TagName extends Token {}

class Group extends Token {}

class Relationship extends Token {}

class Multiplier extends Token {}

class TextBlock extends Token {}

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

class TagTokenStream {
	constructor(stream){
		while(stream.pick()){
			console.log(stream.next())
		}
	}
}

