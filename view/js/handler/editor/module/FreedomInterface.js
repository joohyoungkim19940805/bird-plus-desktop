
export default class FreedomInterface extends HTMLElement {
	#isLoaded = false;
	Tool;
	options;
	constructor(Tool){
		super();
		this.Tool = Tool;
		this.options = Tool.options;
	}
	connectedCallback(){
		if( ! this.#isLoaded ){
			this.#isLoaded = true;
			this.draggable = true;
			this.classList.add(this.options.defaultClass)
			let isKeyPress = false;
			this.addEventListener('keyup', (event) => {
				if(isKeyPress == false){
					isKeyPress = true;
				}
			})
			document.addEventListener("selectstart", (event) => {
				if( ! this.Tool.options.showTools){
					return;
				}
				if(event.composedPath().some(e=>e==this)){
					this.Tool.options.showTools.setAttribute('active_tool','');
				}else{
					this.Tool.options.showTools.removeAttribute('active_tool');
				}
			})
			document.addEventListener("selectionchange", (event) => {
				if( ! this.Tool.options.showTools){
					return;
				}
				let target = window.getSelection().focusNode.parentElement;
				if(isKeyPress == false){
					return;
				}else if(target == this){
					this.Tool.options.showTools.setAttribute('active_tool','');
				}else{
					this.Tool.options.showTools.removeAttribute('active_tool');
				}
			})
		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
    }
}