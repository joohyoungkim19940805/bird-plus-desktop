
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
	static defaultClass = 'line';
	constructor(option={}){
		super();
		console.log(option);
	}
	connectedCallback(){
		if( ! this.#isLoaded){
			this.draggable="true"
            this.#isLoaded = true;
			this.classList.add(Line.defaultClass)
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

	applyTool(TargetTool, range){
		return new Promise(resolve => {
			let tool = new TargetTool();
			//let text = this.textContent;
			//tool.append(text.substring(0, startOffset))
			range.surroundContents(tool);
			let str = range.toString();
			if(str != ''){
				tool.textContent = str;
			}
			resolve(tool);
		})
		/*
		let text = document.createTextNode('\u200B')
		tool.append(text);
		tool.tabIndex = 1;
		tool.focus();
		*/
		//this.replaceChildren(document.createTextNode(text.substring(0, startOffset)), tool, document.createTextNode(text.substring(startOffset)))
		//this.innerHTML = document.createTextNode(text.substring(0, startOffset)).data + tool.n
		//this.innerHTML = tool.innerHTML + text.substring(startOffset); 
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