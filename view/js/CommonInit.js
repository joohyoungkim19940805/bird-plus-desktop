
import {roomHandler} from "@handler/room/RoomHandler"

import Image from "@handler/editor/tools/Image"
import Video from "@handler/editor/tools/Video"
import Resources from "@handler/editor/tools/Resources"
import FontSize from "@handler/editor/tools/FontSize"

import { accountHandler } from "@handler/account/AccountHandler"
import { s3EncryptionUtil } from "@handler/S3EncryptionUtil"
import {workspaceHandler} from "@handler/workspace/WorkspaceHandler"
import IndexedDBHandler from "@handler/IndexedDBHandler"

import common from "@root/js/common";

FontSize.unit = 'rem';
FontSize.min = 0.1;
FontSize.max = 5;
FontSize.weight = 0.1;

export default class CommonInit{
	#oneDay = 1000 * 60 * 60 * 24;
	constructor(pageName){
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
			const indexedDBHandler = new IndexedDBHandler({
				dbName: 'fileDB-main-page',
				storeName: `s3Memory-main-page`,
				columnInfo: {
					fileName: ['fileName', 'fileName', {unique : true}],
					originFileName: ['originFileName', 'originFileName'],
					fileData : ['fileData', 'fileData'],
					lastModified: ['lastModified', 'lastModified'],
					uploadType: ['uploadType', 'uploadType'],
					roomId: ['roomId', 'roomId'],
					workspaceId: ['workspaceId', 'workspaceId']
				},
				keyPathNameList: ['fileName'],
				pkAutoIncrement : false
			});
			const dbOpenPromise = indexedDBHandler.open();

			const imageOrVideoCallback = async (targetTools) => {
				if(targetTools.hasAttribute('data-is_loading')){
					let uploadLoading = targetTools.querySelector('[data-upload_loading]');
					if( ! uploadLoading){
						uploadLoading = Object.assign(document.createElement('div'), {
							className: 'upload_loading',
							innerHTML: `
							<div class="upload_loading_container">
								<span>컨텐츠를 업로드 중입니다</span>
								<span class="status_text_elipsis" data-status_text_elipsis></span>
							</div>
							`
						})
						uploadLoading.dataset.upload_loading = '';
					}else{
						uploadLoading.className = 'upload_loading'
						uploadLoading.querySelector('[data-status_text_elipsis]').className = 'upload_loading'; 
					}
					targetTools.append(uploadLoading);
					return;
				}


				let fileType;
				if(targetTools.constructor == Image){
					fileType = 'IMAGE';
				}else if(targetTools.constructor == Video){
					fileType = 'VIDEO';
				}else{
					fileType = 'FILE';
				}
				const isHasRememberFile = await new Promise(resolve => {
					/*if(targetTools.constructor == Resources){
						resolve({result: undefined});
					}*/
					dbOpenPromise.then(() => {
						new Promise(res=>{
							indexedDBHandler.getList({
								pageNum : 1, 
								pageSize : 99999, 
								readOption: 'readwrite', 
								callback: (cursor)=>{
									if(cursor.value.lastModified < new Date().getTime() - this.#oneDay){
										cursor.delete();
									}
								}
							}).then(result=>{
								res();
								/*let deleteTargetList = result.data.filter(e=>{
									let lastModified = parseInt(e.lastModified);
									return lastModified - this.#oneDay <= new Date().getTime() - this.#oneDay;
								}).map(e=>e.fileName);
								indexedDBHandler.deleteList(deleteTargetList).then((deleteResult) => {
									res();
								});*/
							}).catch((err)=>{
								console.error(err)
								res();
							})	
						}).then(() => {
							indexedDBHandler.getItem(targetTools.dataset.new_file_name).then(result=>{
								resolve(result);
							});
						})
					})
				})

				if(isHasRememberFile.result){
					let url = window.URL.createObjectURL(isHasRememberFile.result.fileData, targetTools.dataset.content_type)
					targetTools.dataset.url = url;
					if(targetTools.image){
						targetTools.image.src = url;
					}else if(targetTools.video){
						targetTools.video.src = url;
					}else{
						//targetTools.resources.data = url;
						targetTools.resourcesUrl = url;
					}
					return;
				}

				let startPromise = new Promise(resolve => {

					let {size, rank, rankText} = common.shortenBytes(targetTools.dataset.size);

					if(size >= 10 && rank >= 2){
						let filePreview = targetTools.querySelector('[data-file_preview]');
						if( ! filePreview){
							filePreview = Object.assign(document.createElement('div'), {
								className: 'file_preview',
								innerHTML: `
								<div class="file_preview_container" data-file_preview_container>
									<div>10MB 이상의 파일은 당신의 데이터를 위해 미리보기를 제공하지 않습니다.</div>
									<div>미리보기를 클릭시 기능 제공을 위해 임시 저장소에 저장을 시작하며, 이는 추후 자동 삭제의 대상이 됩니다.</div>
									<div>이 파일의 용량 : ${size}${rankText}</div>
									<button class="file_preview_button" data-file_preview_button type="button">미리보기</button>
								</div>
								`
							});
							filePreview.dataset.file_preview = '';
						}else{
							filePreview.querySelector('[data-file_preview_container]').className = 'file_preview_container'
							filePreview.querySelector('[data-file_preview_button]').className = 'file_preview_button'; 
							filePreview.className = 'file_preview';
						}
						filePreview.style.display = 'none';
						Resources.resourcesCallback = ({status, resources}) => {
							if(status == 'error'){
								filePreview.style.display = '';
							}
						}
						filePreview.onclick = (event) => {
							event.stopPropagation();
						}
						filePreview.dataset.visibility_not = '';

						targetTools.append(filePreview)

						let filePreviewButton = filePreview.querySelector('.file_preview_button');
						//document.body.onclick = (event) =>{ event}
						filePreviewButton.onclick = (event) => {

							event.stopPropagation();
							filePreviewButton.textContent = '';
							filePreviewButton.className = 'loading_rotate';
							resolve(filePreview);
						}
					}else{
						resolve();
					}
				});

				startPromise.then((filePreview) => {
					document.body.closest
					let getSignData = `${roomHandler.roomId}:${workspaceHandler.workspaceId}:${targetTools.dataset.new_file_name}:${targetTools.closest('[data-account_name]')?.dataset.account_name}`
					s3EncryptionUtil.callS3PresignedUrl(window.myAPI.s3.generateSecurityGetObjectPresignedUrl, getSignData, {uploadType : targetTools.dataset.upload_type, fileType})
					.then( (result) => {
						if(! result){
							return;
						}
						let {data, encDncKeyPair} = result;
						let totalLen = 0;
						let size = parseInt(targetTools.dataset.size);
						let progress = Object.assign(document.createElement('progress'), {
							max: 100,
							value : 0
						});
						if(filePreview){
							let container = filePreview.querySelector('.file_preview_container');
							container.append(progress)
						}
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
													totalLen += value?.length || 0;
													progress.value = (totalLen / size) * 100 
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
								let imgUrl = window.URL.createObjectURL(newBlob);
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
										lastModified: new Date().getTime(),
										uploadType: targetTools.dataset.upload_type,
										roomId: roomHandler.roomId,
										workspaceId: workspaceHandler.workspaceId
									}).then(()=>{
										return window.URL.createObjectURL(newBlob)
									})
								})
							})
							.then(url => {
								//targetTools.dataset.url = url;
								if(targetTools.image){
									targetTools.image.src = url;
								}else if(targetTools.video){
									targetTools.video.src = url;
								}else{
									//targetTools.resources.data = url;
									targetTools.resourcesUrl = url;
								}

								if(filePreview){
									filePreview.replaceChildren();
									filePreview.parentElement.removeChild(filePreview);
									filePreview.remove();
								}
							})
							.catch(err=>{
								console.error(err);
								console.error(err.message)
							})
						
						})
					})

				})
				
			}

			Image.customImageCallback = (imageEditor) => imageOrVideoCallback(imageEditor)
			Video.customVideoCallback = (videoEditor) => imageOrVideoCallback(videoEditor)
			Resources.customResourcesCallback = (resourcesEditor) => imageOrVideoCallback(resourcesEditor)
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


	}
}