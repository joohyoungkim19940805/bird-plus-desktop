import FreeWillEditor from "../handler/editor/FreeWillEditor"
import Strong from "../handler/editor/tools/Strong"
import Color from "../handler/editor/tools/Color"
import Background from "../handler/editor/tools/Background"
import Strikethrough from "../handler/editor/tools/Strikethrough"
import Underline from "../handler/editor/tools/Underline"
import FontFamily from "../handler/editor/tools/FontFamily"
import Quote from "../handler/editor/tools/Quote"
import NumericPoint from "../handler/editor/tools/NumericPoint"
import BulletPoint from "../handler/editor/tools/BulletPoint"
import Sort from "../handler/editor/tools/Sort"
import FontSize from "../handler/editor/tools/FontSize"
import Italic from "../handler/editor/tools/Italic"
import Image from "../handler/editor/tools/Image"
import Video from "../handler/editor/tools/Video"
import Code from "../handler/editor/tools/Code"

import RoomContainer from "../component/room/RoomContainer"

window.addEventListener("DOMContentLoaded", (event) => {
	let workspaceIdResolve;
	let workspaceIdPromise = new Promise(resolve=>{
		workspaceIdResolve = resolve;
	})
	window.myAPI.workspace.getWorkspaceId().then(workspaceId=>{
		console.log('workspaceId', workspaceId)
		if(workspaceId != undefined){
			workspaceIdResolve(workspaceId);
		}
		window.myAPI.event.electronEventTrigger.addElectronEventListener('workspaceChange', event => {
			console.log('test event', event);
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
		const roomContainer = new RoomContainer(
			document.querySelector('.rooms_wrapper .content_wrapper'),
			workspaceId
		)
	})

});

// 채팅 셋팅
window.myAPI.chatting.chattingReady();
const chattingLine = document.querySelector('#chatting_read_only');
window.myAPI.event.electronEventTrigger.addElectronEventListener('chattingAccept', event => {

	let {data, lastEventId, origin, type} = event;
	let {accountId, accountName, chatting, createAt, createBy, id, roomId, updateAt, updateBy} = JSON.parse(data);
	/**
	 * 
	data:"{\"id\":null,\"accountId\":null,\"accountName\":\"test\",\"roomId\":null,\"chatting\":\"[{\\\"type\\\":1,\\\"name\\\":\\\"Line\\\",\\\"data\\\":{},\\\"cursor_offset\\\":\\\"10\\\",\\\"cursor_type\\\":\\\"3\\\",\\\"cursor_index\\\":\\\"0\\\",\\\"cursor_scroll_x\\\":null,\\\"cursor_scroll_y\\\":\\\"0\\\",\\\"childs\\\":[{\\\"type\\\":3,\\\"name\\\":\\\"Text\\\",\\\"text\\\":\\\"qweasdxzxc\\\"}]}]\",\"createAt\":null,\"createBy\":null,\"updatedAt\":null,\"updatedBy\":null}"
	lastEventId: ""
	origin: "http://localhost:8079"
	type: "message"
	 */
	let wrap = Object.assign(document.createElement('div'),{

	});

	let content = new Editor({isReadOnly : true});
	content.contentEditable = false;
	content.parseLowDoseJSON(chatting);

	wrap.append(content);
	chattingLine.append(wrap);
});

// 에디터 셋팅
class Editor extends FreeWillEditor{
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
		super(undefined, tools);

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
		this.onkeyup = (event) => {
			let {altKey, ctrlKey, shiftKey, key} = event;
			// key == Enter
			console.log(event);
			if(key == 'Enter' && (altKey || ctrlKey || shiftKey)){
				// let line = this.createLine();
				// window.getSelection().getRangeAt(0).insertNode(document.createTextNode('\n'));
			}else if(key == 'Enter'){
				event.preventDefault();
				/*
				let test = this.getLowDoseJSON();
				let test2 = JSON.stringify(test);
				console.log('test<<< ' , test);
				console.log('test2<<< ', test2);
				*/
				window.myAPI.chatting.sendChatting(this.getLowDoseJSON()).then(res=>{
					console.log(res);
				})
			}
		}
	}
}
window.customElements.define('free-will-editor', Editor);
