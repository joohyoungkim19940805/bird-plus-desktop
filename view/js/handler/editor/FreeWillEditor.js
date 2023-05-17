import Components from "./module/Components"
import Strong from "./tools/Strong"
import Color from "./tools/Color"
import Background from "./tools/Background"
import Strikethrough from "./tools/Strikethrough"

export default class FreeWillEditor extends HTMLDivElement {
	#isLoaded = false;
	#prevParent;
	components;
	tools;
	toolsElement = {};
	#placeholder;
	#firstLine;
	static Components = Components
	
	/**
	 * 
	 * @param {Object} components 
	 * @param {Ojbect} tools 
	 */
	constructor(
		components={
			'free-will-line' : FreeWillEditor.Components.Line
		},
		tools={
			'free-will-strong' : Strong,
			'free-will-color' : Color,
			'free-will-background' : Background,
			'free-will-strikethrough' : Strikethrough
		}
	){
		super();
		this.components = components;
		this.tools = tools;
		console.log(tools);
		this.componentsMap = Object.entries(this.components).forEach( ([className, Component]) => {
			if(className.includes(' ')){
				throw new DOMException(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
			}
			Component.toolHandler.defaultClass = className;
			window.customElements.define(className, Component, {extends:Component.toolHandler.extendsElement});
			//obj[Component.constructor.name] = Component;
			//return obj;
		})
		this.toolsMap = Object.entries(this.tools).reduce( (obj, [className, Tool]) => {
			if(className.includes(' ')){
				throw new DOMException(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
			}
			Tool.toolHandler.defaultClass = className;
			this.toolsElement[className] = Tool.toolHandler.toolButton
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
			observer.observe(Tool.toolHandler.toolButton, {
				attributeFilter:['data-tool_status'],
				attributeOldValue:true
			})
			
			//Tool.toolHandler.toolButton.addEventListener('click', (event) => this.#toolsClickEvent(event, Tool))
			window.customElements.define(className, Tool, Tool.toolHandler.extendsElement && Tool.toolHandler.extendsElement != '' ? {extends:Tool.toolHandler.extendsElement} : undefined);
			obj[Tool.constructor.name] = Tool;
			return obj;
		}, {})

		let observer = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => {
				
				if(this.innerText.length <= 1 && (this.innerText.includes('\u200B') || this.innerText.includes('\n'))){
					this.#firstLine.setAttribute('placeholder', this.#placeholder);
				}else if(this.innerText.charAt(0) != '\u200B' && this.innerText.length > 0){
					this.#firstLine.removeAttribute('placeholder');
				}

				if(this.childElementCount == 0){
					this.#startFirstLine();
				}
			})
		});
		observer.observe(this, {
			characterData: true,
			characterDataOldValue: true,
			childList:true,
			subtree: true
		})
	}
	#startFirstLine(){
		let line = new FreeWillEditor.Components.Line();
		line.isFirstLine = true;
		line.setAttribute('placeholder', this.#placeholder);
		this.#firstLine = line;
		this.append(line);
		return line;
	}
	connectedCallback(){
		if( ! this.#isLoaded){
            this.#isLoaded = true;
			this.contentEditable = true;
			this.tabIndex = 1;
			this.focus()
			this.#startFirstLine();
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
		let targetLine = FreeWillEditor.Components.Line.getLine(targetElement);
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
			//let emptyElement = document.createTextNode('\u200B')
			//targetElement.textContent = '\u200B'; //.append(emptyElement)
		}
		
		range.selectNodeContents(targetElement)
		range.setStart(targetElement, targetElement.length);
		range.setEnd(targetElement, targetElement.length);
		selection.removeAllRanges()
		selection.addRange(range)
		targetElement.removeAttribute('tabIndex');
		//cursor
		/*
		let observer = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => {
				if(mutation.target.textContent.includes('\u200B')){
					if(targetElement.toolHandler && targetElement.toolHandler.toolButton ? true: false){
						targetElement.toolHandler.toolButton.setAttribute('data-is_alive', '');
					}
					mutation.target.textContent = mutation.target.textContent.replace('\u200B', '');
					console.log('146 :: targetElement.isConnected',targetElement.isConnected);
					console.log('147 :: targetElement',targetElement);
					if(targetElement.isConnected){
						selection.modify('move', 'forward', 'line')
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
		*/
	}

	#renderingTools(TargetTool){
		let selection = window.getSelection();
		let {anchorNode, focusNode} = selection; 
		//if( ! anchorNodeLine || ! focusNodeLine){
		//	return;
		//}
		let startAndEndLineFindObject;
		if(anchorNode == this){
			let allLine = this.querySelectorAll(`.${FreeWillEditor.Components.Line.toolHandler.defaultClass}`)
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
			let anchorNodeLine = FreeWillEditor.Components.Line.getLine(anchorNode);
			let focusNodeLine = FreeWillEditor.Components.Line.getLine(focusNode);
			startAndEndLineFindObject = [...this.querySelectorAll(`.${FreeWillEditor.Components.Line.toolHandler.defaultClass}`)].reduce((obj,item,index)=>{
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
		startLine.applyTool(TargetTool, selection.getRangeAt(0), endLine)
		/*
		.then(tool=>{
			this.querySelectorAll(`.${TargetTool.toolHandler.defaultClass}`).forEach(async e =>{
				await new Promise(resolve=>{
					resolve();
				})
			})
			//this.#addAfterSelectionMove(tool);
		});
		*/
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
			let allLine = this.querySelectorAll(`.${FreeWillEditor.Components.Line.toolHandler.defaultClass}`)
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
			let anchorNodeLine = FreeWillEditor.Components.Line.getLine(anchorNode);
			let focusNodeLine = FreeWillEditor.Components.Line.getLine(focusNode);
			startAndEndLineFindObject = [...this.querySelectorAll(`.${FreeWillEditor.Components.Line.toolHandler.defaultClass}`)].reduce((obj,item,index)=>{
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
			this.querySelectorAll(`.${TargetTool.toolHandler.defaultClass}`).forEach(async e =>{
				await new Promise(resolve=>{
					resolve();
				})
			})
			console.log(textNode);
			//console.log(textNode)
			//this.#removeAfterSelectionMove(textNode);
		}).catch(e=>console.error(e));
	}

	set placeholder(placeholder){
		this.#placeholder = placeholder;
		if(this.#firstLine){
			this.#firstLine.setAttribute('placeholder', this.#placeholder);
		}
	}

	get firstLine(){
		return this.#firstLine;
	}
}
