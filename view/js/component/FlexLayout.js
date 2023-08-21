/**
 * 커스텀 메인 레이아웃
 */

class FlexLayout extends HTMLElement {
	
	static #componentName = 'flex-layout'
	static #parentClass = 'flux-layout-wrap';
	static #childClass = 'flux-layout-content';
	static #resizePanelClass = 'flex-resize-panel';
	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'flex-layout-style',
		textContent : `
			${this.#componentName}{
				display: inline-flex;
				height: 100%;
				width: 100%;
				overflow: auto;
				overflow-wrap: revert-layer;
				-ms-overflow-style: none;
				scrollbar-width: none;
			}
			${this.#componentName}::-webkit-scrollbar{
				display: none;
			}
			${this.#componentName}[data-direction="column"]{
				flex-direction: column;
			}
			${this.#componentName}[data-direction="row"]{
				flex-direction: row;
			}
			${this.#componentName} > .${this.#childClass} > *{
				display: flex;
				flex-direction: column;
				height: 100%;
				width: 100%;
			}
			${this.#componentName} > .${this.#childClass}[data-is_resize="true"]{
				flex: 1 1 0%;
				box-sizing: border-box;
				overflow: hidden;
			}
			${this.#componentName} > .${this.#childClass}[data-is_resize="false"]{
				flex: 0 0 0%;
				box-sizing: border-box;
			}
			${this.#componentName} .${this.#resizePanelClass}{
				background-color: #b1b1b1;
				z-index: 9999;
				display: flex;
				justify-content: center;
				flex: 0 0 0.1%;
				-moz-user-select: -moz-none;
				-khtml-user-select: none;
				-webkit-user-select: none;
				-ms-user-select: none;
				user-select: none;
				right: 0;
				bottom: 0;
			}
			${this.#componentName}[data-direction="row"] .${this.#resizePanelClass}{
				width: 2.5px;
				height: 100%;
			}
			${this.#componentName}[data-direction="column"] .${this.#resizePanelClass}{
				height: 2.5px;
				width:100%;
			}
			${this.#componentName}[data-direction="row"] .${this.#resizePanelClass}:hover > .hover, 
			${this.#componentName}[data-direction="row"] .${this.#resizePanelClass} > .hover[data-is_hover]{
				width: 3px;
				height: inherit;
			}
			${this.#componentName}[data-direction="column"] .${this.#resizePanelClass}:hover > .hover,
			${this.#componentName}[data-direction="column"] .${this.#resizePanelClass} > .hover[data-is_hover]{
				height: 3px;
				width: inherit;
			}
			${this.#componentName}[data-direction="row"] .${this.#resizePanelClass}{
				cursor: ew-resize;
			}
			${this.#componentName}[data-direction="column"] .${this.#resizePanelClass}{
				cursor: ns-resize;
			}
			${this.#componentName} .${this.#resizePanelClass} > .hover{
				opacity: 0;
				visibility: hidden;
				transition: all 1s;
			}
			${this.#componentName} .${this.#resizePanelClass}:hover{
				animation-name: drag-panel-hover;
				animation-fill-mode: forwards;
				animation-direction: normal;
				animation-duration: 0.3s;
				animation-iteration-count: 1;
				animation-timing-function: cubic-bezier(1, -0.37, 0.73, 0.8);
			}
			
			${this.#componentName} .${this.#resizePanelClass}:hover > .hover,
			${this.#componentName} .${this.#resizePanelClass} > .hover[data-is_hover]{
				background-color: #0066ffb5;
				z-index: 9999;
				position: absolute;
				display: block;
				opacity: 1;
				visibility: inherit;
				transition: all 1s;
				animation-name: drag-panel-hover-highlight;
				animation-fill-mode: forwards;
				animation-direction: normal;
				animation-duration: 0.3s;
				animation-iteration-count: 1;
				animation-timing-function: cubic-bezier(1, -0.37, 0.73, 0.8);
			}
			@keyframes drag-panel-hover {
				0%{background-color: #b1b1b1d6;}
				10%{background-color: #b1b1b1ba;}
				20%{background-color: #b1b1b194;}
				40%{background-color: #b1b1b17d;}
				60%{background-color: #b1b1b152;}
				80%{background-color: #b1b1b130;}
				100%{background-color: #b1b1b100;animation-play-state: paused;}
			}
			@keyframes drag-panel-hover-highlight {
				0%{opacity: 0;}
				10%{opacity: 0.1;}
				20%{opacity: 0.2;}
				40%{opacity: 0.4;}
				60%{opacity: 0.6;}
				80%{opacity: 0.8;}
				100%{opacity: 1;animation-play-state: paused;}
		`
	});

	static{
		document.head.append(this.#defaultStyle);
	}

	static get componentName(){
		return this.#componentName;
	}
	static get parentClass(){
		return this.#parentClass;
	}
	static get childClass(){
		return this.#childClass;
	}
	static get resizePanelClass(){
		return this.#resizePanelClass;
	}

	#isLoaded = false;
	#growLimit = 0; 
	//#shrinkDefault = 1;
	//#basisDefault = '0%';
	
	// 가로 모드인 경우 lastElementChild의 리사이즈 제거 필요
	// 세로 모드인 경우 firstElementChild의 리사이즈 제거 필요 
	constructor(){
		super();
		let observer = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => {
				let {addedNodes, removedNodes} = mutation;
				addedNodes.forEach(childElement=>{
					if(childElement.nodeType != Node.ELEMENT_NODE || childElement.classList.contains(FlexLayout.resizePanelClass)){
						return;
					}
					childElement.classList.add(FlexLayout.childClass)
					
					if(childElement.dataset.is_resize == 'true'){
						let resizePanel = this.#createResizePanel();
						childElement.__resizePanel = resizePanel;
						
						childElement.after(resizePanel);
						
						resizePanel.__resizeTarget = childElement; 
					}
				});
				let forResizeList = [...this.children].filter(e=>e.dataset.is_resize == 'true');
				this.#growLimit = forResizeList.length;

				new Promise(resolve => {
					let notGrowList = [];
					let remain = forResizeList.reduce((t,e,i)=>{
						if(e.hasAttribute('data-grow') == false){
							notGrowList.push(e);
							return t;
						}
						let grow = parseFloat(e.dataset.grow);
						e.style.flex = `${grow} 1 0%`;
						t -= grow;
						return t;
					}, this.#growLimit);

					const resizeFun = (list) => {
						let resizeWeight = (remain - list.length) / list.length;
						list.forEach(e=>{
							e.style.flex = `${1 + resizeWeight} 1 0%`;
						});
					}
					if(notGrowList.length == 0){
						resizeFun(forResizeList);
					}else{
						resizeFun(notGrowList);
					}

					resolve();
				});
			});
		})
		observer.observe(this, {childList:true});
	}

	connectedCallback(){
        if( ! this.#isLoaded){
			this.#isLoaded = true;
			/*
			document.addEventListener('DOMContentLoaded', (event) => {

			})
			*/
        }
    }

	disconnectedCallback(){
        this.#isLoaded = false;
    }

	#createResizePanel (){
		// panel_width가 반드시 필요한지 확인 할 것 2023 06 20
		let resizePanel = Object.assign(document.createElement('div'), {
			className: FlexLayout.resizePanelClass,
			innerHTML : `
				<div class="hover">
				</div>
				<div class="panel_width">
				</div>
			`
		});
		this.#addResizePanelEvent(resizePanel);
		return resizePanel;
	}

	/**
	 * 
	 * @param {HTMLElement} resizePanel 
	 */
	#addResizePanelEvent(resizePanel){
		
		resizePanel.onmousedown = (event) => {
			resizePanel.setAttribute('data-is_mouse_down', '');
			resizePanel.querySelector('.hover').setAttribute('data-is_hover', '');
			document.body.style.cursor = this.getCursor;
		}

		window.addEventListener('mouseup', (event) => {
			if( resizePanel.hasAttribute('data-is_mouse_down')) {
				resizePanel.removeAttribute('data-is_mouse_down');
			}
			
			resizePanel.querySelector('.hover').removeAttribute('data-is_hover', '');
			
			if(document.body.style.cursor == 'ew-resize' || document.body.style.cursor == 'ns-resize'){
				document.body.style.cursor = '';
			}
		})
		
		resizePanel.onmouseup = (event) => {
			resizePanel.removeAttribute('data-is_mouse_down');
		}

		window.addEventListener('mousemove', (event) => {
			if( ! resizePanel.hasAttribute('data-is_mouse_down') || ! resizePanel.__resizeTarget ){
				return;
			}
			// 부모요소 width 계산, 자기 자신 요소 width 마우스 위치값 비율 계산, 비율 기준으로 limit의 비율 재계산하여 flex grow 반영
			
			let targetRect = resizePanel.__resizeTarget.getBoundingClientRect();
			let nextElementRect = resizePanel.nextElementSibling.getBoundingClientRect();

			let xy;
			let targetDirection;
			let nextElementDirection;
			let sizeName;
			let parentSize;
			if(this.dataset.direction == 'row'){
				xy = 'x';
				targetDirection = 'left';
				nextElementDirection = 'right'
				sizeName = 'width'
				parentSize = this.getBoundingClientRect().width;
			}else{
				xy = 'y';
				targetDirection = 'top';
				nextElementDirection = 'bottom';
				sizeName = 'height';
				parentSize = this.getBoundingClientRect().height;
			}

			let targetWidth = event[xy] - targetRect[targetDirection];
			let nextElementWidth = nextElementRect[nextElementDirection] - event[xy];

			if(targetWidth < 0){
				targetWidth = 0
				nextElementWidth = /*targetRect.width +*/ nextElementRect[sizeName]
			}else if(nextElementWidth < 0){
				targetWidth = targetRect[sizeName] /*+ nextElementRect.width*/;
				nextElementWidth = 0
			}

			let targetFlexGrow = (targetWidth / parentSize) * this.#growLimit;
			let nextElementFlexGrow = (nextElementWidth / parentSize) * this.#growLimit;

			resizePanel.__resizeTarget.style.flex = `${targetFlexGrow} 1 0%`;
			resizePanel.nextElementSibling.style.flex = `${nextElementFlexGrow} 1 0%`;

		})
	}
	get getCursor(){
		let resizeCursor;
		if(this.dataset.direction == 'row'){
			resizeCursor = 'ew-resize';
		}else{
			//is ::: this.dataset.direction == 'column'
			resizeCursor = 'ns-resize';
		}
		return resizeCursor;
	}
}


window.customElements.define(FlexLayout.componentName, FlexLayout);