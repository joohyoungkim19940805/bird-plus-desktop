import FreedomInterface from "../module/FreedomInterface"
import Options from "../module/Options"
export default class Bold extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static options = new Options(this);
	static{
		this.options.extendsElement = 'strong';
		this.options.defaultClass = 'freedom-bold';
		
		//let img = document.createElement('img');
		let button = document.createElement('button');
		//button.append(img);
		button.textContent = 'B'
		// default tools icon
		this.options.showTools = button;
		this.options.showTools.onclick = ()=>{
			if(this.options.showTools.dataset.tool_status == 'active' || this.options.showTools.dataset.tool_status == 'connected'){
				this.options.showTools.dataset.tool_status = 'cancel';
			}else{
				this.options.showTools.dataset.tool_status = 'active';
			}
		}
	}
	#isLoaded = false;
	constructor(){
		super(Bold);
	}
	
}
