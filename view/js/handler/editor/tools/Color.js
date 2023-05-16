import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import Palette from "../module/Palette"

export default class Color extends FreedomInterface {
	static toolHandler = new ToolHandler(this);

	static palette;// = new Palette();

	static{
		this.toolHandler.defaultClass = 'freedom-color';
		
		//let img = document.createElement('img');
		let button = document.createElement('button');
		//button.append(img);
		button.textContent = 'C'
		// default tools icon
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


	#isLoaded = false;
	constructor(){
		super(Color);
		this.style.color = Color.palette.selectedColor;
		//Color.palette.reset();
	}


}