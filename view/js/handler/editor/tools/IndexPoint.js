import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class IndexPoint extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);
	
	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-index'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-index';
		
		//let img = document.createElement('img');
		let button = document.createElement('button');
		//button.append(img);
		button.textContent = 'I'
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
			.${this.toolHandler.defaultClass}[data-index]::before {
				content: attr(data-index) '. ';
				padding-right: 1em;
			}
			.${this.toolHandler.defaultClass} {
				display: list-item;
				margin-inline: 1.3em;
				list-style-type: none;
			}
		`
		return this.#defaultStyle;
	}

	constructor(){
		super(IndexPoint);
		if(IndexPoint.#defaultStyle.textContent != '' && IndexPoint.#defaultStyle.textContent){
			IndexPoint.createDefaultStyle();
		}
        super.disconnectedAfterCallback = () => {
			if(IndexPoint.toolHandler.isLastTool(this)){
				let nextLine = this.parentEditor.getNextLine(this.parentLine);
				if( ! nextLine){
                	this.parentEditor.createLine();
				}else{
					nextLine.lookAtMe();
				}
            }
			IndexPoint.toolHandler.connectedFriends.forEach((e, i)=>{
				e.dataset.index = i + 1; 
			})
        }
		
		super.connectedAfterOnlyOneCallback = () => {
			this.dataset.index = IndexPoint.toolHandler.connectedFriends.length;
		}

		super.connectedAfterCallback = () => {
			IndexPoint.toolHandler.connectedFriends.forEach((e, i)=>{
				e.dataset.index = i + 1; 
			})
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