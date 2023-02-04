/**
 * 헤더 기본타입 : 상단 타이틀바 커스텀라이징
 */

class HeaderDefault extends HTMLElement {
	#isLoaded = false;
	constructor(){
		super();
	}

	connectedCallback(){
        if( ! this.#isLoaded){
            this.innerHTML = `
            <div id="header_content">
                <div class="header_item" id="left_wrapper" data-info="아이콘과 메뉴 영역">
                    <img/>
                </div>
                <div class="header_item" data-info="검색 영역">필터와 검색</div>
                <div class="header_item" data-info="프로필과 버튼영역 영역">프로필과 닫기</div>
            </div>
            `

            // 타이틀바 등록 = 누른상태로 창 이동, 최대화, 최소화 등
            this.style.webkitAppRegion = 'drag';
            this.#isLoaded = true;
        }
    }
    disconnectedCallback(){
        this.#isLoaded = false;
    }
}

window.customElements.define('header-default', HeaderDefault);
