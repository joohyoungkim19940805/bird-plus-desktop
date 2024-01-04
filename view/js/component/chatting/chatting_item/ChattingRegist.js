import FreeWillEditor from "@handler/editor/FreeWillEditor";
import FreedomInterface from "@handler/editor/module/FreedomInterface";
import Strong from "@handler/editor/tools/Strong"
import Color from "@handler/editor/tools/Color"
import Background from "@handler/editor/tools/Background"
import Strikethrough from "@handler/editor/tools/Strikethrough"
import Underline from "@handler/editor/tools/Underline"
import FontFamily from "@handler/editor/tools/FontFamily"
import Quote from "@handler/editor/tools/Quote"
import NumericPoint from "@handler/editor/tools/NumericPoint"
import BulletPoint from "@handler/editor/tools/BulletPoint"
import Sort from "@handler/editor/tools/Sort"
import FontSize from "@handler/editor/tools/FontSize"
import Italic from "@handler/editor/tools/Italic"
import Image from "@handler/editor/tools/Image"
import Video from "@handler/editor/tools/Video"
import Resources from "@handler/editor/tools/Resources";
import Code from "@handler/editor/tools/Code"
import Hyperlink from "@handler/editor/tools/Hyperlink"

import {workspaceHandler} from "@handler/workspace/WorkspaceHandler";
import {roomHandler} from "@handler/room/RoomHandler";
import common from "@root/js/common";

import { s3EncryptionUtil } from "@handler/S3EncryptionUtil";

import { accountHandler } from "@handler/account/AccountHandler"

export const chattingRegist = new class ChattingRegist extends FreeWillEditor{
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
		Resources,
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
		
		super.placeholder = 'Enter Your Text Here'
		super.spellcheck = true
		//super.dataset.visibility_not = ''
		this.#addEvent();

	}
	async #addEvent(){

		let toolList = Object.values(ChattingRegist.tools).map(e=>e.toolHandler.toolButton);
		let toolCloneList = toolList.map(e=>{
			let clone = e.cloneNode(true);
			clone.style.color = '#7c7c7c59';
			clone.style.textDecorationColor = '#40404069';
			return clone;
		});
		this.#elementMap.toolbarWrapper.append(...toolCloneList);
		this.onfocus = (event) => {
			this.#elementMap.toolbarWrapper.replaceChildren(...toolList);
		}

		this.onblur = (event) => {
			if( FreedomInterface.isMouseInnerElement(this.#elementMap.toolbarWrapper) && event.relatedTarget?.hasAttribute('data-tool_status') ){
				return;
			}
			this.#elementMap.toolbarWrapper.replaceChildren(...toolCloneList);
		}
		document.addEventListener('selectionchange', event => {
			if(document.activeElement == this || FreedomInterface.isMouseInnerElement(this.#elementMap.toolbarWrapper)){
				return
            }
			this.#elementMap.toolbarWrapper.replaceChildren(...toolCloneList);
		})

		let isEnter = false;
		this.onkeydown = (event) => {
			let {altKey, ctrlKey, shiftKey, key} = event;
			if(key == 'Enter' && (altKey || ctrlKey || shiftKey)){
				event.preventDefault();
				let LineBreakMode;
				if(altKey){
					LineBreakMode = FreeWillEditor.LineBreakMode.NEXT_LINE_FIRST
				}else if(ctrlKey){
					LineBreakMode = FreeWillEditor.LineBreakMode.NEXT_LINE_LAST
				}else{
					LineBreakMode = FreeWillEditor.LineBreakMode.NO_CHANGE
				}
				this.lineBreak(LineBreakMode);
				return;
			}else if(key == 'Enter' && this.innerText.replaceAll('\n', '') != ''){
				event.preventDefault();
				if(isEnter){
					return;
				}
				isEnter = true;
				let promiseList = [];
				//전송 중 채널, 워크스페이스 변경시 변경된 id 값이 들어가므로 변수로 재할당
				let workspaceId = workspaceHandler.workspaceId;
				let roomId = roomHandler.roomId; 
				ChattingRegist.getLowDoseJSON(this, {
					afterCallback : (json) => {
						if(json.tagName != Image.toolHandler.defaultClass && 
							json.tagName != Video.toolHandler.defaultClass &&
							json.tagName != Resources.toolHandler.defaultClass
						){
							return;
						}else if(json.data.hasOwnProperty('is_upload_end')){
							return;
						}
						let node = json.node;
						let file = node.selectedFile;
						json.data.is_loading = '';
						console.log(node, file);
						let fileType;
						if(json.tagName == Image.toolHandler.defaultClass){
							fileType = 'IMAGE';
						}else if(json.tagName == Video.toolHandler.defaultClass){
							fileType = 'VIDEO';
						}else {
							fileType = 'FILE';
						}
						promiseList.push(new Promise(async resolve => {

							let {name, size, lastModified, contentType, newFileName} = await common.underbarNameToCamelName(json.data);
							let putSignData = `${roomId}:${workspaceId}:${name}:${accountHandler.accountInfo.accountName}`;
							let isUpload = await s3EncryptionUtil.callS3PresignedUrl(window.myAPI.s3.generateSecurityPutObjectPresignedUrl, putSignData, {newFileName, fileType, uploadType: 'CHATTING'})
							.then( (result) => {
								if(! result){
									return;
								}
								let {data, encDncKeyPair} = result;

								json.data.new_file_name = data.newFileName;

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
									let res = await s3EncryptionUtil.fetchPutObject(data.presignedUrl, k, m, file.files[0]);
									if( ! (res.status == 200 || res.status == 201) ){
										return;
									}
									return true;
								})
							})
							if( ! isUpload){
								resolve();
								return;
							}
							let getSignData = `${roomId}:${workspaceId}:${json.data.new_file_name}:${accountHandler.accountInfo.accountName}`;
							
							s3EncryptionUtil.callS3PresignedUrl(window.myAPI.s3.generateSecurityGetObjectPresignedUrl, getSignData, {fileType, uploadType: 'CHATTING'})
							.then( (result) => {
								if(! result){
									return;
								}
								let {data, encDncKeyPair} = result;

								json.data.url = data.presignedUrl;
								delete json.data.base64
								json.data.upload_type = 'CHATTING';
								resolve(json);
							})
						}))
					}
				}).then(jsonList => {

					window.myAPI.chatting.sendChatting({
						workspaceId,
						roomId,
						chatting: JSON.stringify(jsonList)
					}).then(res=>{
						let {data} = res
						this.innerText = '';
						isEnter = false;
						Promise.all(promiseList).then((fileTargetList) => {
							console.log(fileTargetList);
							if(fileTargetList.length == 0){
								window.getSelection().setPosition(this, 1)
								return;
							}
							fileTargetList.forEach(e=>{
								delete e.data.is_loading
								e.data.is_upload_end = '';
								e.data.room_id = roomId
								e.data.workspace_id = workspaceId;
							});
							window.myAPI.chatting.sendChatting({
								id: data.id,
								workspaceId,
								roomId,
								chatting: JSON.stringify(jsonList)
							}).then(res=>{
								window.getSelection().setPosition(this, 1)
							});
						})
					});
					
				})
			}
		}
	}

    get element(){
        return this.#element;
    }

}();
