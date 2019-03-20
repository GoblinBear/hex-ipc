import net from 'net';
import { EventEmitter } from 'events';
import IPCSocket from './ipc-socket.esm.js';
	
class IPCServer extends EventEmitter {
	constructor() {
		super();
		
		this.server = net.createServer()
		.on( 'connection', ___HANDLE_CONNECTION.bind(this) )
		.on( 'close', ___HANDLE_CLOSE.bind(this) )
		.on( 'error', ___HANDLE_ERROR.bind(this) );
		
		this._serializer = null;
		this._deserializer = null;
	}
	listen(...args) {
		this.server.listen(...args);
		return this;
	}
}

export default IPCServer;


async function ___HANDLE_CONNECTION(socket) {
	let ipcSock = new IPCSocket(socket, this);
	ipcSock._serializer	  = this._serializer;
	ipcSock._deserializer = this._deserializer;
	
	this.emit( 'connected', {type:'connected', sender:ipcSock});
}
function ___HANDLE_CLOSE() {
	this.emit('close', {type:'close', sender:this});
}
function ___HANDLE_ERROR() {
	this.emit('close', {type:'close', sender:this});
}

