import Line from '../component/Line'

export default class FreedomInterface extends HTMLElement {

	static globalMouseEvent = undefined;
	static lastClickElementPath = undefined;
	static globalClickEventPromiseResolve;
	static globalClickEventPromise = new Promise(resolve=>{
		this.globalClickEventPromiseResolve = resolve;
	});
	
	static{
		document.addEventListener('mousemove', (event) => {
			//mousePos = { x: event.clientX, y: event.clientY };
			//mousePosText.textContent = `(${mousePos.x}, ${mousePos.y})`;
			this.globalMouseEvent = event;
		});
		document.addEventListener('mousedown', (event) => {
			this.lastClickElementPath = event.composedPath();
			this.globalClickEventPromiseResolve(event)
			this.globalClickEventPromise = new Promise(resolve => {
				this.globalClickEventPromiseResolve = resolve;
			})
		})

	}
	static isMouseInnerElement(element){
		if( ! this.globalMouseEvent) return;
		let {clientX, clientY} = this.globalMouseEvent;
		let {x, y, width, height} = element.getBoundingClientRect();
		let isMouseInnerX = ((x + width) >= clientX && x <= clientX);
		let isMouseInnerY = ((y + height) >= clientY && y <= clientY);
		return (isMouseInnerX && isMouseInnerY);
	}

	/**
	 * 
	 * @param {HTMLElement} element 
	 * @param {Function} callBack 
	 */
	static outClickElementListener(element, callBack = ({oldEvent, newEvent})=>{}){

		if(element == undefined || element?.nodeType != Node.ELEMENT_NODE){
			throw new Error('element is not Element');
		}

		let oldEvent = undefined;
		let newEvent = undefined;
		const simpleObserver = () => {
			this.globalClickEventPromise.then((event)=>{
				let isMouseOut = ! this.isMouseInnerElement(element);
				newEvent = event;
				callBack({oldEvent, newEvent, isMouseOut});
				oldEvent = event;
				simpleObserver();
			})
		}
		simpleObserver();
	}
	
	static DeleteOption = class DeleteOption{
		static #DeleteOptionEnum = class DeleteOptionEnum{
			value;
			constructor(value){
				this.value = value;
				Object.freeze(this);
			}
		}
		static EMPTY_CONTENT_IS_DELETE = new this.#DeleteOptionEnum('empty_content_is_delete');
		static EMPTY_CONTENT_IS_NOT_DELETE = new this.#DeleteOptionEnum('empty_content_is_not_delete');
		value;
		static{
			Object.freeze(this);
		}
		constructor(value){
			this.value = value;
			Object.freeze(this);
		}
	}

	#isLoaded = false;
	Tool;
	#connectedAfterCallback = () => {}
	#connectedAfterOnlyOneCallback = ()=> {}
	#disconnectedAfterCallback = ()=> {}
	#connectedChildAfterCallBack = () => {}
	#disconnectedChildAfterCallBack = () => {}
	#deleteOption;
	parentEditor;
	
	constructor(Tool, dataset, {deleteOption = FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_DELETE} = {}){
		super();
		this.#deleteOption = deleteOption;
		this.Tool = Tool;
		this.classList.add(this.constructor.toolHandler.defaultClass)
		const removeFun = () => {
			if(this.#deleteOption == FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE){
				document.removeEventListener('selectionchange', removeFun, true);
				return;
			}else if(this.isToolEmpty() || this.childNodes.length == 0){
				let thisLine = this.parentEditor?.getLine(this);
				this.remove();
				if(thisLine){
					thisLine.line.lookAtMe();
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

		let childListObserver = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => {
				//console.log(mutation);
				let {addedNodes, removedNodes} = mutation;
				let connectedChildPromise = new Promise(resolve => {
					if(addedNodes.length != 0){
						
						let resultList;
						if( ! this.constructor.toolHandler.isInline){
							let lastItemIndex;
							resultList = [...addedNodes].map((e,i)=>{
								if(e.nodeType != Node.ELEMENT_NODE){
									return e;
								} else if(e.classList.contains(Line.toolHandler.defaultClass)){
									if( ! e.line){
										new Line(e);
									}
									return e;
								}
								let line = new Line(e);
								line.lineElement.replaceChildren(e);
								this.append(line.lineElement);
								if( i == addedNodes.length - 1){
									lastItemIndex = i;
								}
								return line.lineElement;
							});
							if(lastItemIndex){
								resultList[lastItemIndex].line.lookAtMe();
							}
						}else{
							resultList = addedNodes;
						}
						
						this.connectedChildAfterCallBack(resultList);
						this.connectedChildAfterCallBack(addedNodes);
					}
					resolve();
				})
				
				let disconnectedChildPromise = new Promise(resolve => {
					if(removedNodes.length != 0){
						this.disconnectedChildAfterCallBack(removedNodes);
					}
					resolve();
				})
				
			})
		});
		childListObserver.observe(this, {childList:true})

	}

	connectedCallback(){
		if( ! this.#isLoaded){
			
			this.#isLoaded = true;
			this.constructor.toolHandler.connectedFriends = this;
			this.parentEditor = this.closest('.free-will-editor');
			this.parentLine = this.parentEditor?.getLine(this);

			if(this.childNodes.length == 0 && this.#deleteOption == FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE && (this.innerText.length == 0 || (this.innerText.length == 1 && this.innerText.charAt(0) == '\n'))){
				let sty = window.getComputedStyle(this);
				if(sty.visibility != 'hidden' || sty.opacity != 0){
					this.innerText = '\n';
				}
			}

			if(this.#deleteOption == FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_DELETE && (this.isToolEmpty() || this.childNodes.length == 0)){
				let thisLine = this.parentEditor.getLine(this);
				this.remove();
				if(thisLine){
					thisLine.line.lookAtMe();
				}
			}
						
			if(this.shadowRoot){
				//this.parentLine.prepend(document.createTextNode('\u00A0'));
				//this.parentLine.prepend(document.createElement('br'));
				//this.before(document.createElement('br'));
				this.parentLine.before(this.parentEditor.createLine());
				let nextLine = this.parentEditor.getNextLine(this.parentLine);
				if( ! nextLine){
					this.parentEditor.createLine();
				}else{
					nextLine.line.lookAtMe();
				}
			}

			this.connectedAfterOnlyOneCallback();

			
			/*
			if(this.shadowRoot && (this.querySelectorAll('[slot]').length == 0 || this.childNodes.length == 0 || (this.childNodes.length == 1 && this.childNodes[0]?.tagName == 'BR'))){
				//this.parentLine.prepend(document.createElement('br'));
				
				let slot = Object.assign(document.createElement('slot'),{
					name: 'empty-slot'
				});
				let emptySpan = Object.assign(document.createElement('span'), {
					slot : 'empty-slot'
				});
				//emptySpan.style.opacity='0';
				//emptySpan.append(document.createTextNode('\u200B'));
				emptySpan.innerText = '\n'
				this.prepend(emptySpan);
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
		let sty = window.getComputedStyle(this);
		if(sty.visibility == 'hidden' || sty.opacity == 0){
			return false;
		}
        return this.innerText.length == 0 || (this.innerText.length == 1 && (this.innerText == '\n' || this.innerText == '\u200B'));
    }

	/**
	 * @param {Function}
	 */
	set connectedAfterCallback(connectedAfterCallback){
		this.#connectedAfterCallback = connectedAfterCallback;
	}

	/**
	 * @returns {Function}
	 */
	get connectedAfterCallback(){
		return this.#connectedAfterCallback;
	}

	/**
	 * @param {Function}
	 */
	set connectedAfterOnlyOneCallback(connectedAfterOnlyOneCallback){
		this.#connectedAfterOnlyOneCallback = connectedAfterOnlyOneCallback;
	}
	
	/**
	 * @returns {Function}
	 */
	get connectedAfterOnlyOneCallback(){
		return this.#connectedAfterOnlyOneCallback;
	}

	/**
	 * @param {Function}
	 */
	set disconnectedAfterCallback(disconnectedAfterCallback){
		this.#disconnectedAfterCallback = disconnectedAfterCallback;
	}

	/**
	 * @returns {Function}
	 */
	get disconnectedAfterCallback(){
		return this.#disconnectedAfterCallback;
	}
 
	/**
	 * @param {Function}
	 */
	set connectedChildAfterCallBack(connectedChildAfterCallBack){
		this.#connectedChildAfterCallBack = connectedChildAfterCallBack;
	}

	/**
	 * @returns {Function}
	 */
	get connectedChildAfterCallBack(){
		return this.#connectedChildAfterCallBack;
	}

	/**
	 * @param {Function}
	 */
	set disconnectedChildAfterCallBack(disconnectedChildAfterCallBack){
		this.#disconnectedChildAfterCallBack = disconnectedChildAfterCallBack;
	}

	/**
	 * @returns {Function}
	 */
	get disconnectedChildAfterCallBack(){
		return this.#disconnectedChildAfterCallBack;
	}
}