import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import Palette from "../component/Palette"

export default class Underline extends FreedomInterface {
	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-underline-style'
	});

	static palette;

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-underline';
		
		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: 'U',
            className: `${this.#defaultStyle.id}-button`
        });

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
		this.#defaultStyle.textContent = `
			.${this.#defaultStyle.id}-button{
				text-decoration: 1px underline;
			}
		`
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
		super(Underline, dataset);
		if(Underline.defaultStyle.textContent == '' && Underline.defaultStyle.hasAttribute('data-is_update') == false && isDefaultStyle){
			Underline.createDefaultStyle();
			Underline.defaultStyle.setAttribute('data-is_update', true);
		}
		if( ! dataset && Object.entries(this.dataset).length == 0){
			this.dataset.rgba = Underline.palette.r + ',' + Underline.palette.g + ',' + Underline.palette.b + ',' + Underline.palette.a;
		}
		this.style.textDecoration = `underline rgba(${this.dataset.rgba}) 1px`;
	}

}