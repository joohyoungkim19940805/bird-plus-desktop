import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import Palette from "../module/Palette"

export default class Strikethrough extends FreedomInterface {

	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-strikethrough'
	});

    static palette;
	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-strikethrough';
		
		let button = document.createElement('button');
		button.textContent = 'S'
		this.toolHandler.toolButton = button;

		this.palette = new Palette({
            openPositionMode: Palette.OpenPositionMode.BUTTON, 
            openPosition : this.toolHandler.toolButton
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else if(this.palette.isConnected){
				this.palette.close();
			}else{
				this.palette.open();
			}
		}

		this.palette.applyCallback = (event) => {
			this.toolHandler.toolButton.dataset.tool_status = 'active'
			this.palette.close();
		}

		let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.createDefaultStyle());
        }else{
            this.#defaultStyle = defaultStyle;
        }
	}

	static createDefaultStyle(){
		this.#defaultStyle.textContent = ``
		return this.#defaultStyle;
	}

	constructor(dataset){
		super(Strikethrough, dataset);
		if(Strikethrough.#defaultStyle.textContent != '' && Strikethrough.#defaultStyle.textContent && Strikethrough.#defaultStyle.hasAttribute('data-is_update')){
			Strikethrough.createDefaultStyle();
			Strikethrough.#defaultStyle.toggleAttribute('data-is_update');
		}
		if( ! dataset){
			this.dataset.rgba = Strikethrough.palette.r + ',' + Strikethrough.palette.g + ',' + Strikethrough.palette.b + ',' + Strikethrough.palette.a;
		}

		this.style.textDecoration = `line-through rgba(${this.dataset.rgba}) 1px`;
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