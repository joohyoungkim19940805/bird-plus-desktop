import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class Quote extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-quote-style'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-quote';
		this.toolHandler.isInline = false;

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: 'Q',
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

	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
			.${this.toolHandler.defaultClass} {
				display: block;
				padding-left: 1em;
				border-left: 3px solid #d7d7db;
				margin-inline: 2.5em;
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
		super(Quote, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});
		if(Quote.defaultStyle.textContent != '' && Quote.defaultStyle.textContent && Quote.defaultStyle.hasAttribute('data-is_update') == false){
			Quote.createDefaultStyle();
			Quote.defaultStyle.toggleAttribute('data-is_update');
		}

		super.connectedAfterOnlyOneCallback = () => {
			this.dataset.index = Quote.toolHandler.connectedFriends.length;
			let nextLine = Quote.toolHandler.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				Quote.toolHandler.parentEditor.createLine();
			}else{
				nextLine.lookAtMe();
			}
		}

        super.disconnectedChildAfterCallBack = () => {
			let nextLine = Quote.toolHandler.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				Quote.toolHandler.parentEditor.createLine();
			}
        }
	}

}