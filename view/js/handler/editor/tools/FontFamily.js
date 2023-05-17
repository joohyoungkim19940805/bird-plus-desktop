import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import FontBox from "../module/FontBox";
export default class FontFamily extends FreedomInterface {
    static toolHandler = new ToolHandler(this);
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
		this.toolHandler.defaultClass = 'free-will-font-family';
		
        this.fontBox = new FontBox(this.#fontList);

		let button = document.createElement('button');
		button.textContent = 'F'
		// default tools icon
		this.toolHandler.toolButton = button;
		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else if(this.fontBox.isConnected){
				this.fontBox.close();
			}else{
				this.fontBox.open();
				this.toolHandler.processingElementPosition(this.fontBox.fontBox);
			}
		}

        this.fontBox.applyCallback = (event) => {
			this.toolHandler.toolButton.dataset.tool_status = 'active'
			this.fontBox.close();
		}
	}
	#isLoaded = false;
	constructor(){
		super(FontFamily);
        this.style.fontFamily = FontFamily.fontBox.lastSelectedItem.style.fontFamily;
	}
	
}
