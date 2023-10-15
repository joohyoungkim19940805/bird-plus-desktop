import workspaceHandler from "../../../handler/workspace/WorkspaceHandler";
import roomHandler from "../../../handler/room/RoomHandler";
import PositionChanger from "../../../handler/PositionChangeer";
import common from "./../../../common"
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
		//noticeBoardList
    }
	createFolder(data = {isEmpty:true}, parentRoot){
		let li = Object.assign(document.createElement('li'), {
			className: 'notice_board_list_content_item',
			innerHTML : `
			<div class="notice_board_list_content_item_title_wrapper">
				<button class="marker pointer" ${data.isEmpty ? 'data-is_open=""' : ''}></button>
				<div class="notice_board_list_content_item_title">
					<b class="notice_board_list_content_item_title_name" contentEditable=true>${data.title || ''}</b>
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
		if( ! data.isEmpty){
			common.jsonToSaveElementDataset(data, li);
			console.log('dataset :::' , li.dataset);
		}
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
					window.myAPI.noticeBoard.createNoticeBoardGroup({
						roomId: roomHandler.roomId,
						workspaceId: workspaceHandler.workspaceId,
						title: titleName.textContent,
						groupId: li.dataset.group_id,
						parentGroupId: parentRoot.dataset.parent_group_id
					}).then( result => {
						childRoot.dataset.parent_group_id = li.dataset.group_id;
						console.log(result);
						common.jsonToSaveElementDataset(result.data, li);
					})
				}
				titleName.dataset.prev_titleName = titleName.textContent
			}
		}
		window.myAPI.event.electronEventTrigger.addElectronEventListener('noticeBoardAccept', event => {

		})
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
			if(titleName.isConnected && data.isEmpty){
				titleName.focus();
				clearInterval(titleNameConnectedAwait);
			}
		}, 100)
		parentRoot.prepend(li);
		
		return li;
	}
	createNoticeBoard(data = {isEmpty:true}, parentRoot){
		let li = Object.assign(document.createElement('li'), {
			className: 'notice_board_list_content_item type_notice_board',
			innerHTML: `
			<div class="notice_board_list_content_item_title_wrapper">
				<div class="notice_board_list_content_item_title">
					<span class="notice_board_list_content_item_title_name" contentEditable=true>${data.title || ''}</span>
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
			if(titleName.isConnected && data.isEmpty){
				titleName.focus();
				clearInterval(titleNameConnectedAwait);
			}
		}, 100)
		parentRoot.prepend(li);
		
		return li;
	}
    callData(workspaceId, roomId, searchTitle, searchContent, parentGroupId){
        return window.myAPI.noticeBoard.searchNoticeBoard({
            workspaceId, roomId, searchTitle, searchContent, parentGroupId
        }).then((data = {}) => {
			console.log(data);
            return data.data;
        })
	}

    createPage(content = [], searchTitle = '', searchContent = '', parentRoot = this.#elementMap.noticeBoardList){
		return new Promise(resolve => {
			//let {content = []} = data || {};
			if(content.length == 0){
				resolve(content);
				return;
			}
			return Promise.all(
				content.map(item => {
					return this.createItemElement(item, parentRoot)
				})
			).then((liList = [])=>{
				if(liList.length == 0){
                    resolve(liList);
                }
				console.log(this.#memory);
				let list = Object.values(this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][parentRoot.dataset.parent_group_id || 0]);
				parentRoot.replaceChildren(...list);
				if(searchTitle == '' && searchContent == ''){
					console.log(list);
					this.#positionChanger.addPositionChangeEvent(...list);
				}
               resolve(list);
            });
		});
	}

    createItemElement(item, parentRoot){
		return new Promise(resolve=>{
			let li = ! item.groupId ? this.createNoticeBoard(item, parentRoot) : this.createFolder(item, parentRoot);
			this.#addMemory(li, item.id, parentRoot.dataset.parent_group_id);
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

    #addMemory(data, noticeBoardId, parentGroupId = 0){
		if( ! this.#memory.hasOwnProperty(workspaceHandler.workspaceId)){
			this.#memory[workspaceHandler.workspaceId] = {};
		}
		if( ! this.#memory[workspaceHandler.workspaceId].hasOwnProperty(roomHandler.roomId)){
			this.#memory[workspaceHandler.workspaceId][roomHandler.roomId] = {} ;
		}
		if( ! this.#memory[workspaceHandler.workspaceId][roomHandler.roomId].hasOwnProperty(parentGroupId)){
			this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][parentGroupId] = {};
		}
		this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][parentGroupId][noticeBoardId] = data;
    }

    refresh(parentRoot){
		this.reset();
		this.callData(workspaceHandler.workspaceId, roomHandler.roomId, undefined, undefined, parentRoot?.dataset.parent_group_id)
			.then(data => {
				this.createPage(data, undefined, undefined, parentRoot)
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