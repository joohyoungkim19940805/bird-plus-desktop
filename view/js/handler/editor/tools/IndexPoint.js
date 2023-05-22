import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class IndexPoint extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);
	
	static #style = Object.assign(document.createElement('style'), {
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

		let style = document.querySelector(`#${this.#style.id}`);
        if(! style){
            document.head.append(this.createStyle());
        }else{
            this.#style = style;
        }
	}

	static createStyle(){
		this.#style.textContent = ``/*`
			[data-index]::before {
				content: attr(data-index) '. ';
			}
		`*/
		return this.#style;
	}

    #defaultStyle = {
        display: 'list-item',
        paddingLeft: '1em',
        marginInline: '2.5em',
		listStyleType: 'decimal',
    }
	constructor(){
		super(IndexPoint);
        Object.assign(this.style, this.#defaultStyle);

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
	}

    get defaultStyle(){
        return this.#defaultStyle;
    }

    set defaultStyle(styleMap = {}){
        this.#defaultStyle = styleMap;
		Object.assign(this.style, this.#defaultStyle);
    }
	


}