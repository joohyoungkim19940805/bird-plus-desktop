/**
 * 헤더 기본타입 : 상단 타이틀바 커스텀라이징
 */

class HeaderDefault extends HTMLElement {
	#isLoaded = false;
    content;
	constructor(){
		super();
	}

	connectedCallback(){
        if( ! this.#isLoaded){
            this.innerHTML = `
            <div id="header_content">
                ${this.headerItem}
                <div class="header_item" data-info="프로필과 버튼영역 영역">프로필과 닫기</div>
            </div>
            `
            /*
            this.content = this.querySelector('#header_content');
            if(this.content.children.length == 1){
                this.content.insertBefore(document.createElement('div'), this.content.children[0]);
            }
            */
            // 타이틀바 등록 = 누른상태로 창 이동, 최대화, 최소화 등
            this.style.webkitAppRegion = 'drag';
            this.#isLoaded = true;
        }
    }
    disconnectedCallback(){
        this.#isLoaded = false;
    }

    get headerItem(){
        let item = ''
        if( ! this.hasAttribute('data-is_no_menu') ){
            item += `
            <div class="header_item" id="left_wrapper" data-info="아이콘이나 메뉴 영역">
                <img/>
            </div>` 
        }
        if( ! this.hasAttribute('data-is_no_search') ){
            item += `
                <div class="header_item" data-info="검색 영역">
                    필터와 검색
                </div>`
        }
        if(item === ''){
            item += `<div></div>`
        }
        return item
    }
}

window.customElements.define('header-default', HeaderDefault);
