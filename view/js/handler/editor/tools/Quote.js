import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class Quote extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);
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
	}

    #defaultStyle = {
        display: 'block',
        paddingLeft: '1em',
        borderLeft: '3px solid #d7d7db',
        marginInline: '2.5em',
    }
	constructor(){
		super(Quote);
        Object.assign(this.style, this.#defaultStyle);

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

    set defaultStyle(styleMap = {}){
        this.#defaultStyle = styleMap;
		Object.assign(this.style, this.#defaultStyle);
    }
	


}