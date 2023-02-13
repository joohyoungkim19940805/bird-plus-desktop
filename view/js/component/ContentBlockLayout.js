/**
 * layout 블럭  
 */
class ContentBlockLayout extends HTMLDivElement {
	#isLoaded = false;
	resizePanel;
	constructor(){
		super();
	}

	connectedCallback(e){
        if( ! this.#isLoaded){
            this.#isLoaded = true;
			if( ! this.hasAttribute('data-is_no_panel')){
				this.resizePanel = document.createElement('resize-drag-panel');
				this.resizePanel.resizeTarget = this;
				if(this.hasAttribute('data-is_no_resize')){
					this.resizePanel.className = "no_resize"
				}

				this.after(this.resizePanel);
			}

			this.addContentBlockEvent();
        }
    }
    disconnectedCallback(){
        this.#isLoaded = false;
    }

	addContentBlockEvent(){
		this.onresize = (event) => {
			if(event.target.hasAttribute('data-origin_display')){
				event.target.style.display = event.target.getAttribute('data-origin_display');
				event.target.removeAttribute('data-origin_display');
			}
			let resizeList = event.target.parentElement.parentElement.querySelectorAll('resize-drag-panel');
			resizeList.forEach( async (e,i)=>{
				await new Promise(resolve=>{
					let {width, right} = e.resizeTarget.getBoundingClientRect();
					if((right > window.outerWidth || (window.outerWidth - right) < 5) && ! e.classList.contains('no_resize')){
						e.resizeTarget.style.width = e.resizeTarget.clientWidth - (right - window.outerWidth) + 'px';
						e.resizeTarget.setAttribute('data-is_over','');
					}else if(e.resizeTarget.hasAttribute('data-is_over') && right < window.outerWidth && ! e.classList.contains('no_resize')){
						e.resizeTarget.style.width = e.resizeTarget.clientWidth + (window.outerWidth - right) + 'px';
					}else if(width < 5 && ! e.resizeTarget.hasAttribute('data-origin_display')){
						e.resizeTarget.setAttribute('data-origin_display', window.getComputedStyle(e.resizeTarget).display);
						e.resizeTarget.style.display = 'none';
					}else if(width > 5 && e.resizeTarget.hasAttribute('data-origin_display')){
						e.resizeTarget.style.display = e.resizeTarget.getAttribute('data-origin_display');
						e.resizeTarget.removeAttribute('data-origin_display');
					}
					resolve();
				})
			});
		}
		new IntersectionObserver((entries, observer) => {
			entries.forEach(entry =>{
				if ( ! entry.isIntersecting && ! entry.target.resizePanel.hasAttribute('data-is_hiding')) {
					console.log('??')
					entry.target.resizePanel.setAttribute('data-is_hiding', '');
					let imHere = Object.assign(document.createElement('div'),{
						className:'im_here',
						textContent:'≪≫'
					})
					entry.target.resizePanel.append(imHere);
				}else{
					let here = entry.target.resizePanel.querySelector('div.im_here');
					if(here){
						here.remove();
					}
					entry.target.resizePanel.removeAttribute('data-is_hiding')
				}
			})
		},{
			threshold: 0.1,
			root: this.querySelector('main-layout')
		}).observe(this);
	}
}

window.customElements.define('content-block', ContentBlockLayout, {extends : 'div'});
