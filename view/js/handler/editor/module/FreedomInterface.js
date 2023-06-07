
export default class FreedomInterface extends HTMLElement {
	#isLoaded = false;
	Tool;
	#connectedAfterCallback = () => {}
	#connectedAfterOnlyOneCallback = ()=> {}
	#disconnectedAfterCallback = ()=> {}
	static globalMouseEvent = undefined;
	static lastClickElementPath = undefined; 
	static{
		document.addEventListener('mousemove', (event) => {
			//mousePos = { x: event.clientX, y: event.clientY };
			//mousePosText.textContent = `(${mousePos.x}, ${mousePos.y})`;
			this.globalMouseEvent = event;
		});
		document.addEventListener('click', (event) => {
			this.lastClickElementPath = event.composedPath();
		})
	}
	static isMouseInnerElement(element){
		let {clientX, clientY} = this.globalMouseEvent;
		let {x, y, width, height} = element.getBoundingClientRect();
		let isMouseInnerX = ((x + width) >= clientX && x <= clientX);
		let isMouseInnerY = ((y + height) >= clientY && y <= clientY);
		return (isMouseInnerX && isMouseInnerY);
	}

	static DeleteOption = class DeleteOption{
		static EMPTY_CONTENT_IS_DELETE = new Option('empty_content_is_delete');
		static EMPTY_CONTENT_IS_NOT_DELETE = new Option('empty_content_is_not_delete');
		value;
		static{
			Object.freeze(this);
		}
		constructor(value){
			this.value = value;
			Object.freeze(this);
		}
	}

	#deleteOption;

	constructor(Tool, dataset, deleteOption = FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_DELETE){
		super();
		this.#deleteOption = deleteOption;
		this.Tool = Tool;
		this.classList.add(this.constructor.toolHandler.defaultClass)
		const removeFun = () => {
			if(this.#deleteOption == FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE){
				document.removeEventListener('selectionchange', removeFun, true);
				return;
			}else if(this.isToolEmpty() || this.childNodes.length == 0){
				let thisLine = this.constructor.toolHandler.parentEditor.getLine(this);
				this.remove();
				if(thisLine){
					thisLine.lookAtMe();
				}
				document.removeEventListener('selectionchange', removeFun, true);
			}else if( ! this.isConnected){
				document.removeEventListener('selectionchange', removeFun, true);
			}
		}
		document.addEventListener('selectionchange',removeFun, true);
		
		if(dataset){
			Object.assign(this.dataset, dataset);
		}
	}
	
	connectedCallback(){
		if( ! this.#isLoaded){
			
			this.#isLoaded = true;
			this.constructor.toolHandler.connectedFriends = this;
			this.parentLine = this.constructor.toolHandler.parentEditor.getLine(this);
			
			if(this.childNodes.length == 0 && this.#deleteOption == FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE && (this.innerText.length == 0 || (this.innerText.length == 1 && this.innerText.charAt(0) == '\n'))){
				this.innerText = '\n';
			}

			this.connectedAfterOnlyOneCallback();
			if(this.shadowRoot){
				this.parentLine.prepend(document.createTextNode('\u00A0'));
			}
			/*
			if(this.shadowRoot && (this.querySelectorAll('[slot]').length == 0 || this.childNodes.length == 0 || (this.childNodes.length == 1 && this.childNodes[0]?.tagName == 'BR'))){
				//this.parentLine.prepend(document.createElement('br'));
				
				let slot = Object.assign(document.createElement('slot'),{
					name: 'empty-slot'
				});
				let emptySpan = Object.assign(document.createElement('span'), {
					slot : 'empty-slot',
				})
				emptySpan.append(document.createTextNode('\u00A0'));
				this.append(emptySpan);
				this.shadowRoot.append(slot);
				
			}
			*/

			return;
		}
		this.connectedAfterCallback();
	}
	disconnectedCallback(){
        this.#isLoaded = false;
		try{
			this.disconnectedAfterCallback();
		}catch(err){
			console.error(err)
		}finally{
			this.constructor.toolHandler.connectedFriends = this;
		}
	}

	isToolEmpty(){
        return this.innerText.length == 0 || (this.innerText.length == 1 && (this.innerText == '\n' || this.innerText == '\u200B'));
    }

	set connectedAfterCallback(connectedAfterCallback){
		this.#connectedAfterCallback = connectedAfterCallback;
	}

	get connectedAfterCallback(){
		return this.#connectedAfterCallback;
	}

	set connectedAfterOnlyOneCallback(connectedAfterOnlyOneCallback){
		this.#connectedAfterOnlyOneCallback = connectedAfterOnlyOneCallback;
	}

	get connectedAfterOnlyOneCallback(){
		return this.#connectedAfterOnlyOneCallback;
	}

	set disconnectedAfterCallback(disconnectedAfterCallback){
		this.#disconnectedAfterCallback = disconnectedAfterCallback;
	}

	get disconnectedAfterCallback(){
		return this.#disconnectedAfterCallback;
	}
}