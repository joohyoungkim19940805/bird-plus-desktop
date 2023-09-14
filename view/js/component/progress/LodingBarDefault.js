/**
 * 프로그레스 바 기본타입 : 프로그래스 바 커스텀라이징
 */

class LodingBarDefault extends HTMLElement {
	#isLoaded = false;

	constructor(){
		super();
	}

	connectedCallback(e){
        if( ! this.#isLoaded){
			let html = '';
			console.log(this.hasAttribute('data-is_status_text'))
			if(this.hasAttribute('data-is_status_text')){
				html += `
					<div class="status_wrapper">
						<span class="status_text">파일 스캐닝 대기 중</span>
					</div>
				`
			}
            html += `
				<div class="loding_bar">
					<div class="progress"></div>
				</div>
            `
			this.innerHTML = html;
            this.#isLoaded = true;
        }
    }
	disconnectedCallback(){
        this.#isLoaded = false;
    }
}

window.customElements.define('loding-bar-default', LodingBarDefault);
