// test for node

import * as tests from "./run.mjs"


function parseargv([{}, {}, ...rest]) {
	return rest
}

if(process){
	var args = parseargv(process.argv)
	tests.run(args.length ? args : void 0)
}