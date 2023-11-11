export default new class Common{
	#keyRegx = /[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g;
	
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

	encoder = new TextEncoder();
	decoder = new TextDecoder();

	constructor(){

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

	jsonToSaveElementDataset(data, element){
		if( ! element){
			throw new Error('element is undefined')
		} else if(element.nodeType != Node.ELEMENT_NODE){
			throw new Error(`element is not element node type ::: ${element.nodeType}`);
		}
		return new Promise(resolve=>{
			let underbarKeyNameObject = Object.entries(data).reduce((total, [k,v]) => {
				let key = k.match(this.#keyRegx).map(e=> e.toLowerCase()).join('_');
				total[key] = v;
				return total;
			}, {});
			Object.assign(element.dataset, underbarKeyNameObject);
			resolve(element);
		})
	}
	async underbarNameToCamelName(obj){
		return new Promise(resolve => {
			resolve(Object.entries(obj).reduce((total, [k,v]) => {
				let key = k.split('_').map((e,i)=>{
					if(i == 0){
						return e.charAt(0).toLowerCase() + e.substring(1);
					}
					return e.charAt(0).toUpperCase() + e.substring(1)
				}).join('');
				total[key] = v;
				return total;
			}, {}))
		})
	}
	/**
	 * @returns {Promise<String>}
	 */
	async getProjectPathPromise(){
		return await window.myAPI.getProjectPath().then((data) => {
			return data;
		}).catch(error=>{
			console.error(error);
			return '';
		})
	}

	processingElementPosition(element, target){
		let {x, y, height} = target.getBoundingClientRect();
		
		let elementHeightPx = element.clientHeight;
		let elementTop = (y - elementHeightPx)
		if(elementTop > 0){
			element.style.top = elementTop + 'px';
		}else{
			element.style.top = y + height + 'px';
		}
		element.style.left = x + 'px';
	}

	async convertBase64ToBuffer(base64){
		return fetch(`data:application/octet-binary;base64,${base64}`)
		.then(res=>res.arrayBuffer())
		.then(buffer=>new Uint8Array(buffer))
	}

}