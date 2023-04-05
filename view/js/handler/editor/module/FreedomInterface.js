
export default class FreedomInterface extends HTMLElement {
	#isLoaded = false;
	Tool;
	options;
	constructor(Tool){
		super();
		this.Tool = Tool;
		this.options = Tool.options;
		let isKeyPress = false;
		this.draggable = true;
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
			if(this.textContent.includes('\u200B') || this.textContent.length <= 2){
				return;
			}else if(target == this){
				this.Tool.options.showTools.dataset.tool_status = 'active';
			}else{
				this.Tool.options.showTools.dataset.tool_status = '';
			}
		})
	}
	connectedCallback(){
		if( ! this.#isLoaded ){
			this.#isLoaded = true;
			//this.draggable = true;
			this.classList.add(this.options.defaultClass)
		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
    }
}