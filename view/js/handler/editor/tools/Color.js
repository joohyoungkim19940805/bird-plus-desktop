import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import Palette from "../component/Palette"

export default class Color extends FreedomInterface {
	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-color-style'
	});

	static palette;

	static{

		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-color';
		
		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: 'C',
            className: `${this.#defaultStyle.id}-button`,
			title: 'Font Color'
        });

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

		super.outClickElementListener(this.palette.palette, ({oldEvent, newEvent, isMouseOut})=>{
			if(isMouseOut && this.palette.palette.isConnected && ! super.isMouseInnerElement(this.toolHandler.toolButton)){
				this.palette.close();
			}
		})

		let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.#defaultStyle);
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

	constructor(dataset, {isDefaultStyle = true} = {}){
		super(Color, dataset);
		if(Color.defaultStyle.textContent == '' && Color.defaultStyle.hasAttribute('data-is_update') == false && isDefaultStyle){
			Color.createDefaultStyle();
			Color.defaultStyle.setAttribute('data-is_update', true);
		}
		if( ! dataset && Object.entries(this.dataset).length == 0){
			this.dataset.rgba = Color.palette.r + ',' + Color.palette.g + ',' + Color.palette.b + ',' + Color.palette.a;
		}
		this.style.color = `rgba(${this.dataset.rgba})`;
	}

}