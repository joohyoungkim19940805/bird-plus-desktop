import FreedomPlusEditor from "../handler/editor/FreedomPlusEditor"

class Editor extends FreedomPlusEditor{
	constructor(){
		let components = {
			'freedom-line' : FreedomPlusEditor.Components.Line
		};
		let tools = {
			'freedom-bold' : FreedomPlusEditor.Tools.Bold
		}
		super(components, tools);
		let wrap = document.createElement('div');
		super.showToolsWrap = wrap;
	}
	
}

window.customElements.define('freedom-editor-plus', Editor, {extends : 'div'});
