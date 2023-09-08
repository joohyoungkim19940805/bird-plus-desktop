import workspaceHandler from "../../../handler/workspace/WorkspaceHandler";
import chattingHandler from "../../../handler/chatting/ChattingHandler";
import PositionChanger from "./../../../handler/PositionChangeer";
import CreateRoomView from "./CreateRoomView";
export default new class RoomList{
	#workspaceId
	#roomId
	#page = 0;
	#size = 10;
	#element = Object.assign(document.createElement('div'), {
		id: 'room_list_wrapper',
		innerHTML: `
			<div class="room_container list_scroll list_scroll-y" data-bind_name="roomContainer">
				<div class="room_sticky" data-bind_name="roomSticky">
					<div class="custom_details_summary" data-bind_name="customDetailsSummary">
						<b><i>Room</i></b>
						<button class="add_button" data-bind_name="addButton">+</button>
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

	#liList = [];

	#visibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				entry.target.style.visibility = '';
				entry.target.style.opacity = '';
			}else{
				entry.target.style.visibility = 'hidden';
				entry.target.style.opacity = 0;
			}
		})
	}, {
		threshold: 0.1,
		root: this.#elementMap.roomContentList
	});

	#lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				this.#page += 1;
				let roomName = this.#elementMap.searchName.value;
				this.callData(this.#page, this.#size, this.#workspaceId, roomName).then(data=>{
					this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
					if(this.#page >= data.totalPages){
						this.#lastItemVisibleObserver.disconnect();
					}
				})
			}
		})
	}, {
		threshold: 0.1,
		root: document//this.#elementMap.roomContentList
	});

	#positionChanger;
	#createRoomView;
	constructor(){

		this.#positionChanger = new PositionChanger({wrapper: this.#elementMap.roomContentList});
		this.#positionChanger.onDropEndChangePositionCallback = (changeList) => {
			window.myAPI.room.updateRoomInAccout(changeList).then(data=>{
				console.log(data);
			})
		}

		this.#createRoomView = new CreateRoomView(this);
		workspaceHandler.addWorkspaceIdChangedListener = {
			name: 'roomList',
			callBack: (handler) => {
				this.workspaceId = handler.workspaceId;
			},
			runTheFirst: true
		}

		this.#elementMap.menuSearch.onsubmit = (event) => {
			event.preventDefault();
			let roomName = this.#elementMap.searchName.value;
			this.reset();
			this.callData(this.#page, this.#size, this.#workspaceId, roomName).then(data => {
				this.createPage(data, roomName).then(liList=> this.addListItemVisibleEvent(liList))
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

		this.#createRoomView.onOpenCloseCallBack = (status) => {
			this.#createRoomView.reset();
			if(status == 'open'){
				this.#createRoomView.callData(this.#createRoomView.page, this.#createRoomView.size, this.#workspaceId, this.#createRoomView.form.fullName.value)
				.then(data => {
					this.#createRoomView.createPage(data).then(liList => {
						this.#createRoomView.addListItemVisibleEvent(liList);
					})
				})
			}else{
				this.roomId = this.#createRoomView.roomId;
			}
		}

		this.#elementMap.addButton.onclick = () =>{
			this.#createRoomView.open();
		}

		chattingHandler.addRoomIdChangeListener = {
			name: 'roomList',
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
					this.reset();
					this.#elementMap.searchName.value = '';
					this.callData(this.#page, this.#size, this.#workspaceId, this.#elementMap.searchName.value).then(data => {
						this.createPage(data).then(liList=> this.addListItemVisibleEvent(liList))
					});
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
			searchPromise = window.myAPI.room.searchRoomMyJoinedName({
				page, size, workspaceId, roomName, roomType: ['ROOM_PUBLIC','ROOM_PRIVATE']
			})
		}else{
			searchPromise = window.myAPI.room.searchRoomMyJoined({
				page, size, workspaceId, roomType: ['ROOM_PUBLIC','ROOM_PRIVATE']
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
				}else if(roomType == 'ROOM_PRIVATE'){
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
				this.#visibleObserver.observe(li);
				this.#addItemEvent(li);
				return li;
			});
			this.#liList.push(...liList);
			this.#elementMap.roomContentList.replaceChildren(...this.#liList);
			if(roomName == ''){
				this.#positionChanger.addPositionChangeEvent(...this.#liList);
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
			this.#lastItemVisibleObserver.observe(liList[liList.length - 1]);
			resolve(liList);
		})
	}

	reset(){
		this.#page = 0;
		this.#liList = [];
		this.#visibleObserver.disconnect();
		this.#lastItemVisibleObserver.disconnect();
		this.#elementMap.roomContentList.replaceChildren();
	}

	set workspaceId(workspaceId){
		this.#createRoomView.workspaceId = workspaceId;
		this.#workspaceId = workspaceId;
		this.reset();
		this.callData(this.#page, this.#size, this.#workspaceId, this.#elementMap.searchName.value).then(data => {
			this.createPage(data).then(liList=> this.addListItemVisibleEvent(liList))
		});
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
		chattingHandler.roomId = roomId;
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
}
