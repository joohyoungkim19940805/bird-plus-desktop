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
            className: `${this.#defaultStyle.id}-button`,
			title: 'Quote'
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else{
				this.toolHandler.toolButton.dataset.tool_status = 'active';
			}
		}
	}

	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
			.${this.#defaultStyle.id}-button{
				font-size: 0.8rem;
			}
			.${this.toolHandler.defaultClass} {
				display: block;
				padding-left: 1em;
				border-left: 3px solid #d7d7db;
				margin-inline: 2.5em;
			}
		`
		let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.#defaultStyle);
        }else{
            this.#defaultStyle?.remove();
            this.#defaultStyle = defaultStyle;
            document.head.append(this.#defaultStyle);
        }
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

		/*
		super.connectedAfterOnlyOneCallback = () => {
			this.dataset.index = Quote.toolHandler.connectedFriends.length;
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}else{
				nextLine.line.lookAtMe();
			}
		}

        super.disconnectedChildAfterCallback = () => {
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}
        }
		*/
	}

}