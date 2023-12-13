
export const s3EncryptionUtil = new class S3EncryptionUtil{

	encoder = new TextEncoder();
	decoder = new TextDecoder();

	signAlgorithm = {
		name: "RSASSA-PKCS1-v1_5",
		// Consider using a 4096-bit key for systems that require long-term security
		modulusLength: 2048,
		publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
		hash: "SHA-256",
	}

	secretAlgorithm = {
		name: "RSA-OAEP",
		modulusLength: 2048,
		publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
		hash: "SHA-256",
	}

	async generateKeyPair(algorithm, keyUsages){
		return window.crypto.subtle.generateKey(
			algorithm,
			true,
			keyUsages//["sign", "verify"]
		);
	}

	async keySign(data, privateKey){
		let message = this.encoder.encode(data);
		return window.crypto.subtle.sign(this.signAlgorithm.name, privateKey, message).then(signature=>{
			return {message, signature};
		})
	}

	async decryptMessage(privateKey, ciphertext, algorithm) {
		return window.crypto.subtle.decrypt(
			{ name: algorithm.name },
			privateKey,
			ciphertext,
		).catch(err=>{
			console.error(err.message);
			console.error(err.stack);
		});
	}

	
	async convertBase64ToBuffer(base64){
		return fetch(`data:application/octet-binary;base64,${base64}`)
		.then(res=>res.arrayBuffer())
		.then(buffer=>new Uint8Array(buffer))
	}

	async exportKey(exportType, key){
		return window.crypto.subtle.exportKey(exportType, key).then(exportKey => {
			return new Promise( resolve => resolve(String.fromCharCode(...new Uint8Array(exportKey))) );
		}).then(exportKeyString => {
			return new Promise( resolve => resolve(window.btoa(exportKeyString)) );
		});
	}
	async callS3PresignedUrl(callFunction, signData, callFunctionParam = {} ){//,fileName, accountName){
		console.log('callFunctionParam !!! ',callFunctionParam);
		return Promise.all( [this.generateKeyPair(this.signAlgorithm, ["sign", "verify"]), this.generateKeyPair(this.secretAlgorithm, ["encrypt", "decrypt"])] )
		.then( ([signKeyPair, encDncKeyPair]) => {
			return Promise.all( [
				this.exportKey('spki', signKeyPair.publicKey),
				this.exportKey('spki', encDncKeyPair.publicKey), 
				Promise.resolve(encDncKeyPair), 
				Promise.resolve(signKeyPair)
			] )		
		}).then( async ([exportSignKey, exportEncKey, encDncKeyPair, signKeyPair]) => {

			let sign = await this.keySign(
				`${signData}:${exportEncKey}`, 
				signKeyPair.privateKey
			)
			
			let result = await callFunction(Object.assign(callFunctionParam, {
				data: window.btoa(String.fromCodePoint(...sign.message)), 
				dataKey: exportSignKey, 
				sign: window.btoa( String.fromCodePoint(...new Uint8Array(sign.signature)) ), 
			}))

			let {code, data} = result;
			
			if(code != 0){
				return ;
			}
			
			return {data, encDncKeyPair};
		})
	}

	async fetchPutObject(putUrl, key, md5, fileData){
		return fetch(putUrl, {
			method:"PUT",
			headers: {
				'Content-Encoding' : 'base64',
				'Content-Type' : 'application/octet-stream',
				'x-amz-server-side-encryption-customer-algorithm': 'AES256',
				'x-amz-server-side-encryption-customer-key': key,
				'x-amz-server-side-encryption-customer-key-md5': md5,
			},
			body: fileData
		})
	}
}