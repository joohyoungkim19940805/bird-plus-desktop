
export default class ToolHandler{

	static processingElementPosition(element, target){
		let {x, y, height} = target.getBoundingClientRect();
		
		let elementTop = (y - element.clientHeight)
		let elementLeft = (x - element.clientWidth)
		if(elementTop > 0){
			element.style.top = elementTop + 'px';
		}else{
			element.style.top = y + height + 'px';
		}

		if(elementLeft > 0){
			element.style.left = elementLeft + 'px'
		}else{
			element.style.left = x + width + 'px';
		}
		
	}

	#extendsElement;
	#defaultClass;
	#isInline = true;
	#toolButton;
	#identity;
	#connectedFriends = [];
	#buttonMap = {};
	/**
	 * 
	 * @param {FreedomInterface} identity
	 * @returns {FreedomInterface} 
	 */
	constructor(identity){
		this.#identity = identity;
		//다른 부분 선택시에 동작하지 않도록 수정 필요(에디터만 셀렉션체인지인 경우)
		document.addEventListener("selectionchange", (event) => {
			let selection = window.getSelection();
			if(! document.activeElement.classList.contains('free-will-editor')){
				return;
			}
			/**
			 * None 현재 선택된 항목이 없습니다.
			 * Caret 선택 항목이 축소됩니다(예: 캐럿이 일부 텍스트에 배치되지만 범위가 선택되지 않음).
			 * Range 범위가 선택되었습니다.
			 */
			if(selection.type == 'None' || ! this.#toolButton){
				return;
			}

			let findTarget = this.#connectedFriends.find(e=> selection.containsNode(e, true) || selection.containsNode(e, false))
			if(findTarget){
				this.#toolButton.dataset.tool_status = 'connected';
			}else {
				this.#toolButton.dataset.tool_status = 'blur';
			}
		});
	}

	processingElementPosition(element, target = this.#toolButton){
		ToolHandler.processingElementPosition(element, target);
	}

	isLastTool(tool){
		if(this.#identity.prototype.isPrototypeOf(tool)){
			return tool === this.#connectedFriends.at(-1);
		}else{
			throw new Error(`tool is not my identity, this tool name is ${tool.constructor.name}. but my identity name is ${this.#identity.name}`);
		}
		
	}

	/**
	 * @param {String}
	 */
	set extendsElement(extendsElement){
		this.#extendsElement = extendsElement;
	}
	
	get extendsElement(){
		return this.#extendsElement;
	}
	
	set defaultClass(defaultClass){
		this.#defaultClass = defaultClass;
	}

	get defaultClass(){
		return this.#defaultClass;
	}

	/**
	 * @param {boolean} isInline 
	 */
	set isInline(isInline){
		this.#isInline = isInline;
	}
	
	/**
	 * @returns {boolean}
	 */
	get isInline(){
		return this.#isInline
	}

	set toolButton(toolButton){
		if( ! toolButton || ! toolButton.nodeType || toolButton.nodeType != Node.ELEMENT_NODE){
			throw new Error('toolButton is not element');
		}
		this.#toolButton = toolButton;

	}
	
	get toolButton(){
		return this.#toolButton;
	}

	/**
	 * @param {FreedomInterface}
	 */
	set connectedFriends(friend){
		if(friend.constructor != this.#identity){
			new TypeError('is not my friend')
		}
		
		if(friend.isConnected){
			this.#connectedFriends.push(friend);
		}else{
			this.#connectedFriends = this.#connectedFriends.filter(e=>e.isConnected);
		}
	}

	get connectedFriends(){
		return this.#connectedFriends;
	}

}