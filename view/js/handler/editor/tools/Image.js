import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import ImageBox from "../module/ImageBox"
export default class Image extends FreedomInterface {

	static toolHandler = new ToolHandler(this);

    static imageBox = new ImageBox();

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-image'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-image';

		let button = document.createElement('button');
		this.toolHandler.toolButton = button;
		button.append(Object.assign(document.createElement('i'),{
            className: 'css-gg-image-icon'
        }));
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
            .css-gg-image-icon {
                box-sizing: border-box;
                position: relative;
                display: block;
                width: 14px;
                height: 15px;
                overflow: hidden;
                box-shadow: 0 0 0 2px;
                border-radius: 2px
            }
            .css-gg-image-icon::after, .gg-image-icon::before {
                content: "";
                display: block;
                box-sizing: border-box;
                position: absolute;
                border: 2px solid;
            }
            .css-gg-image-icon::after {
                transform: rotate(45deg);
                border-radius: 3px;
                width: 16px;
                height: 16px;
                top: 9px;
                left: 2px;
            }
            .css-gg-image-icon::before {
                width: 6px;
                height: 6px;
                border-radius: 100%;
                top: 1px;
                left: 1px;
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

	constructor(dataset){
		super(Image, dataset);
		if(Image.defaultStyle.textContent != '' && Image.defaultStyle.textContent && Image.defaultStyle.hasAttribute('data-is_update') == false){
			Image.createDefaultStyle();
			Image.defaultStyle.toggleAttribute('data-is_update');
		}

	}

	
}
