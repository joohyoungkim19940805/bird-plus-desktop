import {roomMenuList} from "./room_item/RoomMenuList"
import {roomFavoritesList} from "./room_item/RoomFavoritesList"
import {roomList} from "./room_item/RoomList"
import {roomMessengerList} from "./room_item/RoomMessengerList"

export default new class RoomContainer{

	#contentList 
	#wrap = (()=>{
		let wrap = Object.assign(document.createElement('div'),{
			id:'room_wrapper',
			innerHTML: '<div class="content"></div>'
		})
		wrap.dataset.is_resize = true;
		wrap.dataset.grow = 0.55;
		return wrap;
	})();
	#container = (() => {
		let roomContainer = Object.assign(document.createElement('flex-layout'), {

		});
		roomContainer.dataset.direction = 'column'
		return roomContainer;
	})();
	constructor(){
		roomMenuList.element.dataset.is_resize = true;
		roomMenuList.element.dataset.grow = 0;

		roomFavoritesList.element.dataset.is_resize = true;
		//roomFavoritesList.element.dataset.grow = 0;

		roomList.element.dataset.is_resize = true;
		//roomList.element.dataset.grow = 0;

		roomMessengerList.element.dataset.is_resize = true;
		//roomMessengerList.element.dataset.grow = 0;

		this.#contentList = [roomMenuList.element, roomFavoritesList.element, roomList.element, roomMessengerList.element]

		this.#container.replaceChildren(...this.#contentList)
		this.#wrap.querySelector('.content').append(this.#container);
		
		this.#contentList.forEach(wrap => {
			//document에 connect되지 않아서 minHeight가 무조건 0인 현상 수정 //20231005
			let connectedAwait = setInterval(()=>{
				if( ! wrap.isConnected){
					return;
				}
				clearInterval(connectedAwait);
				let flexLayout = wrap.closest('flex-layout');

				let [
					roomSticky, roomContentList, scrollbar
				] = wrap.querySelectorAll('.room_sticky, .room_content_list, .room_scrollbar'); 

				let roomContainerListScroll = wrap.querySelector('.list_scroll')
				let customDetailsTitle = wrap.querySelector('[data-bind_name="customDetailsTitle"]')
				let customDetails = wrap.querySelector('.custom_details');
				let customDetailsSummary = customDetails.closest('.custom_details_summary')

				let minHeight = customDetailsSummary.getBoundingClientRect().height;

				wrap.style.minHeight = minHeight + 'px';
				wrap.ontransitionend = () => {
					wrap.style.transition = '';
				}
				customDetailsTitle.onclick = () => customDetails.click();
				customDetails.onclick = () => {
					let isOpen = customDetails.hasAttribute('data-is_open');
					
					if(isOpen){
						customDetails.textContent = customDetails.dataset.close_status;
						customDetails.dataset.previous_flex = wrap.style.flex;
						//wrap.style.transition = 'flex 0.5s';
						minHeight = customDetailsSummary.getBoundingClientRect().height;
						wrap.style.minHeight = minHeight + 'px';
						//wrap.style.flex = '0 1 0%';
						//wrap.dataset.grow = 0;
						flexLayout.closeFlex(wrap, {isResize : true});
						roomContainerListScroll.style.overflow = 'hidden';
						customDetails.removeAttribute('data-is_open');
					}else{
						customDetails.textContent = customDetails.dataset.open_status;
						//wrap.style.transition = 'flex 0.5s';
						wrap.style.flex = customDetails.dataset.previous_flex;
						//wrap.style.flex = '1 1 0%';
						//wrap.dataset.grow = 1;
						flexLayout.openFlex(wrap, {isResize : true});
						roomContainerListScroll.style.overflow = '';
						customDetails.setAttribute('data-is_open', '');
					}
				}
				window.addEventListener('resize', () => {
					minHeight = customDetailsSummary.getBoundingClientRect().height;
					wrap.style.minHeight = minHeight + 'px';
				})
				new IntersectionObserver((entries, observer) => {
					entries.forEach(entry =>{
						let wrapRect = wrap.getBoundingClientRect();
						if(! entry.isIntersecting){
							if(wrapRect.height <= minHeight){
								customDetails.removeAttribute('data-is_open', '');
								customDetails.textContent = customDetails.dataset.close_status;
								roomContainerListScroll.style.overflow = 'hidden';
							}
						}else{
							if(wrapRect.height > minHeight){
								customDetails.setAttribute('data-is_open', '');
								customDetails.textContent = customDetails.dataset.open_status;
								roomContainerListScroll.style.overflow = '';
							}
						}
					});
				}, {
					threshold: 0.01,
					root: wrap
				}).observe(customDetailsSummary.nextElementSibling);

			},100);
		})
	}

	get container(){
		return this.#container;
	}

	get wrap(){
		return this.#wrap;
	}
}();