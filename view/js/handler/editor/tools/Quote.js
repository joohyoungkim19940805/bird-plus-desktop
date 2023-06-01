import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class Quote extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-quote'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-quote';
		
		//let img = document.createElement('img');
		let button = document.createElement('button');
		//button.append(img);
		button.textContent = 'Q'
		// default tools icon
		this.toolHandler.toolButton = button;
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

	constructor(dataset){
		super(Quote, dataset);
		if(Quote.#defaultStyle.textContent != '' && Quote.#defaultStyle.textContent && Quote.#defaultStyle.hasAttribute('data-is_update')){
			Quote.createDefaultStyle();
			Quote.#defaultStyle.toggleAttribute('data-is_update');
		}
        super.disconnectedAfterCallback = () => {
			if(Quote.toolHandler.isLastTool(this)){
				let nextLine = this.parentEditor.getNextLine(this.parentLine);
				if( ! nextLine){
                	this.parentEditor.createLine();
				}else{
					nextLine.lookAtMe();
				}
            }
        }
	}

    get defaultStyle(){
        return this.#defaultStyle;
    }

    set defaultStyle(style){
        this.#defaultStyle.textContent = style;
    }

	set insertDefaultStyle(style){
		this.#defaultStyle.sheet.insertRule(style);
	}


}