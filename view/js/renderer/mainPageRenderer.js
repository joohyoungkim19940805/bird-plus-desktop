import roomContainer from "./../component/room/RoomContainer"
import chattingContainer from "./../component/chatting/ChattingContainer"
import noticeBoardContainer from "../component/notice_board/NoticeBoardContainer"

import roomHandler from "../handler/room/RoomHandler"
import chattingHandler from "../handler/chatting/ChattingHandler"

import Image from "../handler/editor/tools/Image"
import Video from "../handler/editor/tools/Video"

import { accountHandler } from "../handler/account/AccountHandler"
import { s3EncryptionUtil } from "../handler/S3EncryptionUtil"
import workspaceHandler from "../handler/workspace/WorkspaceHandler"
import IndexedDBHandler from "../handler/IndexedDBHandler"

import HeaderDefault from "../component/header/HeaderDefault"

window.customElements.define('header-default', HeaderDefault);

/*
indexedDBHandler.open().then(()=>{
	indexedDBHandler.addItem({
		fileName:'test',
		lastModified:'1111',
		targetId: '1',
		uploadType: 'abcd'
	});
})
*/
window.addEventListener('load', async () => {

	let accountInfo = (await accountHandler.accountInfo);
	
	const indexedDBHandler = new IndexedDBHandler({
		dbName: 'fileDB',
		storeName: `s3Memory`,
		columnInfo: {
			fileName: ['fileName', 'fileName', {unique : true}],
			originFileName: ['originFileName', 'originFileName'],
			fileData : ['fileData', 'fileData'],
			lastModified: ['lastModified', 'lastModified'],
			targetId: ['targetId', 'targetId'],
			uploadType: ['uploadType', 'uploadType'],
			roomId: ['roomId', 'roomId'],
			workspaceId: ['workspaceId', 'workspaceId']
		},
		keyPathNameList: ['fileName'],
		pkAutoIncrement : false
	});

	const dbOpenPromise = indexedDBHandler.open();

	const imageOrVideoCallback = async (targetTools) => {
		const isHasRememberFile = await new Promise(resolve => {
			dbOpenPromise.then(() => {
				indexedDBHandler.getItem(targetTools.dataset.new_file_name).then(result=>{
					resolve(result);
				});
			})
		})
		if(isHasRememberFile.result){
			let url = URL.createObjectURL(isHasRememberFile.result.fileData, targetTools.dataset.content_type)
			targetTools.dataset.url = url;
			if(targetTools.image){
				targetTools.image.src = url;
			}else{
				targetTools.video.src = url;
			}
			return;
		}

		let getSignData = `${roomHandler.roomId}:${workspaceHandler.workspaceId}:${targetTools.dataset.new_file_name}:${accountInfo.accountName}`
		s3EncryptionUtil.callS3PresignedUrl(window.myAPI.s3.generateGetObjectPresignedUrl, getSignData, targetTools.dataset.upload_type)
		.then( (result) => {
			if(! result){
				return;
			}
			let {data, encDncKeyPair} = result;
			return Promise.all([
				s3EncryptionUtil.convertBase64ToBuffer(data.encryptionKey).then( async (buffer) => {
					return s3EncryptionUtil.decryptMessage(encDncKeyPair.privateKey, buffer, s3EncryptionUtil.secretAlgorithm)
						.then(buf=>String.fromCharCode(...new Uint8Array(buf)))
				}),
				s3EncryptionUtil.convertBase64ToBuffer(data.encryptionMd).then( async (buffer) => {
					return s3EncryptionUtil.decryptMessage(encDncKeyPair.privateKey, buffer, s3EncryptionUtil.secretAlgorithm)
						.then(buf=>String.fromCharCode(...new Uint8Array(buf)))
				})
			]).then( async ([k,m]) => {
				return fetch(data.presignedUrl, {
					method:"GET",
					headers: {
						'Content-Encoding' : 'base64',
						'Content-Type' : 'application/octet-stream',
						'x-amz-server-side-encryption-customer-algorithm': 'AES256',
						'x-amz-server-side-encryption-customer-key': k,
						'x-amz-server-side-encryption-customer-key-md5': m,
					}
				}).then(async response=> {
					if(response.status != 200 && response.status != 201){
						throw new Error('s3 connect failed')
					}
					return response.body;
				}).then((body) => {
					const reader = body.getReader();
					return new ReadableStream(
						{
							start(controller) {
								return pump();
								function pump() {
									return reader.read().then(({ done, value }) => {
										// When no more data needs to be consumed, close the stream
										if (done) {
											controller.close();
											return;
										}
										// Enqueue the next data chunk into our target stream
										controller.enqueue(value);
										return pump();
									});
								}
							},
						}
					);
					/*
					let newBlob = new Blob([buffer], { type: imageEditor.dataset.content_type });
					let imgUrl = URL.createObjectURL(newBlob);
					*/
				})
				.then(stream => new Response(stream))
				.then(res => res.blob())
				.then(async blob => {
					let newBlob = new Blob([blob], { type: targetTools.dataset.content_type });
					return dbOpenPromise.then( async () => {
						return indexedDBHandler.addItem({
							fileName: targetTools.dataset.new_file_name,
							originFileName: targetTools.dataset.name,
							fileData: newBlob,
							lastModified: targetTools.dataset.last_modified,
							targetId: targetTools.dataset.target_id,
							uploadType: targetTools.dataset.upload_type,
							roomId: roomHandler.roomId,
							workspaceId: workspaceHandler.workspaceId
						}).then(()=>{
							return URL.createObjectURL(newBlob)
						})
					})
					
				})
				.then(url => {
					targetTools.dataset.url = url;
					if(targetTools.image){
						targetTools.image.src = url;
					}else{
						targetTools.video.src = url;
					}
				})
				.catch(err=>{
					console.error(err);
				})
			
			})
		})
	}

	Image.customImageCallback = (imageEditor) => imageOrVideoCallback(imageEditor)
	Video.customVideoCallback = (videoEditor) => imageOrVideoCallback(videoEditor)
});	

const visibleObserver = new IntersectionObserver((entries, observer) => {
	entries.forEach(entry =>{
		let {isIntersecting, target} = entry;
		if(target.hasAttribute('slot') || target.hasAttribute('data-visibility_not')){
			return;
		}
		if (isIntersecting){
			target.style.visibility = '';
			target.style.opacity = '';
			target.dataset.visibility = 'v';
		}else{
			target.style.visibility = 'hidden';
			target.style.opacity = 0;
			target.dataset.visibility = 'h';
		}
	})
}, {
	threshold: 0.01,
	root: document
});
new MutationObserver( (mutationList, observer) => {
	mutationList.forEach((mutation) => {
		let {addedNodes, removedNodes} = mutation;
		new Promise(resolve=> {
			addedNodes.forEach(async e => {
				if(e.nodeType !== Node.ELEMENT_NODE || (e.nodeType === Node.ELEMENT_NODE && e.hasAttribute('data-is_not_visible_target')) || e.isContentEditable){
					return;
				}
				new Promise(res=>{
					visibleObserver.observe(e);
					res();
				})
			})
			resolve();
		})
		new Promise(resolve=> {
			removedNodes.forEach(async e => {
				if(e.nodeType !== Node.ELEMENT_NODE || (e.nodeType === Node.ELEMENT_NODE && e.hasAttribute('data-is_not_visible_target')) || e.isContentEditable){
					return;
				}
				new Promise(res=>{
					visibleObserver.unobserve(e);
					res();
				})
			})
			resolve();
		})
	})
}).observe(document, {
	childList: true,
	subtree: true
})

window.addEventListener("DOMContentLoaded", (event) => {

	document.body.classList.add('default')
	let workspaceIdResolve;
	let workspaceIdPromise = new Promise(resolve=>{
		workspaceIdResolve = resolve;
	})
	window.myAPI.workspace.getWorkspaceId().then(workspaceId=>{
		if(workspaceId != undefined){
			workspaceIdResolve(workspaceId);
		}
		window.myAPI.event.electronEventTrigger.addElectronEventListener('workspaceChange', event => {
			let newWorkspaceId = event.workspaceId
			if(workspaceId == newWorkspaceId){
				return;
			}
			if(newWorkspaceId != undefined){
				workspaceIdResolve(newWorkspaceId)
			}
			//event.workspaceId
		})
	})
	workspaceIdPromise.then(workspaceId => {
		document.querySelector('#main').append(
			noticeBoardContainer.wrap,
			roomContainer.wrap,
			chattingContainer.wrap
		)
		workspaceHandler.addWorkspaceIdChangedListener = {
			name: 'mainPageRenderer',
			callBack : () => {
				window.myAPI.room.createMySelfRoom({workspaceId}).then(result => { 
					// 방에 접속하면 자기 자신의 방을 무조건 생성하는 리퀘스트를 날린다.(어차피 서버에서 체크)
					if(result.code == 0){
						roomHandler.roomId = result.data.id;
					}
				})
			},
			runTheFirst: true
		}
		
		window.myAPI.stream.initWorkspaceStream({workspaceId});
	})
});
