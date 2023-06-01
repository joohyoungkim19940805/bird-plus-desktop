
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
	constructor(Tool, dataset){
		super();
		//this.Tool = Tool;
		this.classList.add(this.constructor.toolHandler.defaultClass)
		const removeFun = () => {
			//if((this.textContent.includes('\u200B') && this.textContent.length == 1) || this.textContent.length == 0){
			if(this.innerText.length == 0){
				this.remove();
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
			if(this.style.display == 'block' && this.innerText.length == 0){
				this.innerText = '\n';
			}
			this.connectedAfterOnlyOneCallback();
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