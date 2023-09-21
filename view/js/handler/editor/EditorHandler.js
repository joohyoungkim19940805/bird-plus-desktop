import FreeWillEditor from "../editor/FreeWillEditor";
import Strong from "../editor/tools/Strong"
import Color from "../editor/tools/Color"
import Background from "../editor/tools/Background"
import Strikethrough from "../editor/tools/Strikethrough"
import Underline from "../editor/tools/Underline"
import FontFamily from "../editor/tools/FontFamily"
import Quote from "../editor/tools/Quote"
import NumericPoint from "../editor/tools/NumericPoint"
import BulletPoint from "../editor/tools/BulletPoint"
import Sort from "../editor/tools/Sort"
import FontSize from "../editor/tools/FontSize"
import Italic from "../editor/tools/Italic"
import Image from "../editor/tools/Image"
import Video from "../editor/tools/Video"
import Code from "../editor/tools/Code"


import workspaceHandler from "../workspace/WorkspaceHandler";
import roomHandler from "../room/RoomHandler";

export default class EditorHandler extends FreeWillEditor{
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
		}
		let option = {
			isDefaultStyle : true
		}
		super(tools, option);

		let toolbar = document.querySelector('#toolbar');
		
		toolbar.append(
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
		);

		super.placeholder = '텍스트를 입력해주세요.'
		if( ! isReadOnly){
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
						console.log(res);
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

}
