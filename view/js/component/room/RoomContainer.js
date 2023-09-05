import roomMenuList from "./room_item/RoomMenuList"
import roomFavoritesList from "./room_item/RoomFavoritesList"
import roomList from "./room_item/RoomList"
import roomMessengerList from "./room_item/RoomMessengerList"

export default class RoomContainer{
	
	#workspaceId;

	#roomMenuList
	#roomMenuListWrapper;

	#roomFavoritesList
	#roomFavoritesListWrapper;

	#roomList;
	#roomListWrapper;

	#roomMessngerList;
	#roomMessngerListWrapper;

	#contentWrapperList // = [this.#roomMenuWrapper, this.#roomFavoritesWrapper, this.#roomListWrapper, this.#roomMessengerWrapper]
	#contentWrapper;

	constructor(contentWrapper, workspaceId){
		if( ! contentWrapper){
			throw new Error('contentWrapper is not defined');
		}
		if( ! workspaceId ){
			throw new Error('workspaceId is undefined');
		}
		this.#workspaceId = workspaceId;

		roomMenuList.element.dataset.is_resize = true;

		roomFavoritesList.element.dataset.is_resize = true;
		
		roomList.element.dataset.is_resize = true;
		
		roomMessengerList.element.dataset.is_resize = true;
		
		this.#contentWrapperList = [roomMenuList.element, roomFavoritesList.element, roomList.element, roomMessengerList.element]

		contentWrapper.replaceChildren(...this.#contentWrapperList)
		this.#contentWrapperList.forEach(wrap => {
			let [
				roomSticky, roomContentList, scrollbar
			] = wrap.querySelectorAll('.room_sticky, .room_content_list, .room_scrollbar'); 
			let roomContainerListScroll = wrap.querySelector('.room_container.list_scroll')
			let customDetails = wrap.querySelector('.custom_details');
			let customDetailsSummary = customDetails.closest('.custom_details_summary')
			/*
			roomContentList.parentElement.onmouseenter = () => {
			}
			roomContentList.parentElement.onmouseleave = () => {
			}
			roomContentList.parentElement.onscroll = (event) => {
			}
			*/
			//'▼'; '▶';
			let minHeight = customDetailsSummary.getBoundingClientRect().height;
			wrap.style.minHeight = minHeight + 'px';
			wrap.ontransitionend = () => {
				wrap.style.transition = '';
			}
			customDetails.onclick = () => {
				let isOpen = customDetails.hasAttribute('data-is_open');
				if(isOpen){
					customDetails.textContent = customDetails.dataset.close_status;
					customDetails.dataset.previous_flex = wrap.style.flex;
					wrap.style.transition = 'flex 0.5s';
					wrap.style.minHeight = customDetailsSummary.getBoundingClientRect().height + 'px';
					wrap.style.flex = '0 1 0%';
					roomContainerListScroll.style.overflow = 'hidden';
					customDetails.removeAttribute('data-is_open');
				}else{
					customDetails.textContent = customDetails.dataset.open_status;
					wrap.style.transition = 'flex 0.5s';
					wrap.style.flex = customDetails.dataset.previous_flex;
					wrap.style.flex = '1 1 0%';
					roomContainerListScroll.style.overflow = '';
					customDetails.setAttribute('data-is_open', '');
				}
			}
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
			//wrap.__resizePanel
		})
	}

	set workspaceId(workspaceId){
		this.#workspaceId = workspaceId;
	}
	get workspaceId(){
		return workspaceId;
	}

}