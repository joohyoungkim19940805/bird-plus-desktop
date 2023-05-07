export default class Options{
	#extendsElement;
	#defaultClass;
	#showTools;
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
			if(selection.type == 'None' || ! this.#showTools){
				return;
			}

			let findTarget = this.#connectedFriends.find(e=> selection.containsNode(e, true) || selection.containsNode(e, false))
			if(findTarget){
				this.#showTools.dataset.tool_status = 'connected';
			}else {
				this.#showTools.dataset.tool_status = 'blur';
			}
		})
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

	set showTools(showTools){
		this.#showTools = showTools;
	}
	
	get showTools(){
		return this.#showTools;
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
			this.#connectedFriends.splice(this.#connectedFriends.findIndex(e=>e==friend), 1)
		}
	}

	get connectedFriends(){
		return this.#connectedFriends;
	}

}