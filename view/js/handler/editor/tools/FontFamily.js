import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import FontBox from "../module/FontBox";
export default class FontFamily extends FreedomInterface {
    static toolHandler = new ToolHandler(this);

    static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-font-family'
	});

    static fontBox;

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
		
        this.fontBox = new FontBox(this.#fontList);

		let button = document.createElement('button');
		button.textContent = 'F'
		// default tools icon
		this.toolHandler.toolButton = button;
		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else if(this.fontBox.fontBox.isConnected){
				this.fontBox.close();
			}else{
				this.fontBox.open().then(fontBoxContainer=>{
				    this.toolHandler.processingElementPosition(this.fontBox.fontBox);
                });
			}
		}

        this.fontBox.applyCallback = (event) => {
			this.toolHandler.toolButton.dataset.tool_status = 'active'
			this.fontBox.close();
		}

        document.addEventListener("scroll", () => {
			if(this.fontBox.fontBox.isConnected){
				this.toolHandler.processingPalettePosition(this.fontBox.fontBox);
			}
		});
        window.addEventListener('resize', (event) => {
            if(this.fontBox.fontBox.isConnected){
                this.fontBox.open().then(fontBoxContainer=>{
				    this.toolHandler.processingElementPosition(this.fontBox.fontBox);
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

	constructor(dataset){
		super(FontFamily, dataset);
        if(FontFamily.#defaultStyle.textContent != '' && FontFamily.#defaultStyle.textContent && FontFamily.#defaultStyle.hasAttribute('data-is_update')){
			FontFamily.createDefaultStyle();
			FontFamily.#defaultStyle.toggleAttribute('data-is_update');
		}
        if( ! dataset){
            this.style.fontFamily = FontFamily.fontBox.lastSelectedItem.style.fontFamily;
            this.dataset.font_family = FontFamily.fontBox.lastSelectedItem.style.fontFamily;
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
