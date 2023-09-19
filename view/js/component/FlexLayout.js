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

	static get observedAttributes() {
		return ['data-direction'];
	}

	#isLoaded = false;
	#growLimit = 0; 
	//#shrinkDefault = 1;
	//#basisDefault = '0%';
	
	// 가로 모드인 경우 lastElementChild의 리사이즈 제거 필요
	// 세로 모드인 경우 firstElementChild의 리사이즈 제거 필요 
	#growChangeObserver = new MutationObserver( (mutationList, observer) => {
		mutationList.forEach((mutation) => {
			mutation.target.style.flex = `${parseFloat(mutation.target.dataset.grow)} 1 0%`;
			/*if(window.getComputedStyle(mutation.target).transition == 'all 0s ease 0s'){
				this.resize(mutation.target.__resizePanel);	
			}else{
				const removeEvent = (event) => {
					let rect = mutation.target.getBoundingClientRect();
					this.resize(mutation.target.__resizePanel, rect);
					mutation.target.removeEventListener('transitionend', removeEvent, true);
				}
				mutation.target.addEventListener('transitionend', removeEvent, true);
			}*/
		});
	})

	#visibleObserver = new MutationObserver((mutationList, observer) => {
		// 정해진 방향의 사이즈만(width or height) 0일뿐 다른 다른 방향 사이즈는 그대로여서 
		// intersection observer(가시성 영역 체크 코드)가 미동작함
		mutationList.forEach((mutation) => {
			let currentFlexGrow = parseFloat(mutation.target.style.flex.split(' ')[0]);
			let currentStyle = window.getComputedStyle(mutation.target);
			let currentSize = parseFloat(currentStyle[this.sizeName]);
			//let minSize = parseFloat(currentStyle['min' + this.sizeName.charAt(0).toUpperCase() + this.sizeName.substring(1)]);
			let {target} = mutation;
			if( ! isNaN(currentFlexGrow) && currentFlexGrow == 0 && currentSize == 0){//&& (currentSize == 0 || minSize >= currentSize)){
				// 뷰포트 내에서 해당 영역이 보이지 않는 경우
				target.style.visibility = 'hidden';
				target.style.opacity = 0;
				target.dataset.visibility = 'h'
				//console.log('hidden!');
			}else{
				// 뷰포트 내에서 보이는 경우
				target.style.visibility = '';
				target.style.opacity = '';
				target.style.visibility = 'h';
				//console.log('show!')
			}
		});
	});

	xy;
	targetDirection;
	nextElementDirection;
	sizeName;
	resizeCursor;

	resizeTargetList = [];

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
						this.#visibleObserver.observe(childElement, {
							attributeFilter:['style'],
							attributeOldValue:true
						});
						this.resizeTargetList.push(childElement);
					}
				});
				let forResizeList = [...this.children].filter(e=>e.dataset.is_resize == 'true');
				this.#growLimit = forResizeList.length;

				new Promise(resolve => {
					let notGrowList = [];
					let remain = forResizeList.reduce((t,e,i)=>{
						this.#growChangeObserver.observe(e, {
							attributeFilter:['data-grow'],
						})
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
		
		resizePanel.addEventListener('mousedown', () => {
			resizePanel.setAttribute('data-is_mouse_down', '');
			resizePanel.querySelector('.hover').setAttribute('data-is_hover', '');
			document.body.style.cursor = this.resizeCursor;
		})
		window.addEventListener('mouseup', (event) => {
			if( resizePanel.hasAttribute('data-is_mouse_down')) {
				resizePanel.removeAttribute('data-is_mouse_down');
			}
			
			resizePanel.querySelector('.hover').removeAttribute('data-is_hover', '');
			
			if(document.body.style.cursor == 'ew-resize' || document.body.style.cursor == 'ns-resize'){
				document.body.style.cursor = '';
			}
		})
		
		resizePanel.addEventListener('mouseup', () => {
			resizePanel.removeAttribute('data-is_mouse_down');
		})
		window.addEventListener('mousemove', (event) => {
			if( ! resizePanel.hasAttribute('data-is_mouse_down') || ! resizePanel.__resizeTarget ){
				return;
			}
			// 부모요소 width 계산, 자기 자신 요소 width 마우스 위치값 비율 계산, 비율 기준으로 limit의 비율 재계산하여 flex grow 반영
			this.getResizeRequiredObject(resizePanel).then(obj => {
				let targetSize = event[this.xy] - obj.targetRect[this.targetDirection];
				let nextElementSize = obj.nextElementRect[this.nextElementDirection] - event[this.xy];
				obj.targetSize = targetSize;
				obj.nextElementSize = nextElementSize;
				return obj;	
			})
			.then(obj => this.resize(resizePanel, obj));

		})
	}

	getResizeRequiredObject(resizePanel){
		return new Promise(resolve=>{
			let targetElement = resizePanel.__resizeTarget;
			let nextElement = resizePanel.nextElementSibling;
			let targetRect = targetElement.getBoundingClientRect();
			let nextElementRect = nextElement.getBoundingClientRect();

			let parentSize = this.getBoundingClientRect()[this.sizeName];

			let minSizeName = 'min' + this.sizeName.charAt(0).toUpperCase() + this.sizeName.substring(1);
			let targetMinSize = parseFloat(window.getComputedStyle(resizePanel.__resizeTarget)[minSizeName]);
			let nextElementMinSize = parseFloat(window.getComputedStyle(resizePanel.nextElementSibling)[minSizeName]);
			resolve({
				targetElement,
				nextElement,
				targetRect,
				nextElementRect,
				parentSize,
				minSizeName,
				targetMinSize,
				nextElementMinSize
			})
		})
	}

	resize(resizePanel, {
		targetElement,
		nextElement,
		targetRect,
		nextElementRect,
		parentSize,
		minSizeName,
		targetMinSize,
		nextElementMinSize,
		targetSize,
		nextElementSize
	}){
		return new Promise(resolve => {
			console.log('targetSize', targetSize);
			console.log('targetElement', targetElement);
			console.log('nextElementSize', nextElementSize);
			console.log('nextElement', nextElement);
			console.log('resizePanel', resizePanel);
			if(targetSize <= 0 || (isNaN(targetMinSize) ? false : targetMinSize >= targetSize)){
				//targetSize = 0
				//nextElementWidth = targetRect.width + nextElementRect[sizeName]
				nextElementSize = nextElementRect[this.sizeName]
				let previousElement = targetElement.previousElementSibling.__resizeTarget;
				let previousElementSize = previousElement.getBoundingClientRect()[this.sizeName] - targetSize;
				let previousMinSize =  parseFloat(window.getComputedStyle(previousElement)[minSizeName]);
				if(previousElement){
					let previousElementFlexGrow = ( previousElementSize / (parentSize - previousMinSize - 1)) * this.#growLimit;
					previousElement.style.flex = `${previousElementFlexGrow} 1 0%`;
				}
				targetSize = 0
			}else if(nextElementSize <= 0 || (isNaN(nextElementMinSize) ? false : nextElementMinSize >= nextElementSize)){
				//targetWidth = targetRect[sizeName] + nextElementRect.width;
				targetSize = targetRect[this.sizeName];
				nextElementSize = 0
			}
			let targetFlexGrow = (targetSize / (parentSize - targetMinSize - 1)) * this.#growLimit;
			let nextElementFlexGrow = (nextElementSize / (parentSize - targetMinSize - 1)) * this.#growLimit;
			resizePanel.__resizeTarget.style.flex = `${targetFlexGrow} 1 0%`;
			resizePanel.nextElementSibling.style.flex = `${nextElementFlexGrow} 1 0%`;
			resolve();
		})
	}

	closeFlex(resizeTarget){
		if( ! resizeTarget.hasAttribute('data-is_resize') || resizeTarget.dataset.is_resize == false){
			return;
		}

		resizeTarget.style.transition = 'flex 0.5s';
		resizeTarget.ontransitionend = () => {
			resizeTarget.style.transition = '';
		}

		if(! resizeTarget.__resizePanel.nextElementSibling || resizeTarget.__resizePanel.nextElementSibling.dataset.grow == 0){
			resizeTarget.dataset.grow = 0;
			return;
		}

		resizeTarget.__resizePanel.nextElementSibling.style.transition = 'flex 0.5s';
		resizeTarget.__resizePanel.nextElementSibling.ontransitionend = () => {
			resizeTarget.__resizePanel.nextElementSibling.style.transition = '';
		}

		let prevGrow = parseFloat(resizeTarget.style.flex.split(' ')[0]);
		resizeTarget.dataset.grow = 0;
		resizeTarget.__resizePanel.nextElementSibling.style.flex =
			parseFloat(resizeTarget.__resizePanel.nextElementSibling.style.flex.split(' ')[0]) + prevGrow + ' 1 0%';
	}

	openFlex(resizeTarget){
		if( ! resizeTarget.hasAttribute('data-is_resize') || resizeTarget.dataset.is_resize == false){
			return;
		}

		resizeTarget.style.transition = 'flex 0.5s';
		resizeTarget.ontransitionend = () => {
			resizeTarget.style.transition = '';
		}

		if(! resizeTarget.__resizePanel.nextElementSibling || resizeTarget.__resizePanel.nextElementSibling.dataset.grow == 0){
			resizeTarget.dataset.grow = 1;
			return;
		}

		resizeTarget.__resizePanel.nextElementSibling.style.transition = 'flex 0.5s';
		resizeTarget.__resizePanel.nextElementSibling.ontransitionend = () => {
			resizeTarget.__resizePanel.nextElementSibling.style.transition = '';
		}

		let prevGrow = parseFloat(resizeTarget.__resizePanel.nextElementSibling.style.flex.split(' ')[0]) - 1;

		resizeTarget.dataset.grow = prevGrow == 0 ? 1 : prevGrow;

		resizeTarget.__resizePanel.nextElementSibling.dataset.grow = 1;
	}

	reflex(resizePanel){
		/*
		return new Promise(resolve=>{
			this.getResizeRequiredObject(resizePanel).then(obj => {
				let targetSize = obj.targetRect[this.targetDirection];
				let nextElementSize = obj.nextElementRect[this.nextElementDirection]
				obj.targetSize = targetSize;
				obj.nextElementSize = nextElementSize;
				this.resize(resizePanel, obj);
			})
			resolve();
		});
		*/
		/*
		return new Promise(resolve=>{
			Promise.all(this.resizeTargetList.map(async resizeTarget=>{
				if(resizePanel == resizeTarget.__resizePanel || ! resizeTarget.__resizePanel.nextElementSibling){
					return Promise.resolve();
				}
				return this.getResizeRequiredObject(resizeTarget.__resizePanel).then(obj => {
					let targetSize = obj.targetRect[this.targetDirection];
					let nextElementSize = obj.nextElementRect[this.nextElementDirection]
					obj.targetSize = targetSize;
					obj.nextElementSize = nextElementSize;
					return {resizePanel, obj}
				})
			})).then(flexTargetList => {
				flexTargetList.filter(e=> e != undefined).forEach( ({resizePanel, obj}) => {
					console.log(obj.targetSize);
					let targetFlexGrow = (obj.targetSize / obj.parentSize) * this.#growLimit;
					resizePanel.__resizeTarget.style.flex = `${targetFlexGrow} 1 0%`;
				})
			})
			resolve();
		});
		*/
	}

	attributeChangedCallback(name, oldValue, newValue){
		if(newValue == 'row'){
			this.xy = 'x';
			this.targetDirection = 'left';
			this.nextElementDirection = 'right';
			this.sizeName = 'width';
			this.resizeCursor = 'ew-resize';
		}else if(newValue == 'column'){
			//is ::: this.dataset.direction == 'column'
			this.xy = 'y';
			this.targetDirection = 'top';
			this.nextElementDirection = 'bottom';
			this.sizeName = 'height';
			this.resizeCursor = 'ns-resize';
		}else {
			throw new Error('direction is "row" or "column" required value');
		}
	}
}


window.customElements.define(FlexLayout.componentName, FlexLayout);