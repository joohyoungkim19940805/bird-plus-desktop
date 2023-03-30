
export default class Bold extends HTMLElement {
	static extendsElement = 'strong';
	static defaultClass = 'line';
	static showTools;
	static{
		//let img = document.createElement('img');
		let button = document.createElement('button');
		//button.append(img);
		button.textContent = 'B'
		// default tools icon
		this.showTools = button;
	}
	#isLoaded = false;
	constructor(){
		super();
	}
	connectedCallback(){
		if( ! this.#isLoaded ){
			this.#isLoaded = true;
			this.draggable="true"
			this.classList.add(Bold.defaultClass)
			let isKeyPress = false;
			this.addEventListener('keyup', (event) => {
				isKeyPress = true;
			})
			document.addEventListener("selectstart", (event) => {
				console.log('selectstart', event.composedPath());
				if(event.composedPath().some(e=>e==this)){
					Bold.showTools.setAttribute('active_tool','');
				}else{
					Bold.showTools.removeAttribute('active_tool');
				}
			})
			document.addEventListener("selectionchange", (event) => {
				let target = window.getSelection().focusNode.parentElement;
				if(isKeyPress == false){
					return;
				}else if(target == this){
					Bold.showTools.setAttribute('active_tool','');
				}else{
					Bold.showTools.removeAttribute('active_tool');
				}
			})
		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
    }
}
