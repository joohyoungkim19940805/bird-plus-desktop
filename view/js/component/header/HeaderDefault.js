import common from "@root/js/common";
import { simpleOption } from "@component/option/SimpleOption";
import FreedomInterface from "@handler/editor/module/FreedomInterface";
/**
 * 헤더 기본타입 : 상단 타이틀바 커스텀라이징
 */

export default class HeaderDefault extends HTMLElement {
	#isLoaded = false;
    content;
	isMobile = /Mobi/i.test(window.navigator.userAgent)

    #unmaximizeIcon = Object.assign(document.createElement('button'), {
        className: 'unmaximize_icon',
        innerHTML: `
            <svg width="1rem" height="1rem" style="zoom:150%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path transform="translate(-2.5, 2.5)" d="M6.5 6.5 H17.5 V17.5 H6.5 V6.5 Z" stroke="currentColor" stroke-width="2" />
                <path transform="translate(2.5,-2.5)" d="M5.5 10 V7 H17 V17.5 H14 " stroke="currentColor" stroke-width="2" />
            </svg>
        `
    })
    #maximizeIcon = Object.assign(document.createElement('button'), {
        className: 'maximize_icon',
        innerHTML: `
            <svg class="css-gg-border-all" width="1rem" height="1rem" style="zoom:150%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 6.5H17.5V17.5H6.5V6.5Z" stroke="currentColor" stroke-width="2" />
            </svg>
        `
    })
    #minimizeIcon = Object.assign(document.createElement('button'), {
        className: 'minimize_icon',
        textContent: `ㅡ`
    })
    #optionIcon = Object.assign(document.createElement('button'), {
        className: 'option_icon',
        innerHTML : `
        <svg class="css-gg-option" width="1rem" height="1rem" style="zoom:150%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7 3C8.86384 3 10.4299 4.27477 10.874 6H19V8H10.874C10.4299 9.72523 8.86384 11 7 11C4.79086 11 3 9.20914 3 7C3 4.79086 4.79086 3 7 3ZM7 9C8.10457 9 9 8.10457 9 7C9 5.89543 8.10457 5 7 5C5.89543 5 5 5.89543 5 7C5 8.10457 5.89543 9 7 9Z"
            fill="currentColor"
            />
            <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17 20C15.1362 20 13.5701 18.7252 13.126 17H5V15H13.126C13.5701 13.2748 15.1362 12 17 12C19.2091 12 21 13.7909 21 16C21 18.2091 19.2091 20 17 20ZM17 18C18.1046 18 19 17.1046 19 16C19 14.8954 18.1046 14 17 14C15.8954 14 15 14.8954 15 16C15 17.1046 15.8954 18 17 18Z"
            fill="currentColor"
            />
        </svg>
        `
    })
    #closeIcon = Object.assign(document.createElement('button'), {
        className: 'close_icon',
        innerHTML:`
        <svg class="css-gg-close-x" width="1rem" height="1rem" style="zoom:150%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
            d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z"
            fill="currentColor"
            />
        </svg>
        `
    })

	constructor(){
		super();
        Object.assign(this.#minimizeIcon.style,{fontSize:'1.1rem', fontWeight:'bold'});
        window.myAPI.event.electronEventTrigger.addElectronEventListener('maximize', () => {
            this.#maximizeIcon.remove();
            this.#minimizeIcon.after(this.#unmaximizeIcon)
        })
        window.myAPI.event.electronEventTrigger.addElectronEventListener('unmaximize', () => {
            this.#unmaximizeIcon.remove();
            this.#minimizeIcon.after(this.#maximizeIcon)
        })
        this.#minimizeIcon.onclick = () => {
            window.myAPI.minimizeRequest();
        }
        this.#maximizeIcon.onclick = () => {
            window.myAPI.maximizeRequest();
        }
        this.#unmaximizeIcon.onclick = () => {
            window.myAPI.unmaximizeRequest();
        }
        this.#closeIcon.onclick = () =>{
            window.myAPI.closeRequest();
        }

        this.#optionIcon.onclick = () => {
            if(simpleOption.wrap.isConnected){
                simpleOption.close();
                return;
            }
            simpleOption.open();
            common.processingElementPosition(simpleOption.wrap, this.#optionIcon);
        }
        window.addEventListener('resize', (event) => {
			if(simpleOption.wrap.isConnected){
				common.processingElementPosition(simpleOption.wrap, this.#optionIcon);
			}
		})
        
        FreedomInterface.outClickElementListener(simpleOption.wrap, ({oldEvent, newEvent, isMouseOut}) =>{
            if(isMouseOut && simpleOption.wrap.isConnected && ! FreedomInterface.isMouseInnerElement(this.#optionIcon) && ! simpleOption.wrap.matches(':hover')){
				simpleOption.close();
			}
        })
	}
    
	connectedCallback(){
        if( ! this.#isLoaded){
            this.innerHTML = `
            <div id="header_content">
                ${this.headerItem}
                <div class="header_item default_icon_container" data-info="프로필과 버튼영역 영역">

                </div>
            </div>
            `
            let homeIcon = this.querySelector('.home_icon')
            if(homeIcon){
                homeIcon.onclick = () => {
                    window.myAPI.pageChange.changeWokrspacePage();
                }
            }
            let defaultIconContainer = this.querySelector('.default_icon_container')
            this.createDefaultIcon(defaultIconContainer);
            //this.style.webkitAppRegion = 'drag';
            this.#isLoaded = true;
        }
    }

    async createDefaultIcon(container){
        let targetWindowSizeIcon = (await window.myAPI.isMaximize()) ? this.#unmaximizeIcon : this.#maximizeIcon

        if(this.isMobile){
            container.replaceChildren(this.#optionIcon);
        }else{
            container.replaceChildren(
                this.#optionIcon,
                this.#minimizeIcon,
                targetWindowSizeIcon,
                this.#closeIcon
            );
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
                <button class="home_icon">
                    <svg class="css-gg-home" width="1rem" height="1rem" style="zoom:125%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M21 8.77217L14.0208 1.79299C12.8492 0.621414 10.9497 0.621413 9.77817 1.79299L3 8.57116V23.0858H10V17.0858C10 15.9812 10.8954 15.0858 12 15.0858C13.1046 15.0858 14 15.9812 14 17.0858V23.0858H21V8.77217ZM11.1924 3.2072L5 9.39959V21.0858H8V17.0858C8 14.8767 9.79086 13.0858 12 13.0858C14.2091 13.0858 16 14.8767 16 17.0858V21.0858H19V9.6006L12.6066 3.2072C12.2161 2.81668 11.5829 2.81668 11.1924 3.2072Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>` 
        }
        if( ! this.hasAttribute('data-is_no_search') ){
            item += `
                <div class="header_item" data-info="검색 영역 필터와 검색">
                </div>`
        }
        if(item === ''){
            item += `<div></div>`
        }
        return item
    }
}

