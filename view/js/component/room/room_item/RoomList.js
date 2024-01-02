import {workspaceHandler} from "@handler/workspace/WorkspaceHandler";
import {roomHandler} from "@handler/room/RoomHandler";
import PositionChanger from "@handler/PositionChangeer";
import CreateRoomView from "./CreateRoomView";
export const roomList = new class RoomList{
	#memory = {}

	#page = 0;
	#size = 10;
	#element = Object.assign(document.createElement('div'), {
		id: 'room_list_wrapper',
		innerHTML: `
			<div class="room_container list_scroll list_scroll-y" data-bind_name="roomContainer">
				<div class="room_sticky" data-bind_name="roomSticky">
					<div class="custom_details_summary" data-bind_name="customDetailsSummary">
						<div class="custom_details_wrapper">
							<button class="custom_details" data-open_status="▼" data-close_status="▶" data-is_open="" data-bind_name="customDetails">▼</button>
							<b class="pointer custom_details_title" data-bind_name="customDetailsTitle"><i>Room</i></b>
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

	#lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				this.#page += 1;
				let promise;
				let memory = Object.values(this.#memory[workspaceHandler.workspaceId]?.[this.#page] || {});
				if(this.#elementMap.searchName.value == '' && memory && memory.length != 0){
					promise = Promise.resolve(
						memory
					);
				}else{
					promise = this.callData(this.#page, this.#size, workspaceHandler.workspaceId, this.#elementMap.searchName.value).
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
					if(liList.length == 0){
						return;
					}
					let lastVisibleTarget = this.#liList.at(-1);
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

	#positionChanger;
	#createRoomView;
	constructor(){
		roomHandler.roomListMemory = this.#memory;
		this.#positionChanger = new PositionChanger({wrapper: this.#elementMap.roomContentList});
		this.#positionChanger.onDropEndChangePositionCallback = (changeList) => {
			window.myAPI.room.updateRoomInAccoutOrder(changeList.map(e=>{
				return {
					id: e.dataset.id, 
					roomId: e.dataset.room_id, 
					orderSort: e.dataset.order_sort,
				}
			})).then(data=>{
				console.log(data);
			})
		}

		this.#positionChanger.onDropDocumentOutCallback = ({target, event}) => {
			window.myAPI.createSubWindow({
				workspaceId: workspaceHandler.workspaceId,
				roomId: target.dataset.room_id,
				width: parseInt(window.outerWidth * 0.7),
				height: parseInt(window.outerHeight * 0.7),
				x: event.x,
				y: event.y,
				pageName: 'multipleChattingView',
				pageId : target.dataset.room_id,
				title : roomHandler.room.roomName
			})
		}

		this.#createRoomView = new CreateRoomView(this);
		
		workspaceHandler.addWorkspaceIdChangedListener = {
			name: 'roomList',
			callback: (handler) => {
				this.refresh();
			},
			runTheFirst: true
		}

		this.#elementMap.menuSearch.onsubmit = (event) => {
			event.preventDefault();
			this.refresh()
		}
		this.#elementMap.searchName.oninput = (event) => {
			if(this.#elementMap.searchName.value == ''){
				this.refresh()
			}
		}

		this.#createRoomView.onOpenCloseCallback = (status) => {
			this.#createRoomView.reset();
			if(status == 'open'){
				this.#createRoomView.callData(this.#createRoomView.page, this.#createRoomView.size, workspaceHandler.workspaceId, this.#createRoomView.form.fullName.value)
				.then(data => {
					this.#createRoomView.createPage(data).then(liList => {
						this.#createRoomView.addListItemVisibleEvent(liList);
					})
				})
			}
		}

		this.#elementMap.addButton.onclick = () =>{
			this.#createRoomView.open();
		}

		roomHandler.addRoomIdChangeListener = {
			name: 'roomList',
			callback: (handler) => {
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
				document.head.querySelector('title').textContent = handler.room.roomName + ' - Grease Lightning Chat';
			},
			runTheFirst: false
		}
		window.myAPI.event.electronEventTrigger.addElectronEventListener('roomAccept', event => {
			let {content} = event;
			if( ! ['ROOM_PUBLIC','ROOM_PRIVATE'].some(e=> e == content.roomType)){
				return;
			}
			//this.refresh();
			this.createItemElement(content)
			.then(li => {
				Object.entries(this.#memory[content.workspaceId] || {}).forEach(([page, obj]) => {
					if( ! obj.hasOwnProperty(event.roomId)){
						return;
					}
					this.#memory[content.workspaceId][page][content.roomId] = li;
				})
				this.refresh()
			})
		});
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
					this.#positionChanger.addPositionChangeEvent(this.#liList);
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
			let roomTypeMark;
			if(roomType == 'ROOM_PUBLIC'){
				roomTypeMark = `
				<svg class="room_public" style="transform: rotate(-3deg);" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M8 4V8H4V10H8V14H4V16H8V20H10V16H14V20H16V16H20V14H16V10H20V8H16V4H14V8H10V4H8ZM14 14V10H10V14H14Z" fill="currentColor"/>
				</svg>
				`;
			}else if(roomType == 'ROOM_PRIVATE'){
				roomTypeMark = `
				<svg class="room_private" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M18 10.5C19.6569 10.5 21 11.8431 21 13.5V19.5C21 21.1569 19.6569 22.5 18 22.5H6C4.34315 22.5 3 21.1569 3 19.5V13.5C3 11.8431 4.34315 10.5 6 10.5V7.5C6 4.18629 8.68629 1.5 12 1.5C15.3137 1.5 18 4.18629 18 7.5V10.5ZM12 3.5C14.2091 3.5 16 5.29086 16 7.5V10.5H8V7.5C8 5.29086 9.79086 3.5 12 3.5ZM18 12.5H6C5.44772 12.5 5 12.9477 5 13.5V19.5C5 20.0523 5.44772 20.5 6 20.5H18C18.5523 20.5 19 20.0523 19 19.5V13.5C19 12.9477 18.5523 12.5 18 12.5Z" fill="currentColor"/>
				</svg>
				`;
			}
			let li = Object.assign(document.createElement('li'), {
				className: 'room_container_item pointer',
				innerHTML: `
					<div class="room_container_item_container">
						<span>${roomTypeMark}</span>
						<span>${roomName}</span>
					</div>
				`
			});
			if(roomHandler.roomId && roomId == roomHandler.roomId){
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
			this.#addMemory(li, workspaceId, roomId);
			this.#addItemEvent(li);
			resolve(li);
		})
	}

	#addItemEvent(li){
		return new Promise(resolve => {
			li.onclick = () => {
				if(li.dataset.room_id == roomHandler.roomId) return;
				roomHandler.roomId = li.dataset.room_id;
			}
			resolve(li);
		});
	}

	#addMemory(data, workspaceId, roomId){
		if( ! this.#memory.hasOwnProperty(workspaceId)){
			this.#memory[workspaceId] = {};
		}
		if( ! this.#memory[workspaceId].hasOwnProperty(this.#page)){
			this.#memory[workspaceId][this.#page] = {};
		}
		if( ! data || ! roomId){
			return ;
		}
		this.#memory[workspaceId][this.#page][roomId] = data;
    }

	refresh(){
		this.reset();
		let promise;
		let memory = Object.values(this.#memory[workspaceHandler.workspaceId] || {});
		if(memory && memory.length != 0 && this.#elementMap.searchName.value == ''){
			this.#page = memory.length - 1;
			promise = Promise.resolve(
				memory.flatMap(e=>Object.values(e))
			);
		}else{
			promise = this.callData(this.#page, this.#size, workspaceHandler.workspaceId, this.#elementMap.searchName.value).
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
			if(liList.length == 0){
				return;
			}
			let lastVisibleTarget = this.#liList.at(-1);
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

	get element(){
		return this.#element;
	}
	
	get elementMap(){
		return this.#elementMap;
	}

	get liList(){
		return this.#liList;
	}
}
