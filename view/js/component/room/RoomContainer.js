import RoomMenuList from "./room_item/RoomMenuList"
import RoomFavoritesList from "./room_item/RoomFavoritesList"
import RoomList from "./room_item/RoomList"
import RoomMessengerList from "./room_item/RoomMessengerList"

export default class RoomContainer{
	
	#workspaceId;

	#roomMenuWrapper = (()=>{
		let wrapper = Object.assign(document.createElement('div'), {
			id: 'room_menu_list_wrapper',
			innerHTML: `
				<div class="room_container list_scroll list_scroll-y">
					<div class="room_sticky">
						<div class="custom_details_summary">
							추가
							<button>+</button>
							<button class="custom_details" data-open_status="▼" data-close_status="▶" data-is_open="">▼</button>
						</div>
						<div>
							<input type="text " placeholder="search">
						</div>
					</div>
					<ul class="room_content_list">
						<li>최근 메시지 1</li>
						<li>스크랩</li>
						<li>반응 및 댓글</li>
						<li>즐겨찾기</li>
						<li>최근 메시지</li>
						<li>스크랩</li>
						<li>반응 및 댓글</li>
						<li>즐겨찾기</li>
						<li>최근 메시지</li>
						<li>스크랩</li>
						<li>반응 및 댓글</li>
						<li>즐겨찾기 0</li>
					</ul>
				</div>
			`
		});
		wrapper.dataset.is_resize = true;
		return wrapper;
	})();
	
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
		this.#roomList = new RoomList(workspaceId);
		this.#roomListWrapper = this.#roomList.element;
		this.#roomListWrapper.dataset.is_resize = true;
		
		this.#roomFavoritesList = new RoomFavoritesList(workspaceId);
		this.#roomFavoritesListWrapper = this.#roomFavoritesList.element;
		this.#roomFavoritesListWrapper.dataset.is_resize = true;
		
		
		this.#roomMessngerList = new RoomMessengerList(workspaceId);
		this.#roomMessngerListWrapper = this.#roomMessngerList.element;
		this.#roomMessngerListWrapper.dataset.is_resize = true;
		
		this.#contentWrapperList = [this.#roomMenuWrapper, this.#roomFavoritesListWrapper, this.#roomListWrapper, this.#roomMessngerListWrapper]
		//console.log(this.#roomMenuWrapper)
		//console.log(this.#roomMenuWrapper.childNodes)
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