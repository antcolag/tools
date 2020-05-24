export var x = 1
export function increment() {
	return x++
}

var models = [
	{
		field: "foo"
	},
	{
		field: "bar"
	}
]

export function getModel(id) {
	return models[id]
}

export function add(arg){
	models.push(arg)
}