
export default class Bold extends HTMLElement {
	static extendsElement = 'strong';
	static showTools;
	static{
		img = document.createElement('img');
		button = document.createElement('button');
		button.append(img);
		// default tools icon
		this.showTools.append(this.button);
	}
	#isLoaded = false;
	constructor(){
		super();
	}
	connectedCallback(){
		if( ! this.#isLoaded ){
			
		}
	}
}