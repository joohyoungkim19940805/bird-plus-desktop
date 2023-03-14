import FreedomPlusEditor from "../handler/editor/FreedomPlusEditor"

class Editor extends FreedomPlusEditor{
	constructor(){
		let component = {
			'freedom-line' : FreedomPlusEditor.Component.Line
		};

		super(component,{});
	}
}

window.customElements.define('freedom-editor-plus', Editor, {extends : 'div'});
