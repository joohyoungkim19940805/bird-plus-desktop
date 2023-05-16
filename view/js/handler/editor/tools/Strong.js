import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
export default class Strong extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);
	static{
		this.toolHandler.extendsElement = 'strong';
		this.toolHandler.defaultClass = 'free-will-Strong';
		
		//let img = document.createElement('img');
		let button = document.createElement('button');
		//button.append(img);
		button.textContent = 'B'
		// default tools icon
		this.toolHandler.toolButton = button;
		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else{
				this.toolHandler.toolButton.dataset.tool_status = 'active';
			}
		}
	}
	#isLoaded = false;
	constructor(){
		super(Strong);
	}
	
}
