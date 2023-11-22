import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
export default class Italic extends FreedomInterface {

	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-italic-style'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-italic';

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: 'I',
            className: `${this.#defaultStyle.id}-button`,
			title: 'Italic'
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else{
				this.toolHandler.toolButton.dataset.tool_status = 'active';
			}
		}
	}

	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
			.${this.#defaultStyle.id}-button{
				font-style: italic;
				font-size: 0.8rem;
			}

			.${this.toolHandler.defaultClass} {
				font-style: italic;
			}
		`
		let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.#defaultStyle);
        }else{
            this.#defaultStyle?.remove();
            this.#defaultStyle = defaultStyle;
            document.head.append(this.#defaultStyle);
        }
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
		super(Italic, dataset);
	}

	
}
