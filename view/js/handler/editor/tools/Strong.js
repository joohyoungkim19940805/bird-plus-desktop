import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
export default class Strong extends FreedomInterface {

	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-strong-style'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-strong';

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: 'B',
            className: `${this.#defaultStyle.id}-button`
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else{
				this.toolHandler.toolButton.dataset.tool_status = 'active';
			}
		}

		let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.#defaultStyle);
        }else{
            this.#defaultStyle = defaultStyle;
        }
	}

	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
			.${this.toolHandler.defaultClass} {
				font-weight: bold;
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
		super(Strong, dataset);
		if(Strong.defaultStyle.textContent == '' && Strong.defaultStyle.hasAttribute('data-is_update') == false && isDefaultStyle){
			Strong.createDefaultStyle();
			Strong.defaultStyle.setAttribute('data-is_update', true);
		}
	}
	
}
