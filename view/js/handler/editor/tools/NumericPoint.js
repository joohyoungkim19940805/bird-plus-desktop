import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class NumericPoint extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);
	
	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-numeric-point-style'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-numeric-point';
		this.toolHandler.isInline = false;

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: '1.',
            className: `${this.#defaultStyle.id}-button`
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else{
				this.toolHandler.toolButton.dataset.tool_status = 'active';
			}
		}

		let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.createDefaultStyle());
        }else{
            this.#defaultStyle = defaultStyle;
        }
	}
    //list-style-type: disc;
	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
			.${this.toolHandler.defaultClass} {
				display: block;
				margin-inline: 1.3em;
				list-style-type: none;
			}
			.${this.toolHandler.defaultClass} > * {
				list-style-type: decimal;
				display: list-item;
				margin-inline: 1.3em;
			}
		`
		return this.#defaultStyle;
	}
	
	static get defaultStyle(){
        return this.#defaultStyle;
    }

    static set defaultStyle(style){
        this.#defaultStyle.textContent = style;
    }

	static set insertDefaultStyle(style){
		this.#defaultStyle.sheet.insertRule(style);
	}

	parentLine;
	
	constructor(dataset){
		super(NumericPoint, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});
		if(NumericPoint.defaultStyle.textContent != '' && NumericPoint.defaultStyle.textContent && NumericPoint.defaultStyle.hasAttribute('data-is_update') == false){
			NumericPoint.createDefaultStyle();
			NumericPoint.defaultStyle.toggleAttribute('data-is_update');
		}
		
		super.connectedAfterOnlyOneCallback = () => {
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}else{
				nextLine.line.lookAtMe();
			}
		}

		super.disconnectedChildAfterCallBack = (removedNodes) => {
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}
        }

	}

}