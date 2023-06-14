import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import FontSizeBox from "../module/FontSizeBox";

export default class FontSize extends FreedomInterface {
    static toolHandler = new ToolHandler(this);

    static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-font-size'
	});

    static fontSizeBox;

    static{
        
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-font-size';
		
        this.fontSizeBox = new FontSizeBox({min:1, max:50});

		let button = document.createElement('button');
		button.textContent = '↑↓'
		button.style.fontSize = '14px';
		button.style.paddingBottom = '1.1%';
		// default tools icon
		this.toolHandler.toolButton = button;
		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else if(this.fontSizeBox.fontSizeBox.isConnected){
				this.fontSizeBox.close();
			}else{
				this.fontSizeBox.open().then(fontSizeBoxContainer=>{
				    this.toolHandler.processingElementPosition(this.fontSizeBox.fontSizeBox);
                });
			}
		}

        this.fontSizeBox.applyCallback = (event) => {
			this.toolHandler.toolButton.dataset.tool_status = 'active'
			this.fontSizeBox.close();
		}

        document.addEventListener("scroll", () => {
			if(this.fontSizeBox.fontSizeBox.isConnected){
				this.toolHandler.processingElementPosition(this.fontSizeBox.fontSizeBox);
			}
		});
        window.addEventListener('resize', (event) => {
            if(this.fontSizeBox.fontSizeBox.isConnected){
                this.fontSizeBox.open().then(fontSizeBoxContainer=>{
				    this.toolHandler.processingElementPosition(this.fontSizeBox.fontSizeBox);
                });
            }
		})

		super.outClickElementListener(this.fontSizeBox.fontSizeBox, ({oldEvent, newEvent, isMouseOut})=>{
			if(isMouseOut && this.fontSizeBox.fontSizeBox.isConnected && ! super.isMouseInnerElement(this.toolHandler.toolButton)){
				this.fontSizeBox.close();
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
		super(FontSize, dataset);
        if(FontSize.defaultStyle.textContent != '' && FontSize.defaultStyle.textContent && FontSize.defaultStyle.hasAttribute('data-is_update') == false){
			FontSize.createDefaultStyle();
			FontSize.defaultStyle.toggleAttribute('data-is_update');
		}
        if( ! dataset){
            this.dataset.font_size = FontSize.fontSizeBox.selectedFont?.style.fontSize;
        }
        this.style.fontSize = this.dataset.font_size
    }
	
}
