import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import FontFamilyBox from "../component/FontFamilyBox";

export default class FontFamily extends FreedomInterface {
    static toolHandler = new ToolHandler(this);

    static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-font-family-style'
	});

    static fontFamilyBox;

    static #fontList = [
        'Arial, Helvetica, Sans-Serif',
        'Arial Black, Gadget, Sans-Serif',
        'Comic Sans MS, Textile, Cursive',
        'Courier New, Courier, Monospace',
        'Georgia, Times New Roman, Times, Serif',
        'Impact, Charcoal, Sans-Serif',
        'Lucida Console, Monaco, Monospace',
        'Lucida Sans Unicode, Lucida Grande, Sans-Serif',
        'Palatino Linotype, Book Antiqua, Palatino, Serif',
        'Tahoma, Geneva, Sans-Serif',
        'Times New Roman, Times, Serif',
        'Trebuchet MS, Helvetica, Sans-Serif',
        'Verdana, Geneva, Sans-Serif',
        'MS Sans Serif, Geneva, Sans-Serif',
        'MS Serif, New York, Serif'
    ]
    static isDefaultStyle = true;
    static{
        
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-font-family';
		
        this.fontFamilyBox = new FontFamilyBox(this.#fontList);

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: 'F',
            className: `${this.#defaultStyle.id}-button`,
            title: 'Font Family'
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else if(this.fontFamilyBox.fontFamilyBox.isConnected){
				this.fontFamilyBox.close();
			}else{
				this.fontFamilyBox.open().then(fontFamilyBoxContainer=>{
				    super.processingElementPosition(this.fontFamilyBox.fontFamilyBox, this.toolHandler.toolButton);
                });
			}
		}

        this.fontFamilyBox.applyCallback = (event) => {
			this.toolHandler.toolButton.dataset.tool_status = 'active'
			this.fontFamilyBox.close();
		}

        document.addEventListener("scroll", () => {
			if(this.fontFamilyBox.fontFamilyBox.isConnected){
                super.processingElementPosition(this.fontFamilyBox.fontFamilyBox, this.toolHandler.toolButton);
			}
		});
        window.addEventListener('resize', (event) => {
            if(this.fontFamilyBox.fontFamilyBox.isConnected){
                this.fontFamilyBox.open().then(fontFamilyBoxContainer=>{
                    super.processingElementPosition(this.fontFamilyBox.fontFamilyBox, this.toolHandler.toolButton);
                });
            }
		})

		super.outClickElementListener(this.fontFamilyBox.fontFamilyBox, ({oldEvent, newEvent, isMouseOut})=>{
			if(isMouseOut && this.fontFamilyBox.fontFamilyBox.isConnected && ! super.isMouseInnerElement(this.toolHandler.toolButton)){
                this.fontFamilyBox.close();
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
		super(FontFamily, dataset);
		if( ! dataset && Object.entries(this.dataset).length == 0){
            this.dataset.font_family = FontFamily.fontFamilyBox.selectedFont?.style.fontFamily;
        }
        this.style.fontFamily = this.dataset.font_family
    }
	
}
