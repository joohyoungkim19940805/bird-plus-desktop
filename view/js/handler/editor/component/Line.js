
export default class Line extends HTMLDivElement {
	#isLoaded = false;
	#prevParent;
	/**
	 * line은 무조건 div를 상속받아야 합니다.
	 * mark라던가 span으로 사용해도 엔터치는 순간 div로 감싸입니다. 
	 * 즉 엔터시 무조건 div로 됩니다.
	 * 추후 엔터 이벤트를 막고 알트 엔터로 트리거 할 수 있도록 바꾸어야합니다.
	 */
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