import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import FontSizeBox from "../component/FontSizeBox";

export default class FontSize extends FreedomInterface {
    static toolHandler = new ToolHandler(this);

    static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-font-size-style'
	});

    static fontSizeBox;

    static{
        
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-font-size';
		
		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: '↑↓',
            className: `${this.#defaultStyle.id}-button`,
			title: 'Font Size'
        });

		this.fontSizeBox = new FontSizeBox({min:1, max:50});

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
	}

    static createDefaultStyle(){
		this.#defaultStyle.textContent = `
			.${this.#defaultStyle.id}-button{
				font-size: 0.8rem;
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
		super(FontSize, dataset);
		if( ! dataset && Object.keys(this.dataset).length == 0){
            this.dataset.font_size = FontSize.fontSizeBox.selectedFont?.style.fontSize;
        }
        this.style.fontSize = this.dataset.font_size
    }
	
}
