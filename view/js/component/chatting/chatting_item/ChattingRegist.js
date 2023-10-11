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
    #element = Object.assign(document.createElement('div'), {
        id: 'chatting_regist_wrapper',
        innerHTML: `
            <div class="chatting_regist_container" data-bind_name="chattingRegistContainer">
                <div id="toolbar" data-bind_name="toolbarWrapper">
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
	
    constructor({isReadOnly = false} = {}){

		let tools = {
			'free-will-strong' : Strong,
			'free-will-color' : Color,
			'free-will-background' : Background,
			'free-will-strikethrough' : Strikethrough,
			'free-will-underline' : Underline,
			'free-will-font-family' : FontFamily,
			'free-will-font-quote' : Quote,
			'free-will-numeric-point' : NumericPoint,
			'free-will-bullet-point' : BulletPoint,
			'free-will-sort' : Sort,
			'free-will-editor-font-size' : FontSize,
			'free-will-editor-italic' : Italic,
			'free-will-editor-image' : Image,
			'free-will-editor-video' : Video,
			'free-will-editor-code' : Code,
			'free-will-editor-link' : Hyperlink,
		}
		let option = {
			isDefaultStyle : true
		}
		super(tools, option);

		if( ! isReadOnly){
            this.#elementMap.chattingRegistContainer.append(this);

            this.#elementMap.toolbarWrapper.append(
                Strong.toolHandler.toolButton,
                Color.toolHandler.toolButton,
                Background.toolHandler.toolButton,
                Strikethrough.toolHandler.toolButton,
                Underline.toolHandler.toolButton,
                FontFamily.toolHandler.toolButton,
                Quote.toolHandler.toolButton,
                NumericPoint.toolHandler.toolButton,
                BulletPoint.toolHandler.toolButton,
                Sort.toolHandler.toolButton,
                FontSize.toolHandler.toolButton,
                Italic.toolHandler.toolButton,
                Image.toolHandler.toolButton,
                Video.toolHandler.toolButton,
                Code.toolHandler.toolButton,
                Hyperlink.toolHandler.toolButton,
            );
            
            super.placeholder = '텍스트를 입력해주세요.'
			super.spellcheck = true
			this.#addEvent();
		}
	}
	#addEvent(){
		this.onkeydown = (event) => {
			let {altKey, ctrlKey, shiftKey, key} = event;
			if(key == 'Enter' && altKey && this.innerText.replaceAll('\n', '') != ''){
				this.getLowDoseJSON().then(jsonList => {
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
