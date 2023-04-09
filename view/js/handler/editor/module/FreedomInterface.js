
export default class FreedomInterface extends HTMLElement {
	#isLoaded = false;
	Tool;
	options;
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
		this.Tool = Tool;
		this.options = Tool.options;
		this.classList.add(this.options.defaultClass)
		this.tabIndex = 1;
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
		document.addEventListener("selectionchange", (event) => {
			if( ! this.Tool.options.showTools){
				return;
			}

			let target = window.getSelection().focusNode.parentElement;
			// u200B를 제거하는 로직으로 인해 오류 발생하여 추가 20230405
			if(( this.textContent.includes('\u200B') || this.Tool.options.showTools.hasAttribute('data-is_alive') ) && ( ! target.Tool || target.Tool.options != this.Tool.options)){
				//let lastClickElement = FreedomInterface.lastClickElementPath.filter(e=>e==this.Tool.options.showTools)[0];
				//console.log('lastClickElement',lastClickElement)
				if( FreedomInterface.isMouseInnerElement(this) == false && FreedomInterface.isMouseInnerElement(this.Tool.options.showTools) == false){
					this.Tool.options.showTools.dataset.tool_status = '';
					if(this.textContent.includes('\u200B') && this.textContent.length == 1){
						//this.Tool.options.showTools.dataset.tool_status = '';
						this.remove();
					}
				}
				return;
			}else if(target.Tool && target.Tool.options == this.Tool.options){
				this.Tool.options.showTools.removeAttribute('data-is_alive');
				this.Tool.options.showTools.dataset.tool_status = 'active';
			}else if(FreedomInterface.isMouseInnerElement(this.Tool.options.showTools) == false){
				this.Tool.options.showTools.dataset.tool_status = '';
				if(this.textContent.includes('\u200B') && this.textContent.length == 1){
					this.remove();
				}
			} 
		})
	}

}