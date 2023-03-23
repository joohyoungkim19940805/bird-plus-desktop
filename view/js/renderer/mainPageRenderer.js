import FreedomPlusEditor from "../handler/editor/FreedomPlusEditor"

class Editor extends FreedomPlusEditor{
	constructor(){
		let component = {
			'freedom-line' : FreedomPlusEditor.Component.Line
		};
		let tools = {
			'freedom-bold' : FreedomPlusEditor.Tools
		}
		super(component,{});
		super.onkeyup = (e)=>console.log(111)
	}
}

window.customElements.define('freedom-editor-plus', Editor, {extends : 'div'});
