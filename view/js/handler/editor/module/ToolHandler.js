export default class ToolHandler{
	#extendsElement;
	#defaultClass;
	#toolButton;
	#identity;
	#connectedFriends = [];
	constructor(identity){
		this.#identity = identity;
		document.addEventListener("selectionchange", (event) => {
			let selection = window.getSelection();
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

		})
	}

	processingElementPosition(element){
		let {x, y, height} = this.#toolButton.getBoundingClientRect();
		
		let elementHeightPx = element.clientHeight;
		let elementTop = (y - elementHeightPx)
		if(elementTop > 0){
			element.style.top = elementTop + 'px';
		}else{
			element.style.top = y + height + 'px';
		}
		element.style.left = x + 'px';
	}

	isLastTool(tool){
		if(this.#identity.prototype.isPrototypeOf(tool)){
			return tool === this.#connectedFriends[this.#connectedFriends.length - 1];
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

	set toolButton(toolButton){
		if( ! toolButton || ! toolButton.nodeType || ! toolButton.nodeType == Node.ELEMENT_NODE){
			throw new Error('toolButton is not element');
		}
		if(this.#toolButton){
			toolButton.onclick = this.#toolButton.onclick;
			this.#toolButton.remove();
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

		console.log(friend.isConnected);
		if(friend.isConnected){
			this.#connectedFriends.push(friend);
		}else{
			this.#connectedFriends.splice(this.#connectedFriends.findIndex(e=>e==friend), 1)
		}
	}

	get connectedFriends(){
		return this.#connectedFriends;
	}

}