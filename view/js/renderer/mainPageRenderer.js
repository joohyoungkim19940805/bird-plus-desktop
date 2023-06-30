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
import Video from "../handler/editor/tools/video"
import Code from "../handler/editor/tools/Code"
class Editor extends FreeWillEditor{
	constructor(){

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

		this.#addEvent();
	}
	#addEvent(){
		this.onkeydown = (event) => {
			let {altKey, ctrlKey, shiftKey, key} = event;
			// key == Enter
			console.log(event);
			if(key == 'Enter' && (altKey || ctrlKey || shiftKey)){
				let line = this.createLine();
			}else if(key == 'Enter'){
				event.preventDefault();
				window.myAPI.regist.sendChatting(this.innerHTML).then(res=>{
					console.log(res);
				})
			}
		}
	}
}

window.customElements.define('free-will-editor', Editor);
