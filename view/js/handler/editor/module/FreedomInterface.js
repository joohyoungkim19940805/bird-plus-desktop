import Line from '../component/Line'

export default class FreedomInterface extends HTMLElement {

	static globalMouseEvent = undefined;
	static lastClickElementPath = undefined;
	static globalClickEventPromiseResolve;
	static globalClickEventPromise = new Promise(resolve=>{
		this.globalClickEventPromiseResolve = resolve;
	});
	static globalKeydownEventPromiseResolve;
	static globalKeydownEventPromise = new Promise(resolve=>{
		this.globalKeydownEventPromiseResolve = resolve;
	})
	static globalSelectionChangeEventPromiseResolve;
	static globalSelectionChangeEventPromise = new Promise(resolve=>{
		this.globalSelectionChangeEventPromiseResolve = resolve;
	})
	
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
		window.addEventListener('keydown', (event) => {
			this.globalKeydownEventPromiseResolve(event);
			this.globalKeydownEventPromise = new Promise(resolve=>{
				this.globalKeydownEventPromiseResolve = resolve;
			})
		})
		document.addEventListener('selectionchange', (event) => {
			this.globalSelectionChangeEventPromiseResolve(event);
			this.globalSelectionChangeEventPromise = new Promise(resolve=>{
				this.globalSelectionChangeEventPromiseResolve = resolve;
			})
		});

	}
	static isMouseInnerElement(element){
		if( ! this.globalMouseEvent) return;
		let {clientX, clientY} = this.globalMouseEvent;
		let {x, y, width, height} = element.getBoundingClientRect();
		let isMouseInnerX = ((x + width) >= clientX && x <= clientX);
		let isMouseInnerY = ((y + height) >= clientY && y <= clientY);
		return (isMouseInnerX && isMouseInnerY);
	}
	static globalKeydownEventListener(element, callBack = ({oldEvent, newEvent})=>{}){
		let oldEvent = undefined;
		let newEvent = undefined;
		const simpleObserver = () => {
			this.globalKeydownEventPromise.then((event)=>{
				newEvent = event;
				callBack({oldEvent, newEvent});
				oldEvent = event;
				simpleObserver();
			})
		}
		simpleObserver();
	}
	static globalSelectionChangeEventListener(element, callBack = ({oldEvent, newEvent})=>{}){
		let oldEvent = undefined;
		let newEvent = undefined;
		const simpleObserver = () => {
			this.globalSelectionChangeEventPromise.then((event)=>{
				newEvent = event;
				callBack({oldEvent, newEvent});
				oldEvent = event;
				simpleObserver();
			})
		}
		simpleObserver();
	}
	/**
	 * 
	 * @param {HTMLElement} element 
	 * @param {Function} callBack 
	 */
	static outClickElementListener(element, callBack = ({oldEvent, newEvent, isMouseOut = false})=>{}){

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
	#connectedChildAfterCallback = () => {}
	#disconnectedChildAfterCallback = () => {}
	#deleteOption;
	parentEditor;
	#childListObserver = new MutationObserver( (mutationList, observer) => {
		mutationList.forEach((mutation) => {
			let {addedNodes, removedNodes} = mutation;
			let connectedChildPromise = new Promise(resolve => {
				if(addedNodes.length != 0){
					
					let resultList;
					if( ! this.constructor.toolHandler.isInline){
						let lastItemIndex;
						resultList = [...addedNodes].map((e,i)=>{
							if( ! e.classList?.contains(Line.toolHandler.defaultClass)){
								let lineElement = this.parentEditor.createLine();
								lineElement.replaceChildren(e);
								this.append(lineElement);
								if( i == addedNodes.length - 1){
									lastItemIndex = i;
								}
								return lineElement;
							}
							return e;
						});

						//if(lastItemIndex){
						//	resultList[lastItemIndex].line.lookAtMe();
						//}
					}else{
						resultList = addedNodes;
					}
					
					this.connectedChildAfterCallback(resultList);
					//this.connectedChildAfterCallback(addedNodes);
				}
				resolve();
			})
			
			let disconnectedChildPromise = new Promise(resolve => {
				if(removedNodes.length != 0){
					this.disconnectedChildAfterCallback(removedNodes);
				}
				resolve();
			})
			
		})
	});
	constructor(Tool, dataset, {deleteOption = FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_DELETE} = {}){
		super();
		this.#childListObserver.disconnect();
		this.#childListObserver.observe(this, {childList:true})
		this.#deleteOption = deleteOption;
		this.Tool = Tool;
		this.classList.add(this.constructor.toolHandler.defaultClass)

		document.addEventListener('selectionchange', this.removeFun, true);

		if(dataset){
			Object.assign(this.dataset, dataset);
		}
		
		FreedomInterface.globalSelectionChangeEventListener(this, ({oldEvent, newEvent}) => {
			if(this.#deleteOption != FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE && this.isToolEmpty()){
				let thisLine = this.parentEditor?.getLine(this);
				this.remove();
				if(thisLine){
					thisLine.line.lookAtMe();
				}
			}
		})

		if( ! this.constructor.toolHandler.isInline){
			FreedomInterface.globalKeydownEventListener(this, ({oldEvent, newEvent}) => {
				if(this.isCursor() && newEvent.key == 'ArrowDown' && ! this.parentLine.nextElementSibling){
					let nextLine = this.parentEditor.createLine();
					nextLine.line?.lookAtMe();
				}
			})
		}
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
				//this.parentLine.before(this.parentEditor.createLine());
				let nextLine = this.parentEditor.getNextLine(this.parentLine);
				if( ! nextLine){
					this.parentEditor.createLine().innerText = '\n';
				}else{
					nextLine.line.lookAtMe();
				}
				/*this.childNodes.forEach(e=>{
					if(e.nodeType == Node.TEXT_NODE){
						e.remove()
					}
				})*/
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
			this.#childListObserver.disconnect(this, {childList:true})
			document.removeEventListener('selectionchange', this.removeFun, true);
		}
	}

	isToolEmpty(){
		let sty = window.getComputedStyle(this);
		if(sty.visibility == 'hidden' || sty.opacity == 0){
			return false;
		}
        return this.innerText.length == 0 || (this.innerText.length == 1 && (this.innerText == '\n' || this.innerText == '\u200B'));
    }

	isCursor(){
		let selection = window.getSelection();
		if(! document.activeElement.classList.contains('free-will-editor')){
			return false;
		}
		if(selection.type == 'None'){
			return false;
		}

		return selection.containsNode(this, true) || selection.containsNode(this, false)
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
	set connectedChildAfterCallback(connectedChildAfterCallback){
		this.#connectedChildAfterCallback = connectedChildAfterCallback;
	}

	/**
	 * @returns {Function}
	 */
	get connectedChildAfterCallback(){
		return this.#connectedChildAfterCallback;
	}

	/**
	 * @param {Function}
	 */
	set disconnectedChildAfterCallback(disconnectedChildAfterCallback){
		this.#disconnectedChildAfterCallback = disconnectedChildAfterCallback;
	}

	/**
	 * @returns {Function}
	 */
	get disconnectedChildAfterCallback(){
		return this.#disconnectedChildAfterCallback;
	}
}