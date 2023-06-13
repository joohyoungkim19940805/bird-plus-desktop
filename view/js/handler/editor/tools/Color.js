import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import Palette from "../module/Palette"

export default class Color extends FreedomInterface {
	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-color'
	});

	static palette;

	static{

		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-color';
		
		let button = document.createElement('button');
		button.textContent = 'C'
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

		FreedomInterface.outClickElementObserver(this.palette.palette, ({oldEvent, newEvent})=>{
			console.log(oldEvent, newEvent);
			this.palette.close();
		})
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
		super(Color, dataset);
		if(Color.defaultStyle.textContent != '' && Color.defaultStyle.textContent && Color.defaultStyle.hasAttribute('data-is_update') == false){
			Color.createDefaultStyle();
			Color.defaultStyle.toggleAttribute('data-is_update');
		}
		if( ! dataset){
			this.dataset.rgba = Color.palette.r + ',' + Color.palette.g + ',' + Color.palette.b + ',' + Color.palette.a;
		}
		this.style.color = `rgba(${this.dataset.rgba})`;
	}

}