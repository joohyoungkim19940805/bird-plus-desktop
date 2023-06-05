import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import SortBox from "../module/SortBox";

export default class Sort extends FreedomInterface {
    static toolHandler = new ToolHandler(this);
	
	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-index'
	});

    static sortBox; 

    static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-index';
		
        this.sortBox = new SortBox();

		//let img = document.createElement('img');
		let button = document.createElement('button');
		//button.append(img);
		button.textContent = 'Ξ'
        button.style.fontSize = '14px';

		// default tools icon
		this.toolHandler.toolButton = button;
		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else if(this.sortBox.sortBox.isConnected){
				this.sortBox.close();
			}else{
				this.sortBox.open();
                this.toolHandler.processingElementPosition(this.sortBox.sortBox);
			}
		}

        this.sortBox.applyCallback = (event) => {
			this.toolHandler.toolButton.dataset.tool_status = 'active'
			this.sortBox.close();
		}

        document.addEventListener("scroll", () => {
			if(this.sortBox.sortBox.isConnected){
				this.toolHandler.processingPalettePosition(this.sortBox.sortBox);
			}
		});
        window.addEventListener('resize', (event) => {
            if(this.sortBox.sortBox.isConnected){
                this.sortBox.open();
                this.toolHandler.processingElementPosition(this.sortBox.sortBox);
            }
		})


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
                display: block;
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
		super(Sort, dataset, FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE);
		if(Sort.defaultStyle.textContent != '' && Sort.defaultStyle.textContent && Sort.defaultStyle.hasAttribute('data-is_update') == false){
			Sort.createDefaultStyle();
			Sort.defaultStyle.toggleAttribute('data-is_update');
		}
        if( ! dataset){
            this.dataset.text_align = Sort.sortBox.selectedSort?.textContent;
        }
        this.style.textAlign = this.dataset.text_align;
        super.connectedAfterOnlyOneCallback = () => {
            let nextLine = Sort.toolHandler.parentEditor.getNextLine(this);
            if( ! nextLine){
                Sort.toolHandler.parentEditor.createLine();
            }
        }

	}

}