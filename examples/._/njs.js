/**
 *	Author: JCloudYu
 *	Create: 2019/03/01
**/
(()=>{
	"use strict";
	
	const DEFAULT_NODE_EXEC = require('path').resolve(process.argv[0]);
	
	//NOTE: Modify here if you want to add additional default args...
	const DEFAULT_NODE_ARGS = [
		'--experimental-modules',
		'--loader', `./._/esm-js.loader.mjs`,
	];


	
	if ( require.main === module ) {
		___INVOKE_CHILD(process.argv.slice(2));
	}
	else {
		module.exports = ___INVOKE_CHILD;
	}
	
	
	
	
	function ___INVOKE_CHILD(child_args, node_path=DEFAULT_NODE_EXEC) {
		const {NODE_ARGS=DEFAULT_NODE_ARGS} = ___INVOKE_CHILD;
		const EXEC_ARGS = [
			...NODE_ARGS,
			...child_args
		];
	
		return require( 'child_process' )
		.spawn(node_path, EXEC_ARGS, {
			cwd:process.cwd(), env:process.env, stdio:[0, 1, 2]
		})
		.on( 'exit', function(code) {
			const CHILD_PROCESS = this;
			Promise.resolve().then(async()=>{
				if ( typeof CHILD_PROCESS.onexit === "function" ) {
					await CHILD_PROCESS.onexit.call(CHILD_PROCESS, code);
				}
			})
			.catch((e)=>{ console.log(e); })
			.finally(()=>{
				process.exit(code);
			});
		});
	}
})();
