import FreeWillEditor from "../handler/editor/FreeWillEditor"
import Strong from "../handler/editor/tools/Strong"
import Color from "../handler/editor/tools/Color"
import Background from "../handler/editor/tools/Background"
import Strikethrough from "../handler/editor/tools/Strikethrough"
import FontFamily from "../handler/editor/tools/FontFamily"

class Editor extends FreeWillEditor{
	constructor(){
		let components = {
			'free-will-line' : FreeWillEditor.Components.Line
		};
		let tools = {
			'free-will-strong' : Strong,
			'free-will-color' : Color,
			'free-will-background' : Background,
			'free-will-strikethrough' : Strikethrough,
			'free-will-strikethrough' : FontFamily,
		}
		super(undefined, tools);

		let toolbar = document.querySelector('#toolbar');
		
		toolbar.append(
			Strong.toolHandler.toolButton,
			Color.toolHandler.toolButton,
			Background.toolHandler.toolButton,
			Strikethrough.toolHandler.toolButton,
			FontFamily.toolHandler.toolButton,
		);
		super.placeholder = '텍스트를 입력해주세요.'
	}
	
}

window.customElements.define('free-will-editor', Editor, {extends : 'div'});
