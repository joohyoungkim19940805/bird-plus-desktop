import FreedomInterface from "../module/FreedomInterface"
import Options from "../module/Options"
import Palette from "../module/Palette"

export default class Color extends FreedomInterface {
	static options = new Options(this);

	static palette;// = new Palette();

	static{
		this.options.defaultClass = 'freedom-color';
		
		//let img = document.createElement('img');
		let button = document.createElement('button');
		//button.append(img);
		button.textContent = 'C'
		// default tools icon
		this.options.showTools = button;

		this.palette = new Palette({openButton: this.options.showTools});

		this.options.showTools.onclick = ()=>{
			if(this.options.showTools.dataset.tool_status == 'active' || this.options.showTools.dataset.tool_status == 'connected'){
				this.options.showTools.dataset.tool_status = 'cancel';
			}else if(this.palette.isConnected){
				this.palette.close();
			}else{
				this.palette.open();
			}
		}

		this.palette.applyCallback = (event) => {
			this.options.showTools.dataset.tool_status = 'active'
			this.palette.close();
		}
	}


	#isLoaded = false;
	constructor(){
		super(Color.palette);
		this.style.color = Color.palette.selectedColor;
		//Color.palette.reset();
	}


}