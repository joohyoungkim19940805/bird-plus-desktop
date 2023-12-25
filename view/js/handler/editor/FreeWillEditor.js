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
import Resources from './tools/Resources'
import Code from "./tools/Code"
import Hyperlink from "./tools/Hyperlink"

export default class FreeWillEditor extends FreeWiilHandler {
	
	static componentsMap = {};
	static toolsMap = {};

	static LineBreakMode = class LineBreakMode{
		static #LineBreakModeEnum = class LineBreakModeEnum{
			value;
			constructor(value){
				this.value = value;
				Object.freeze(this);
			}
		}
		static NO_CHANGE = new this.#LineBreakModeEnum(1)
		static NEXT_LINE_FIRST = new this.#LineBreakModeEnum(2);
		static NEXT_LINE_LAST = new this.#LineBreakModeEnum(3);
	}

	#isLoaded = false;
	components;
	tools;
	#placeholder;
	#undoManager;
	isDefaultStyle = true;
	#toolButtonObserver = new MutationObserver( (mutationList, observer) => {
		mutationList.forEach((mutation) => {
			//if(mutation.oldValue == mutation.mutation.target.dataset.tool_status){
				// 동일한 동작이 수행되지 않도록 추가 2023 05 25
			//	return;
			//}
			if(this.contentEditable == 'false'){
				//observer.disconnect();
				return;
			}
			let selection = window.getSelection();
			/*if( ! selection.containsNode(this, true)){
				console.log(222)
				return;
			}*/
			let focusNode = selection.focusNode;
			let Tool = mutation.target.__Tool;
			if(mutation.target.dataset.tool_status == 'active' && mutation.oldValue != 'active' && Tool.prototype.isPrototypeOf(focusNode.parentElement) == false){
				this.#renderingTools(Tool);
			}else if(mutation.target.dataset.tool_status == 'cancel' && mutation.oldValue != 'cancel'){// && window.getSelection().isCollapsed == false){
				this.#removerTools(Tool);
			}
		});
	});
	constructor(
		tools = [
			Strong,
			Color,
			Background,
			Strikethrough,
			Underline,
			FontFamily,
			Quote,
			NumericPoint,
			BulletPoint,
			Sort,
			FontSize,
			Italic,
			Image,
			Video,
			Resources,
			Code,
			Hyperlink,
		],
		{isDefaultStyle = true} = {}
	){
		super();
		if(isDefaultStyle){
			FreeWiilHandler.createDefaultStyle();
		}
		new Promise(resolve => {
			this.isDefaultStyle = isDefaultStyle;
			this.components = {
				'free-will-editor-line' : Line
			};
			this.tools = tools;
			this.classList.add('free-will-editor');

			Object.entries(this.components).forEach( ([className, Component]) => {
				if(className.includes(' ')){
					throw new DOMException(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
				}
				if(FreeWillEditor.componentsMap[Component.name]){
					return;
				}
				Component.toolHandler.defaultClass = className;
				if( ! window.customElements.get(className)){
					window.customElements.define(className, Component, Component.toolHandler.extendsElement && Component.toolHandler.extendsElement != '' ? {extends:Component.toolHandler.extendsElement} : undefined);
				}	
				FreeWillEditor.componentsMap[Component.name] = Component;
			});
			
			this.tools.forEach( (Tool) => {
				if(FreeWillEditor.toolsMap[Tool.name]){
					return;
				}
				if(this.isDefaultStyle){
					Tool.createDefaultStyle();
				}
				Tool.toolHandler.toolButton.__Tool = Tool;
				// attribute에 value가 없어서 oldvalue가 ''이 나옵니다.
				// oldvalue로 구분할 수 있게 합시다.
				this.#toolButtonObserver.observe(Tool.toolHandler.toolButton, {
					attributeFilter:['data-tool_status'],
					attributeOldValue:true
				})
				
				if( ! window.customElements.get(Tool.toolHandler.defaultClass)){
					window.customElements.define(Tool.toolHandler.defaultClass, Tool, Tool.toolHandler.extendsElement && Tool.toolHandler.extendsElement != '' ? {extends:Tool.toolHandler.extendsElement} : undefined);
				}
				FreeWillEditor.toolsMap[Tool.name] = Tool;
			})
			
			

			let observer = new MutationObserver( (mutationList, observer) => {
				mutationList.forEach((mutation) => {
					//if(this.contentEditable == 'false'){
					//	return;
					//}
					
					if(this.childElementCount == 0){
						this.startFirstLine();
					}
					if( ! this.firstElementChild.line){
						new Line(this.firstElementChild.line);
					}
					
					this.querySelectorAll('[data-placeholder]').forEach(async e => {
						e.removeAttribute('data-placeholder')
					})
					if(this.isEmpty){
						this.placeholder = this.#placeholder;
						//this.firstElementChild.dataset.placeholder = this.#placeholder
					}else{
						this.firstElementChild.setAttribute('data-placeholder', '');
					}
					//console.log(mutation.target);
					mutation.addedNodes.forEach(async element=>{
						new Promise(resolve=>{
							if(element.nodeType != Node.ELEMENT_NODE) return;
							/*
							let sty = window.getComputedStyle(element);
							
							if(sty.visibility == 'hidden' || sty.opacity == 0){
								return;
							}
							*/
							if(element.classList.contains(Line.toolHandler.defaultClass)){
								if( ! element.line){
									new Line(element);
								}
								if(element.innerText.length == 0){
									element.innerText = '\n';
									window.getSelection().setPosition(element, 1)
									element.focus();
								}
							}
							resolve();
						})
					})
					/*mutation.removedNodes.forEach(element=>{

					})*/
				})
			});
			observer.observe(this, {
				childList:true,
				subtree: true
			})
			resolve();
		});
	}

	connectedCallback(){
		this.#undoManager = new UndoManager(this);
		if( ! this.#isLoaded){
            this.#isLoaded = true;
			if(this.contentEditable == 'inherit' || this.contentEditable == true){
				this.contentEditable = true;
				this.tabIndex = 1;
				this.focus()
				if(this.isEmpty){
					this.startFirstLine();
				}
			}
		}
	}
	disconnectedCallback(){
		this.#undoManager = null;
        this.#isLoaded = false;
		//this.contentEditable = false;
		this.#toolButtonObserver.disconnect();
    }

	startFirstLine(){
		let lineElement = super.createLine();
		lineElement.line.isFirstLine = true;
		this.placeholder = this.#placeholder;
		return lineElement;
	}

	#removeAfterSelectionMove(targetElement){
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
		
		super.getLineRange(selection)
		.then(({startLine, endLine}) => { 
			if( ! startLine){
				startLine = endLine
			}
			if( ! startLine.line){
				new Line(startLine);
			}
			if( ! endLine.line){
				new Line(endLine);
			}
			return startLine.line.applyTool(TargetTool, selection.getRangeAt(0), endLine)
		})
		.then(lastApplyTool=> {
			if( ! this.#undoManager){
				this.#undoManager = new UndoManager(this);
			}
			this.#undoManager.addUndoRedo(true);
			let applyToolAfterSelection = window.getSelection(), range = applyToolAfterSelection.getRangeAt(0);
			let scrollTarget;
			if(range.endContainer.nodeType == Node.TEXT_NODE){
				scrollTarget = range.endContainer.parentElement
			}else{
				scrollTarget = range.endContainer;
			}
			scrollTarget.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
			applyToolAfterSelection.setPosition(scrollTarget, scrollTarget.childNodes.length - 1);
			//selection.setPosition(lastApplyTool, 0)
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

	#removerTools(TargetTool){
		let selection = window.getSelection();
		let {isCollapsed, anchorNode, focusNode} = selection;
		/*
		// 범위 선택 x인 경우 넘어가기
		if(isCollapsed){
			return;
		}*/
		super.getLineRange(selection).then(({startLine, endLine})=> {
			console.log(endLine);
			if( ! startLine){
				startLine = endLine
			}
			if( ! startLine.line){
				new Line(startLine);
			}
			if( ! endLine.line){
				new Line(endLine);
			}
			startLine.line.cancelTool(TargetTool, selection, endLine);
		}).then(()=>{
			this.#undoManager.addUndoRedo(true);
			/*[...this.children]
			.filter(e=>e.classList.contains(`${Line.toolHandler.defaultClass}`))
			.forEach(lineElement=>{
				if(lineElement.line.isLineEmpty()){
					//lineElement.line = undefined;
					//lineElement.remove();
				}
			})*/
		})
	}
	
	async lineBreak(LineBreakMode = FreeWillEditor.LineBreakMode.NEXT_LINE_FIRST){
		let selection = window.getSelection();
		return super.getLineRange(selection)
		.then(({startLine, endLine}) => { 
			if( ! startLine.line){
				new Line(startLine);
			}
			if( ! endLine.line){
				new Line(endLine);
			}
			let range = selection.getRangeAt(0);
			let {startOffset, endOffset, startContainer,endContainer} = range;
			let lastItem = startLine.lastChild
			let lastItemEndOffset = lastItem.nodeType == Node.TEXT_NODE ? lastItem.length : lastItem.childNodes.length;
			range.setStart(startContainer, startOffset);
			range.setEnd(lastItem, lastItemEndOffset);
			let lineElement = super.createLine();
			lineElement.append(range.extractContents());
			startLine.after(lineElement);
			if(LineBreakMode == FreeWillEditor.LineBreakMode.NEXT_LINE_FIRST){
				window.getSelection().setPosition(lineElement, 0);
			}else if(LineBreakMode == FreeWillEditor.LineBreakMode.NEXT_LINE_LAST){
				lineElement.line.lookAtMe();
			}

		})
	}

	async getLowDoseJSON(targetElement = this, {afterCallback = (json)=> {}} = {}){
		console.log(targetElement)
		return Promise.all([...targetElement.childNodes]
			.map(async (node, index)=>{
				return new Promise(resolve =>{
					if(targetElement == this && node.nodeType == Node.TEXT_NODE){
						resolve(undefined);
					}
					resolve( this.#toJSON(node, {afterCallback}) )
				})
			})).then(jsonList=>jsonList.filter(e=>e != undefined).map(e=> {
				delete e.node;
				return e;
			}))
	}

	async #toJSON(node, {afterCallback}){
		return new Promise(resolve=>{
			let obj = {};
			if(node.nodeType == Node.TEXT_NODE && node.textContent != '' && node.textContent){
				obj.type = Node.TEXT_NODE;
				obj.name = node.constructor.name;
				obj.text = node.textContent
				obj.node = node;
				afterCallback(obj);
				resolve(obj);
			}else if(node.nodeType == Node.ELEMENT_NODE){
				obj.type = Node.ELEMENT_NODE;
				obj.name = node.constructor.name;
				obj.tagName = node.localName;
				obj.data = Object.assign({}, node.dataset);
				obj.node = node;
				if(node.hasAttribute('is_cursor')){
					obj.cursor_offset = node.getAttribute('cursor_offset');
					obj.cursor_type = node.getAttribute('cursor_type');
					obj.cursor_index = node.getAttribute('cursor_index');
					obj.cursor_scroll_x = node.getAttribute('cursor__scroll_x');
					obj.cursor_scroll_y = node.getAttribute('cursor_scroll_y');
				}
				this.getLowDoseJSON(node, {afterCallback})
				.then(jsonList => {
					obj.childs = jsonList.filter(e=> e != undefined)
					afterCallback(obj);
					resolve(obj);
				})
			}else{
				//afterCallback(undefined)
				resolve(undefined);
			}
			
		})
	}

	async parseLowDoseJSON(json, {beforeCallback = (json) => {}, afterCallback = (node)=> {}} = {}){
		return new Promise(resolve => {
			let jsonObj = json;
			if(typeof json == 'string'){
				jsonObj = JSON.parse(json);
			}

			if(jsonObj instanceof Array){
				resolve(
					Promise.all(this.#toHTML(jsonObj, {beforeCallback, afterCallback}))
					.then(htmlList => {
						this.replaceChildren(...htmlList.filter(e=> e != undefined))
					})
				);
			}
			resolve(undefined);
		})
	}

	#toHTML(objList, {beforeCallback, afterCallback}){
		return objList.filter(e=>e!=undefined).map(async jsonNode => {
			return new Promise(resolve => {
				beforeCallback(jsonNode);
				let node = undefined;
				if(jsonNode.type == Node.TEXT_NODE){
					node = document.createTextNode(jsonNode.text);
				}else if(jsonNode.type == Node.ELEMENT_NODE){
					let EditorTarget = FreeWillEditor.componentsMap[jsonNode.name] || FreeWillEditor.toolsMap[jsonNode.name]
					if(EditorTarget){
						node = new EditorTarget(jsonNode.data);
					}else if(jsonNode.data.hasOwnProperty('is_line')){
						let line = new Line(document.createElement(jsonNode.tagName));
						node = line.lineElement;
						Object.assign(node.dataset, jsonNode.data);
					}else{
						//node = document.createElement(jsonNode.name.replaceAll(/HTML|Element/g, '').toLowerCase());
						node = document.createElement(jsonNode.tagName);
						Object.assign(node.dataset, jsonNode.data);
					}
					afterCallback(node)
					if(jsonNode.childs.length != 0){
						Promise.all(this.#toHTML(jsonNode.childs, {beforeCallback, afterCallback})).then(childList => {
							node.append(...childList);
						})
					}
				}
				resolve(node);
			})
		})
	}

	set placeholder(placeholder){
		this.#placeholder = placeholder;
		if(this.firstElementChild && this.contentEditable != false){
			this.firstElementChild.setAttribute('data-placeholder', this.#placeholder);
		}
	}

	get firstLine(){
		return this.firstElementChild;
	}

	get isEmpty(){
		return Line.isElementTextEmpty(this) && ! [...this.querySelectorAll('*')].some(e=>this.tools.hasOwnProperty(e.localName));
	}

	get isLoaded(){
		return this.#isLoaded;
	}
}
