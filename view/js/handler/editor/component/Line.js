import ToolHandler from "../module/ToolHandler"
import FreedomInterface from "../module/FreedomInterface"
export default class Line {
	#isLoaded = false;
	#prevParent;

	static toolHandler = new ToolHandler(this);

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-line'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-line';
	}

	static createDefaultStyle(){
		this.#defaultStyle.textContent = ``
		return this.#defaultStyle;
	}

	static get defaultStyle(){
        return this.#defaultStyle;
    }

    static set defaultStyle(style){
        this.#defaultStyle.textContent = style;
    }

	static set insertDefaultStyle(style){
		this.#defaultStyle.sheet.insertRule(style);
	}

	/**
	 * 
	 * @param {HTMLElement} element 
	 * @returns {HTMLElement} 
	 */
	static getLine(element){
		let line = undefined;
		if( ! element.parentElement){
			return line;
		}else if(element.classList?.contains(Line.toolHandler.defaultClass)){
			return element;
		}else if(element.parentElement.classList.contains(Line.toolHandler.defaultClass)){
			line = element.parentElement;
		}else{
			line = element.parentElement.closest(`.${Line.toolHandler.defaultClass}`);
		}
		return line;
	}
	static getTool(element, TargetTool){
		let tool = undefined;
		
		if( ! element.parentElement){
			return tool;
		}else if(element.classList?.contains(TargetTool.toolHandler.defaultClass)){
			return element
		}else if(element.parentElement.classList.contains(TargetTool.toolHandler.defaultClass)){
			tool = element.parentElement;
		}else{
			tool = element.parentElement.closest(`.${TargetTool.toolHandler.defaultClass}`);
		}

		if(! tool){
			tool = element.parentElement.querySelector(`.${TargetTool.toolHandler.defaultClass}`);
		}
		return tool;
	}
	
	static isElementTextEmpty(element){
        let sty = window.getComputedStyle(element);
		if(sty.visibility == 'hidden' || sty.opacity == 0){
			return false;
		}
		//let emptyString = (element.innerText.replace(/\n+/g, '\n') == '\n' || element.innerText.replace(/\u200B+/g, '\u200B') == '\u200B');
        return element.innerText.length == 0 || (element.innerText.length == 1 && (element.innerText == '\n' || element.innerText == '\u200B'));
    }

	lineElement

	constructor(div){
		//super();
		if( ! div){
			this.lineElement = Object.assign(document.createElement('div'),{
				className : Line.toolHandler.defaultClass
			})
		}else{
			this.lineElement = div;
			this.lineElement.classList.add(Line.toolHandler.defaultClass);
		}
		this.lineElement.dataset.is_line = '';
		/*
		Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach(functionName=>{
			if(functionName == 'constructor') return;
			this.lineElement[functionName] = this[functionName];
		});
		*/
		this.lineElement.line = this;
		/*
		this.onkeyup = (event) => {
			if(event.key === 'Backspace' && this.innerText.length == 1 && (this.innerText.includes)){

			}
		}
		*/
		/*
		let observer = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => {
				if(Line.isElementTextEmpty(this.lineElement)){
					if(this.lineElement.childElementCount != 0){
						return;
					}
					//this.lineElement.innerText = '\n';
					window.getSelection().setPosition(this.lineElement, 0)
					this.lineElement.focus();
				}
			})
		});
		observer.observe(this.lineElement, {
			childList:true,
			subtree: true
		})
		*/
	}
	/*
	connectedCallback(){
		if( ! this.#isLoaded){
            this.#isLoaded = true;

			
			if(this.innerText.length == 0 || (this.innerText.length == 1 && this.innerText.charAt(0) == '\n')){
				this.innerText = '\n';
				window.getSelection().setPosition(this, 1)
				this.focus();
			}

		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
    }
	*/
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
		return new Promise(resolve=>{
			range.surroundContents(tool);
			resolve(tool)
		});
	}
	
	async #applyOnlyOneLine(range, tool, TargetTool){
		return new Promise(resolve=>{
			let {startOffset, endOffset, startContainer,endContainer} = range;

			let selection = window.getSelection();

			let startNodeToPrevNodeIndex = [...this.lineElement.childNodes].findIndex(e=>selection.containsNode(e, true)) - 1;
			let isFirstNodeToStart = startNodeToPrevNodeIndex < 0;

			
			let nodeList = [];
			for(let i = startNodeToPrevNodeIndex + 1 ; true ; i += 1){
				if( ! this.lineElement.childNodes[i] || ! selection.containsNode(this.lineElement.childNodes[i], true)){
					break;
				}
				let iter = document.createNodeIterator(this.lineElement.childNodes[i], NodeFilter.SHOW_TEXT)
				let targetNode;
				while(targetNode = iter.nextNode()){
					if(targetNode == endContainer){
						// this.lineElement.childNodes[i] == endContainer == targetNode
						let clone = targetNode.cloneNode(true);
						clone.textContent = targetNode.textContent.substring(endOffset);
						targetNode.after(clone);
						targetNode.textContent = targetNode.textContent.substring(0, endOffset);
					}
				}
				nodeList.push(this.lineElement.childNodes[i]);
			}
			//nodeList.forEach(e=>e.remove())
			//prepend
			tool.append(...nodeList);
			if(isFirstNodeToStart){
				this.lineElement.prepend(tool)
			}else{
				let startTarget = this.lineElement.childNodes[startNodeToPrevNodeIndex];
				startTarget.after(tool);
			}
			
			/*
			range.setStart(startContainer, startOffset);
			range.setEnd(startContainer, startContainer.textContent.length);
			range.surroundContents(tool);
			
			let targetNode = startContainer.nextSibling;
			//let lastPrevTool = undefined;
			while(targetNode){
				console.log(targetNode)
				if(targetNode == endContainer){
					console.log(2)
					break;
				}
				if(targetNode.textContent == '' || TargetTool.prototype.isPrototypeOf(targetNode)){
					console.log(3)
					targetNode = targetNode.nextSibling
					continue;
				}

				console.log(targetNode);
				range.selectNode(targetNode);
				range.surroundContents(new TargetTool());
				console.log(4)
				targetNode = targetNode.nextSibling
			}

			let endTool = new TargetTool();
			range.setStart(endContainer, 0);
			range.setEnd(endContainer, endOffset);
			range.surroundContents(endTool);
			resolve(endTool);
			*/
			resolve();
		});
	}
	async #applyMultipleLineAllBlock(range, tool ,TargetTool, endLine){
		return new Promise(resolve => {
			let fragment = range.extractContents();
			tool.append(...fragment.childNodes);
			this.lineElement.append(tool);
			resolve(tool);
		})
	}
	async #applyMultipleLineAll(range, tool, TargetTool, endLine){
		return new Promise(resolve=>{
			let {startOffset, endOffset, startContainer,endContainer} = range;
			
			range.setStart(startContainer, startOffset);
			range.setEnd(startContainer, startContainer.textContent.length);
			range.surroundContents(tool);

			let targetStartLineItem = startContainer.nextSibling?.nextSibling;
			
			if(targetStartLineItem){
				let itemRemoveList = [];
				let itemAppendList = [];
				while(targetStartLineItem){
					if(targetStartLineItem.nodeType == Node.ELEMENT_NODE){
						if(tool == targetStartLineItem){
							break;
						}
						tool.append(targetStartLineItem);
						
					}else{
						itemAppendList.push(targetStartLineItem.textContent);
						itemRemoveList.push(targetStartLineItem);
					}
					targetStartLineItem = targetStartLineItem.nextSibling;	

				}
				[...tool.childNodes].find(e=>e.nodeType == Node.TEXT_NODE)?.appendData(itemAppendList.join(''));
				itemRemoveList.forEach(e=>e.remove())
			}
			
			if(tool.parentElement != this.lineElement && tool.parentElement?.nextSibling){
				//20230817 멀티라인일시 첫번쨰 라인 중첩 서식 미동작 현상 수정을 위해 내용 변경
				let nextTool = new TargetTool();
				nextTool.append(tool.parentElement.nextSibling);
				tool.parentElement.after(nextTool);
				let nextItem = nextTool.nextSibling;

				while(nextItem){		
					if(nextTool == nextItem){
						break;
					}
					nextTool.append(nextItem);

				}
			}
			
			
			let targetLine = Line.getLine(startContainer).nextElementSibling; 
			let middleTargetTool;
			
			while(targetLine){
				if(targetLine === endLine){
					break;
				}
				// 아래 주석 지우지 말 것, 중첩 자식 요소에서 미동작 또는 오류 발생시 아래 로직 주석 풀고 테스트 해볼 것
				// let middleTool = new TargetTool();
				// middleTool.append(...targetLine.childNodes);
				// targetLine.append(middleTool);
				middleTargetTool = new TargetTool()
				range.selectNodeContents(targetLine);
				range.surroundContents(middleTargetTool);
				targetLine = targetLine.nextElementSibling;

			}

			if(Line.prototype.isPrototypeOf(endContainer.line)){
				resolve(( ! middleTargetTool ? tool : middleTargetTool ));
			}else{
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
			}


		})
	}

	/**
	 * 
	 * @param {*} TargetTool 
	 * @param {*} range 
	 * @returns 
	 */
	async applyTool(TargetTool, range, endLine){
		return new Promise(resolve => {
			let tool = new TargetTool();
			let {startOffset, endOffset, startContainer,endContainer} = range;

			/*
			if(startContainer === endContainer){
				console.log('applyOnlyOneTool');
				this.#applyOnlyOneTool(tool, range).then(tool=>{
					resolve(tool)
				})
			}*/
			if(this.lineElement.childNodes.length == 1 && this.lineElement.innerText == '\n' && this.lineElement.childNodes[0].nodeName == 'BR'){
				this.lineElement.childNodes[0].remove();
			}
			if(tool.shadowRoot || ! TargetTool.toolHandler.isInline){
				resolve(this.#applyMultipleLineAllBlock(range, tool, TargetTool, endLine));
			}else if(startContainer === endContainer && this.lineElement.innerText.length != range.toString().length){
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

	async #cancelOnlyOneLine(range, tool, TargetTool){
		return new Promise(resolve => {
			// this로 childern 돌려서 TargetTool 타입 체크랑 nodeType로 바깥으로 빼는 로직 만들기
			let {startOffset, endOffset, startContainer, endContainer} = range;
			this.lineElement.childNodes.forEach(e=>{
				this.#findCancels(e, TargetTool);
			});
			resolve();
		});
	}
	async #cancelOnlyOneTool(range, tool, TargetTool){
		return new Promise(resolve => {
			let {startOffset, endOffset, startContainer, endContainer, commonAncestorContainer} = range;
			/*
			let textNode = document.createTextNode(startContainer.textContent.substring(startOffset, endOffset));
			let startNextSibling = (tool?.nextSibling  || endContainer.nextSibling);
			let startPrevSibling = (tool?.previousSibling || startContainer.previousSibling);
			*/
			let offset = endOffset - startOffset;

			let leftText = undefined;
			let rightText = undefined;
			let leftList = [];
			let rightList = [];
			let targetWrap = undefined;
			let targetText;
			if(commonAncestorContainer.nodeType == Node.TEXT_NODE && commonAncestorContainer.parentElement != this && ! TargetTool.prototype.isPrototypeOf(commonAncestorContainer.parentElement)){
				let cloneRange = range.cloneRange();
				cloneRange.selectNode(commonAncestorContainer.parentElement);
				targetText = cloneRange.cloneContents();
			}else{
				targetText = range.cloneContents();
			}

			let selection = window.getSelection()

			if(tool.childNodes.length > 1){
				let list = [...tool.childNodes];
				let index = list.findIndex(e=> selection.containsNode(e, true) || selection.containsNode(e, false))
				targetWrap = list[index]
				leftList = list.slice(0, index);
				rightList = list.slice(index + 1);
			}
			

			if(startContainer.textContent.length != offset){
				leftText = startContainer.textContent.substring(0, startOffset);			
				rightText = offset <= 1 ? startContainer.textContent.substring(startOffset + 1) : startContainer.textContent.substring(startOffset + offset);
				if(targetWrap != undefined){
					let cloneLeft = targetWrap.cloneNode(false);
					cloneLeft.textContent = leftText;
					leftText = cloneLeft; 
					let cloneRight = targetWrap.cloneNode(false);
					cloneRight.textContent = rightText;
					rightText = cloneRight; 
					targetWrap.remove();
				}else{
					leftText = document.createTextNode(leftText);
					rightText = document.createTextNode(rightText);
				}
				leftList.unshift(leftText);
				rightList.push(rightText);
			}
			//tool.replaceChildren(...leftList, targetText, ...rightList)

			let leftElement = undefined;
			if(leftList.length != 0){
				leftElement = new TargetTool();
				leftElement.append(...leftList);
			}
			let rightElement = undefined;
			if(rightList.length != 0){
				rightElement = new TargetTool();
				rightElement.append(...rightList);
			}

			let appendList = [leftElement, targetText, rightElement].filter(e=>e);
			if(tool.previousSibling){
				tool.previousSibling.after(...appendList)
			}else if(tool.nextSibling){
				tool.nextSibling.before(...appendList);
			}else{
				this.lineElement.append(...appendList);
			}
			/*
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
			}*/
			//startContainer.remove();
			tool.remove();
			resolve();
		});
	}

	async #cancelMultipleLineAll(range, tool, TargetTool, endLine){
		return new Promise(resolve => {
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
				//console.log(1)
				this.#findCancels(this.lineElement, TargetTool);
			}else
			if(startPrevSibling && startPrevSibling.nodeType == Node.TEXT_NODE){
				//console.log(2)
				startPrevSibling.after(startTextNode);
				if(startLeftText){
					let leftTool = new TargetTool()
					leftTool.textContent = startLeftText 
					startPrevSibling.after(leftTool);
				}
			}else if(startNextSibling && startNextSibling.nodeType == Node.TEXT_NODE){
				//console.log(3)
				if(startLeftText){
					let leftTool = new TargetTool()
					leftTool.textContent = startLeftText 
					startNextSibling.before(leftTool);
				}
				startNextSibling.before(startTextNode);
			}else{
				/*console.log(4)
				if(startLeftText){
					let leftTool = new TargetTool()
					leftTool.textContent = startLeftText 
					this.append(leftTool);
				}
				this.append(startTextNode);
				*/
			}
			if(tool){
				tool.remove();
			}

			let nextLine = this.lineElement.nextElementSibling;


			while(nextLine){
				if(nextLine == endLine){
					break;
				}
				nextLine.childNodes.forEach(e=>{
					//console.log(4);
					this.#findCancels(e, TargetTool);
				})
				nextLine = nextLine.nextElementSibling;

			}

			if(endOffset == endContainer.length){
				//console.log(1)
				this.#findCancels(endLine, TargetTool);
			}else
			if(endPrevSibling && endPrevSibling.nodeType == Node.TEXT_NODE){
				//console.log(2)
				if(endRightText){
					let rightTool = new TargetTool();
					rightTool.textContent = endRightText;
					endPrevSibling.after(rightTool);
				}
				endPrevSibling.after(endTextNode);
			}else if(endNextSibling && endNextSibling.nodeType == Node.TEXT_NODE){
				//console.log(3)
				endNextSibling.before(endTextNode);
				if(endRightText){
					let rightTool = new TargetTool();
					rightTool.textContent = endRightText;
					endNextSibling.after(rightTool);
				}
			}else{
				/*console.log(4)
				if(endRightText){
					let rightTool = new TargetTool();
					rightTool.textContent = endRightText;
					//endLine.append(rightTool);
				}
				endLine.prepend(endTextNode);
				*/
			}

			if(endTool){
				endTool.remove();
			}
			resolve();
		});
	}

	async cancelTool(TargetTool, selection, endLine){
		return new Promise(resolve => {
			let {isCollapsed, anchorNode, anchorOffset} = selection;
			let range = selection.getRangeAt(0);
			let {startOffset, endOffset, startContainer, endContainer, commonAncestorContainer} = range;
			let tool = Line.getTool(startContainer, TargetTool);
			/*
			if(startContainer === endContainer){
				if(startContainer.parentElement.childNodes.length == 1 
					&& startContainer.parentElement.childNodes[0] ==  startContainer
					&& startContainer.parentElement.childNodes[0] ==  endContainer
					&& endContainer.textContent.length == endOffset){
					// tool 범위 전체 선택인 경우
					this.#cancelOnlyOneLine(range, tool, TargetTool).then(()=>{
						console.log('cancelOnlyOneLine 1')
						resolve();
					})
				}else{
					// 범위 중 일부
					this.#cancelOnlyOneTool(range, tool, TargetTool).then(()=>{
						console.log('cancelOnlyOneTool')
						resolve();
					})
				}
			*/

			if( ! tool){
				TargetTool.toolHandler.toolButton.dataset.tool_status = 'connected'
				resolve();
			}else{
				if(startContainer === endContainer && this.lineElement.innerText.length != range.toString().length){
					this.#cancelOnlyOneTool(range, tool, TargetTool).then(()=>{
						console.log('cancelOnlyOneTool')
						resolve();
					})
				}else if(Line.getLine(startContainer) === Line.getLine(endContainer)){
					// 하나만
					// tool 범위 전체 선택인 경우
					this.#cancelOnlyOneLine(range, tool, TargetTool).then(()=>{
						console.log('cancelOnlyOneLine 2')
						resolve();
					})
				}else{
					this.#cancelMultipleLineAll(range, tool, TargetTool, endLine).then(()=>{
						console.log('cancelMultipleLineAll')
						resolve();
					}).catch(err=>console.error(err))
				}
				resolve();
			}
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
				if(element.nodeType == Node.ELEMENT_NODE){
					element.childNodes.forEach(e=>{
						this.#findCancels(e, TargetTool);
					})
				}
			}
			res();
		})
	}

	lookAtMe(){
		let sty = window.getComputedStyle(this.lineElement);
		if(sty.visibility == 'hidden' || sty.opacity == 0){
			return;
		}
		if(this.lineElement.innerText.length == 0 || (this.lineElement.innerText.length == 1 && this.lineElement.innerText.charAt(0) == '\n')){
			this.lineElement.innerText = '\n';
		}
		if(this.lineElement.isContentEditable){
			this.lineElement.focus()
			window.getSelection().setPosition(this.lineElement, this.lineElement.childNodes.length)
		}
	}

}