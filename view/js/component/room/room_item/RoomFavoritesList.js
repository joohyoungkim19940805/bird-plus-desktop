import workspaceHandler from "../../../handler/workspace/WorkspaceHandler";
import roomHandler from "../../../handler/room/RoomHandler";
import PositionChanger from "./../../../handler/PositionChangeer";
import CreateRoomView from "./CreateRoomView";

export default new class RoomFavoritesList{

	#roomFavoritesMemory = {};

	#workspaceId
	#roomId
	#page = 0;
	#size = 10;
	#element = Object.assign(document.createElement('div'), {
		id: 'room-favorites-wrapper',
		innerHTML: `
			<div class="room_container list_scroll list_scroll-y" data-bind_name="roomContainer">
				<div class="room_sticky">
					<div class="custom_details_summary" data-bind_name="customDetailsSummary">
						<b><i>Favorites</i></b>
						<button class="custom_details" data-open_status="▼" data-close_status="▶" data-is_open="" data-bind_name="customDetails">▼</button>
					</div>
					<div class="room_functions" data-bind_name="roomFunctions">
						<form id="menu_search" data-bind_name="menuSearch">
							<input type="search" placeholder="Press Enter Key" class="search_name" name="searchName" data-bind_name="searchName">
						</form>
					</div>
				</div>
				<ul class="room_content_list" data-bind_name="roomContentList">
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
				let promise;
				let memory = Object.values(this.#roomFavoritesMemory[workspaceHandler.workspaceId]?.[this.#page] || {});
				if(this.#elementMap.searchName.value == '' && memory && memory.length != 0){
					promise = Promise.resolve(
						memory
					);
				}else{
					promise = this.callData(this.#page, this.#size, this.#workspaceId, this.#elementMap.searchName.value).
					then(data => 
						this.createPage(data)
						.then(liList => {        
							if(this.#page >= data.totalPages){
								this.#lastItemVisibleObserver.disconnect();
							}
							return liList;
						})
					)
				}
				promise.then(liList => {
					this.#liList.push(...liList);
					this.#liList = Object.values(this.#liList.reduce((total, item)=>{
						if(total.hasOwnProperty(item.dataset.room_id)){
							return total;	
						}
						total[item.dataset.room_id] = item;
						return total;
					}, {})).sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort))
					this.#elementMap.roomContentList.replaceChildren(...this.#liList);
					this.#lastItemVisibleObserver.disconnect();
					let lastVisibleTarget = liList[liList.length - 1];
					if(lastVisibleTarget){
						this.#lastItemVisibleObserver.observe(lastVisibleTarget)
					}
				})
			}
		})
	}, {
		threshold: 0.1,
		root: document//this.#elementMap.roomContentList
	});


	constructor(){
		this.#positionChanger = new PositionChanger({wrapper: this.#elementMap.roomContentList});
		this.#positionChanger.onDropEndChangePositionCallback = (changeList) => {
			console.log(changeList)
			window.myAPI.room.updateRoomFavorites(changeList).then(data=>{
				console.log(data);
			})
		}
		workspaceHandler.addWorkspaceIdChangedListener = {
			name: 'roomFavoritesList',
			callBack: (handler) => {
				this.workspaceId = handler.workspaceId;
			},
			runTheFirst: true
		};
		

		this.#elementMap.menuSearch.onsubmit = (event) => {
			event.preventDefault();
			this.refresh();
		}
		this.#elementMap.searchName.oninput = (event) => {
			if(this.#elementMap.searchName.value == ''){
				this.refresh();
			}
		}

		roomHandler.addRoomIdChangeListener = {
			name: 'roomFavoritesList',
			callBack: (handler) => {
				/*if(this.#roomId == handler.roomId){
					return;
				}*/
				this.#roomId = handler.roomId;
				new Promise(resolve => {
					this.#liList.forEach((item) => {
						let itemRoomId = Number(item.dataset.room_id);
						if(isNaN(itemRoomId)){
							resolve();
							return;
						}else if(handler.roomId == itemRoomId){
							resolve();
							return;
						}
						item.style.fontWeight = '';
					})
					resolve();
				})
				let targetRoom = this.#elementMap.roomContentList.querySelector(`[data-room_id="${handler.roomId}"]`);
				if(! targetRoom){
					this.#elementMap.searchName.value = '';
					this.refresh();
					return;
				}
				targetRoom.style.fontWeight = 'bold';
			},
			runTheFirst: false
		}
	}

	callData(page, size, workspaceId, roomName){
		let searchPromise;
		if(roomName && roomName != ''){
			searchPromise = window.myAPI.room.searchRoomFavoritesMyJoinedName({
				page, size, workspaceId, roomName
			})
		}else{
			searchPromise = window.myAPI.room.searchRoomFavoritesMyJoined({
				page, size, workspaceId
			})
		}
		return searchPromise.then((data = {}) =>{
			console.log(data)
			return data.data;
		});
	}

	createPage(data, roomName = ''){
		return new Promise(resolve => {
			let {content = []} = data || {};
			if(content.length == 0){
				resolve(content);
				return;
			}
			return Promise.all(content.map(item => 
                this.createItemElement(item)
            )).then((liList = [])=>{
				if(liList.length == 0){
                    resolve(liList);
                }
				this.#liList.push(...liList);
				this.#elementMap.roomContentList.replaceChildren(...this.#liList);
				if(roomName == ''){
					this.#positionChanger.addPositionChangeEvent(...this.#liList);
				}
               resolve(liList);
            });
		});
	}
	createItemElement(item){
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
		return new Promise(resolve=>{
			let roomTypeMark = '$';
			if(roomType == 'ROOM_PUBLIC'){
				roomTypeMark = '@';
			}else if(roomType == 'ROOM_PRIVATE'){
				roomTypeMark = '#';
			}else{
				roomTypeMark = '$'
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
			if(this.#roomId && roomId == this.#roomId){
				li.style.fontWeight = 'bold';
			}
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
			li.draggable = true;
			this.#addRoomFavoritesMemory(li, roomId);
			this.#addItemEvent(li);
			resolve(li);
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

	#addRoomFavoritesMemory(data, roomId){
		if( ! this.#roomFavoritesMemory.hasOwnProperty(workspaceHandler.workspaceId)){
			this.#roomFavoritesMemory[workspaceHandler.workspaceId] = {};
		}
		if( ! this.#roomFavoritesMemory[workspaceHandler.workspaceId].hasOwnProperty(this.#page)){
			this.#roomFavoritesMemory[workspaceHandler.workspaceId][this.#page] = {};
		}
		if( ! data || ! roomId){
			return ;
		}
		this.#roomFavoritesMemory[workspaceHandler.workspaceId][this.#page][roomId] = data;
    }
	
	refresh(){
		this.reset();
		let promise;
		let memory = Object.values(this.#roomFavoritesMemory[workspaceHandler.workspaceId] || {});
		if(this.#elementMap.searchName.value == '' && memory && memory.length != 0){
			this.#page = memory.length - 1;
			promise = Promise.resolve(
				memory.flatMap(e=>Object.values(e))
			);
		}else{
			promise = this.callData(this.#page, this.#size, this.#workspaceId, this.#elementMap.searchName.value).
			then(data => 
				this.createPage(data)
				.then(liList => {        
					if(this.#page >= data.totalPages){
						this.#lastItemVisibleObserver.disconnect();
					}
					return liList;
				})
			)
		}
		promise.then(liList => {
			this.#liList.push(...liList);
			this.#liList = Object.values(this.#liList.reduce((total, item)=>{
				if(total.hasOwnProperty(item.dataset.room_id)){
					return total;	
				}
				total[item.dataset.room_id] = item;
				return total;
			}, {})).sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort))
			this.#elementMap.roomContentList.replaceChildren(...this.#liList);
			this.#lastItemVisibleObserver.disconnect();
			let lastVisibleTarget = liList[liList.length - 1];
			if(lastVisibleTarget){
				this.#lastItemVisibleObserver.observe(lastVisibleTarget)
			}
		})
	}

	reset(){
		this.#page = 0;
		this.#liList = [];
		this.#lastItemVisibleObserver.disconnect();
		this.#elementMap.roomContentList.replaceChildren();
	}

	set workspaceId(workspaceId){
		this.#workspaceId = workspaceId;
		this.refresh();
	}
	get workspaceId(){
		return this.#workspaceId;
	}

	set roomId(roomId){
		if( ! roomId){
			console.error('roomId is undefined');
            return;
        }
		this.#roomId = roomId;
		roomHandler.roomId = roomId;
	}
	get roomId(){
		return this.#roomId;
	}

	get element(){
		return this.#element;
	}
	
	get elementMap(){
		return this.#elementMap;
	}

	get roomFavoritesMemory(){
		return this.#roomFavoritesMemory;
	}
}
