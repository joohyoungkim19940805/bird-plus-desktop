import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import Palette from "../module/Palette"

export default class Strikethrough extends FreedomInterface {

	static toolHandler = new ToolHandler(this);
    static palette;
	static{
		this.toolHandler.extendsElement = 's';
		this.toolHandler.defaultClass = 'free-will-strikethrough';
		
		let button = document.createElement('button');
		button.textContent = 'S'
		this.toolHandler.toolButton = button;

		this.palette = new Palette({
            openPositionMode: Palette.OpenPositionMode.BUTTON, 
            openPosition : this.toolHandler.toolButton
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else if(this.palette.isConnected){
				this.palette.close();
			}else{
				this.palette.open();
			}
		}

		this.palette.applyCallback = (event) => {
			this.toolHandler.toolButton.dataset.tool_status = 'active'
			this.palette.close();
		}
	}

	constructor(){
		super(Strikethrough);
        this.style.textDecoration = `line-through ${Strikethrough.palette.selectedColor} 1px`
	}
	
}