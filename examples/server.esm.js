import fs from 'fs';
import { Serialize, _Deserialize } from 'beson';

(async()=>{
	"use strict";
	
	const { default: IPCServer } = await import('../ipc-server.esm.js');
	
	const socketPath = './socket';
	if (fs.existsSync(socketPath)) {
		console.log("[Info] Socket file exists.");
		fs.unlinkSync(socketPath);
	}

	const IPCInst = new IPCServer();
	IPCInst._serializer = (input)=>{return Serialize(input);};
	IPCInst._deserializer = (input, anchor)=>{return _Deserialize(input, anchor);};
	
	IPCInst
	.on('connected', (e)=>{
		let client = e.sender;
		client.id = Date.now();
		
		console.log( `Client (${client.id}) has connected!` );
	})
	.on('disconnected', (e)=>{
		let client = e.sender;
		console.log( `Client (${client.id}) has disconnected!` );
	})
	.on('beson', (sender, data)=>{
		console.log('Receiving data: ' + data);
        let result = '[ok] ' + data;
        sender.sendUnencoded(result);
	})
	.listen( socketPath, ()=>{
		console.log( '[Info] Server is listening!' );
	});
})();
