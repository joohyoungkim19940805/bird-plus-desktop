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

import { s3EncryptionUtil } from "@handler/S3EncryptionUtil";

import { accountHandler } from "@handler/account/AccountHandler"

import { roomHandler } from "@handler/room/RoomHandler"

export const FastSendChatting = class FastSendChatting extends FreeWillEditor{
	static{
        window.customElements.define('fast-send-chatting', FastSendChatting);
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

	static beforeSendChattingFindRoomIdCallback = () => { return undefined; }

	static toolbar = Object.assign(document.createElement('div'), {
		className: 'toolbar',
	});

	#workspaceId; set workspaceId(id){this.#workspaceId = id} get workspaceId(){return this.#workspaceId}

    __parentWrapper;


    constructor(parent, workspaceId){
        super(FastSendChatting.tools, FastSendChatting.option);
        this.#workspaceId = workspaceId;
        this.__parentWrapper = parent;

        super.placeholder = '빠른 메시지 보내기'
		
		let toolList = Object.values(FastSendChatting.tools).map(e=>e.toolHandler.toolButton);

		Object.assign(FastSendChatting.toolbar.style, {
			position : 'fixed',
			zIndex : 2000
		});
		document.addEventListener('selectionchange', event => {
			if(document.activeElement.constructor != FastSendChatting){
                return;
            }
            let selection = window.getSelection();
            if (selection.rangeCount == 0){
                return;
            }
			if( ! selection.isCollapsed){
				document.body.append(FastSendChatting.toolbar);
                FastSendChatting.toolbar.replaceChildren(...toolList);
                FreedomInterface.processingElementPosition(FastSendChatting.toolbar, window.getSelection().getRangeAt(0).getBoundingClientRect())
            }else{
                FastSendChatting.toolbar.remove();
            }
		})

		this.onkeydown = async (event) => {
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
				if(! this.workspaceId){
					return;
				}
				let roomId = await FastSendChatting.beforeSendChattingFindRoomIdCallback();
				console.log('roomId', roomId)
				setTimeout(()=>{
					this.#sendChatting(this.workspaceId, roomId);
				}, 500)
			}
		}

    }

	#sendChatting(workspaceId, roomId){
		let promiseList = [];
		FastSendChatting.getLowDoseJSON(this, {
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
				workspaceId : workspaceId,
				roomId : roomId,
				chatting: JSON.stringify(jsonList)
			}).then(res=>{
				let {data} = res
				this.innerText = '';
				Promise.all(promiseList).then((fileTargetList) => {
					//console.log(fileTargetList);
					if(fileTargetList.length == 0){
						window.getSelection().setPosition(this, 1)
						return;
					}
					fileTargetList.forEach(e=>{
						delete e.data.is_loading
						e.data.is_upload_end = '';
						e.data.room_id = roomId
						e.data.workspace_id = this.workspaceId;
					});
					window.myAPI.chatting.sendChatting({
						id: data.id,
						workspaceId: this.workspaceId,
						roomId: roomId,
						chatting: JSON.stringify(jsonList)
					}).then(res=>{
						window.getSelection().setPosition(this, 1)
					});
				})
			});
			
		})
	}
}

export const userSimpleMenu = new class UserSimpleMenu{
	#wrap = Object.assign(document.createElement('div'), {
		className: 'chatting_head_detail_wrapper'
	}); get wrap(){return this.#wrap}
	#jobGrade; set jobGrade(text){this.#jobGrade.textContent = text} get jobGrade(){return this.#jobGrade}
	#department; set department(text){this.#department.textContent = text} get department(){return this.#department}
	#descriptionContainer = (() => {
		let container = Object.assign(document.createElement('div'),{
			className: 'chatting_head_detail_description',
			innerHTML: `
				<div class="chatting_head_detail_job_grade">Job Grade</div>
				<div class="chatting_head_detail_department">Department</div>
			`
		});
		this.#jobGrade = container.querySelector('.chatting_head_detail_job_grade');
		this.#department = container.querySelector('.chatting_head_detail_department');
		return container;
	})();

	#oneToOneWrapper;
	#oneToOneContainer;
	/**
	 * @type {FastSendChatting}
	 */
	#oneToOneFastMessage;
	#oneToOneMoveButton;
	#exile;
	#exileButton;
	#goOut;
	#goOutButton;
	#menuContauner = (() => {
		let container = Object.assign(document.createElement('ul'), {
			className: 'chatting_head_detail_menu',
			innerHTML: `
				<li class="chatting_head_one_to_one_wrapper">
					<details class="chatting_head_one_to_one_container">
						<summary>1:1 대화하기</summary>
					</details>
					<button class="chatting_head_one_to_one_move_room" type="button">대화방으로 이동하기</button>
				</li>
				<li class="chatting_head_exile">
					<button class="chatting_head_exile_button" type="button">추방하기</button>
				</li>
				<li class="chatting_head_go_out">
					<button class="chatting_head_go_out_button" type="button">나가기</button>
				</li>
			`
		})
		this.#oneToOneWrapper = container.querySelector('.chatting_head_one_to_one_wrapper');
		this.#oneToOneContainer = container.querySelector('.chatting_head_one_to_one_container');
		this.#oneToOneFastMessage = new FastSendChatting(this.#oneToOneWrapper, undefined, undefined);
		this.#oneToOneMoveButton = container.querySelector('.chatting_head_one_to_one_move_room');
		this.#oneToOneContainer.append(this.#oneToOneFastMessage);
		
		this.#exile = container.querySelector('.chatting_head_exile');
		this.#exileButton = container.querySelector('.chatting_head_exile_button');
		this.#goOut = container.querySelector('.chatting_head_go_out');
		this.#goOutButton = container.querySelector('.chatting_head_go_out_button');

		return container;
	})()
	
	#roomOwnerMemory = {};

	constructor(){
		this.#oneToOneMoveButton.onclick = () => {
			let targetRoomId = FastSendChatting.beforeSendChattingFindRoomIdCallback();
			if( ! targetRoomId){
				alert('해당 사용자와 연결에 실패하였습니다.');
				return;
			}
		}
	}

	open(workspaceId, roomId, accountName){
		
		this.#menuContauner.append(this.#oneToOneWrapper, this.#exile, this.#goOut);

		// 나 자신인 경우 1:1 대화 메뉴 및 추방하기 메뉴 제거 
		if(accountName == accountHandler.accountInfo.accountName){
			this.#oneToOneWrapper.remove();
			this.#exile.remove();
		}else{
			// 나 자신이 아닌 경우 '나가기' 메뉴 제거
			this.#goOut.remove();
		}

		// 내가 해당 방의 관리자가 아닌 경우 '추방' 메뉴 제거 
		if( ! roomHandler.isOwner){
			this.#exile.remove();
		}
		
		// 나 자신의 방인 경우(self room)
		if(roomHandler.room.roomType == 'SELF'){
			this.#exile.remove();
			this.#goOut.remove();
		}

		this.#oneToOneFastMessage.workspaceId = workspaceId;
		this.#wrap.replaceChildren(
			this.#descriptionContainer,
			this.#menuContauner
		)
		this.#exileButton.onclick = () => {
			
			if( ! window.confirm(`이 기능은 프리뷰입니다. 
			\n이 기능에는 '빠른 1:1 대화하기' 및 '방 생성' 기능에 치명적인 오작동을 일으키는 오류가 발견되어 수정 될 예정입니다. 
			\n이 기능을 이용시, 추후 오작동을 해결하기 위해 개발자가 데이터를 수정 및 삭제 해야 할 수도 있습니다.
			\n정말 이용하시겠습니까?`)) return;

			if( ! window.confirm('정말 추방하시겠습니까?')) return;
			window.myAPI.room.roomInAccountOut({roomId, accountName})
		}
		this.#goOutButton.onclick = () => {
			if( ! window.confirm(`이 기능은 프리뷰입니다. 
			\n이 기능에는 '빠른 1:1 대화하기' 및 '방 생성' 기능에 치명적인 오작동을 일으키는 오류가 발견되어 수정 될 예정입니다. 
			\n이 기능을 이용시, 추후 오작동을 해결하기 위해 개발자가 데이터를 수정 및 삭제 해야 할 수도 있습니다.
			\n정말 이용하시겠습니까?`)) return;

			if( ! window.confirm('정말 나가시겠습니까? \n방에 혼자 남아있는 경우 이 방은 자동으로 삭제됩니다.')) return;
			window.myAPI.room.roomInAccountOut({roomId, accountName})
		}
		document.body.append(this.#wrap);
	}

	close(){
		this.reset();
		this.#wrap.replaceChildren();
		this.#wrap.remove();
	}

	reset(){
		this.jobGrade = '';
		this.department = '';
		FastSendChatting.beforeSendChattingFindRoomIdCallback = () => {return undefined;}
	}
}