/**
 * 커스텀 메인 레이아웃
 */

class MainLayout extends HTMLElement {
	#isLoaded = false;
	#isAddEventDone = false;
	constructor(){
		super();
	}

	connectedCallback(){
        if( ! this.#isLoaded){
			this.#isLoaded = true;
        }
		if( ! this.#isAddEventDone ){
			this.addMainEvent();
			this.#isAddEventDone = true;
		}
    }
	disconnectedCallback(){
        this.#isLoaded = false;
    }

	addMainEvent(){
		let header = document.querySelector('header-default > #header_content');
		this.style.height = (window.outerHeight - header.clientHeight) + 'px'
		this.style.width = window.outerWidth + 'px'; 
		window.myAPI.electronEventTrigger.addElectronWindowEventListener('resized', ( [width, height] ) => {
			let mathHeight =  (window.outerHeight - header.clientHeight);
			//mathHeight = mathHeight - (mathHeight * 0.02)
			this.style.height = mathHeight + 'px'
			this.style.width = window.outerWidth + 'px'; 
		});
		/*window.addEventListener('load',()=>{
			let mathHeight =  (window.outerHeight - header.clientHeight);
			this.style.height = mathHeight + 'px'
			this.style.width = window.outerWidth + 'px';
		})*/
		/*
		[...this.children].forEach(e=>{
			let originWidth = window.getComputedStyle(e).width;
			e.style.width = originWidth
			let originRatio = parseInt(originWidth) / window.outerWidth
			window.myAPI.electronEventTrigger.addElectronWindowEventListener('resized', ( [width, height] ) => {
				let newWidth = (window.outerWidth * originRatio);
				e.style.width = newWidth + 'px';
				originRatio = newWidth / window.outerWidth
			});
		})
		*/
	}
}

window.customElements.define('main-layout', MainLayout);