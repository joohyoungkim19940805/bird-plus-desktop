
export default class Line extends HTMLDivElement {
	#isLoaded = false;
	#prevParent;
	static extendsElement = 'div'
	constructor(option={}){
		super();
		console.log(option);
	}
	connectedCallback(){
		console.log(this.dataset.test_abc)
		if( ! this.#isLoaded){
			this.draggable="true"
            this.#isLoaded = true;
			this.classList.add('freedom-line')
			this.dataset.test = 'test';
			//this.onselectstart  = (event) => console.log(event)
			//this.onselectionchange = (event) => this.selectionchangeEventFunction(event);
			//this.onselect = (event) => console.log(event);
			//this.onbeforexrselect = (event) => console.log(event)
			//this.onmouseup = (event) => console.log(window.getSelection())
			//let testDiv = document.createElement('div');
			//testDiv.className = 'testAAAA'
			//testDiv.textContent = 'testaaa';
			//this.append(testDiv);
			//자기 자신 호출로 아웃오브메모리
			//this.parentElement.append(new Line());
		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
    }

	selectstartEventFunction(event){
		console.log(event)
		console.log(window.getSelection())
		console.log(document.getSelection())
	}
	selectionchangeEventFunction(event){
		console.log(event);
	}

}