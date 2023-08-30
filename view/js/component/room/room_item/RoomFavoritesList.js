
export default class RoomMenuItems{
	#workspaceId
	#roomId
	#page = 0;
	#size = 10;
	#element = Object.assign(document.createElement('div'), {
		id: 'room-list-wrapper',
		innerHTML: `
			<div class="room_container list_scroll list_scroll-y" data-bind_name="roomContainer">
				<div class="room_sticky" data-bind_name="roomSticky">
					<div class="custom_details_summary" data-bind_name="customDetailsSummary">
						추가
						<button>+</button>
						<button class="custom_details" data-open_status="▼" data-close_status="▶" data-is_open="" data-bind_name="customDetails">▼</button>
					</div>
					<div class="room_functions" data-bind_name="roomFunctions">
						<form id="menu-search" data-bind_name="menuSearch">
							<input type="text" placeholder="Press Enter Key" class="search_name" name="searchName" data-bind_name="searchName">
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
					if(this.page >= data.totalPages){
						this.#lastItemVisibleObserver.disconnect();
					}
				})
			}
		})
	}, {
		threshold: 0.1,
		root: document//this.#elementMap.roomContentList
	});


	constructor(workspaceId, roomId){
		if( ! workspaceId){
			throw new Error('workspaceId is undefined');
		}
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

	createPage(data){
		return new Promise(resolve => {
			console.log(data);
			console.log(data.content)
			let {content = []} = data || {};
			console.log(content);
			let liList = content.map(item => {
				let {
					roomId,
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
					room_code: roomCode,
					room_id : roomId,
					workspace_id : workspaceId,
					room_type : roomType 
				});
				this.#visibleObserver.observe(li);
				this.#addItemEvent(li);
				return li;
			});
			this.#liList.push(...liList);
			this.#elementMap.roomContentList.replaceChildren(...this.#liList);
			resolve(liList);
		});
	}

	#addItemEvent(li){
		return new Promise(resolve => {
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
		this.#workspaceId = workspaceId;
	}
	get workspaceId(){
		return this.#workspaceId;
	}

	set roomId(roomId){
		this.#roomId = roomId;
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
