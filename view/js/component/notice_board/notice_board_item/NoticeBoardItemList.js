import workspaceHandler from "../../../handler/workspace/WorkspaceHandler";
import roomHandler from "../../../handler/room/RoomHandler";
import PositionChanger from "./../../../handler/PositionChangeer";

export default new class NoticeBoardItemList{
	#roomMemory = {}
	#page = 0;
	#size = 10;
    #element = Object.assign(document.createElement('div'), {
        id: 'notice_board_list_wrapper',
        innerHTML: `
            <div class="notice_board_list_container" data-bind_name="noticeBoardListContainer">
                <div class="notice_board_menu_wrapper">
                    <div class="notice_board_search_wrapper" data-bind_name="noticeBoardMenuSearchWrapper">
						<form id="notice_board_search" data-bind_name="noticeBoardSearch">
							<div class="search_title_wrapper">
                                <label>search title</label>
                                <input type="search" placeholder="Press Enter Key" class="search_name" name="searchTitle" data-bind_name="searchTitle">
                            </div>
                            <div class="search_content_wrapper">
                                <label>search content</label>
                                <input type="search" placeholder="Press Enter Key" class="search_name" name="searchContent" data-bind_name="searchContent">
                            </div>
                        </form>
					</div>
                </div> 
                <ul class="notice_board_list_content list_scroll list_scroll-y" data-bind_name="noticeBoardListContent">
                    <li>게시판 테스트 1</li>
                    <li>게시판 테스트 2</li>
                    <li>게시판 테스트 3</li>
                    <li>게시판 테스트 4</li>
                    <li>게시판 테스트 5</li>
                    <li>게시판 테스트 6</li>

                    <li>게시판 테스트 7</li>
                    <li>게시판 테스트 8</li>
                    <li>게시판 테스트 9</li>
                    <li>게시판 테스트 10</li>
                    <li>게시판 테스트 11</li>
                    <li>게시판 테스트 12</li>

                    <li>게시판 테스트 13</li>
                    <li>게시판 테스트 14</li>
                    <li>게시판 테스트 15</li>
                    <li>게시판 테스트 16</li>
                    <li>게시판 테스트 17</li>
                    <li>게시판 테스트 18</li>
                    <li>게시판 테스트 19</li>
                    <li>게시판 테스트 20</li>
                    <li>게시판 테스트 21</li>
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
				let memory = Object.values(this.#roomMemory[workspaceHandler.workspaceId]?.[this.#page] || {});
				if(memory && memory.length != 0 && this.#elementMap.searchTitle.value == '' && this.#elementMap.searchContent.value == ''){
					promise = Promise.resolve(
						memory
					);
				}else{
					promise = this.callData(this.#page, this.#size, workspaceHandler.workspaceId, this.#elementMap.searchTitle.value, this.#elementMap.searchContent.value)
                    .then(data => 
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
    #positionChanger;
    constructor(){
        this.#positionChanger = new PositionChanger({wrapper: this.#elementMap.noticeBoardListContent});
		this.#positionChanger.onDropEndChangePositionCallback = (changeList) => {
			/*window.myAPI.room.updateRoomInAccout(changeList).then(data=>{
				console.log(data);
			})*/
		}

        this.#elementMap.noticeBoardSearch.onsubmit = (event) => {
			event.preventDefault();
			this.refresh()
		}
		this.#elementMap.searchTitle.oninput = (event) => {
			if(this.#elementMap.searchTitle.value == ''){
				this.refresh()
			}
		}
        this.#elementMap.searchContent.oninput = (event) => {
			if(this.#elementMap.searchContent.value == ''){
				this.refresh()
			}
		}
        

    }

    callData(page, size, workspaceId, searchTitle, searchContent){
        return window.myAPI.noticeBoard.searchNoticeBoard({
            page, size, workspaceId, searchTitle, searchContent
        }).then((data = {}) => {
            return data.data;
        })
	}

    createPage(data, searchTitle = '', searchContent = ''){
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
				if(searchTitle == '' && searchContent == ''){
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
			this.#addRoomMemory(li, roomId);
			this.#addItemEvent(li);
			resolve(li);
		})
	}

    #addItemEvent(li){
		return new Promise(resolve => {
			li.onclick = () => {
				roomHandler.roomId = li.dataset.room_id;
			}
			resolve(li);
		});
	}

    #addRoomMemory(data, roomId){
		if( ! this.#roomMemory.hasOwnProperty(workspaceHandler.workspaceId)){
			this.#roomMemory[workspaceHandler.workspaceId] = {};
		}
		if( ! this.#roomMemory[workspaceHandler.workspaceId].hasOwnProperty(this.#page)){
			this.#roomMemory[workspaceHandler.workspaceId][this.#page] = {};
		}
		if( ! data || ! roomId){
			return ;
		}
		this.#roomMemory[workspaceHandler.workspaceId][this.#page][roomId] = data;
    }

    refresh(){
		this.reset();
		let promise;
		let memory = Object.values(this.#roomMemory[workspaceHandler.workspaceId] || {});
		if(memory && memory.length != 0 && this.#elementMap.searchTitle.value == '' && this.#elementMap.searchContent.value == ''){
			this.#page = memory.length - 1;
			promise = Promise.resolve(
				memory.flatMap(e=>Object.values(e))
			);
		}else{
			promise = this.callData(this.#page, this.#size, workspaceHandler.workspaceId, this.#elementMap.searchTitle.value, this.#elementMap.searchContent.value)
            .then(data => 
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
}