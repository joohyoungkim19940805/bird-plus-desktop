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
			line = element.parentElement.closest(`.${this.options.defaultClass}`);
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
			tool = element.parentElement.closest(`.${TargetTool.options.defaultClass}`);
		}
		return tool;
	}
	static findTool(element, TargetTool){
		return element.querySelector(`,${TargetTool.options.defaultClass}`);
	}
	constructor(){
		super();
		this.classList.add(Line.options.defaultClass);
	}
	connectedCallback(){
		if( ! this.#isLoaded){
			//this.draggable="true"
			//this.tabIndex = 1;
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
	/**
	 * applyTool, cancelTool에서 3가지 경우의 수로 함수를 분기시킬 것 apply mng와 cancel mng class를 새로 만들것, line이 할 일이 아니니 freedomPlusEditor로 옮길 것
	 * --applyTool
	 * 1. 범위 전체
	 * 2. 범위이되 line이 같을 때 (textNode별로 처리 필요)
	 * 3. start와 end가 다를 때(멀티라인)
	 * --cancelTool
	 * 1. 범위
	 * 2. 범위 중 일부
	 * 3. 멀티라인
	 */

	/**
	 * 
	 * @param {*} TargetTool 
	 * @param {*} range 
	 * @returns 
	 */
	async applyTool(TargetTool, range){
		return await new Promise(resolve => {
			let tool = new TargetTool();
			let {startOffset, endOffset, startContainer,endContainer} = range;
			if(startContainer === endContainer){
				range.surroundContents(tool);
				resolve(tool);
			}else{
				let endLine = Line.getLine(endContainer);
				range.setStart(startContainer, startOffset);
				range.setEnd(startContainer, startContainer.textContent.length);
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

	async cancelTool(TargetTool, selection){
		return await new Promise(resolve => {
			let {isCollapsed, anchorNode, anchorOffset} = selection;
			console.log(anchorNode) 

			
			let range = selection.getRangeAt(0);
			console.log('range', range);
			let {startOffset, endOffset, startContainer, endContainer, commonAncestorContainer} = range;
			let tool = Line.getTool(startContainer, TargetTool);
			if( ! tool){
				resolve(tool)
			}
			console.log(startContainer);
			let node;
			console.log(commonAncestorContainer )
			console.log(tool);
			console.log('true test >>>', commonAncestorContainer == tool );
			let leftText = undefined;
			let rightText = undefined;
			if(commonAncestorContainer == tool){
				// tool 범위 전체 선택인 경우
				node = document.createTextNode(startContainer.textContent);
			}else{
				// tool 범위 중 일부 선택인 경우
				node = document.createTextNode(startContainer.textContent.substring(startOffset, endOffset));
				leftText = startContainer.textContent.substring(0, startOffset);
				rightText = startContainer.textContent.substring(startOffset+1, endOffset+1);
			}
			console.log('node', node);
			console.log('leftText', leftText);
			console.log('rightText', rightText);
			let startNextSibling = (tool?.nextSibling || anchorNode.nextSibling || endContainer.nextSibling);
			let startPrevSibling = (tool?.previousSibling || anchorNode.previousSibling || startContainer.previousSibling);
			console.log(anchorNode.nextElementSibling);
			console.log(anchorNode.previousElementSibling);

			if(startPrevSibling && startPrevSibling.nodeType == Node.TEXT_NODE){
				//startPrevSibling.replaceData(startPrevSibling.textContent + startTextSpan.textContent);
				//range.setStart(startPrevSibling, startPrevSibling.textContent.length);
				//range.insertNode(startText)
				if(rightText){
					let rightTool = new TargetTool();
					rightTool.textContent = rightText;
					startPrevSibling.after(rightTool);
				}
				startPrevSibling.after(node);
				if(leftText){
					let leftTool = new TargetTool()
					leftTool.textContent = leftText 
					startPrevSibling.after(leftTool);
				}
			}else if(startNextSibling && startNextSibling.nodeType == Node.TEXT_NODE){
				//startNextSibling.replaceData(startTextSpan.textContent + startNextSibling.textContent);
				//range.setStart(startNextSibling, 0);
				//range.insertNode(startText)
				if(leftText){
					let leftTool = new TargetTool()
					leftTool.textContent = leftText 
					startNextSibling.before(leftTool);
				}
				startNextSibling.before(node);
				if(rightText){
					let rightTool = new TargetTool();
					rightTool.textContent = rightText;
					startNextSibling.before(rightTool);
				}
			}else{
				if(leftText){
					let leftTool = new TargetTool()
					leftTool.textContent = leftText 
					this.append(leftTool);
				}
				this.append(document.createTextNode(node));
				if(rightText){
					let rightTool = new TargetTool();
					rightTool.textContent = rightText;
					this.append(leftTool);
				}
			}
			tool.remove();
		})
	}
	async cancelTool2(TargetTool, selection){
		return await new Promise(resolve => {
			console.log('selection', selection);
			let {isCollapsed, anchorNode, anchorOffset} = selection; 
			let tool = Line.getTool(anchorNode, TargetTool);
			if( ! tool){
				resolve(tool)
			}
			
			let range = selection.getRangeAt(0);
			console.log('range', range);
			let startTextFragment = range.extractContents();
			let {startOffset, endOffset, startContainer, endContainer} = range;
			let startNextSibling = (tool?.nextSibling || anchorNode.nextSibling || endContainer.nextSibling);
			let startPrevSibling = (tool?.previousSibling || anchorNode.previousSibling || startContainer.previousSibling);

			console.log('startContainer ::: ', startContainer);
			console.log('startNextSibling ::: ', startNextSibling);
			console.log('startNextSibling data ::: ', startNextSibling?.textContent);
			console.log('startPrevSibling ::: ', startPrevSibling);
			console.log('startPrevSibling data ::: ', startPrevSibling?.textContent);
			//throw new Error();
			//range.setStart(startContainer, startOffset);
			//range.setEnd(startContainer, startContainer.textContent.length);
			//range.insertNode(startTextSpan);
			console.log(startTextFragment);
			let node = [...startTextFragment.childNodes].filter(e=> e.nodeType == Node.TEXT_NODE && e.textContent != undefined).map(e=>{
				return e.textContent
			}).join('');
			if(startPrevSibling && startPrevSibling.nodeType == Node.TEXT_NODE){
				//startPrevSibling.replaceData(startPrevSibling.textContent + startTextSpan.textContent);
				//range.setStart(startPrevSibling, startPrevSibling.textContent.length);
				//range.insertNode(startText)
				startPrevSibling.appendData(node);
			}else if(startNextSibling && startNextSibling.nodeType == Node.TEXT_NODE){
				//startNextSibling.replaceData(startTextSpan.textContent + startNextSibling.textContent);
				//range.setStart(startNextSibling, 0);
				//range.insertNode(startText)
				startNextSibling.appendData(node);
			}else{
				//this.append(document.createTextNode(startTextSpan.textContent));
			}
			
			//range.insertNode(document.createTextNode(node));

			console.log('130 ::: startContainer',startContainer)

			let endLine = Line.getLine(endContainer);
			let endTool = Line.getTool(endContainer, TargetTool);
			resolve(startContainer)
			/*
			if(startContainer !== endContainer){
				let targetLine = this.nextElementSibling; 
				while(targetLine){
					let targetToolList = targetLine.querySelectorAll(`.${TargetTool.options.defaultClass}`);
					if(targetToolList.length == 0){
						continue;
					}
					let textNodeList = [...targetToolList].map(targetTool=>{
						let targetTextSpan = document.createElement('span');
						range.selectNodeContents(targetTool);
						range.surroundContents(targetTextSpan);
						let targetTextNode = document.createTextNode(targetTextSpan.textContent);
						targetTool.remove();
						return targetTextNode;
					});
					targetLine.append(...textNodeList);

					targetLine = targetLine.nextElementSibling;
					if(targetLine === endLine){
						break;
					}
				}
				let endTextSpan = document.createElement('span');
				
				range.setStart(endContainer, 0);
				range.setEnd(endContainer, endOffset)
				range.surroundContents(endTextSpan);
				let endTextNode = document.createTextNode(endTextSpan.textContent);
				if(endContainer.nextSibling && endContainer.nextSibling.nodeType == Node.TEXT_NODE){
					endContainer.nextSibling.appendData(endTextNode.textContent);
				}else{
					endLine.prepend(endTextNode);
				}
				endTool.remove();
				resolve(endTextNode);
			}else{
				resolve(startTextNode);
			}
			*/
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