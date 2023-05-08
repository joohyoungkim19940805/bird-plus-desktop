import FreedomPlusEditor from "../handler/editor/FreedomPlusEditor"
import {Bold, Color}from "../handler/editor/module/Tools"
class Editor extends FreedomPlusEditor{
	constructor(){
		let components = {
			'freedom-line' : FreedomPlusEditor.Components.Line
		};
		let tools = {
			'freedom-bold' : Bold,
			'freedom-color' : Color
		}
		super(undefined, tools);
		let wrap = document.createElement('div');
		super.showToolsWrap = wrap;
	}
	
}

window.customElements.define('freedom-editor-plus', Editor, {extends : 'div'});
