import Options from "../module/Options"
export default class Line extends HTMLDivElement {
	#isLoaded = false;
	#prevParent;
	/**
	 * line은 무조건 div를 상속받아야 합니다.
	 * mark라던가 span으로 사용해도 엔터치는 순간 div로 감싸입니다. 
	 * 즉 엔터시 무조건 div로 됩니다.
	 * 추후 엔터 이벤트를 막고 알트 엔터로 트리거 할 수 있도록 바꾸어야합니다.
	 */
	static options = new Options();
	static{
		this.options.extendsElement = 'div';
		this.options.defaultClass = 'line';
	}
	static getLine(element){
		let line = undefined;
		if( ! element.parentElement){
			return line;
		}else if(element.parentElement.classList.contains(this.options.defaultClass)){
			line = element.parentElement;
		}else{
			line = element.parentElement.closest(`,${this.options.defaultClass}`);
		}
		return line;
	}
	constructor(){
		super();
		this.classList.add(Line.options.defaultClass);
	}
	connectedCallback(){
		if( ! this.#isLoaded){
			//this.draggable="true"
            this.#isLoaded = true;
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
	applyTool(TargetTool, range, s){
		return new Promise(resolve => {
			let tool = new TargetTool();
			let {startOffset, endOffset,startContainer,endContainer} = range;
			if(startContainer === endContainer){
				range.surroundContents(tool);
				resolve(tool);
			}else{
				let endLine = Line.getLine(endContainer);
				range.setStart(range.startContainer, startOffset);
				range.setEnd(range.startContainer, range.startContainer.textContent.length);
				range.surroundContents(tool);
				let targetLine = this.nextElementSibling; 
				console.log(targetLine)
				while( targetLine){
					// 아래 주석 지우지 말 것, 중첩 자식 요소에서 미동작 또는 오류 발생시 아래 로직 주석 풀고 테스트 해볼 것
					// let middleTool = new TargetTool();
					// middleTool.append(...targetLine.childNodes);
					// targetLine.append(middleTool);
					range.selectNodeContents(targetLine);
					range.surroundContents(new TargetTool());
					targetLine = targetLine.nextElementSibling;
					if(targetLine === endLine){
						break;
					}
				}
				let endTool = new TargetTool();
				range.setStart(endContainer, 0);
				range.setEnd(endContainer, endOffset);
				range.surroundContents(endTool);
				resolve(endTool);
			}
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