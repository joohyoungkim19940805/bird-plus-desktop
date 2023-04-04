
export default class FreedomInterface extends HTMLElement {
	#isLoaded = false;
	Tool;
	options;
	constructor(Tool){
		super();
		this.Tool = Tool;
		this.options = Tool.options;
		let isKeyPress = false;
		this.draggable = true;
		// keyup을 옵저버로 대신 써보기
		document.addEventListener('keyup', (event) => {
			console.log(event);
			if(isKeyPress == false){
				isKeyPress = true;
			}
		})
		/*
		document.addEventListener("selectstart", (event) => {
			if( ! this.Tool.options.showTools){
				return;
			}
			//console.log(event.composedPath());
			if(event.composedPath().some(e=>e==this)){
				this.Tool.options.showTools.dataset.tool_status = 'active';
			}else{
				this.Tool.options.showTools.dataset.tool_status = '';
			}
		})
		*/
		document.addEventListener("selectionchange", (event) => {
			if( ! this.Tool.options.showTools){
				return;
			}
			let target = window.getSelection().focusNode.parentElement;
			console.log(target);
			console.log(isKeyPress)
			if(isKeyPress == false){
				return;
			}else if(target == this){
				this.Tool.options.showTools.dataset.tool_status = 'active';
			}else{
				this.Tool.options.showTools.dataset.tool_status = '';
			}
		})
	}
	connectedCallback(){
		if( ! this.#isLoaded ){
			this.#isLoaded = true;
			//this.draggable = true;
			this.classList.add(this.options.defaultClass)

		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
    }
}