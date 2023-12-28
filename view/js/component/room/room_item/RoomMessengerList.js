import {workspaceHandler} from "@handler/workspace/WorkspaceHandler";
import {roomHandler} from "@handler/room/RoomHandler";
import PositionChanger from "@handler/PositionChangeer";
import CreateMessengerView from "./CreateMessengerView";

import { accountHandler } from "@handler/account/AccountHandler"

export const roomMessengerList = new class RoomMessengerList{

	#memory = {};

	#page = 0;
	#size = 10;
	#element = Object.assign(document.createElement('div'), {
		id: 'room_messenger_wrapper',
		innerHTML: `
			<div class="room_container list_scroll list_scroll-y" data-bind_name="roomContainer">
				<div class="room_sticky" data-bind_name="roomSticky">
					<div class="custom_details_summary" data-bind_name="customDetailsSummary">
					<div class="custom_details_wrapper">
						<button class="custom_details" data-open_status="▼" data-close_status="▶" data-is_open="" data-bind_name="customDetails">▼</button>
						<b class="pointer custom_details_title" data-bind_name="customDetailsTitle"><i>Messenger</i></b>
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
	#positionChanger;

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
					let lastVisibleTarget = liList.at(-1);
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

	#createMessengerView;
	constructor(){
		roomHandler.roomMessengerListMemory = this.#memory;
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

		this.#createMessengerView = new CreateMessengerView(this);

		workspaceHandler.addWorkspaceIdChangedListener = {
			name: 'roomMessengerList',
			callBack: (handler) => {
				this.refresh();
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

		this.#createMessengerView.onOpenCloseCallback = (status) => {
			this.#createMessengerView.reset();
			if(status == 'open'){
				this.#createMessengerView.callData(this.#createMessengerView.page, this.#createMessengerView.size, workspaceHandler.workspaceId, this.#createMessengerView.form.fullName.value)
				.then(data => {
					this.#createMessengerView.createPage(data).then(liList => {
						this.#createMessengerView.addListItemVisibleEvent(liList);
					})
				})
			}
		}

		this.#elementMap.addButton.onclick = () =>{
			this.#createMessengerView.open();
		}

		roomHandler.addRoomIdChangeListener = {
			name: 'roomMessengerList',
			callBack: (handler) => {
				/*if(this.#roomId == handler.roomId){
					return;
				}*/
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

		/*window.myAPI.event.electronEventTrigger.addElectronEventListener('roomInAccountAccept', event => {
			console.log(event);
		})*/
		window.myAPI.event.electronEventTrigger.addElectronEventListener('roomAccept', event => {
			console.log('roomAccept ::: ',event);
			let {content} = event;
			if( ! ['SELF','MESSENGER'].some(e=> e == content.roomType)){
				return;
			}
			//this.refresh();
			this.createItemElement(content)
			.then(li => {
				//this.#liList.push(li);
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
			page, size, workspaceId, roomName, roomType: ['SELF','MESSENGER']
		}).then((data = {}) =>{
			return data.data;
		});
	}

	createPage(data){
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
				if(this.#elementMap.searchName.value == ''){
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
			let roomTypeMark = `
			<svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7ZM14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7Z" fill="currentColor"/>
				<path d="M16 15C16 14.4477 15.5523 14 15 14H9C8.44772 14 8 14.4477 8 15V21H6V15C6 13.3431 7.34315 12 9 12H15C16.6569 12 18 13.3431 18 15V21H16V15Z" fill="currentColor"/>
			</svg>
			`;
			/*
			if(roomType == 'ROOM_PUBLIC'){
				roomTypeMark = '@';
			}else if(roomTypeMark == 'ROOM_PRIVATE'){
				roomTypeMark = '#';
			}
			*/
			if(roomType == 'MESSENGER'){
				let roomNameList = roomName.split(',');
				let targetIndex = roomNameList.findIndex(e=> e == accountHandler.accountInfo.fullName);
				if(targetIndex != -1){
					roomNameList.splice(roomNameList.findIndex(e=> e == accountHandler.accountInfo.fullName), 1);
				}
				roomName = roomNameList.sort((a,b)=> a.localeCompare(b)).join(', ');
			}else{
				roomName = `나 (${roomName})`; 
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
		});
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
				.sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort))
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
			let lastVisibleTarget = liList.at(-1);
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
