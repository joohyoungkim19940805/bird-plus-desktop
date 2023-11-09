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
	#addEvent(){
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
						promiseList.push(new Promise(resolve => {
							let {name, base64, size, last_modified, content_type} = json.data;
							window.myAPI.testImage({
								name, base64, size, last_modified, content_type
							}).then(async result => {
								console.log('result!!!',result);
								let {code, data} = result;
								if(code == 0){
									console.log(data);
									fetch(data, {
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
									}).then(res=>{
										if( ! (res.status == 200 || res.status == 201) ){
											throw new Error('fail');
										} 
										resolve(data);
									})
								}
							})
						}))
					}
				}).then(jsonList => {
					console.log(jsonList);
					new Promise(resolve => {
						jsonList.flatMap(e=> e.child)
					})
					window.myAPI.chatting.sendChatting({
						workspaceId: workspaceHandler.workspaceId,
						roomId: roomHandler.roomId,
						chatting: JSON.stringify(jsonList)
					}).then(res=>{
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

    get element(){
        return this.#element;
    }

}();
