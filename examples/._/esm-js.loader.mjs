/**
 * I've been encountered a stupid situation in which I want to write es module compatible libraries that
 * can be shared between nodejs and browser, but I have to rename my file in mjs to enable es module in nodejs
 * and at the same time, I have to provide correct mime type to make the browser accepts files ended with .mjs
 * extension. Here's why this module comes out! This module makes the nodejs environment accept files ended with
 * .esm.js to be a es module. Then I don't have to modify the server to tell the browser what a .js file is!
**/
// Source: https://gist.github.com/JCloudYu/87b4a5caff65320557452167e3466dbb

import process from 'process';
import os from 'os';



const IS_WINDOWS = (os.platform().substring(0,3).toLowerCase() === "win");
const IS_WIN_ABSOLUTE_PATH = /^[a-zA-Z]:\/[^/].*$/;
const BASE_URL = `file://${IS_WINDOWS?'/':''}${process.cwd()}/`;

export function resolve(specifier, parentModuleURL, defaultResolve) {
	if ( IS_WINDOWS && IS_WIN_ABSOLUTE_PATH.test(specifier) ) {
		specifier = `file:///${specifier}`;
	}

	// console.log(specifier);
	// console.log(parentModuleURL);
	
	

	if ( specifier.substr(-7) === ".esm.js" ) {
		return {
			url: new URL(specifier, parentModuleURL||BASE_URL).href,
			format: 'esm'
		};
	}
	
	return defaultResolve(specifier, parentModuleURL);
}
