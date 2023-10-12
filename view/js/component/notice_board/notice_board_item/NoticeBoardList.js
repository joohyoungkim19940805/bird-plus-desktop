import workspaceHandler from "../../../handler/workspace/WorkspaceHandler";
import roomHandler from "../../../handler/room/RoomHandler";
import PositionChanger from "../../../handler/PositionChangeer";

export default new class NoticeBoardList{
	#memory = {}
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
				<div class="notice_board_list_content_button_wrapper">
					<button class="css-gg-folder-add pointer" type="button" data-bind_name="rootFolderAdd">
					</button>
				</div>
                <ul class="notice_board_list_content list_scroll list_scroll-y" data-bind_name="noticeBoardList">
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
					this.#elementMap.noticeBoardList.replaceChildren(...this.#liList);
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
        this.#positionChanger = new PositionChanger({wrapper: this.#elementMap.noticeBoardList});
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
		this.#elementMap.rootFolderAdd.onclick = () => {
			this.createFolder(undefined, this.#elementMap.noticeBoardList);
		}
    }
	createFolder(data = {isEmpty:true}, parentRoot){
		let li = Object.assign(document.createElement('li'), {
			className: 'notice_board_list_content_item',
			innerHTML : `
			<div class="notice_board_list_content_item_title_wrapper">
				<button class="marker pointer" ${data.isEmpty ? 'data-is_open=""' : ''}></button>
				<div class="notice_board_list_content_item_title">
					<b class="notice_board_list_content_item_title_name" contentEditable=true>${data.folderName || ''}</b>
				</div>
				<div class="notice_board_list_content_button_wrapper">
					<button class="css-gg-add pointer" type="button">
					</button>
					<button class="css-gg-folder-add pointer" type="button">
					</button>
				</div>
			</div>
			<ul class="notice_board_list_content">
			</ul>
			`
		});
		li.dataset.visibility_not = '';
		let [marker, titleName, buttonWrapper, addButton, folderAddButton, childRoot] = li.querySelectorAll('.marker, .notice_board_list_content_item_title_name, .notice_board_list_content_button_wrapper, .css-gg-add, .css-gg-folder-add, .notice_board_list_content');
		let deleteButton  = Object.assign(document.createElement('button'),{
			className: 'css-gg-remove pointer',
			onclick: (event) => li.remove()
		});
		if(data.isEmpty){
			buttonWrapper.prepend(deleteButton);
		}

		addButton.onclick = () => this.createNoticeBoard(undefined, childRoot);
		folderAddButton.onclick = () => this.createFolder(undefined, childRoot);
		marker.onclick = () => {
			childRoot.ontransitionend = '';
			if(marker.hasAttribute('data-is_open')){
				childRoot.style.height = childRoot.scrollHeight + 'px';
				childRoot.dataset.prev_height = childRoot.style.height;
				setTimeout(()=>{
					childRoot.style.height = '0px';
					childRoot.ontransitionend = () => {
						childRoot.style.overflow = 'hidden';
					}
				}, 0);
			}else{
				childRoot.style.height = childRoot.dataset.prev_height;
				childRoot.ontransitionend = () => {
					childRoot.style.height = '';
					childRoot.style.overflow = '';
				}
			}
			marker.toggleAttribute('data-is_open');
		}
		deleteButton.onmouseover = (event) => {
			deleteButton.dataset.is_mouseover = '';
		}
		deleteButton.onmouseout = (event) => {
			deleteButton.removeAttribute('data-is_mouseover');
		}
		titleName.onblur = (event) => {
			if(deleteButton && titleName.textContent != '' && ! deleteButton.hasAttribute('data-is_mouseover')){
				deleteButton.remove();
				if( ! titleName.dataset.prev_titleName || titleName.dataset.prev_titleName != titleName.textContent){
					window.myAPI.noticeBoard.createNoticeBoard({
						roomId: roomHandler.roomId,
						workspaceId: workspaceHandler.workspaceId,
						title: titleName.textContent
					}).then( result => {
						console.log(result);
						let keyRegx = /[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g;
						let underbarKeyNameObject = Object.entries(result.data).reduce((total, [k,v]) => {
							let key = k.match(keyRegx).map(e=> e.toLowerCase()).join('_');
							total[key] = v;
							return total;
						}, {});
						Object.assign(li.dataset, underbarKeyNameObject);
						console.log(li.dataset);
					})
				}
				titleName.dataset.prev_titleName = titleName.textContent
			}
		}
		titleName.onkeydown = (event) => {
			console.log(event);
			if(event.key != 'Enter'){
				return;
			}
			event.preventDefault();
			titleName.blur();
		}
		titleName.onkeyup = (event) => {
			if(titleName.textContent == ''){
				buttonWrapper.prepend(deleteButton);
			}
		}
		let titleNameConnectedAwait = setInterval(()=>{
			if(titleName.isConnected){
				titleName.focus();
				clearInterval(titleNameConnectedAwait);
			}
		}, 100)

		parentRoot.prepend(li);
	}
	createNoticeBoard(data = {isEmpty:true}, parentRoot){
		let li = Object.assign(document.createElement('li'), {
			className: 'notice_board_list_content_item type_notice_board',
			innerHTML: `
			<div class="notice_board_list_content_item_title_wrapper">
				<div class="notice_board_list_content_item_title">
					<span class="notice_board_list_content_item_title_name" contentEditable=true>${data.folderName || ''}</span>
				</div>
				<div class="notice_board_list_content_button_wrapper">
				</div>
			</div>
			`
		});

		let [titleName, buttonWrapper] = li.querySelectorAll('.notice_board_list_content_item_title_name, .notice_board_list_content_button_wrapper');
		let deleteButton  = Object.assign(document.createElement('button'),{
			className: 'css-gg-remove pointer',
			onclick: (event) => li.remove()
		});
		if(data.isEmpty){
			buttonWrapper.prepend(deleteButton);
		}
		deleteButton.onmouseover = (event) => {
			deleteButton.dataset.is_mouseover = '';
		}
		deleteButton.onmouseout = (event) => {
			deleteButton.removeAttribute('data-is_mouseover');
		}
		titleName.onblur = (event) => {
			if(deleteButton && titleName.textContent != '' && ! deleteButton.hasAttribute('data-is_mouseover')){
				deleteButton.remove();
			}
		}
		titleName.onkeydown = (event) => {
			if(event.key != 'Enter'){
				return;
			}
			event.preventDefault();
			titleName.blur();
		}
		titleName.onkeyup = (event) => {
			if(titleName.textContent == ''){
				buttonWrapper.prepend(deleteButton);
			}
		}
		let titleNameConnectedAwait = setInterval(()=>{
			if(titleName.isConnected){
				titleName.focus();
				clearInterval(titleNameConnectedAwait);
			}
		}, 100)
		parentRoot.prepend(li);
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
		if( ! this.#memory.hasOwnProperty(workspaceHandler.workspaceId)){
			this.#memory[workspaceHandler.workspaceId] = {};
		}
		if( ! this.#memory[workspaceHandler.workspaceId].hasOwnProperty(this.#page)){
			this.#memory[workspaceHandler.workspaceId][this.#page] = {};
		}
		if( ! data || ! roomId){
			return ;
		}
		this.#memory[workspaceHandler.workspaceId][this.#page][roomId] = data;
    }

    refresh(){
		this.reset();
		let promise;
		let memory = Object.values(this.#memory[workspaceHandler.workspaceId] || {});
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
			this.#elementMap.noticeBoardList.replaceChildren(...this.#liList);
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
		this.#elementMap.noticeBoardList.replaceChildren();
	}

	get element(){
		return this.#element;
	}
	
	get elementMap(){
		return this.#elementMap;
	}
}