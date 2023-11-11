import FreeWillEditor from "./../../../handler/editor/FreeWillEditor";
import Strong from "./../../../handler/editor/tools/Strong"
import Color from "./../../../handler/editor/tools/Color"
import Background from "./../../../handler/editor/tools/Background"
import Strikethrough from "./../../../handler/editor/tools/Strikethrough"
import Underline from "./../../../handler/editor/tools/Underline"
import FontFamily from "./../../../handler/editor/tools/FontFamily"
import Quote from "./../../../handler/editor/tools/Quote"
import NumericPoint from "./../../../handler/editor/tools/NumericPoint"
import BulletPoint from "./../../../handler/editor/tools/BulletPoint"
import Sort from "./../../../handler/editor/tools/Sort"
import FontSize from "./../../../handler/editor/tools/FontSize"
import Italic from "./../../../handler/editor/tools/Italic"
import Image from "./../../../handler/editor/tools/Image"
import Video from "./../../../handler/editor/tools/Video"
import Code from "./../../../handler/editor/tools/Code"
import Hyperlink from "./../../../handler/editor/tools/Hyperlink"

import workspaceHandler from "./../../../handler/workspace/WorkspaceHandler";
import roomHandler from "./../../../handler/room/RoomHandler";
import common from "../../../common";

export default new class ChattingRegist extends FreeWillEditor{
    static{
        window.customElements.define('free-will-editor', ChattingRegist);
    }
	static tools = [
        Strong,
        Color,
        Background,
        Strikethrough,
        Underline,
        FontFamily,
        Quote,
        NumericPoint,
        BulletPoint,
        Sort,
        FontSize,
        Italic,
        Image,
        Video,
        Code,
        Hyperlink,
    ]

    static option = {
        isDefaultStyle : true
    }

    #element = Object.assign(document.createElement('div'), {
        id: 'chatting_regist_wrapper',
        innerHTML: `
            <div class="chatting_regist_container" data-bind_name="chattingRegistContainer">
                <div class="toolbar" data-bind_name="toolbarWrapper">
                </div>
            </div>
        `
    })

    #elementMap = (()=>{
        return [...this.#element.querySelectorAll('[data-bind_name]')].reduce((total, element) => {
            total[element.dataset.bind_name] = element;
            return total;
        }, {})
    })();
	
    constructor(){

		super(ChattingRegist.tools, ChattingRegist.option);

		this.#elementMap.chattingRegistContainer.append(this);
		
		let toolList = Object.values(ChattingRegist.tools).map(e=>e.toolHandler.toolButton);
		let toolCloneList = toolList.map(e=>{
			let clone = e.cloneNode(true);
			clone.style.color = '#7c7c7c59';
			clone.style.textDecorationColor = '#40404069';
			return clone;
		});
		this.#elementMap.toolbarWrapper.append(...toolList);
		this.onfocus = (event) => {
			this.#elementMap.toolbarWrapper.replaceChildren(...toolList);
		}

		this.onblur = (event) => {
			if(event.relatedTarget?.hasAttribute('data-tool_status')){
				return;
			}
			this.#elementMap.toolbarWrapper.replaceChildren(...toolCloneList);
		}
		
		super.placeholder = '텍스트를 입력해주세요.'
		super.spellcheck = true
		//super.dataset.visibility_not = ''
		this.#addEvent();

	}
	async #addEvent(){
		let accountInfo = (await window.myAPI.account.getAccountInfo()).data;
		console.log(accountInfo);
		this.onkeydown = (event) => {
			let {altKey, ctrlKey, shiftKey, key} = event;
			console.log(event);
			if(key == 'Enter' && (altKey || ctrlKey || shiftKey)){
				return;
			}else if(key == 'Enter' && this.innerText.replaceAll('\n', '') != ''){
				event.preventDefault();
				let promiseList = [];
				this.getLowDoseJSON(this, {
					afterCallback : (json) => {
						if(json.tagName != Image.toolHandler.defaultClass){
							return;
						}
						promiseList.push(new Promise(async resolve => {

							let {name, size, lastModified, contentType} = await common.underbarNameToCamelName(json.data);

							Promise.all( [common.generateKeyPair(common.signAlgorithm, ["sign", "verify"]), common.generateKeyPair(common.secretAlgorithm, ["encrypt", "decrypt"])] )
							.then( ([signKeyPair, encDncKeyPair]) => {
								let exportSignKeyPromise = window.crypto.subtle.exportKey('spki', signKeyPair.publicKey).then(exportKey => {
									return new Promise( resolve => resolve(String.fromCharCode(...new Uint8Array(exportKey))) );
								}).then(exportKeyString => {
									return new Promise( resolve => resolve(window.btoa(exportKeyString)) );
								});

								let exportEncKeyPromise = window.crypto.subtle.exportKey('spki', encDncKeyPair.publicKey).then(exportKey => {
									return new Promise( resolve => resolve(String.fromCharCode(...new Uint8Array(exportKey))) );
								}).then(exportKeyString => {
									return new Promise( resolve => resolve(window.btoa(exportKeyString)) );
								});
								return Promise.all( [exportSignKeyPromise, exportEncKeyPromise, Promise.resolve(encDncKeyPair), Promise.resolve(signKeyPair)] )		
							}).then( async ([exportSignKey, exportEncKey, encDncKeyPair, signKeyPair]) => {

								let signData = await common.keySign(`${roomHandler.roomId},${workspaceHandler.workspaceId},${name},${accountInfo.accountName},${exportEncKey}}`, signKeyPair.privateKey)
								
								let result = await window.myAPI.s3.generatePutObjectPresignedUrl({
									data: window.btoa(String.fromCodePoint(...signData.message)), dataKey: exportSignKey, sign: window.btoa( String.fromCodePoint(...new Uint8Array(signData.signature)) ), uploadType: 'CHATTING'
								})
								let {code, data} = result;
								
								if(code != 0){
									return ;
								}
								
								Promise.all([
									common.convertBase64ToBuffer(data.encryptionKey).then((buffer) => {
										return common.decryptMessage(encDncKeyPair.privateKey, buffer, common.secretAlgorithm).then(buf=>String.fromCharCode(...new Uint8Array(buf)))
									}),
									common.convertBase64ToBuffer(data.encryptionMd).then((buffer) => {
										return common.decryptMessage(encDncKeyPair.privateKey, buffer, common.secretAlgorithm).then(buf=>String.fromCharCode(...new Uint8Array(buf)))
									})
								]).then( async ([k,m]) => {
									let res = await this.fetchPutObject(data.presignedUrl,k,m, json.data.base64);

									if( ! (res.status == 200 || res.status == 201) ){
										return;
									}
								})

								resolve();
							})
							/*
							console.log('result!!!',result);
							
							let {code, data : putUrl} = result;

							if(code != 0) {
								resolve();
								return;
							}

							console.log(putUrl);
							
							let res = await this.fetchPutObject(putUrl);

							if( ! (res.status == 200 || res.status == 201) ){
								resolve();
								return;
							}
							
							window.myAPI.s3.generateGetObjectPresignedUrl({
								name, base64, size, lastModified, contentType
							}).then(async result => {
								console.log('result!!!',result);
								let {code, data : getUrl} = result;

								if(code != 0) {
									resolve();
									return;
								}

								fetch(getUrl, {
									method: "GET",
									headers: {
										'Content-Type' : contentType,
										'x-amz-server-side-encryption-customer-algorithm': 'AES256',
										'x-amz-server-side-encryption-customer-key': 'zCl8fl7i8t8q4IVZpQTp5QkIwR+S1RH2m3lpgnaMI+g=',
										'x-amz-server-side-encryption-customer-key-md5': 'WPgosOwwFY/pIMDVwcxnpg==',
									},
								}).then(async res=>{
									console.log('res', res);
									res.headers.forEach((e, i)=>{
										console.log('headers ::: ' + i + ' ', e);
									})
									return res.arrayBuffer()
								}).then(buffer =>{

									let newBlob = new Blob([buffer], { type: contentType });
									console.log(newBlob);
									console.log(typeof newBlob);
										
									let imgUrl = URL.createObjectURL(newBlob);

									console.log('imgUrl', imgUrl);
									let img = document.createElement('img');
									img.id = 'test_img';
									img.src = imgUrl;
									document.body.append(img);
									json.url = getUrl
									resolve(getUrl);
								})
							})
							*/
						}))
					}
				}).then(jsonList => {
					console.log('befoer ::: ', jsonList);
					window.myAPI.chatting.sendChatting({
						workspaceId: workspaceHandler.workspaceId,
						roomId: roomHandler.roomId,
						chatting: JSON.stringify(jsonList)
					}).then(res=>{
						console.log(res);
						let {data} = res
						console.log(data);
						console.log('after ::: ', jsonList);
						/*
						window.myAPI.chatting.sendChatting({
							id : data.id,
							workspaceId: workspaceHandler.workspaceId,
							roomId: roomHandler.roomId,
							chatting: JSON.stringify(jsonList)
						});
						*/
						this.innerText = '';
					});
				})

			}
		}
	}

	#chattingLineBreak(){
		if(document.activeElement != this){
			return;
		}
		let range = window.getSelection().getRangeAt(0)

		//collapsed == false = 범위 선택 x
	}
	async fetchPutObject(putUrl, key, md5, fildBase64){
		return fetch(putUrl, {
			method:"PUT",
			headers: {
				'Content-Encoding' : 'base64',
				'Content-Type' : 'application/octet-stream',
				'x-amz-server-side-encryption-customer-algorithm': 'AES256',
				'x-amz-server-side-encryption-customer-key': key,
				'x-amz-server-side-encryption-customer-key-md5': md5,
			},
			body: {data:await fetch(fildBase64).then(async res=>res.blob())}
		})
	}

    get element(){
        return this.#element;
    }

}();

/*
afterCallback : (json) => {
						if(json.tagName != Image.toolHandler.defaultClass){
							return;
						}
						promiseList.push(new Promise(async resolve => {
							let {name, base64, size, lastModified, contentType} = await common.underbarNameToCamelName(json.data);
							let result = await window.myAPI.s3.generatePutObjectPresignedUrlForSSE_C({
								name, base64, size, lastModified, contentType
							})
							console.log('result!!!',result);
							let {code, data : putUrl} = result;

							if(code != 0) {
								resolve();
								return;
							}

							console.log(putUrl);
							
							let res = await fetch(putUrl, {
								method:"PUT",
								headers: {
									'Content-Encoding' : 'base64',
									//'Content-Type': content_type,
									'Content-Type' : 'application/octet-stream',
									'x-amz-server-side-encryption-customer-algorithm': 'AES256',
									'x-amz-server-side-encryption-customer-key': 'zCl8fl7i8t8q4IVZpQTp5QkIwR+S1RH2m3lpgnaMI+g=',
									'x-amz-server-side-encryption-customer-key-md5': 'WPgosOwwFY/pIMDVwcxnpg==',
								},
								body: {data:await fetch(base64).then(async res=>res.blob())}
							})

							if( ! (res.status == 200 || res.status == 201) ){
								resolve();
							}
							
							window.myAPI.s3.generateGetObjectPresignedUrlForSSE_C({
								name, base64, size, lastModified, contentType
							}).then(async result => {
								console.log('result!!!',result);
								let {code, data : getUrl} = result;

								if(code != 0) {
									resolve();
									return;
								}

								fetch(getUrl, {
									method: "GET",
									headers: {
										'Content-Type' : contentType,
										'x-amz-server-side-encryption-customer-algorithm': 'AES256',
										'x-amz-server-side-encryption-customer-key': 'zCl8fl7i8t8q4IVZpQTp5QkIwR+S1RH2m3lpgnaMI+g=',
										'x-amz-server-side-encryption-customer-key-md5': 'WPgosOwwFY/pIMDVwcxnpg==',
									},
								}).then(async res=>{
									console.log('res', res);
									res.headers.forEach((e, i)=>{
										console.log('headers ::: ' + i + ' ', e);
									})
									return res.arrayBuffer()
								}).then(buffer =>{

									let newBlob = new Blob([buffer], { type: contentType });
									console.log(newBlob);
									console.log(typeof newBlob);
										
									let imgUrl = URL.createObjectURL(newBlob);

									console.log('imgUrl', imgUrl);
									let img = document.createElement('img');
									img.id = 'test_img';
									img.src = imgUrl;
									document.body.append(img);
									json.url = getUrl
									resolve(getUrl);
								})
							})

						}))
					}
*/