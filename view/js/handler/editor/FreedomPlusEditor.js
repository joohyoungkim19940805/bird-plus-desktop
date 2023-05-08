import Components from "./module/Components"
/**
 * 전부 다 지우면 line 객체가 사라지는 문제 해결 필요 20230409
 */
export default class FreedomPlusEditor extends HTMLDivElement {
	#isLoaded = false;
	#prevParent;
	components;
	tools;
	toolsElement = {};
	showToolsWrap = undefined;

	static Components = Components
	
	/**
	 * 
	 * @param {Object} components 
	 * @param {Ojbect} tools 
	 */
	constructor(
		components={
			'freedom-line' : FreedomPlusEditor.Components.Line
		},
		tools
	){
		super();
		this.components = components;
		this.tools = tools;
		console.log(tools);
		this.componentsMap = Object.entries(this.components).forEach( ([className, Component]) => {
			if(className.includes(' ')){
				throw new DOMException(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
			}
			Component.options.defaultClass = className;
			window.customElements.define(className, Component, {extends:Component.options.extendsElement});
			//obj[Component.constructor.name] = Component;
			//return obj;
		})
		this.toolsMap = Object.entries(this.tools).reduce( (obj, [className, Tool]) => {
			if(className.includes(' ')){
				throw new DOMException(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
			}
			console.log(Tool);
			console.log(Tool.options);
			console.log(Tool.options.defaultClass);
			Tool.options.defaultClass = className;
			this.toolsElement[className] = Tool.options.showTools
			let observer = new MutationObserver( (mutationList, observer) => {
				mutationList.forEach((mutation) => {
					let focusNode = window.getSelection().focusNode;
					if(mutation.target.dataset.tool_status == 'active' && mutation.oldValue != 'active' && Tool.prototype.isPrototypeOf(focusNode.parentElement) == false){
						this.#renderingTools(Tool);
					}else if(mutation.target.dataset.tool_status == 'cancel' && mutation.oldValue != 'cancel'){
						this.#removerToos(Tool);
					}
				});
			});
			// attribute에 value가 없어서 oldvalue가 ''이 나옵니다.
			// oldvalue로 구분할 수 있게 합시다.
			observer.observe(Tool.options.showTools, {
				attributeFilter:['data-tool_status'],
				attributeOldValue:true
			})
			
			//Tool.options.showTools.addEventListener('click', (event) => this.#toolsClickEvent(event, Tool))
			window.customElements.define(className, Tool, Tool.options.extendsElement ? {extends:Tool.options.extendsElement} : undefined);
			obj[Tool.constructor.name] = Tool;
			return obj;
		}, {})
	}
	connectedCallback(){
		if( ! this.#isLoaded){
            this.#isLoaded = true;
			this.contentEditable = true;
			//this.tabIndex = '';
			let line = new FreedomPlusEditor.Components.Line();
			this.append(line);
			// 최초에 첫번째 추가 된 line에 빈 element를 삽입하여 포커싱 되도록 한다.
			this.#addAfterSelectionMove(line); 
			/*
			if(parseInt(window.getComputedStyle(line).height) == 0 || window.getComputedStyle(line).height == 'auto'){
				line.style.minHeight = '1rem';
				let isFirstKeyUp = false;
				console.log(111)
				line.addEventListener('keyup',(e) => {
					console.log('event >>>> ',e)
					console.log('???');
					if(isFirstKeyUp == false){
						isFirstKeyUp = true;
						line.style.minHeight = '';
					}
				})
			}
			*/
			
			this.#showTools(this.showToolsWrap);
			/*
			// 온키업인 경우 엔터로 얻는 엘레멘탈을 이어받나? = 아니었음
			this.onkeyup = Object.freeze( (event) => {
				console.log(event)
				console.log(window.getSelection());
				console.log(window.getSelection().toString())
				console.log(window.getSelection().getRangeAt(0))
				//console.log(window.getSelection().getRangeAt(1))
			});
			this.onselectstart = Object.freeze( (event) => {
				console.log(event)
				console.log(window.getSelection())
				console.log(window.getSelection().toString())
			});
			this.onmouseup = Object.freeze( (event) => {
				console.log(event);
				console.log(window.getSelection())
				console.log(window.getSelection().toString())
			});
			*/
			// getSelection - isCollapsed이 true인 경우 선택 된 텍스트가 없음, false = 있음
		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
		this.contentEditable = false;
    }

	#removeAfterSelectionMove(targetElement){
		console.log(targetElement);
		let selection = document.getSelection()
		let range =  new Range();//document.createRange()
		let targetLine = FreedomPlusEditor.Components.Line.getLine(targetElement);
		range.setStartAfter(targetLine)
		range.setEnd(targetLine, targetElement.textContent.length - 1);
		selection.removeAllRanges()
		selection.addRange(range) 
	}

	#addAfterSelectionMove(targetElement){
		let selection = document.getSelection()
		let range =  new Range();//document.createRange()
		if( ! targetElement){
		//	return;
		}
		if(targetElement && targetElement.nodeType == Node.ELEMENT_NODE && targetElement.textContent.length == 0){
			let emptyElement = document.createTextNode('\u200B')
			targetElement.append(emptyElement)
		}
		
		targetElement.tabIndex = 1;
		range.selectNodeContents(targetElement)
		range.setStart(targetElement, targetElement.length);
		range.setEnd(targetElement, targetElement.length);
		selection.removeAllRanges()
		selection.addRange(range)
		selection.modify('move', 'forward', 'character')
		selection.setPosition(targetElement, 1)
		targetElement.removeAttribute('tabIndex');
		//cursor
		let observer = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => {
				if(mutation.target.textContent.includes('\u200B')){
					if(targetElement.options && targetElement.options.showTools ? true: false){
						targetElement.options.showTools.setAttribute('data-is_alive', '');
					}
					mutation.target.textContent = mutation.target.textContent.replace('\u200B', '');
					console.log('146 :: targetElement.isConnected',targetElement.isConnected);
					console.log('147 :: targetElement',targetElement);
					if(targetElement.isConnected){
						//window.getSelection().modify('move', 'forward', 'line')
						try{
							//firefox는 paragraphboundary 지원 X
							selection.modify('move', 'forward', 'paragraphboundary')
						}catch{
							selection.modify('move', 'forward', 'line')
						}finally{
							//range.selectNodeContents(targetElement)
							//range.setStart(targetElement, targetElement.length);
							//range.setEnd(targetElement, targetElement.length);
						}
						//window.getSelection().setPosition(targetElement, targetElement.length + 1)
						//range.selectNodeContents(targetElement)
						//selection.removeAllRanges()
						//selection.addRange(range) 
						//argetElement.focus();
					}
					targetElement.removeAttribute('tabIndex');
					observer.disconnect();
				}else{
					targetElement.removeAttribute('tabIndex');
					observer.disconnect();
				}
			});
		})

		observer.observe(targetElement, {
			characterData: true,
			characterDataOldValue: true,
			childList:true,
			subtree: true
		})
	}

	#showTools(wrap){
		console.log(wrap);
		if( ! wrap instanceof HTMLElement || ! wrap){
			throw new Error(`args is not element`);
		}
		let toolsList = Object.values(this.toolsElement);
		wrap.append(...toolsList);
		this.insertAdjacentElement('beforebegin', wrap);
	}

	#renderingTools(TargetTool){
		let selection = window.getSelection();
		let {anchorNode, focusNode} = selection; 
		//if( ! anchorNodeLine || ! focusNodeLine){
		//	return;
		//}
		let startAndEndLineFindObject;
		if(anchorNode == this){
			let allLine = this.querySelectorAll(`.${FreedomPlusEditor.Components.Line.options.defaultClass}`)
			startAndEndLineFindObject = {
				startLine : allLine[0],
				endLine : allLine[allLine.length - 1]
			}
			let range = selection.getRangeAt(0);
			selection.removeAllRanges();
			range.setStart(startAndEndLineFindObject.startLine.childNodes[0], 0);
			range.setEnd(startAndEndLineFindObject.endLine.childNodes[0], startAndEndLineFindObject.endLine.childNodes[0].textContent.length);
			selection.addRange(range);
		}else{
			let anchorNodeLine = FreedomPlusEditor.Components.Line.getLine(anchorNode);
			let focusNodeLine = FreedomPlusEditor.Components.Line.getLine(focusNode);
			startAndEndLineFindObject = [...this.querySelectorAll(`.${FreedomPlusEditor.Components.Line.options.defaultClass}`)].reduce((obj,item,index)=>{
				if(item == anchorNodeLine || item == focusNodeLine){
					let key = 'startLine';
					if(obj.hasOwnProperty(key)){
						obj['endLine'] = item
					}else{
						obj[key] = item
					}
				}
				return obj;
			},{})
		}
		let {startLine, endLine} = startAndEndLineFindObject;
		startLine.applyTool(TargetTool, selection.getRangeAt(0), endLine).then(tool=>{
			this.querySelectorAll(`.${TargetTool.options.defaultClass}`).forEach(async e =>{
				await new Promise(resolve=>{
					resolve();
				})
			})
			this.#addAfterSelectionMove(tool);
		});

	}

	#removerToos(TargetTool){
		let selection = window.getSelection();
		let {isCollapsed,anchorNode, focusNode} = selection;
		// 범위 선택 x인 경우 넘어가기
		if(isCollapsed){
			return;
		}
		let startAndEndLineFindObject;
		if(anchorNode == this){
			let allLine = this.querySelectorAll(`.${FreedomPlusEditor.Components.Line.options.defaultClass}`)
			startAndEndLineFindObject = {
				startLine : allLine[0],
				endLine : allLine[allLine.length - 1]
			}
			let range = selection.getRangeAt(0);
			selection.removeAllRanges();
			range.setStart(startAndEndLineFindObject.startLine.childNodes[0], 0);
			range.setEnd(startAndEndLineFindObject.endLine.childNodes[0], startAndEndLineFindObject.endLine.childNodes[0].textContent.length);
			selection.addRange(range);
		}else{
			let anchorNodeLine = FreedomPlusEditor.Components.Line.getLine(anchorNode);
			let focusNodeLine = FreedomPlusEditor.Components.Line.getLine(focusNode);
			startAndEndLineFindObject = [...this.querySelectorAll(`.${FreedomPlusEditor.Components.Line.options.defaultClass}`)].reduce((obj,item,index)=>{
				if(item == anchorNodeLine || item == focusNodeLine){
					let key = 'startLine';
					if(obj.hasOwnProperty(key)){
						obj['endLine'] = item
					}else{
						obj[key] = item
					}
				}
				return obj;
			},{})
		}
		let {startLine, endLine} = startAndEndLineFindObject;
		startLine.cancelTool(TargetTool, selection, endLine).then(textNode => {
			this.querySelectorAll(`.${TargetTool.options.defaultClass}`).forEach(async e =>{
				await new Promise(resolve=>{
					resolve();
				})
			})
			console.log(textNode);
			//console.log(textNode)
			//this.#removeAfterSelectionMove(textNode);
		}).catch(e=>console.error(e));
	}
}
