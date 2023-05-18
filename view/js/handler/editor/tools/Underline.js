import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import Palette from "../module/Palette"

export default class Underline extends FreedomInterface {
	static toolHandler = new ToolHandler(this);

	static palette;

	static{
		this.toolHandler.extendsElement = 'u';
		this.toolHandler.defaultClass = 'free-will-underline';
		
		let button = document.createElement('button');
		button.textContent = 'U'
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
		super(Underline);
        this.style.textDecoration = `underline ${Underline.palette.selectedColor} 1px`;
	}
	
}