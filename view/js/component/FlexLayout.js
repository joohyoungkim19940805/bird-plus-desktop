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
				position: relative;
				-moz-user-select: -moz-none;
				-khtml-user-select: none;
				-webkit-user-select: none;
				-ms-user-select: none;
				user-select: none;
				right: 0;
				bottom: 0;
			}
			${this.#componentName}[data-direction="row"] .${this.#resizePanelClass}{
				width: 4px;
				height: 100%;
			}
			${this.#componentName}[data-direction="column"] .${this.#resizePanelClass}{
				height: 4px;
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
		});
	})

	#visibleObserver = new MutationObserver((mutationList, observer) => {
		// 정해진 방향의 사이즈만(width or height) 0일뿐 다른 다른 방향 사이즈는 그대로여서 
		// 가시성 영역 체크 코드가 미동작하여 추가
		mutationList.forEach((mutation) => {
			let currentFlexGrow = parseFloat(mutation.target.style.flex.split(' ')[0]);
			let currentStyle = window.getComputedStyle(mutation.target);
			let currentSize = parseFloat(currentStyle[this.sizeName]);
			let minSize = parseFloat(currentStyle['min' + this.sizeName.charAt(0).toUpperCase() + this.sizeName.substring(1)]);
			let {target} = mutation;
			if( ! isNaN(currentFlexGrow) && ( currentFlexGrow == 0 || (currentSize == 0 || minSize >= currentSize) )){
				// 뷰포트 내에서 해당 영역이 보이지 않는 경우
				target.dataset.visibility = 'h'
				//target.dataset.grow = 0;
			}else{
				// 뷰포트 내에서 보이는 경우
				target.dataset.visibility = 'v';
			}
		});
	});

	xy;
	targetDirection;
	nextElementDirection;
	sizeName;
	resizeCursor;
	isReverseMoveCheckingFunction;

	forResizeList = [];

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
					}
				});
				this.forResizeList = [...this.children].filter(e=>e.dataset.is_resize == 'true');
				this.forResizeList.forEach(e=>{
					this.#growChangeObserver.observe(e, {
						attributeFilter:['data-grow'],
					})
				})
				this.#growLimit = this.forResizeList.length;
				this.remain();
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
			this.totalMovement = 0;

			resizePanel.setAttribute('data-is_mouse_down', '');
			resizePanel.querySelector('.hover').setAttribute('data-is_hover', '');
			document.body.style.cursor = this.resizeCursor;
		})
		window.addEventListener('mouseup', (event) => {
			this.totalMovement = 0;

			resizePanel.removeAttribute('data-is_mouse_down');
			resizePanel.querySelector('.hover').removeAttribute('data-is_hover', '');
			
			if(document.body.style.cursor == 'ew-resize' || document.body.style.cursor == 'ns-resize'){
				document.body.style.cursor = '';
			}

		})
		
		resizePanel.addEventListener('mouseup', () => {
			resizePanel.removeAttribute('data-is_mouse_down');
			this.totalMovement = 0;
		})
		window.addEventListener('mousemove', (event) => {
			if( ! resizePanel.hasAttribute('data-is_mouse_down') || ! resizePanel.__resizeTarget ){
				return;
			}

			// 부모요소 계산, 자기 자신 요소와 마우스 위치값 비율 계산, 비율 기준으로 limit의 비율 재계산하여 flex grow 반영
			this.getResizeRequiredObject(resizePanel)
			.then(obj => this.move(resizePanel, event, obj));

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
			let targetMinSize = parseFloat(window.getComputedStyle(resizePanel.__resizeTarget)[minSizeName]) || 1;
			let nextElementMinSize = parseFloat(window.getComputedStyle(resizePanel.nextElementSibling)[minSizeName]) || 1;
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

	move(resizePanel, event, {
		targetElement,
		nextElement,
		targetRect,
		nextElementRect,
		parentSize,
		minSizeName,
		targetMinSize,
		nextElementMinSize,
	}){
		let mousePosition = event[this.xy];

		this.totalMovement += event['movement' + this.xy.toUpperCase()]

		return new Promise(resolve => {
			let targetSize = mousePosition - targetRect[this.targetDirection];
			let nextElementSize = nextElementRect[this.nextElementDirection] - mousePosition;
			
			let overMoveList = [];
			let overTotalMinSize = 0;
			const isOverMove = (elementSize, elementMinSize) => {
				return Math.floor(elementSize) <= 0 || (isNaN(elementMinSize) ? false : elementMinSize >= Math.floor(elementSize));
			}
			const addOverMoveList = (element, elementSize, elementMinSize, elementRect) => {
				overMoveList.push({
					element,
					elementSize,
					elementMinSize,
					elementRect
				});
			}
			const overMoveProcessing = (element, direction = 'previousElementSibling') => {
				let overElement = element[direction]?.[direction];
				let overElementRect;
				let overElementSize;
				let overElementMinSize;
				return new Promise(resolve =>{

					if(overElement){
						overElementRect = overElement.getBoundingClientRect();
						if(direction === 'previousElementSibling'){
							overElementSize = mousePosition - overElementRect[this.targetDirection]// - (targetRect[this.nextElementDirection] - targetRect[this.targetDirection]);
						}else{
							overElementSize = /*(nextElementRect[this.targetDirection] - nextElementRect[this.nextElementDirection]) + */overElementRect[this.nextElementDirection] - mousePosition;
						}
						overElementMinSize = parseFloat(window.getComputedStyle(overElement)[minSizeName]) || 0;
						overTotalMinSize += overElementMinSize;
						if(isOverMove(overElementSize, overElementMinSize)){
							addOverMoveList(overElement, 0, overElementMinSize, overElementRect);
							let loopOverElement = overElement[direction]?.[direction];
							let loopOverElementRect;
							let loopOverElementSize;
							let loopOverElementMinSize;
							while(loopOverElement){
	
								loopOverElementRect = loopOverElement.getBoundingClientRect();
								if(direction === 'previousElementSibling'){
									loopOverElementSize = mousePosition - loopOverElementRect[this.targetDirection] //- (targetRect[this.nextElementDirection] - targetRect[this.targetDirection]);
								}else{
									loopOverElementSize = /*(nextElementRect[this.targetDirection] - nextElementRect[this.nextElementDirection]) +*/ loopOverElementRect[this.nextElementDirection] - mousePosition;
								}
								loopOverElementMinSize = parseFloat(window.getComputedStyle(loopOverElement)[minSizeName]) || 0;

								if(isOverMove(loopOverElement, overTotalMinSize)){
									overElementSize = overElementRect[this.sizeName];
									overTotalMinSize += loopOverElementMinSize;
									addOverMoveList(loopOverElement, 0, loopOverElementMinSize, loopOverElementRect);
								}else{
									addOverMoveList(loopOverElement, loopOverElementSize, loopOverElementMinSize, loopOverElementRect);
									break;
								}
								
								loopOverElement = loopOverElement[direction]?.[direction];
							}
						}else{
							addOverMoveList(overElement, overElementSize, overElementMinSize, overElementRect);
						}
					}

					resolve();
				});
			}

			let overMoveProcessingPromise;
			let overMoveDirection;
			if(isOverMove(targetSize, targetMinSize)){
				overMoveList = [];
				overTotalMinSize += targetMinSize;
				overMoveDirection = 'previousElementSibling';
				overMoveProcessingPromise = overMoveProcessing(targetElement, 'previousElementSibling')
				targetSize = 0;
			}else if(isOverMove(nextElementSize, nextElementMinSize)){
				overMoveList = [];
				overTotalMinSize += nextElementMinSize;
				overMoveDirection = 'nextElementSibling';
				overMoveProcessingPromise = overMoveProcessing(nextElement, 'nextElementSibling')
				nextElementSize = 0;
			}else{
				overMoveProcessingPromise = Promise.resolve(false);
			}

			overMoveProcessingPromise.then(()=>{
				
				/*console.log('overTotalMinSize',overTotalMinSize);
				console.log('totalMovement',this.totalMovement);
				console.log('targetRect',targetRect);
				console.log('nextElementRect', nextElementRect);*/
	
				let targetFlexGrow = (targetSize / (parentSize - (targetMinSize || 0) - 1)) * this.#growLimit;
				targetElement.style.flex = `${targetFlexGrow} 1 0%`;
				let nextElementFlexGrow = (nextElementSize / (parentSize - (nextElementMinSize || 0) - 1)) * this.#growLimit;
				nextElement.style.flex = `${nextElementFlexGrow} 1 0%`;
				
				let lastItem = overMoveList[overMoveList.length - 1];
				let addNextOverMoveProcessingPromise
				if(lastItem && isOverMove(lastItem.elementSize, overTotalMinSize)){
				addNextOverMoveProcessingPromise = overMoveProcessing(lastItem.element, overMoveDirection).then(()=>{
						lastItem.elementSize = 0;
					});
				}else{
					addNextOverMoveProcessingPromise = Promise.resolve();
				}
				
				addNextOverMoveProcessingPromise = Promise.resolve();
				addNextOverMoveProcessingPromise.then(() => {
					overMoveList.reverse().forEach( async ({
						element,
						elementSize,
						elementMinSize,
						elementRect
					}, i)=>{
							if( elementMinSize >= Math.abs(this.totalMovement) * overMoveList.length ){
								return;
							}else if(element.dataset.visibility == 'h'){
								elementSize = 0;
							}/*else if(isOverMove(elementSize, elementMinSize)){
								return;
							}*/
							let flexGrow = (elementSize / (parentSize - (elementMinSize || 0) - 1)) * this.#growLimit;
							element.style.flex = `${flexGrow} 1 0%`;
							this.prevOverFlexGrow = flexGrow;
							this.prevOverRect = elementRect;
					})
				})
				
			})

			resolve();
		})
	}

	closeFlex(resizeTarget, {isResize = false} = {}){
		return new Promise(resolve=>{
			if( ! resizeTarget.hasAttribute('data-is_resize') || resizeTarget.dataset.is_resize == false){
				resolve(resizeTarget);
				return;
			}

			resizeTarget.dataset.prev_grow = this.getGrow(resizeTarget);

			let notCloseList = this.forResizeList.filter(e=>e.style.flex != '0 1 0%' && e != resizeTarget);
			let notCloseAndOpenTargetList = [...notCloseList, resizeTarget];
			let resizeWeight = this.mathWeight(notCloseList, this.forResizeList.length);
			notCloseAndOpenTargetList.forEach(e=>{
				e.style.transition = 'flex 0.5s';
				e.ontransitionend = () => {
					e.style.transition = '';
				}
				
				if(e == resizeTarget){
					e.dataset.grow = 0;
					return;
				}

				if(isResize){
					return;
				}



				let percent = (this.getGrow(e) / this.forResizeList.length);
				
				e.dataset.grow = (this.forResizeList.length * percent) + resizeWeight * percent;
			})

			if(isResize){
				this.resize(notCloseList, this.forResizeList.length);
			}

			resolve(resizeTarget);
		});
	}

	openFlex(resizeTarget, {isPrevSizeOpen = false, isResize = false} = {}){
		return new Promise(resolve=>{
			if( ! resizeTarget.hasAttribute('data-is_resize') || resizeTarget.dataset.is_resize == false){
				resolve(resizeTarget)
				return;
			}

			let notCloseList = this.forResizeList.filter(e=>e.style.flex != '0 1 0%' && e != resizeTarget);
			let notCloseAndOpenTargetList = [...notCloseList, resizeTarget];
			let resizeWeight = this.mathWeight(notCloseAndOpenTargetList, this.forResizeList.length);
			notCloseAndOpenTargetList.forEach(e=>{
				e.style.transition = 'flex 0.5s';
				e.ontransitionend = () => {
					e.style.transition = '';
				}
				
				if(isResize){
					return;
				}
				
				if(e == resizeTarget){
					e.dataset.grow = (isPrevSizeOpen ? resizeTarget.dataset.prev_grow : undefined) || resizeWeight;
					resizeTarget.removeAttribute('data-prev_grow');
					return;
				}

				let percent = this.getGrow(e) / this.forResizeList.length;
				e.dataset.grow = (this.forResizeList.length - resizeWeight) * percent;
			});

			if(isResize){
				this.resize(notCloseAndOpenTargetList, this.forResizeList.length);
			}
			
			
			resolve(resizeTarget)
		})
	}

	remain(){
		return new Promise(resolve => {
			let notGrowList = [];
			let totalGrow = this.forResizeList.reduce((t,e,i)=>{
				if(e.hasAttribute('data-grow') == false){
					notGrowList.push(e);
					return t;
				}
				let grow = parseFloat(e.dataset.grow);
				e.style.flex = `${grow} 1 0%`;
				t -= grow;
				return t;
			}, this.#growLimit);

			if(notGrowList.length != 0){
				this.resize(notGrowList, totalGrow);
			}

			resolve(this.forResizeList);
		});
	}

	resize(list, totalGrow){
		return new Promise(resolve=> {
			//list = list.filter(e=>e.dataset.grow != '0');
			let resizeWeight = this.mathWeight(list, totalGrow)
			list.forEach(e=>{
				if(e.hasAttribute('data-grow')){
					e.dataset.grow = resizeWeight;
				}else{
					e.style.flex = `${resizeWeight} 1 0%`;
				}
			});
			resolve(resizeWeight);
		})
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

	mathWeight(list, total){
		return 1 + ( (total - list.length) / list.length );
	}

	getGrow(growTarget){
		return (parseFloat(growTarget.style.flex.split(' ')[0]) || parseFloat(growTarget.dataset.grow));
	}
}


window.customElements.define(FlexLayout.componentName, FlexLayout);