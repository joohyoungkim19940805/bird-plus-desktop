import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import Palette from "../module/Palette"

export default class Underline extends FreedomInterface {
	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-underline'
	});

	static palette;

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-underline';
		
		let button = document.createElement('button');
		button.textContent = 'U'
		this.toolHandler.toolButton = button;

		this.palette = new Palette({
            openPositionMode: Palette.OpenPositionMode.BUTTON, 
            openPosition: this.toolHandler.toolButton,
			exampleMode: Palette.ExampleMode.TEXT_UNDERLINE
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

	static get defaultStyle(){
        return this.#defaultStyle;
    }

    static set defaultStyle(style){
        this.#defaultStyle.textContent = style;
    }

	static set insertDefaultStyle(style){
		this.#defaultStyle.sheet.insertRule(style);
	}

	constructor(dataset){
		super(Underline, dataset);
		if(Underline.defaultStyle.textContent != '' && Underline.defaultStyle.textContent && Underline.defaultStyle.hasAttribute('data-is_update') == false){
			Underline.createDefaultStyle();
			Underline.defaultStyle.toggleAttribute('data-is_update');
		}
		if( ! dataset){
			this.dataset.rgba = Underline.palette.r + ',' + Underline.palette.g + ',' + Underline.palette.b + ',' + Underline.palette.a;
		}
		this.style.textDecoration = `underline rgba(${this.dataset.rgba}) 1px`;
	}

}