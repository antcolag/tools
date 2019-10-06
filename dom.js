export default function html() {
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