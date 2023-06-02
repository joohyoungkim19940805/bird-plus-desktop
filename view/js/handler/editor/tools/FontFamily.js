import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import FontFamilyBox from "../module/FontFamilyBox";

export default class FontFamily extends FreedomInterface {
    static toolHandler = new ToolHandler(this);

    static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-font-family'
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
    static{
        
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-font-family';
		
        this.fontFamilyBox = new FontFamilyBox(this.#fontList);

		let button = document.createElement('button');
		button.textContent = 'F'
		// default tools icon
		this.toolHandler.toolButton = button;
		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else if(this.fontFamilyBox.fontFamilyBox.isConnected){
				this.fontFamilyBox.close();
			}else{
				this.fontFamilyBox.open().then(fontFamilyBoxContainer=>{
				    this.toolHandler.processingElementPosition(this.fontFamilyBox.fontFamilyBox);
                });
			}
		}

        this.fontFamilyBox.applyCallback = (event) => {
			this.toolHandler.toolButton.dataset.tool_status = 'active'
			this.fontFamilyBox.close();
		}

        document.addEventListener("scroll", () => {
			if(this.fontFamilyBox.fontFamilyBox.isConnected){
				this.toolHandler.processingPalettePosition(this.fontFamilyBox.fontFamilyBox);
			}
		});
        window.addEventListener('resize', (event) => {
            if(this.fontFamilyBox.fontFamilyBox.isConnected){
                this.fontFamilyBox.open().then(fontFamilyBoxContainer=>{
				    this.toolHandler.processingElementPosition(this.fontFamilyBox.fontFamilyBox);
                });
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
		super(FontFamily, dataset);
        if(FontFamily.defaultStyle.textContent != '' && FontFamily.defaultStyle.textContent && FontFamily.defaultStyle.hasAttribute('data-is_update') == false){
			FontFamily.createDefaultStyle();
			FontFamily.defaultStyle.toggleAttribute('data-is_update');
		}
        if( ! dataset){
            this.dataset.font_family = FontFamily.fontFamilyBox.selectedFont?.style.fontFamily;
        }
        this.style.fontFamily = this.dataset.font_family
    }
	
}
