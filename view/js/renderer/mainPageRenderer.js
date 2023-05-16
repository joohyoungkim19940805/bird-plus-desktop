import FreeWillEditor from "../../handler/editor/FreeWillEditor"
import Strong from "../handler/editor/tools/Strong"
import Color from "../handler/editor/tools/Color"
import Background from "../handler/editor/tools/Background"
class Editor extends FreeWillEditor{
	constructor(){
		let components = {
			'freedom-line' : FreeWillEditor.Components.Line
		};
		let tools = {
			'free-will-strong' : Strong,
			'free-will-color' : Color,
			'free-will-background' : Background
		}
		super(undefined, tools);
		let wrap = document.createElement('div');
		super.showToolsWrap = wrap;
	}
	
}

window.customElements.define('free-will-editor', Editor, {extends : 'div'});
