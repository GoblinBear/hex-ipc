import { Serialize, _Deserialize } from 'beson';

(async()=>{
	"use strict";

	const { default: IPCClient }  = await import('../ipc-client.esm.js');
	const clientInst = new IPCClient();

	clientInst._serializer = (input)=>{return Serialize(input);};
	clientInst._deserializer = (input, anchor)=>{return _Deserialize(input, anchor);};
	
	clientInst
	.on( 'connected', (e)=>{
		console.log( "Connected to server!" );
	})
	.on( 'disconnected', (e)=>{
		console.log( `Disconnected from server!` );
	})
	.on( 'error', (e)=>{
		console.log( `Error!` );
	})
	.on( 'data', (e, data)=>{
		console.log( `Receiving data from server` );
	})
	.on( 'beson', (e, data)=>{
		console.log( `Receiving data from server` );
		console.log('data =', data);
	})
	.on( 'server-unencoded', (data)=>{
		clientInst.sendUnencoded(data);
	})
	.on( 'server-encoded', (data)=>{
		clientInst.sendEncoded(data);
	})
	.connect('./socket', function() {
		console.log('Connected to server! (socket)');
	});

	let buf1 = clientInst._serializer('Hello');
	let buf2 = clientInst._serializer('world');
	let buf = Buffer.alloc(0);
	buf = Buffer.concat([buf, Buffer.from(buf1), Buffer.from(buf2)]);
	
	let obj = {
		a: 'aaaa',
		b: 'bbb',
		c: 123,
		d: {
			i: 'iii',
			j: 852
		}
	};
	
	clientInst.emit( 'server-unencoded', obj );
	for (let i = 0; i < 2; i++) {
		clientInst.emit( 'server-unencoded', 'qwertyuiop' + i.toString() );
	}
	clientInst.emit( 'server-encoded', buf );
})();

