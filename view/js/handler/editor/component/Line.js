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
			line = element.parentElement.closest(`${this.options.defaultClass}`);
		}
		return line;
	}
	static getTool(element, TargetTool){
		let tool = undefined;
		if( ! element.parentElement){
			return tool;
		}else if(element.parentElement.classList.contains(TargetTool.options.defaultClass)){
			tool = element.parentElement;
		}else{
			tool = element.parentElement.closest(`,${TargetTool.options.defaultClass}`);
		}
		return tool;
	}
	static findTool(element, TargetTool){
		let tool = undefined;
		return element.querySelector(`,${TargetTool.options.defaultClass}`);
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
	async applyTool(TargetTool, range){
		return await new Promise(resolve => {
			let tool = new TargetTool();
			let {startOffset, endOffset, startContainer,endContainer} = range;
			if(startContainer === endContainer){
				range.surroundContents(tool);
				resolve(tool);
			}else{
				let endLine = Line.getLine(endContainer);
				range.setStart(range.startContainer, startOffset);
				range.setEnd(range.startContainer, range.startContainer.textContent.length);
				range.surroundContents(tool);
				let targetLine = this.nextElementSibling; 
				while(targetLine){
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
	}
	async cancelTool(TargetTool, range, selection){
		return await new Promise(resolve => {
			let {isCollapsed, anchorNode, anchorOffset} = selection; 
			let tool = Line.getTool(anchorNode);
			if( ! tool){
				resolve(tool)
			}
			console.log(anchorNode.previousSibling);
			let {startOffset, endOffset, startContainer,endContainer} = range;
			let endLine = Line.getLine(endContainer);
			let endTool = Line.getTool(endContainer);
			let startTextNode = document.createTextNode();
			range.setStart(range.startContainer, startOffset);
			range.setEnd(range.startContainer, range.startContainer.textContent.length);
			range.surroundContents(startTextNode);
			if(anchorNode.previousSibling){
				anchorNode.previousSibling.insertAdjacentElement('afterend', startTextNode)
			}else {
				this.append(startTextNode);
			}
			tool.remove();

			if(startContainer !== endContainer){
				let targetLine = this.nextElementSibling; 
				while(targetLine){
					let targetToolList = element.querySelectorAll(`,${TargetTool.options.defaultClass}`);
					if(targetToolList.length == 0){
						continue;
					}
					let textNodeList = targetToolList.map(targetTool=>{
						let targetTextNode = document.createTextNode();
						range.selectNodeContents(targetTool);
						range.surroundContents(targetTextNode);
						targetTool.remove();
						return targetTextNode;
					});
					targetLine.append(...textNodeList);

					targetLine = targetLine.nextElementSibling;
					if(targetLine === endLine){
						break;
					}
				}
				let endTextNode = document.createTextNode();
				range.setStart(endContainer, 0);
				range.setEnd(endContainer, endOffset)
				range.surroundContents(endTextNode);
				if(endContainer.previousSibling){
					endContainer.previousSibling.insertAdjacentElement('beforebegin', endTextNode);
				}else{
					this.append(endTextNode);
				}
				endTool.remove();
				resolve(endTextNode);
			}else{
				resolve(startTextNode);
			}

		});
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