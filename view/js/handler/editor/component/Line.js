
export default class Line extends HTMLDivElement {
	#isLoaded = false;
	#prevParent;
	static extendsElement = 'div'
	constructor(option={}){
		super();
		console.log(option);
	}
	connectedCallback(){
		if( ! this.#isLoaded){
            this.#isLoaded = true;
			this.classList.add('freedom-line')
			this.style.minHeight = '1em';
			this.dataset.test = 'test';
		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
    }

}