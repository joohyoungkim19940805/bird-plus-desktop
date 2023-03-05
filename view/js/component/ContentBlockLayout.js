/**
 * layout 블럭  
 */
class ContentBlockLayout extends HTMLDivElement {
	#isLoaded = false;
	resizePanel;
	constructor(){
		super();
	}

	connectedCallback(){
        if( ! this.#isLoaded){
            this.#isLoaded = true;
			if( ! this.hasAttribute('data-is_no_panel') && ! this.resizePanel){
				this.resizePanel = document.createElement('resize-drag-panel');
				this.resizePanel.resizeTarget = this;
				if(this.hasAttribute('data-is_no_resize')){
					this.resizePanel.className = "no_resize"
				}
				this.after(this.resizePanel);
			}
			console.log(this.parentElement.classList)
			console.log(this.clientWidth)
			this.addContentBlockEvent();
        }
		document.addEventListener("DOMContentLoaded", () => {
			this.dataset.origin_width = this.clientWidth;
		});
    }
    disconnectedCallback(){
        this.#isLoaded = false;
    }

	addContentBlockEvent(){
		this.onresize = (event) => {
			let resizeList = event.target.parentElement.parentElement.querySelectorAll('resize-drag-panel');
			resizeList.forEach( async (e,i)=>{
				await new Promise(resolve=>{
					e.resizeTarget.removeAttribute('data-is_last_move');
					let {width, right} = e.resizeTarget.getBoundingClientRect();
					if((right > window.outerWidth || (window.outerWidth - right) < 10) && ! e.classList.contains('no_resize')){
						e.resizeTarget.style.width = e.resizeTarget.clientWidth - (right - window.outerWidth) + 'px';
						e.resizeTarget.setAttribute('data-is_over','');
					}else if(e.resizeTarget.hasAttribute('data-is_over') && right < window.outerWidth && ! e.classList.contains('no_resize')){
						e.resizeTarget.style.width = e.resizeTarget.clientWidth + (window.outerWidth - right) + 'px';
					}else if(width < 10 && ! e.resizeTarget.hasAttribute('data-origin_display')){
						e.resizeTarget.setAttribute('data-origin_display', window.getComputedStyle(e.resizeTarget).display);
						e.resizeTarget.style.display = 'none';
					}else if(width > 10 && e.resizeTarget.hasAttribute('data-origin_display')){
						e.resizeTarget.style.display = e.resizeTarget.getAttribute('data-origin_display');
						e.resizeTarget.removeAttribute('data-origin_display');
					}
					resolve();
				})
			});
			console.log(this.style.display)
			event.target.setAttribute('data-is_last_move', '')
		}
		new IntersectionObserver((entries, observer) => {
			entries.forEach(entry =>{
				if ( ! entry.isIntersecting && ! this.resizePanel.hasAttribute('data-is_hiding')) {
					this.resizePanel.setAttribute('data-is_hiding', '');
					this.resizePanel.classList.add('no_resize');
					let imHere = Object.assign(document.createElement('div'),{
						className:'im_here',
						textContent:'≪≫'
					})
					
					// 좌측 기준으로 px이 들어감
					// 좌측 애가 숨어있으면 좌측 숨은 애 px을 늘리면 해결되는데
					// 우측 애는 좌측 애의 px를 쪼개서 받아야지 화면에 노출된다.
					this.resizePanel.append(imHere);
					imHere.onclick = () => {
						let lastMoveEle;
						let lastIdx;
						let thisIdx;
						let contentBlockList = document.querySelectorAll('div[is="content-block"]')
						contentBlockList.forEach((element,idx)=>{
							if(element.hasAttribute('data-is_over')){
								element.removeAttribute('data-is_over');
								if(! this.hasAttribute('data-is_no_resize')){
									entry.target.resizePanel.classList.remove('no_resize');
								}
							}
							if(element.hasAttribute('data-is_last_move')){
								lastMoveEle = element;
								lastIdx = idx;
							}else if(element == this){
								thisIdx = idx;
							}
						});
						this.style.display = this.dataset.origin_display;
						if(lastMoveEle == this || lastIdx > thisIdx){
							// 현재 숨겨진 컨텐츠가 자기 자신이거나 마지막으로 움직인 엘레멘탈 기준으로 좌측 일 경우
							this.style.width = this.dataset.origin_width + 'px';
						}else if(lastIdx < thisIdx){
							// 현재 숨겨진 컨텐츠가 마지막으로 움직인 엘레멘탈 기준으로 우측 일 경우
							let prevElementIdx = thisIdx - 1;
							// 바로 자신 좌측 컨텐츠와 마지막으로 움직인 엘레멘탈을 원래 상태로 복원
							if(prevElementIdx >= 0 ){
								lastMoveEle.style.width = lastMoveEle.dataset.origin_width + 'px';
								let prevElement = contentBlockList[prevElementIdx]
								prevElement.style.width = prevElement.dataset.origin_width + 'px'; 
								this.style.width = this.dataset.origin_width + 'px';
							}
						}
						
					}
					if( ! this.hasAttribute('data-origin_display')){
						this.dataset.origin_display = window.getComputedStyle(this).display;
					}

					//리사이즈시 순산적으로 width 크기가 

					if(this.parentElement.getBoundingClientRect().left >= window.outerWidth){
						this.style.display = 'none';
					}
				}else{
					//imHere이 옆으로 밀리면서 사라짐(앞에있는 걸 누를시)포지션을 fiexd로 변경 후 리사이즈 패널 기준으로 변경 필요
					let imHere = this.resizePanel.querySelector('div.im_here');
					if(imHere){
						imHere.remove();
					}
					
					if(! this.hasAttribute('data-is_no_resize')){
						this.resizePanel.classList.remove('no_resize');
					}
					if(this.resizePanel.hasAttribute('data-is_hiding')){
						this.style.display = this.dataset.origin_display;
						this.resizePanel.removeAttribute('data-is_hiding')
					}
				}
			})
		},{
			threshold: 0.1,
			root: this.querySelector('main-layout')
		}).observe(this);
	}
}

window.customElements.define('content-block', ContentBlockLayout, {extends : 'div'});
