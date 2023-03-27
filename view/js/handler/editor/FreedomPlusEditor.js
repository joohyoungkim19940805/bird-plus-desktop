import Components from "./module/Components"
import Tools from "./module/Tools"

export default class FreedomEditorPlus extends HTMLDivElement {
	#isLoaded = false;
	#prevParent;
	components;
	tools;
	toolsElement = {};
	showToolsWrap = undefined;
	#activeTools = [];
	onActCallback = (event) => {};
	static Components = Components
	/**
	 * HTMLElement을 상속 받고 extendsElement를 아래 중 하나로 하면 적용 가능 할 것입니다.
	 */
	static Tools = Tools
	/**
	 * 
	 * @param {Object} components 
	 * @param {Ojbect} tools 
	 */
	constructor(
		components={
			'freedom-line' : FreedomEditorPlus.Components.Line
		},
		tools={
			'freedom-blod' : FreedomEditorPlus.Tools.Bold
		}
	){
		super();
		this.components = components;
		this.tools = tools;
		Object.entries(this.components).forEach( ([className, Component]) => {
			if(className.includes(' ')){
				throw new DOMException(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
			}
			Component.defaultClass = className;
			window.customElements.define(className, Component, {extends:Component.extendsElement});
		})
		Object.entries(this.tools).forEach( ([className, Tool]) => {
			if(className.includes(' ')){
				throw new DOMException(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
			}
			Tool.defaultClass = className;
			this.toolsElement[className] = Tool.showTools
			Tool.showTools.addEventListener('click', (event) => this.#toolsClickEvent(event, Tool))
			window.customElements.define(className, Tool, {extends:Tool.extendsElement});
		})
	}
	connectedCallback(){
		if( ! this.#isLoaded){
            this.#isLoaded = true;
			this.contentEditable = true;
			let line = new FreedomEditorPlus.Components.Line();
			this.append(line);
			// 최초에 첫번째 추가 된 line에 빈 element를 삽입하여 포커싱 되도록 한다.
			this.#selectionMove(line); 
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

	#selectionMove(targetElement){
		let selection = window.getSelection()
		let range =  new Range();//document.createRange()

		let emptyElement = document.createTextNode('\u200B')
		targetElement.append(emptyElement)
		targetElement.tabIndex = 1;
		targetElement.focus();
		
		console.log(targetElement);
		let observer = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => {
				if(mutation.target.textContent.charAt(0) == '\u200B' || mutation.target.textContent.charAt(mutation.target.textContent.length -1) == '\u200B'){
					mutation.target.textContent = mutation.target.textContent.replace('\u200B', '');
					range.setStartAfter(targetElement)
					selection.removeAllRanges()
					selection.addRange(range) 
					observer.disconnect();
				}else{
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

		/*
		range.setStartAfter(emptyElement)
		selection.removeAllRanges()
		selection.addRange(range)
		*/
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

	#toolsClickEvent(event, TargetTool){
		let target = event.target;
		if(target.hasAttribute('active_tool')){
			target.toggleAttribute('active_tool');
			// delete this.#activeTools[TargetTool.prototype.constructor.name]
			this.#activeTools.splice(this.#activeTools.findIndex(e => e == TargetTool), 1);
		}else{
			target.toggleAttribute('active_tool');
			this.#activeTools.push(TargetTool);
			// 중복 제거
			this.#activeTools = [...new Set(this.#activeTools)]
			// this.#activeTools[TargetTool.prototype.constructor.name] = TargetTool;
			this.#renderingTools(TargetTool);
		}
	}
	#renderingTools(TargetTool){
		let selection = window.getSelection();
		let {isCollapsed, anchorNode, anchorOffset} = selection; 
		let line = undefined;
		if(anchorNode.parentElement.className.includes(FreedomEditorPlus.Components.Line.defaultClass)){
			line = anchorNode.parentElement
		}else{
			line = anchorNode.parentElement.closest(`.${FreedomEditorPlus.Components.Line.defaultClass}`);
		}

		if( ! line){
			return;
		}
		//if(isCollapsed){
			
			//let line = anchorNode.closest(`.${FreedomEditorPlus.Components.Line.defaultClass}`)
			// line element를 찾지 못하였을 경우 함수 중지
			
			line.applyTool(TargetTool, selection.getRangeAt(0)).then(tool=>{
				this.#selectionMove(tool);
			});
		//}else{
			
		//}
	}
}
