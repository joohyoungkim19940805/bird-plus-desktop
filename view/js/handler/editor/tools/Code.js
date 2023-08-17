import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class Code extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-code-style'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-code';
		this.toolHandler.isInline = false;

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: '',
            className: `${this.#defaultStyle.id}-button`,
            innerHTML: `
                <i class="${this.#defaultStyle.id} css-gg-code-icon"></i>
            `
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

	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
            .${this.#defaultStyle.id}-button{
                padding-left: 13px;
                padding-right: 13px;
            }
            .${this.#defaultStyle.id}.css-gg-code-icon {
                display: block;
                position: relative;
                box-sizing: border-box;
                width: 2px;
                height: 16px;
                background: currentColor;
                transform: rotate(14deg);
                top: 0.3px;
            }
            .${this.#defaultStyle.id}.css-gg-code-icon::after, .${this.#defaultStyle.id}.css-gg-code-icon::before {
                content: "";
                display: block;
                box-sizing: border-box;
                position: absolute;
                width: 8px;
                height: 8px;
                transform: rotate(-60deg);
            }
            .${this.#defaultStyle.id}.css-gg-code-icon::after {
                border-right: 2px solid;
                border-bottom: 2px solid;
                right: -8px;
                top: 3px;
            }
            .${this.#defaultStyle.id}.css-gg-code-icon::before {
                border-left: 2px solid;
                border-top: 2px solid;
                left: -8px;
                top: 5px;
            }

			.${this.toolHandler.defaultClass} {
                display: block;
                background-color: #e7e7e7;
                margin-inline: 0.5em;
                border: solid 1px #d1d1d1;
                border-radius: 4px;
                white-space: pre-wrap;
                font-family: monospace;
                box-shadow: 0px 0px 3px 0px #d1d1d1;
                padding: 0.5em 1em 0.5em 1em;
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
		super(Code, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});
		if(Code.defaultStyle.textContent != '' && Code.defaultStyle.textContent && Code.defaultStyle.hasAttribute('data-is_update') == false){
			Code.createDefaultStyle();
			Code.defaultStyle.toggleAttribute('data-is_update');
		}

		super.connectedAfterOnlyOneCallback = () => {
			this.dataset.index = Code.toolHandler.connectedFriends.length;
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}else{
				nextLine.line.lookAtMe();
			}
		}

        super.disconnectedChildAfterCallBack = () => {
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}
        }
	}

}