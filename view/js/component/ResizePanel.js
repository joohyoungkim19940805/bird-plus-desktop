/**
 * layout 블럭  
 */
class ResizeDragPanel extends HTMLElement {
	#isLoaded = false;
	resizeTarget;
	constructor(){
		super();
	}

	connectedCallback(e){
        if( ! this.#isLoaded){
            this.#isLoaded = true;
			this.innerHTML =  `
				<div class="hover">
				</div>
				<div class="panel_width">
				</div>
			`
			this.addContentBlockEvent();
        }
    }
    disconnectedCallback(){
        this.#isLoaded = false;
    }

	addContentBlockEvent(){
		/*

		*/
		if( ! this.classList.contains('no_resize')){
			let pointer;

			//this.resizeTarget.style.width = this.resizeTarget.getBoundingClientRect().width + 'px';
			window.myAPI.electronEventTrigger.addElectronWindowEventListener('resized', ( [w, h] ) => {
				let originWidth = this.resizeTarget.getBoundingClientRect().width;
				let originWidthRatio = originWidth / window.outerWidth
				this.resizeTarget.style.width = (originWidthRatio*100) + 'vw';
				let {right} = this.resizeTarget.getBoundingClientRect();
				// 화면 비율에 맞게 리사이즈
				if((window.outerWidth- right) < 5 || this.resizeTarget.hasAttribute('data-is_over')){
					let newRatio = (window.outerWidth - this.resizeTarget.getBoundingClientRect().x) / window.outerWidth
					this.resizeTarget.style.width = (newRatio*100) + 'vw';	
				}
				// 리사이즈 - 최대화면 -> 원래 화면으로 전환시(타이틀바 두번누르는 걸로) width가 화면비율에 의해 더 작아지는 현상
				// 원래 리사이즈 후 width보다 작을 경우 원래 width로 복원
				let resizeAfterWidth = this.resizeTarget.getBoundingClientRect().width;
				if(Number(this.resizeTarget.dataset.origin_width) > resizeAfterWidth){
					this.resizeTarget.style.width = this.resizeTarget.dataset.origin_width + 'px';
				}
				//this.resizeTarget.dataset.origin_width = resizeAfterWidth;
			});

			this.onmousedown = (event) => {
				document.querySelectorAll('resize-drag-panel:not(.no_resize)').forEach( async e=>{
					await new Promise(resolve=>{
						e.resizeTarget.style.width = e.resizeTarget.getBoundingClientRect().width + 'px';
						resolve();
					})
				});
				this.setAttribute('data-is_mouse_down', '');
				pointer = event.x;
				document.body.style.cursor = 'ew-resize'
			}
			window.addEventListener('mousemove', (event) => {
				if( ! this.hasAttribute('data-is_mouse_down') || ! this.resizeTarget ){
					return;
				}
				//let weight = this.getBoundingClientRect().width / window.outerWidth;
				let moveX = pointer - event.x//- this.getBoundingClientRect().width;
				pointer = event.x;

				//style = window.getComputedStyle(this.resizeTarget);
				//let rect = this.resizeTarget.getBoundingClientRect();
				let width = this.resizeTarget.clientWidth - moveX// + weight;
				let maxSize =  window.outerWidth - this.resizeTarget.parentElement.getBoundingClientRect().x
				if(width > maxSize){
					width = maxSize
				}
				this.resizeTarget.style.width = width + 'px';
				new Promise(resolve=>{
					resolve(
						this.resizeTarget.onresize(Object.assign( {
							target : this.resizeTarget,
							panel : this,
							moveX : moveX
						}, event))
					)
				});
			})
			window.addEventListener('mouseup', (event) => {
				if( this.hasAttribute('data-is_mouse_down')) {
					this.removeAttribute('data-is_mouse_down');
				}
				if(document.body.style.cursor == 'ew-resize'){
					document.body.style.cursor = '';
				}
				document.querySelectorAll('resize-drag-panel:not(.no_resize)').forEach( async (e,i)=>{
					await new Promise(res=>{
						let {right} = e.resizeTarget.getBoundingClientRect();
						if(e.resizeTarget.hasAttribute('data-is_over') && (window.outerWidth - right) > 10){
							e.resizeTarget.removeAttribute('data-is_over');
						}
						res();
					})
				})
			})

			this.onmouseup = (event) => {
				this.removeAttribute('data-is_mouse_down');
				//this.removeAttribute('data-is_mouse_over');
			}

		}

		if(this.resizeTarget.hasAttribute('data-is_last_child')){
			this.classList.add('no_resize');
			
		}
	}
}

window.customElements.define('resize-drag-panel', ResizeDragPanel);
