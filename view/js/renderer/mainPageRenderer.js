import FreeWillEditor from "../handler/editor/FreeWillEditor"
import Strong from "../handler/editor/tools/Strong"
import Color from "../handler/editor/tools/Color"
import Background from "../handler/editor/tools/Background"
import Strikethrough from "../handler/editor/tools/Strikethrough"
import Underline from "../handler/editor/tools/Underline"
import FontFamily from "../handler/editor/tools/FontFamily"
import Quote from "../handler/editor/tools/Quote"

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
		);

		super.placeholder = '텍스트를 입력해주세요.'
	}
	
}

window.customElements.define('free-will-editor', Editor, {extends : 'div'});
