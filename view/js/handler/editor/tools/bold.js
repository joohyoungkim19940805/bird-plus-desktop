
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
		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
    }
}
