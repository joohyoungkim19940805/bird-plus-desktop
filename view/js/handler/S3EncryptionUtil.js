
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
		return window.crypto.subtle.exportKey(exportType, signKeyPair.publicKey).then(exportKey => {
			return new Promise( resolve => resolve(String.fromCharCode(...new Uint8Array(exportKey))) );
		}).then(exportKeyString => {
			return new Promise( resolve => resolve(window.btoa(exportKeyString)) );
		});
	}
}