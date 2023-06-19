import Line from './component/Line'
import FreeWiilHandler from './module/FreeWiilHandler'
import UndoManager from './fragment/UndoManager'

import Strong from "./tools/Strong"
import Color from "./tools/Color"
import Background from "./tools/Background"
import Strikethrough from "./tools/Strikethrough"
import Underline from "./tools/Underline"
import FontFamily from "./tools/FontFamily"
import Quote from "./tools/Quote"
import NumericPoint from "./tools/NumericPoint"
import BulletPoint from "./tools/BulletPoint"
import Sort from "./tools/Sort"
import FontSize from "./tools/FontSize"
import Italic from "./tools/Italic"
import Image from "./tools/Image"
import Video from "./tools/video"
import Code from "./tools/Code"

export default class FreeWillEditor extends FreeWiilHandler {
	#isLoaded = false;
	#prevParent;
	components;
	tools;
	toolsElement = {};
	#placeholder;
	#firstLine;
	#undoManager;
	constructor(
		components={
			'free-will-editor-line' : Line
		},
		tools={
			'free-will-editor-strong' : Strong,
			'free-will-editor-color' : Color,
			'free-will-editor-background' : Background,
			'free-will-editor-strikethrough' : Strikethrough,
			'free-will-editor-underline' : Underline,
			'free-will-editor-font-family' : FontFamily,
			'free-will-editor-font-quote' : Quote,
			'free-will-editor-numeric-point' : NumericPoint,
			'free-will-editor-bullet-point' : BulletPoint,
			'free-will-editor-sort' : Sort,
			'free-will-editor-font-size' : FontSize,
			'free-will-editor-italic' : Italic,
			'free-will-editor-image' : Image,
			'free-will-editor-video' : Video,
			'free-will-editor-code' : Code,
		}
	){
		super();
		this.#undoManager = new UndoManager(this);
		this.components = components;
		this.tools = tools;

		this.componentsMap = Object.entries(this.components).forEach( ([className, Component]) => {
			if(className.includes(' ')){
				throw new DOMException(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
			}
			Component.toolHandler.defaultClass = className;
			Component.toolHandler.parentEditor = this;
			window.customElements.define(className, Component, Component.toolHandler.extendsElement && Component.toolHandler.extendsElement != '' ? {extends:Component.toolHandler.extendsElement} : undefined);

			//obj[Component.constructor.name] = Component;
			//return obj;
		})
		this.toolsMap = Object.entries(this.tools).reduce( (obj, [className, Tool]) => {
			if(className.includes(' ')){
				throw new DOMException(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
			}
			Tool.toolHandler.defaultClass = className;
			Tool.toolHandler.parentEditor = this;
			this.toolsElement[className] = Tool.toolHandler.toolButton
			let observer = new MutationObserver( (mutationList, observer) => {
				mutationList.forEach((mutation) => {
					//if(mutation.oldValue == mutation.mutation.target.dataset.tool_status){
						// 동일한 동작이 수행되지 않도록 추가 2023 05 25
					//	return;
					//}
					let focusNode = window.getSelection().focusNode;
					if(mutation.target.dataset.tool_status == 'active' && mutation.oldValue != 'active' && Tool.prototype.isPrototypeOf(focusNode.parentElement) == false){
						this.#renderingTools(Tool);
					}else if(mutation.target.dataset.tool_status == 'cancel' && mutation.oldValue != 'cancel'){// && window.getSelection().isCollapsed == false){
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
			
			window.customElements.define(className, Tool, Tool.toolHandler.extendsElement && Tool.toolHandler.extendsElement != '' ? {extends:Tool.toolHandler.extendsElement} : undefined);
			obj[Tool.name] = Tool;
			return obj;
		}, {})

		let observer = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => {

				if(this.childElementCount == 0){
					this.#startFirstLine();
				}

				if(this.innerText.length <= 1 && this.#firstLine.childNodes[0]?.nodeName == 'BR' && (this.innerText.includes('\u200B') || this.innerText.includes('\n'))){
					this.#firstLine.setAttribute('data-placeholder', this.#placeholder);
				}else{
					this.#firstLine.removeAttribute('data-placeholder');
				}
				
			})
		});
		observer.observe(this, {
			childList:true,
			subtree: true
		})

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

	#startFirstLine(){
		let line = super.createLine();
		line.isFirstLine = true;
		line.setAttribute('data-placeholder', this.#placeholder);
		this.#firstLine = line;
		return line;
	}

	#removeAfterSelectionMove(targetElement){
		console.log(targetElement);
		let selection = document.getSelection()
		let range =  new Range();//document.createRange()
		let targetLine = Line.getLine(targetElement);
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
		//if( ! anchorNodeLine || ! focusNodeLine){
		//	return;
		//}
		
		super.getLineRange(selection).then(({startLine, endLine})=> {
			startLine.applyTool(TargetTool, selection.getRangeAt(0), endLine)
		})
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
		super.getLineRange(selection).then(({startLine, endLine})=> {
			console.log(startLine, endLine);
			startLine.cancelTool(TargetTool, selection, endLine);
		})
	}

	set placeholder(placeholder){
		this.#placeholder = placeholder;
		if(this.#firstLine){
			this.#firstLine.setAttribute('data-placeholder', this.#placeholder);
		}
	}

	get firstLine(){
		return this.#firstLine;
	}
}
