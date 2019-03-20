import { Socket } from 'net';
import { EventEmitter } from 'events';
	
const _DATA_PROCESS_LOOP = 15;
const _WEAK_REL = new WeakMap();

class IPCSocket extends EventEmitter {
	constructor(socket=null, serverInst=null) {
		super();
		
		socket = socket || new Socket();
		_WEAK_REL.set(this, {
			_parent: serverInst,
			_socket: socket,
			_connected: false,
			_error: null,
			_chunk: Buffer.alloc(0),
			_timeout: UniqueTimeout()
		});
		
		socket
		.on( 'connect', ___HANDLE_CONNECT.bind(this) )
		.on( 'close', ___HANDLE_CLOSE.bind(this) )
		.on( 'error', ___HANDLE_ERROR.bind(this) )
		.on( 'data', ___HANDLE_DATA.bind(this) );
		
		this._serializer = null;
		this._deserializer = null;
	}

	sendUnencoded(data) {
		const {_socket} = _WEAK_REL.get(this);
		if ( this._serializer ) {
			data = this._serializer(data);
		}
		_socket.write(Buffer.from(data));
	}
	sendEncoded(data) {
		const {_socket} = _WEAK_REL.get(this);
		_socket.write(data);
	}
	connect(...args) {
		const {_socket} = _WEAK_REL.get(this);
		return _socket.connect(...args);
	}
	close() {
		const {_socket} = _WEAK_REL.get(this);
		return _socket.end();
	}
	
	get lastError() {
		const {_error} = _WEAK_REL.get(this);
		return _error;
	}
	get connected() {
		const {_connected} = _WEAK_REL.get(this);
		return _connected;
	}
	get connecting() {
		const {_socket} = _WEAK_REL.get(this);
		return _socket.connecting;
	}
	get _socket() {
		const {_socket} = _WEAK_REL.get(this);
		return _socket;
	}
}


export default IPCSocket;

function ___HANDLE_CONNECT() {
	const _PRIVATES = _WEAK_REL.get(this);
	_PRIVATES._connected = true;
	
	this.emit( 'connected', { type:'connected', sender:this });
}
function ___HANDLE_CLOSE(withError) {
	const _PRIVATES = _WEAK_REL.get(this);
	_PRIVATES._connected = false;
	
	let error = withError ? (_PRIVATES._error||null) : null;
	this.emit( 'disconnected', { type:'disconnected', sender:this, error });
	if ( _PRIVATES._parent ) {
		_PRIVATES._parent.emit( 'disconnected', {type:'disconnected', sender:this, error} );
	}
}
function ___HANDLE_ERROR(error) {
	const _PRIVATES = _WEAK_REL.get(this);
	_PRIVATES._connected = false;
	_PRIVATES._error = error;
	
	this.emit( 'error', { type:'error', sender:this, error });
	if ( _PRIVATES._parent ) {
		_PRIVATES._parent.emit( 'error', {type:'error', sender:this, error} );
	}
}
function ___HANDLE_DATA(chunk) {
	const _PRIVATES = _WEAK_REL.get(this);
	_PRIVATES._chunk = Buffer.concat([_PRIVATES._chunk, chunk]);
	_PRIVATES._timeout(___PROCESS_MESSAGE.bind(this), 0, _PRIVATES);
}
function ___PROCESS_MESSAGE(PRIVATES) {
	let repeat = _DATA_PROCESS_LOOP;
	let result = undefined;
	let anchor = 0;
	repeat = 3;
	while ( repeat-- > 0 ) {
		if ( this._deserializer ) {
			result = this._deserializer(PRIVATES._chunk, anchor);
			if ( !result ) {
				break;
			}
			anchor = result.anchor;
			this.emit( 'beson', this, result.value );
			if ( PRIVATES._parent ) {
				PRIVATES._parent.emit( 'beson', this, result.value );
			}
		}
	}

	PRIVATES._chunk = PRIVATES._chunk.slice(anchor);

	// Hook next processing loop if there's still remaining data
	if ( PRIVATES._chunk.length > 0 && result ) {
		PRIVATES._timeout(___PROCESS_MESSAGE.bind(this), 0, PRIVATES);
	}
}

function UniqueTimeout() {
	let _active_timeout = null;

	return (...args)=>{
		if ( _active_timeout ) {
			clearTimeout(_active_timeout);
		}
		
		return _active_timeout = setTimeout(...args);
	};
}

