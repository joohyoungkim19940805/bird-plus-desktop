/**
 * layout 블럭  
 */
class ContentBlockLayout extends HTMLDivElement {
	#isLoaded = false;
	constructor(){
		super();
	}

	connectedCallback(e){
        if( ! this.#isLoaded){
            this.#isLoaded = true;
			if( ! this.hasAttribute('data-is_no_panel')){
				let resizePanel = document.createElement('resize-drag-panel');
				resizePanel.resizeTarget = this;
				if(this.hasAttribute('data-is_no_resize')){
					resizePanel.className = "no_resize"
				}
				this.after(resizePanel);
			}

			this.addContentBlockEvent();
        }
    }
    disconnectedCallback(){
        this.#isLoaded = false;
    }

	addContentBlockEvent(){
		this.onresize = (event) => {
			console.log(event);
		}
	}
}

window.customElements.define('content-block', ContentBlockLayout, {extends : 'div'});
