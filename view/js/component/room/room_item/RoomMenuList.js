import PositionChanger from "@handler/PositionChangeer";
import CreateRoomView from "./CreateRoomView";

export default new class RoomMenuList{
	#page = 0;
	#size = 10;
	#element = Object.assign(document.createElement('div'), {
		id: 'room_menu_list_wrapper',
		innerHTML: `
			<div class="room_container list_scroll list_scroll-y" data-bind_name="roomContainer">
				<div class="room_sticky" data-bind_name="roomSticky">
					<div class="custom_details_summary" data-bind_name="customDetailsSummary">
						<div class="custom_details_wrapper">
							<button class="custom_details" data-open_status="▼" data-close_status="▶" data-is_open="" data-bind_name="customDetails">▼</button>
							<b class="pointer custom_details_title" data-bind_name="customDetailsTitle"><i>Menu</i></b>
						</div>
						<div class="add_button_wrapper">
							<button class="add_button" data-bind_name="addButton">╊</button>
						</div>
					</div>
					<div class="room_functions" data-bind_name="roomFunctions">
						<form id="menu_search" data-bind_name="menuSearch">
							<input type="search" placeholder="Press Enter Key" class="search_name" name="searchName" data-bind_name="searchName">
						</form>
					</div>
				</div>
				<ul class="room_content_list" data-bind_name="roomContentList">
					<li class="pointer">최근 메시지</li>
					<li class="pointer">스크랩</li>
					<li class="pointer">반응 및 댓글</li>
					<li class="pointer">즐겨찾기</li>
					<li class="pointer">최근 메시지</li>
					<li class="pointer">스크랩</li>
					<li class="pointer">반응 및 댓글</li>
					<li class="pointer">즐겨찾기</li>
					<li class="pointer">최근 메시지</li>
					<li class="pointer">스크랩</li>
					<li class="pointer">반응 및 댓글</li>
					<li class="pointer">즐겨찾기</li>
				</ul>
			</div>
		` 
	})

	#elementMap = (()=>{
		return 	[...this.#element.querySelectorAll('[data-bind_name]')].reduce((total, element) => {
			total[element.dataset.bind_name] = element;
			return total;
		}, {})
	})();
	#positionChanger;

	#liList = [];

	#lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				this.#page += 1;
				let roomName = this.#elementMap.searchName.value;
				/*
				this.callData(this.#page, this.#size, workspaceId, roomName).then(data=>{
					this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
					if(this.page >= data.totalPages){
						this.#lastItemVisibleObserver.disconnect();
					}
				})
				*/
			}
		})
	}, {
		threshold: 0.1,
		root: document//this.#elementMap.roomContentList
	});


	constructor(){
		/*
		this.#positionChanger = new PositionChanger({wrapper: this.#elementMap.roomContentList});

		this.#workspaceId = workspaceId;
		this.callData(this.#page, this.#size, this.#workspaceId).then(data => {
			this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
		})

		this.#elementMap.menuSearch.onsubmit = (event) => {
			event.preventDefault();
			let roomName = this.#elementMap.searchName.value;
			this.reset();
			this.callData(this.#page, this.#size, this.#workspaceId, roomName).then(data => {
				this.createPage(data).then(liList=> this.addListItemVisibleEvent(liList))
			});
		}
		this.#elementMap.searchName.oninput = (event) => {
			if(this.#elementMap.searchName.value == ''){
				this.reset();
				this.callData(this.#page, this.#size, this.#workspaceId, undefined).then(data => {
					this.createPage(data).then(liList=> this.addListItemVisibleEvent(liList))
				});
			}
		}
		*/
	}

	callData(page, size, workspaceId, roomName){
		return window.myAPI.room.searchMyJoinedRoomList({
			page, size, workspaceId, roomName, roomType: ['ROOM_PUBLIC','ROOM_PRIVATE']
		}).then((data = {}) =>{
			console.log(data)
			return data.data;
		});
	}

	createPage(data, roomName = ''){
		return new Promise(resolve => {
			console.log(data);
			console.log(data.content)
			let {content = []} = data || {};
			console.log(content);
			if(content.length == 0){
				return;
			}
			let liList = content.map(item => {
				let {
					id,
					roomId,
					orderSort,
					roomCode,
					roomName,
					isEnabled,
					workspaceId,
					roomType
				} = item;
				let roomTypeMark;
				if(roomType == 'ROOM_PUBLIC'){
					roomTypeMark = '@';
				}else if(roomTypeMark == 'ROOM_PRIVATE'){
					roomTypeMark = '#';
				}
				let li = Object.assign(document.createElement('li'), {
					className: 'pointer',
					innerHTML: `
						<div>
							<span>${roomTypeMark}</span>
							<span>${roomName}</span>
						</div>
					`
				});
				Object.assign(li.dataset, {
					id,
					room_id: roomId,
					prev_order_sort: orderSort,
					order_sort: orderSort,
					room_code: roomCode,
					room_name: roomName,
					is_enabled: isEnabled,
					workspace_id: workspaceId,
					room_type: roomType
				});
				this.#addItemEvent(li);
				return li;
			});
			this.#liList.push(...liList);
			this.#elementMap.roomContentList.replaceChildren(...this.#liList);
			if(roomName == ''){
				this.#positionChanger.addPositionChangeEvent(this.#liList);
			}else{
				this.#liList.forEach(async (e)=>{
					new Promise(resolve=>{
						e.draggable = true;
						resolve();
					})
				})
			}
			resolve(liList);
		});
	}

	#addItemEvent(li){
		return new Promise(resolve => {
			li.onclick = () => {
				this.roomId = li.dataset.room_id;
			}
			resolve(li);
		});
	}

	addListItemVisibleEvent(liList){
		return new  Promise(resolve => {
			if(liList.length == 0){
				resolve(liList);
			}
			this.#lastItemVisibleObserver.disconnect();
			this.#lastItemVisibleObserver.observe(liList.at(-1));
			resolve(liList);
		})
	}

	reset(){
		this.#page = 0;
		this.#liList = [];
		this.#lastItemVisibleObserver.disconnect();
		this.#elementMap.roomContentList.replaceChildren();
	}

	get element(){
		return this.#element;
	}
	
	get elementMap(){
		return this.#elementMap;
	}
}
