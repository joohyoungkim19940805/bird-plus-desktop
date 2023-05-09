
export default class FreedomInterface extends HTMLElement {
	#isLoaded = false;
	Tool;
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
	constructor(Tool){
		super();
		//this.Tool = Tool;
		this.classList.add(this.constructor.options.defaultClass)
		const removeFun = () => {
			if((this.textContent.includes('\u200B') && this.textContent.length == 1) || this.textContent.length == 0){
				this.remove();
				document.removeEventListener('selectionchange', removeFun, true);
			}else if( ! this.isConnected){
				document.removeEventListener('selectionchange', removeFun, true);
			}
		}
		document.addEventListener('selectionchange',removeFun, true);

		//this.tabIndex = 1;
		//this.draggable = true;
		// keyup을 옵저버로 대신 써보기
		/*
		this.addEventListener('keyup', (event) => {
			console.log(event);
			if(isKeyPress == false){
				isKeyPress = true;
			}
		})
		*/
		/*
		let isFirst = false;
		let observer = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => {
				if(this.textContent.includes('\u200B')){
					return;
				}
				if(isKeyPress == false){
					isKeyPress = true;
					observer.disconnect();
				}
			});
		})
		observer.observe(this, {
			characterData: true,
			characterDataOldValue: true,
			childList:true,
			subtree: true
		})
		*/
		/*
		document.addEventListener("selectstart", (event) => {
			if( ! this.Tool.options.showTools){
				return;
			}
			//console.log(event.composedPath());
			if(event.composedPath().some(e=>e==this)){
				this.Tool.options.showTools.dataset.tool_status = 'active';
			}else{
				this.Tool.options.showTools.dataset.tool_status = '';
			}
		})
		*/
		/*
		document.addEventListener("selectionchange", (event) => {
			let selection = window.getSelection();
			if( ! this.Tool.options.showTools, selection.type == 'None' || ! selection.focusNode){
				console.log('???')
				return;
			}
			let target = window.getSelection().focusNode.parentElement;
			// u200B를 제거하는 로직으로 인해 오류 발생하여 추가 20230405
			if(( this.textContent.includes('\u200B') || this.Tool.options.showTools.hasAttribute('data-is_alive') ) && (this.isThisInnerRange(target) == false)){
				console.log(this.constructor.name, 1)
				console.log(this.constructor.name, this.Tool.options.showTools.dataset.tool_status)
				if( this.isThisInnerRange(target) == false && this.Tool.options.showTools.dataset.tool_status != 'connected'){
					console.log(this.constructor.name, 2)
					console.log(this.constructor.name, this.Tool.options.showTools.dataset.tool_status)
					this.Tool.options.showTools.dataset.tool_status = '';
					if((this.textContent.includes('\u200B') && this.textContent.length == 1) || this.textContent.length == 0){
						this.remove();
					}
				}
				return;
			}else if(this.isThisInnerRange(target)){//target.Tool && target.Tool.options == this.Tool.options){
				this.Tool.options.showTools.removeAttribute('data-is_alive');
				console.log(this.constructor.name, 3)
				console.log(this.constructor.name, this.Tool.options.showTools.dataset.tool_status)
				this.Tool.options.showTools.dataset.tool_status = 'connected';
			}else if(this.isThisInnerRange(target) == false && this.Tool.options.showTools.dataset.tool_status != 'connected'){
				this.Tool.options.showTools.dataset.tool_status = '';
				if(this.textContent.includes('\u200B') && this.textContent.length == 1){
					this.remove();
				}
			}else{
				console.log(this.constructor.name, 4)
				console.log(this.constructor.name, this.isThisInnerRange(target))
				this.Tool.options.showTools.dataset.tool_status = 'blur';
			}
		})
		*/
	}
	
	connectedCallback(){
		if( ! this.#isLoaded){
			this.#isLoaded = true;
			this.constructor.options.connectedFriends = this;
		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
		this.constructor.options.connectedFriends = this;
    }
	/*
	#mergeedSameTool(){
		console.log('merge',this.textContent)
		let parentSameElement = this.closest(`.${this.options.defaultClass}`);
		if(this.nextElementSibling && this.nextElementSibling.constructor.name == this.constructor.name && this.nextElementSibling != this){
			console.log('next')
			console.log(this.nextElementSibling)
			console.log(this == this.nextElementSibling)
			this.nextElementSibling.prepend(...this.childNodes);
			this.remove();
		}else if(this.previousElementSibling && this.previousElementSibling.constructor.name == this.constructor.name && this.previousElementSibling != this){
			console.log('prev')
			console.log(this.previousElementSibling)
			this.previousElementSibling.append(...this.childNodes);
			this.remove();
		}else if(parentSameElement && parentSameElement.constructor.name == this.constructor.name && parentSameElement != this){
			console.log('parent')
			parentSameElement.append(...this.childNodes);
			this.remove();
		}
		//this.remove();
	}
	#directionAppend(){

	}
	*/
	/*
	isThisInnerRange(){
		let {x:thisX, y:thisY, width:thisWidth, height:thisHeight} = this.getBoundingClientRect();
		let {x, y, width, height} = window.getSelection().getRangeAt(0).getBoundingClientRect()
		let isInnerX = ((x + width) <= (thisX + thisWidth) && x >= thisX);
		let isInnerY = ((y + height) >= (thisY + thisHeight) && y == thisY);
		return (isInnerX && isInnerY);
	}
	*/
}