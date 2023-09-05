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
import Video from "./tools/Video"
import Code from "./tools/Code"

export default class FreeWillEditor extends FreeWiilHandler {
	
	static componentsMap = {};
	static toolsMap = {};

	#isLoaded = false;
	#prevParent;
	components;
	tools;
	toolsElement = {};
	#placeholder;
	#firstLine;
	#undoManager;
	constructor(
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
		
		this.components = {
			'free-will-editor-line' : Line
		};
		this.tools = tools;
		this.classList.add('free-will-editor');
		FreeWillEditor.componentsMap = Object.entries(this.components).reduce( (total, [className, Component]) => {
			if(className.includes(' ')){
				throw new DOMException(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
			}
			Component.toolHandler.defaultClass = className;
			//Component.toolHandler.parentEditor = this;
			if( ! window.customElements.get(className)){
				window.customElements.define(className, Component, Component.toolHandler.extendsElement && Component.toolHandler.extendsElement != '' ? {extends:Component.toolHandler.extendsElement} : undefined);
			}	
			total[Component.name] = Component;
			return total;
		}, {});

		FreeWillEditor.toolsMap = Object.entries(this.tools).reduce( (total, [className, Tool]) => {
			if(className.includes(' ')){
				throw new DOMException(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
			}
			Tool.toolHandler.defaultClass = className;
			//Tool.toolHandler.parentEditor = this;
			this.toolsElement[className] = Tool.toolHandler.toolButton
			let observer = new MutationObserver( (mutationList, observer) => {
				mutationList.forEach((mutation) => {
					//if(mutation.oldValue == mutation.mutation.target.dataset.tool_status){
						// 동일한 동작이 수행되지 않도록 추가 2023 05 25
					//	return;
					//}
					let selection = window.getSelection();
					if(this.contentEditable == 'false'){
						observer.disconnect();
						return;
					}else if( ! selection.containsNode(this, true)){
						return;
					}
					let focusNode = selection.focusNode;
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
			
			if( ! window.customElements.get(className)){
				window.customElements.define(className, Tool, Tool.toolHandler.extendsElement && Tool.toolHandler.extendsElement != '' ? {extends:Tool.toolHandler.extendsElement} : undefined);
			}
			total[Tool.name] = Tool;
			return total;
		}, {})

		let observer = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => {
				if(this.contentEditable == 'false'){
					return;
				}
				if(this.childElementCount == 0){
					this.#startFirstLine();
				}

				if(this.innerText.length <= 1 && this.#firstLine.childNodes[0]?.nodeName == 'BR' && (this.innerText.includes('\u200B') || this.innerText.includes('\n'))){
					this.#firstLine.setAttribute('data-placeholder', this.#placeholder);
				}else{
					this.#firstLine.removeAttribute('data-placeholder');
				}
				
				//console.log(mutation.target);
				mutation.addedNodes.forEach(element=>{
					if(element.nodeType != Node.ELEMENT_NODE) return;
					
					if(element.classList.contains(Line.toolHandler.defaultClass) && (element.innerText.length == 0 || (element.innerText.length == 1 && element.innerText.charAt(0) == '\n'))){
						element.innerText = '\n';
						window.getSelection().setPosition(element, 1)
						element.focus();
						new Line(element);
						if( ! element.line){
							
						}
					}
					
				})
				
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
			if(this.contentEditable == 'inherit'){
				this.contentEditable = true;
				this.tabIndex = 1;
				this.focus()
				this.#startFirstLine();
				this.#undoManager = new UndoManager(this);
			}
			
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
			console.log(startLine);
			console.log(endLine);
			startLine.line.applyTool(TargetTool, selection.getRangeAt(0), endLine)
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
		let {isCollapsed, anchorNode, focusNode} = selection;
		// 범위 선택 x인 경우 넘어가기
		if(isCollapsed){
			return;
		}
		super.getLineRange(selection).then(({startLine, endLine})=> {
			console.log(startLine, endLine);
			startLine.line.cancelTool(TargetTool, selection, endLine);
		})
	}
	
	getLowDoseJSON(targetElement = this){
		return [...targetElement.childNodes]
			.map((node, index)=>{
				if(targetElement == this && node.nodeType == Node.TEXT_NODE){
					return undefined;
				}
				return this.#toJSON(node)
			})
			.filter(e=>e != undefined);
	}

	#toJSON(node){
		let obj = {};
		if(node.nodeType == Node.TEXT_NODE){
			obj.type = Node.TEXT_NODE;
			obj.name = node.constructor.name;
			obj.text = node.textContent
		}else if(node.nodeType == Node.ELEMENT_NODE){
			obj.type = Node.ELEMENT_NODE;
			obj.name = node.constructor.name;
			obj.data = Object.assign({}, node.dataset);
			if(node.hasAttribute('is_cursor')){
				obj.cursor_offset = node.getAttribute('cursor_offset');
				obj.cursor_type = node.getAttribute('cursor_type');
				obj.cursor_index = node.getAttribute('cursor_index');
				obj.cursor_scroll_x = node.getAttribute('cursor__scroll_x');
				obj.cursor_scroll_y = node.getAttribute('cursor_scroll_y');
			}
			obj.childs = this.getLowDoseJSON(node);
		}else{
			return undefined;
		}
		return obj;
	}

	parseLowDoseJSON(json){
		let jsonObj = json;
		if(typeof json == 'string'){
			jsonObj = JSON.parse(json);
		}
		if(jsonObj instanceof Array){
			this.replaceChildren(...this.#toHTML(jsonObj, this).filter(e=> e != undefined));
		}
		console.log(jsonObj instanceof Array)
	}

	#toHTML(objList, parent = this){
		return objList.map(jsonNode => {
			let EditorTarget = FreeWillEditor.componentsMap[jsonNode.name] || FreeWillEditor.toolsMap[jsonNode.name] || document.createTextNode('');
			
			let node = undefined;
			if(jsonNode.type == Node.TEXT_NODE){
				node = document.createTextNode(jsonNode.text);
			}else if(jsonNode.type == Node.ELEMENT_NODE){
				let EditorTarget = FreeWillEditor.componentsMap[jsonNode.name] || FreeWillEditor.toolsMap[jsonNode.name]
				if(EditorTarget){
					node = new EditorTarget(jsonNode.data);
				}else{
					node = document.createElement(jsonNode.name.replaceAll(/HTML|Element/g, '').toLowerCase());
				}

				if(jsonNode.childs.length != 0){
					node.append(...this.#toHTML(jsonNode.childs, node));
				}
			}
			return node;
		})
	}

	get isEmpty(){
		return this.innerText.trim();
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
