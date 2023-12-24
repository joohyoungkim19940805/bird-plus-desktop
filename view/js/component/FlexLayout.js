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

			}
			${this.#componentName} > .${this.#childClass}[data-is_resize="true"]{
				flex: 1 1 0%;
				box-sizing: border-box;
				overflow: hidden;
			}
			${this.#componentName} > .${this.#childClass}[data-is_resize="false"]{
				flex: 0 0 0%;
				box-sizing: border-box;
				overflow: hidden;
			}
			${this.#componentName} .${this.#resizePanelClass}{
				background-color: #b1b1b1;
				z-index: 100;
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
				z-index: 101;
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
			let {target} = mutation;
			let targetRect = target.getBoundingClientRect();
			let currentFlexGrow = parseFloat(target.style.flex.split(' ')[0]);
			let currentStyle = window.getComputedStyle(target);
			let currentMinSize = parseFloat(currentStyle['min' + this.sizeName.charAt(0).toUpperCase() + this.sizeName.substring(1)]);
			let currentSize = targetRect[this.sizeName];
			//if( ! isNaN(currentFlexGrow) && ( currentFlexGrow == 0 || (currentSize == 0 || currentMinSize >= currentSize) )){
			if(currentSize == 0 || currentMinSize >= currentSize){
			
				// 뷰포트 내에서 해당 영역이 보이지 않는 경우
				target.dataset.flex_visibility = 'h'
				
				/*if(target.hasAttribute('data-is_visibility')){
					target.style.visibility = 'hidden';
					target.style.opacity = 0;
				}*/
				//target.dataset.grow = 0;
				if(target._visibilityChangeCallback){
					target._visibilityChangeCallback(target.dataset.flex_visibility)
				}
			}else{
				// 뷰포트 내에서 보이는 경우
				target.dataset.flex_visibility = 'v';
				/*if(target.hasAttribute('data-is_visibility')){
					target.style.visibility = '';
					target.style.opacity = '';
				}*/
				if(target._visibilityChangeCallback){
					target._visibilityChangeCallback(target.dataset.flex_visibility)
				}
			}
		});
	});

	#resizeChangeObserver = new MutationObserver( (mutationList, observer) => {
		mutationList.forEach((mutation) => {
			if( ! mutation.target.__resizePanel || ! mutation.target.hasAttribute('data-is_resize')){
				return;
			}
			mutation.target.__resizePanel.style.display = mutation.target.dataset.is_resize == 'true' ? '' : 'none';
		})
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
		this.addResizePanel(this.children)
		let observer = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => this.addResizePanel(mutation.addedNodes))
		})
		observer.observe(this, {childList:true});
	}
	addResizePanel(childElementList){
		if(childElementList instanceof HTMLCollection){
			childElementList = [...childElementList]
		}
		childElementList.forEach(childElement=>{
			if(childElement.nodeType != Node.ELEMENT_NODE || childElement.classList.contains(FlexLayout.resizePanelClass)){
				return;
			}
			childElement.classList.add(FlexLayout.childClass)
			let resizePanel = childElement.__resizePanel;
			if(! resizePanel){
				resizePanel = this.#createResizePanel();
				childElement.__resizePanel = resizePanel;
				resizePanel.__resizeTarget = childElement; 
			}
			childElement.after(resizePanel);

			childElement.__resizePanel.style.display = childElement.dataset.is_resize == 'true' ? '' : 'none';

			this.#resizeChangeObserver.observe(childElement, {
				attributeFilter:['data-is_resize'],
				attributeOldValue:true
			});
			this.#visibleObserver.observe(childElement, {
				attributeFilter:['style'],
				attributeOldValue:true
			});
		});
		this.#growChangeObserver.disconnect();
		this.forResizeList = [...this.children].filter(e=>e.hasAttribute('data-is_resize'));
		this.forResizeList.forEach(e=>{
			this.#growChangeObserver.observe(e, {
				attributeFilter:['data-grow'],
			})
		})
		this.#growLimit = this.forResizeList.length;
		this.remain();
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
		this.totalMovement = 0;
		this.parentSize = 0;
		let prevTouchEvent;
		
		new Array('mousedown', 'touchstart').forEach(eventName => {
			resizePanel.addEventListener(eventName, (event) => {
				this.totalMovement = 0;
				prevTouchEvent = undefined;
				this.parentSize = this.getBoundingClientRect()[this.sizeName];
				resizePanel.setAttribute('data-is_mouse_down', '');
				resizePanel.querySelector('.hover').setAttribute('data-is_hover', '');
				document.body.style.cursor = this.resizeCursor;
			})
		})
		new Array('mouseup', 'touchend').forEach(eventName => {
			window.addEventListener(eventName, (event) => {
				this.totalMovement = 0;
				this.parentSize = 0;
				prevTouchEvent = undefined;
				resizePanel.removeAttribute('data-is_mouse_down');
				resizePanel.querySelector('.hover').removeAttribute('data-is_hover', '');
				
				if(document.body.style.cursor == 'ew-resize' || document.body.style.cursor == 'ns-resize'){
					document.body.style.cursor = '';
				}
	
			})
			resizePanel.addEventListener(eventName, () => {
				resizePanel.removeAttribute('data-is_mouse_down');
				this.totalMovement = 0;
				this.parentSize = 0;
				prevTouchEvent = undefined;
			})
		})
		new Array('mousemove', 'touchmove').forEach(eventName => {
			window.addEventListener(eventName, (event) => {
				if( ! resizePanel.hasAttribute('data-is_mouse_down') || ! resizePanel.__resizeTarget ){
					return;
				}
				if(eventName == 'touchmove' && ! prevTouchEvent){
					event.movementX = 0
					event.movementY = 0
					prevTouchEvent = event;
					return;
				}else if(eventName == 'touchmove'){
					event.movementX = (prevTouchEvent.touches[0].pageX - event.touches[0].pageX) * -1
					event.movementY = (prevTouchEvent.touches[0].pageY - event.touches[0].pageY) * -1
					prevTouchEvent = event;
				}
				this.moveMouseFlex(resizePanel, event);
			})
		})
		
	}

	moveMouseFlex(resizePanel, event){
		return new Promise(resolve=>{
			let movement = event['movement' + this.xy.toUpperCase()];
			this.totalMovement += event['movement' + this.xy.toUpperCase()];
			let minSizeName = 'min' + this.sizeName.charAt(0).toUpperCase() + this.sizeName.substring(1);

			let targetElement = this.findNotCloseFlexContent(resizePanel.__resizeTarget, 'previousElementSibling');
			if( ! targetElement || targetElement.dataset.is_resize == 'false' || (resizePanel.__resizeTarget.dataset.is_resize == 'true' && 30 < movement)){
				targetElement = resizePanel.__resizeTarget;
			}
			let targetMinSize = parseFloat(window.getComputedStyle(targetElement)[minSizeName]) || 0;
			let targetRect = targetElement.getBoundingClientRect();
			let targetSize = targetRect[this.sizeName] + movement;

			let nextElement = this.findNotCloseFlexContent(resizePanel.nextElementSibling, 'nextElementSibling');

			if( ! nextElement ||  targetElement.dataset.is_resize == 'false' || (resizePanel.nextElementSibling.dataset.is_resize == 'true' && 30 < (movement * -1))){
				nextElement = resizePanel.nextElementSibling
			}
			let nextElementMinSize = parseFloat(window.getComputedStyle(nextElement)[minSizeName]) || 0;
			let nextElementRect = nextElement.getBoundingClientRect();
			let nextElementSize = nextElementRect[this.sizeName] + (movement * -1);

			if(this.isOverMove(targetSize, targetMinSize)){
				nextElementSize = nextElementRect[this.sizeName]
				targetSize = 0;
			}else if(this.isOverMove(nextElementSize, nextElementMinSize)){
				targetSize = targetRect[this.sizeName];
				nextElementSize = 0;
			}
			
			let targetFlexGrow = (targetSize / (this.parentSize - 1)) * this.#growLimit;
			targetElement.style.flex = `${targetFlexGrow} 1 0%`;
			let nextElementFlexGrow = (nextElementSize / (this.parentSize - 1)) * this.#growLimit;
			nextElement.style.flex = `${nextElementFlexGrow} 1 0%`;

			resolve();
		});
	}
	isOverMove(elementSize, elementMinSize) {
		return Math.floor(elementSize) <= 0 || (isNaN(elementMinSize) ? false : elementMinSize >= Math.floor(elementSize));
	}

	findNotCloseFlexContent(target, direction){
		const isCloseCheck = ()=>{
			if(target.dataset.is_resize == 'false'){
				return true;
			}
			let grow = parseFloat(window.getComputedStyle(target).flex.split(' ')[0]) || 0;
			if(grow == 0){
				return true;
			}else{
				return false;
			}
		};
		while(isCloseCheck()){
			let nextTarget = target[direction]?.[direction];
			if(! nextTarget){
				break;
			}
			target = nextTarget;
		}
		return target;
	}


	closeFlex(resizeTarget, {isResize = false} = {}){
		return new Promise(resolve=>{
			if( ! resizeTarget.hasAttribute('data-is_resize')){
				resolve(resizeTarget);
				return;
			}else if(resizeTarget.dataset.is_resize == 'true'){
				resizeTarget.dataset.is_resize = 'false';
			}

			resizeTarget.dataset.prev_grow = this.getGrow(resizeTarget);

			let notCloseList = this.forResizeList.filter(e=>e.style.flex != '0 1 0%' && e != resizeTarget);
			let notCloseAndOpenTargetList = [...notCloseList, resizeTarget];
			//let resizeWeight = this.mathWeight(notCloseList, this.forResizeList.length);
			notCloseAndOpenTargetList.forEach(e=>{
				e.style.transition = 'flex 0.3s';
				e.ontransitionend = (event) => {
					if(event.propertyName != 'flex-grow'){
						return;
					}
					e.style.transition = '';
					e.ontransitionend = '';
					if(e == resizeTarget && resizeTarget._closeEndCallback){
						resizeTarget._closeEndCallback(this);
					}
				}
				
				if(e == resizeTarget){
					e.dataset.grow = 0;
					return;
				}

				if(isResize){
					return;
				}

				let percent = this.getGrow(e) / this.forResizeList.length;
				//let percentWeight = this.forResizeList.length * percent;
				//let remainWeight = resizeWeight * percent;
				if(notCloseList.length == 1){
					e.dataset.grow = this.forResizeList.length;
					return;
				}
				e.dataset.grow = this.forResizeList.length * percent
			})

			if(isResize){
				this.resize(notCloseList, this.forResizeList.length);
			}

			resolve(resizeTarget);
		});
	}

	openFlex(resizeTarget, {isPrevSizeOpen = false, isResize = false} = {}){
		return new Promise(resolve=>{
			
			if( ! resizeTarget.hasAttribute('data-is_resize')){
				resolve(resizeTarget)
				return;
			}else if(resizeTarget.dataset.is_resize == 'false'){
				resizeTarget.dataset.is_resize = 'true';
			}

			let notCloseList = this.forResizeList.filter(e=>e.style.flex != '0 1 0%' && e != resizeTarget);
			let notCloseAndOpenTargetList = [...notCloseList, resizeTarget];
			//let resizeWeight = this.mathWeight(notCloseAndOpenTargetList, this.forResizeList.length);
			let openTargetGrow = 1;
			if(isPrevSizeOpen && resizeTarget.hasAttribute('data-prev_grow')){
				openTargetGrow = parseFloat(resizeTarget.dataset.prev_grow) || 1;
				resizeTarget.removeAttribute('data-prev_grow');
			}
			//notCloseList.forEach(e=>{
			notCloseAndOpenTargetList.forEach(e=>{
				e.style.transition = 'flex 0.3s';
				e.ontransitionend = (event) => {
					if(event.propertyName != 'flex-grow'){
						return;
					}
					e.style.transition = '';
					e.ontransitionend = '';
					if(e == resizeTarget && resizeTarget._openEndCallback){
						resizeTarget._openEndCallback(this);
					}
				}
				
				if(isResize){
					return;
				}
				
				if(e == resizeTarget){
					resizeTarget.dataset.grow = openTargetGrow;
					return;
				}
				
				let percent = (this.getGrow(e) / this.forResizeList.length) - (openTargetGrow / this.forResizeList.length)
				e.dataset.grow = this.forResizeList.length * percent;
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
	isVisible(target){
		if( ! target.hasAttribute('data-flex_visibility')){
			throw new Error('is not flex-layout child');
			//return false;
		}

		return target.dataset.flex_visibility == 'v';
	}
}


window.customElements.define(FlexLayout.componentName, FlexLayout);