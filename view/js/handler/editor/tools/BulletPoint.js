import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class BulletPoint extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);
	
	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-bullet-point'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-bullet';
		
		//let img = document.createElement('img');
		let button = document.createElement('button');
		//button.append(img);
		button.textContent = 'P'
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
				display: list-item;
				padding-left: 1em;
				margin-inline: 2.5em;
				list-style-type: disc;
			}
		`
		return this.#defaultStyle;
	}
	
	constructor(){
		super(BulletPoint);
		if(BulletPoint.#defaultStyle.textContent != '' && BulletPoint.#defaultStyle.textContent){
			BulletPoint.createDefaultStyle();
		}
        super.disconnectedAfterCallback = () => {
			if(BulletPoint.toolHandler.isLastTool(this)){
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