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
			this.onmousedown = (event) => {
				this.setAttribute('data-is_mouse_down', '');
				pointer = event.x;
				document.body.style.cursor = 'ew-resize'
			}
			window.addEventListener('mousemove', (event) => {
				if( ! this.hasAttribute('data-is_mouse_down') || ! this.resizeTarget ){
					return;
				}
				let weight = this.getBoundingClientRect().width / window.outerWidth;
				let moveX = pointer - event.x//- this.getBoundingClientRect().width;
				pointer = event.x;

				//style = window.getComputedStyle(this.resizeTarget);
				let rect = this.resizeTarget.getBoundingClientRect();
				let width = rect.width - moveX + weight;
				this.resizeTarget.style.width = width + 'px';
			})
			window.addEventListener('mouseup', (event) => {
				if( this.hasAttribute('data-is_mouse_down')) {
					this.removeAttribute('data-is_mouse_down');
					document.body.style.cursor = '';
				}
			})

			this.onmouseup = (event) => {
				this.removeAttribute('data-is_mouse_down');
				//this.removeAttribute('data-is_mouse_over');
			}

		}
	}
}

window.customElements.define('resize-drag-panel', ResizeDragPanel);
