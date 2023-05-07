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
		}else if(element.classList?.contains(this.options.defaultClass)){
			return element;
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
		}else if(element.classList?.contains(TargetTool.options.defaultClass)){
			return element
		}else if(element.parentElement.classList.contains(TargetTool.options.defaultClass)){
			tool = element.parentElement;
		}else{
			tool = element.parentElement.closest(`.${TargetTool.options.defaultClass}`);
		}
		return tool;
	}
	static findTool(element, TargetTool){
		return element.querySelector(`.${TargetTool.options.defaultClass}`);
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
	 * applyTool, cancelTool에서 3가지 경우의 수로 함수를 분기시킬 것 apply mng와 cancel mng class를 새로 만들것, 
	 * line이 할 일이 아니니 freedomPlusEditor로 옮길 것
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
	 * tool이 좌우 옆 또는 자식, 부모에서 동일한 tool임을 감지할 때 합치는 로직 필요
	 */
	/**
	 * 
	 * @param {*} tool 
	 * @param {*} range 
	 * @returns 
	 */
	async #applyOnlyOneTool(tool, range){
		return await new Promise(resolve=>{
			range.surroundContents(tool);
			resolve(tool)
		});
	}
	
	async #applyOnlyOneLine(range, tool, TargetTool){
		return await new Promise(resolve=>{
			let {startOffset, endOffset, startContainer,endContainer} = range;

			range.setStart(startContainer, startOffset);
			range.setEnd(startContainer, startContainer.textContent.length);
			range.surroundContents(tool);

			let targetNode = startContainer.nextSibling
			//let lastPrevTool = undefined;
			while(targetNode){
				if(targetNode == endContainer){
					break;
				}
				if(targetNode.textContent == '' || TargetTool.prototype.isPrototypeOf(targetNode)){
					targetNode = targetNode.nextSibling
					continue;
				}
				//tool.append(targetNode);
				//lastPrevTool = new TargetTool();
				range.selectNodeContents(targetNode);
				range.surroundContents(new TargetTool());
				targetNode = targetNode.nextSibling
			}

			let endTool = new TargetTool();
			range.setStart(endContainer, 0);
			range.setEnd(endContainer, endOffset);
			range.surroundContents(endTool);
			resolve(endTool);
		});
	}

	async #applyMultipleLineAll(range, tool, TargetTool, endLine){
		return await new Promise(resolve=>{
			let {startOffset, endOffset, startContainer,endContainer} = range;

			range.setStart(startContainer, startOffset);
			range.setEnd(startContainer, startContainer.textContent.length);
			range.surroundContents(tool);
			// 분할 적용 되지 않도록 합친다 ex(<b>1</b><b>2</b> => <b>12</b>) 

			let targetStartLineItem = startContainer.nextSibling.nextSibling;
			if(targetStartLineItem){
				let itemRemoveList = [];
				let itemAppendList = [];
				while(targetStartLineItem){
					if(targetStartLineItem.nodeType == Node.ELEMENT_NODE){
						tool.append(targetStartLineItem);
						/*let firstTextNode = [...targetStartLineItem.childNodes].find(e=>e.nodeType == Node.TEXT_NODE);
						[...tool.childNodes].filter(e=>e.nodeType == Node.TEXT_NODE).forEach(e=>{
							//firstTextNode.appendData(e.data);
							e.appendData(firstTextNode.textContent);
							firstTextNode.remove();
							firstTextNode = e;
						})
						targetStartLineItem.append(firstTextNode)
						*/
					}else{
						itemAppendList.push(targetStartLineItem.textContent);
						itemRemoveList.push(targetStartLineItem);
					}
					targetStartLineItem = targetStartLineItem.nextSibling;
				}
				[...tool.childNodes].find(e=>e.nodeType == Node.TEXT_NODE)?.appendData(itemAppendList.join(''));
				itemRemoveList.forEach(e=>e.remove())
			}
			
			let targetLine = Line.getLine(startContainer).nextElementSibling; 
			while(targetLine){
				if(targetLine === endLine){
					break;
				}
				// 아래 주석 지우지 말 것, 중첩 자식 요소에서 미동작 또는 오류 발생시 아래 로직 주석 풀고 테스트 해볼 것
				// let middleTool = new TargetTool();
				// middleTool.append(...targetLine.childNodes);
				// targetLine.append(middleTool);
				let middleTargetTool = new TargetTool()
				range.selectNodeContents(targetLine);
				range.surroundContents(middleTargetTool);
				targetLine = targetLine.nextElementSibling;
			}
			let endTool = new TargetTool();
			range.setStart(endContainer, 0);
			range.setEnd(endContainer, endOffset);
			range.surroundContents(endTool);
			// 분할 적용 되지 않도록 합친다 ex(<b>1</b><b>2</b> => <b>12</b>) 
			let targetEndLineItem = endContainer.previousSibling;
			if(targetEndLineItem){
				let itemRemoveList = [];
				let itemAppendList = [];
				while(targetEndLineItem){
					if(targetEndLineItem.nodeType == Node.ELEMENT_NODE){
						endTool.prepend(targetEndLineItem);
						/*
						let firstTextNode = [...targetEndLineItem.childNodes].find(e=>e.nodeType == Node.TEXT_NODE);
						let moveTextList = [...endTool.childNodes].filter(e=>e.nodeType == Node.TEXT_NODE)
						moveTextList.forEach(e=>{
							e.textContent = firstTextNode.textContent + e.data
							firstTextNode.remove();
							firstTextNode = e;
						})
						targetEndLineItem.append(firstTextNode);
						*/
					}else{
					//endTool.prepend(document.createTextNode(targetEndLineItem.textContent));
						itemRemoveList.push(targetEndLineItem);
						itemAppendList.unshift(targetEndLineItem.textContent)
					}
					targetEndLineItem = targetEndLineItem.previousSibling;
				}
				//let targetTextNode = [...endTool.childNodes].find(e=>e.nodeType == Node.TEXT_NODE)
				//itemAppendList.push(targetTextNode.data);
				//targetTextNode.textContent = itemAppendList.join('');
				//endTool.append(targetTextNode)
				[...endTool.childNodes].find(e=>e.nodeType == Node.TEXT_NODE)?.appendData(itemAppendList.join(''));
				//endTool.prepend(document.createTextNode(itemAppendList.join('')))
				//itemRemoveList.forEach(e=>e.remove())
			}

			resolve(endTool);
		})
	}

	/**
	 * 
	 * @param {*} TargetTool 
	 * @param {*} range 
	 * @returns 
	 */
	async applyTool(TargetTool, range, endLine){
		return await new Promise(resolve => {
			let tool = new TargetTool();
			let {startOffset, endOffset, startContainer,endContainer} = range;
			if(startContainer === endContainer){
				console.log('applyOnlyOneTool');
				this.#applyOnlyOneTool(tool, range).then(tool=>{
					resolve(tool)
				})
			}else if(Line.getLine(startContainer) === Line.getLine(endContainer)){
				console.log('applyOnlyOneLine')
				this.#applyOnlyOneLine(range, tool, TargetTool).then(endTool => {
					resolve(endTool)
				})
			}else{
				console.log('applyMultipleLineAll')
				this.#applyMultipleLineAll(range, tool, TargetTool, endLine).then(endTool => {
					resolve(endTool)
				})
			}
		})
	}

	async #cancelOnlyOneTool(range, tool, TargetTool){
		return await new Promise(resolve => {
			// this로 childern 돌려서 TargetTool 타입 체크랑 nodeType로 바깥으로 빼는 로직 만들기
			let {startOffset, endOffset, startContainer, endContainer} = range;
			const fun = (element) => {
				new Promise(res=>{
					
					if(TargetTool.prototype.isPrototypeOf(element)){
						if(element.nextSibling){
							element.nextSibling.before(...element.childNodes);
						} else if(element.previousSibling){
							element.previousSibling.after(...element.childNodes);
						}else {
							element.parentElement.append(...element.childNodes);
						}
						element.remove();
					}else{
						element.childNodes.forEach(e=>{
							fun(e);
						})
					}
					res();
				})
				/*
				console.log('element',element);
				console.log('lement.parentElement',element.parentElement);
				element.childNodes.forEach(e=>{
					let parent = element.parentElement;

					if(TargetTool.prototype.isPrototypeOf(e)){
						fun(e);
					}else if(e.nodeType == Node.TEXT_NODE){
						console.log(4)
						parent.append(e);
						
						if(parent.nextSibling){
							console.log(1)
							console.log(element.nextSibling);
							parent.nextSibling.before(e);
						} else if(parent.previousSibling){
							console.log(2)
							parent.previousSibling.after(e);
						}else {
							console.log(3)
							this.append(e);
						}
						
					}
				});
				if(TargetTool.prototype.isPrototypeOf(element)){
					element.remove();
				}*/
			}
			this.childNodes.forEach(e=>{
				fun(e);
			});
			/*
			let textNode = document.createTextNode(range.toString());
			let startNextSibling = (tool?.nextSibling  || endContainer.nextSibling);
			let startPrevSibling = (tool?.previousSibling || startContainer.previousSibling);
			if(startPrevSibling && startPrevSibling.nodeType == Node.TEXT_NODE){
				console.log(1)
				startPrevSibling.after(textNode);
			}else if(startNextSibling && startNextSibling.nodeType == Node.TEXT_NODE){
				console.log(2)
				startNextSibling.before(textNode);
			}else{
				console.log(3)
				this.append(textNode);
			}
			*/
			//tool.remove();
			resolve();
		});
	}
	async #cancelOnlyOneItem(range, tool, TargetTool){
		return await new Promise(resolve => {
			let {startOffset, endOffset, startContainer, endContainer} = range;
			let textNode = document.createTextNode(startContainer.textContent.substring(startOffset, endOffset));
			let startNextSibling = (tool?.nextSibling  || endContainer.nextSibling);
			let startPrevSibling = (tool?.previousSibling || startContainer.previousSibling);

			let offset = endOffset - startOffset;

			let leftText = undefined;
			let rightText = undefined;
			if(startContainer.textContent.length != offset){
				leftText = startContainer.textContent.substring(0, startOffset);			
				rightText = offset <= 1 ? startContainer.textContent.substring(startOffset + 1) : startContainer.textContent.substring(startOffset + 1, offset);	
			}
			if(startPrevSibling && startPrevSibling.nodeType == Node.TEXT_NODE){
				console.log(1)
				if(rightText){
					let rightTool = new TargetTool();
					rightTool.textContent = rightText;
					startPrevSibling.after(rightTool);
				}
				startPrevSibling.after(textNode);
				if(leftText){
					let leftTool = new TargetTool()
					leftTool.textContent = leftText 
					startPrevSibling.after(leftTool);
				}
			}else if(startNextSibling && startNextSibling.nodeType == Node.TEXT_NODE){
				console.log(2)
				if(leftText){
					let leftTool = new TargetTool()
					leftTool.textContent = leftText 
					startNextSibling.before(leftTool);
				}
				startNextSibling.before(textNode);
				if(rightText){
					let rightTool = new TargetTool();
					rightTool.textContent = rightText;
					startNextSibling.before(rightTool);
				}
			}else{
				console.log(3)
				if(leftText){
					let leftTool = new TargetTool()
					leftTool.textContent = leftText 
					this.append(leftTool);
				}
				this.append(document.createTextNode(textNode));
				if(rightText){
					let rightTool = new TargetTool();
					rightTool.textContent = rightText;
					this.append(rightTool);
				}
			}
			//startContainer.remove();
			tool.remove();
			resolve();
		});
	}

	async #cancelMultipleLineAll(range, tool, TargetTool, endLine){
		return await new Promise(resolve => {
			let {startOffset, endOffset, startContainer, endContainer} = range;
			
			let endTool = Line.getTool(endContainer, TargetTool);

			// 파이어폭스에서 startContainer, endContainer가 나노 미세 컨트롤로 커서 위치와 관계 없이 비정상 동작 하는 현상 수정 필요
			let startTextNode = document.createTextNode(startContainer.textContent.substring(startOffset, startContainer.textContent.length));
			let endTextNode = document.createTextNode(endContainer.textContent.substring(0, endOffset));
			
			let startLeftText = startContainer.textContent.substring(0, startOffset);
			let endRightText = endContainer.textContent.substring(endOffset, endContainer.textContent.length)

			let startNextSibling = tool?.nextSibling
			let startPrevSibling = tool?.previousSibling

			let endNextSibling = endTool?.nextSibling
			let endPrevSibling = endTool?.previousSibling

			if(startOffset == 0){
				this.#findCancels(this, TargetTool);
			}else if(startPrevSibling && startPrevSibling.nodeType == Node.TEXT_NODE){
				startPrevSibling.after(startTextNode);
				if(startLeftText){
					let leftTool = new TargetTool()
					leftTool.textContent = startLeftText 
					startPrevSibling.after(leftTool);
				}
			}else if(startNextSibling && startNextSibling.nodeType == Node.TEXT_NODE){
				if(startLeftText){
					let leftTool = new TargetTool()
					leftTool.textContent = startLeftText 
					startNextSibling.before(leftTool);
				}
				startNextSibling.before(startTextNode);
			}else{
				if(startLeftText){
					let leftTool = new TargetTool()
					leftTool.textContent = startLeftText 
					this.append(leftTool);
				}
				this.append(startTextNode);
			}
			if(tool){
				tool.remove();
			}

			let nextLine = this.nextElementSibling
			while(nextLine){
				if(nextLine == endLine){
					break;
				}
				nextLine.childNodes.forEach(e=>{
					this.#findCancels(e, TargetTool);
				})
				nextLine = nextLine.nextElementSibling;
			}

			if(endOffset == endContainer.length){
				this.#findCancels(endLine, TargetTool);
			}else if(endPrevSibling && endPrevSibling.nodeType == Node.TEXT_NODE){
				if(endRightText){
					let rightTool = new TargetTool();
					rightTool.textContent = endRightText;
					endPrevSibling.after(rightTool);
				}
				endPrevSibling.after(endTextNode);
			}else if(endNextSibling && endNextSibling.nodeType == Node.TEXT_NODE){
				endNextSibling.before(endTextNode);
				if(endRightText){
					let rightTool = new TargetTool();
					rightTool.textContent = endRightText;
					endNextSibling.after(rightTool);
				}
			}else{
				endLine.append(endTextNode);
			}

			if(endTool){
				endTool.remove();
			}
			resolve();
		});
	}

	async cancelTool(TargetTool, selection, endLine){
		return await new Promise(resolve => {
			let {isCollapsed, anchorNode, anchorOffset} = selection;
			let range = selection.getRangeAt(0);
			let {startOffset, endOffset, startContainer, endContainer, commonAncestorContainer} = range;
			let tool = Line.getTool(startContainer, TargetTool);
			if(startContainer === endContainer){
				// 범위 중 일부
				this.#cancelOnlyOneItem(range, tool, TargetTool).then(()=>{
					console.log('cancelOnlyOneItem')
					resolve();
				})
			}else if(Line.getLine(startContainer) === Line.getLine(endContainer)){
				// 하나만
				// tool 범위 전체 선택인 경우
				this.#cancelOnlyOneTool(range, tool, TargetTool).then(()=>{
					console.log('cancelOnlyOneTool')
					resolve();
				})
			}else{
				this.#cancelMultipleLineAll(range, tool, TargetTool, endLine).then(()=>{
					console.log('cancelMultipleLineAll')
					resolve();
				}).catch(err=>console.error(err))
			}
			
			resolve();
		})
	}

	#findCancels(element, TargetTool){
		new Promise(res=>{
			if(TargetTool.prototype.isPrototypeOf(element)){
				if(element.nextSibling){
					element.nextSibling.before(...element.childNodes);
				} else if(element.previousSibling){
					element.previousSibling.after(...element.childNodes);
				}else {
					element.parentElement.append(...element.childNodes);
				}
				element.remove();
			}else{
				element.childNodes.forEach(e=>{
					this.#findCancels(e, TargetTool);
				})
			}
			res();
		})
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