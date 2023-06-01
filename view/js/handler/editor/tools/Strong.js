import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
export default class Strong extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-strong'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-strong';

		let button = document.createElement('button');
		button.textContent = 'B'
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
				font-weight: bold;
			}
		`
		return this.#defaultStyle;
	}

	constructor(dataset){
		super(Strong, dataset);
		if(Strong.#defaultStyle.textContent != '' && Strong.#defaultStyle.textContent && Strong.#defaultStyle.hasAttribute('data-is_update')){
			Strong.createDefaultStyle();
			Strong.#defaultStyle.toggleAttribute('data-is_update');
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
