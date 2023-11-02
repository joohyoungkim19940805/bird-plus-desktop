import workspaceHandler from "../../../handler/workspace/WorkspaceHandler";
import roomHandler from "../../../handler/room/RoomHandler";
import PositionChanger from "../../../handler/PositionChangeer";
import noticeBoardDetail from "./NoticeBoardDetail";
import common from "./../../../common";
import noticeBoardHandler from "./../../../handler/notice_board/NoticeBoardHandler";

export default new class NoticeBoardList{
	#memory = {}

    #element = Object.assign(document.createElement('div'), {
        id: 'notice_board_list_wrapper',
        innerHTML: `
            <div class="notice_board_list_container" data-bind_name="noticeBoardListContainer">
                <div class="notice_board_menu_wrapper">
                    <div class="notice_board_search_wrapper" data-bind_name="noticeBoardMenuSearchWrapper">
						<form id="notice_board_search" data-bind_name="noticeBoardSearch" style="display:none;">
							<div class="search_title_wrapper">
                                <label>search title</label>
                                <input type="search" placeholder="Press Enter Key" class="search_name" name="searchTitle" data-bind_name="searchTitle">
                            </div>
                            <div class="search_content_wrapper">
                                <label>search content</label>
                                <input type="search" placeholder="Press Enter Key" class="search_name" name="searchContent" data-bind_name="searchContent">
                            </div>
							<button type="submit" hidden></button>
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

    #positionChanger;

    constructor(){
        this.#positionChanger = new PositionChanger({wrapper: this.#elementMap.noticeBoardList});
		//let prevWrapper;
		this.#positionChanger.onDropEndChangePositionCallback = (changeList, {item, target, wrapper}) => {
			//prevWrapper = wrapper;
			let parentRoot = item.__parentRoot;
			if(parentRoot && target.dataset.parent_group_id != parentRoot.dataset.parent_group_id || 0){
				target.dataset.parent_group_id = parentRoot.dataset.parent_group_id
				if(! parentRoot.dataset.parent_group_id){

				}
				//if(prevWrapper){
					//prevWrapper.querySelector(`[data-id="${targetData.id}"]`)?.remove();
				//}
				
				this.#positionChanger.addPositionChangeEvent(changeList, parentRoot)
			}
			window.myAPI.noticeBoard.updateNoticeBoardOrder(changeList.map(e=>{
				let obj = {
					id: e.dataset.id,
					groupId: e.dataset.group_id,
					workspaceId: e.dataset.workspace_id,
					roomId: e.dataset.room_id, 
					orderSort: e.dataset.order_sort,
					parentGroupId: e.dataset.parent_group_id,
				}
				if(! parentRoot.dataset.parent_group_id){
					delete obj.parentGroupId
				}
				return obj;
			})).then(data=>{
				console.log(data);
			})
		}
		this.#positionChanger.onIfCancelCallBack = (target, item) => {
			if(! item.dataset.parent_group_id && ! target.dataset.group_id){
				return true
			}
			return false;
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
			this.createNoticeBoardGroup(undefined, this.#elementMap.noticeBoardList);
		}

		window.myAPI.event.electronEventTrigger.addElectronEventListener('noticeBoardAccept', (data) => {
			let {content = data} = data;
			let parentRoot = content.parentGroupId == null ? this.#elementMap.noticeBoardList : this.#element.querySelector(`ul[data-parent_group_id="${content.parentGroupId}"]`)
			this.createItemElement(
				content, 
				parentRoot
			).then(li => {
				let id = content.groupId || content.id;
				let bindName = ! content.groupId ? 'id' : 'group_id'
				this.#elementMap.noticeBoardList.querySelectorAll(`[data-${bindName}="${id}"]`).forEach((e,i)=>{
					if(e == li) {
						return
					}
					e.remove();
				});
				let list = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId] || {}).filter(e=>(e.dataset.parent_group_id || 0) == (parentRoot.dataset.parent_group_id || 0))
					.sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));
				this.#positionChanger.addPositionChangeEvent(list, parentRoot)
				parentRoot.replaceChildren(...list);
			})

		});
		window.myAPI.event.electronEventTrigger.addElectronEventListener('noticeBoardDeleteAccept', (data) => {
			let {content} = data;
			let id = content.groupId || content.id;
			if(! id) return;

			delete this.#memory[workspaceHandler.workspaceId][roomHandler.roomId]?.[id]
			
			let parentRoot = content.parentGroupId == null ? this.#elementMap.noticeBoardList : this.#element.querySelector(`ul[data-parent_group_id="${content.parentGroupId}"]`)
			
			let list = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId] || {}).filter(e=>(e.dataset.parent_group_id || 0) == (parentRoot.dataset.parent_group_id || 0))
				.sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));
			this.#positionChanger.addPositionChangeEvent(list, parentRoot)
			parentRoot.replaceChildren(...list);
		})
        window.addEventListener('resize', (event) => {
			let activeTitleName = this.#elementMap.noticeBoardList.querySelector('.notice_board_list_content_item_title_name.pointer.active');
            if(activeTitleName){
				activeTitleName.scrollIntoView({ behavior: 'instant', block: "end", inline: "nearest" });
			}
		})
    }
	createFolder(){
		
	}
	createNoticeBoardGroup(data = {isEmpty:true}, parentRoot){
		let li = Object.assign(document.createElement('li'), {
			className: `notice_board_list_content_item`,
			innerHTML : `
			<div class="notice_board_list_content_item_title_wrapper">
				<button class="marker pointer" data-is_open=${Boolean(data.isEmpty)}></button>
				<div class="notice_board_list_content_item_title">
					<b class="notice_board_list_content_item_title_name ${data.isEmpty ? '' : 'pointer'}" ${data.isEmpty ? '' : `data-prev_title-name="${data.title}"`} contentEditable=${Boolean(data.isEmpty)}>${data.title || ''}</b>
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
		li.__parentRoot = parentRoot;
		let [marker, titleName, buttonWrapper, addButton, folderAddButton, childRoot] = li.querySelectorAll('.marker, .notice_board_list_content_item_title_name, .notice_board_list_content_button_wrapper, .css-gg-add, .css-gg-folder-add, .notice_board_list_content');
		childRoot.__component = {
			marker, titleName, buttonWrapper, addButton, folderAddButton, childRoot, li
		};
		let markerObserve = new MutationObserver((mutationList, observer) => {
			mutationList.forEach((mutation) => {
				let isOpen = JSON.parse(marker.dataset.is_open);
				if(isOpen && marker.dataset.is_open == mutation.oldValue){
					childRoot.style.height = '';
					childRoot.style.overflow = '';	
					return
				}
				else if(! isOpen){
					childRoot.style.height = childRoot.scrollHeight + 'px';
					childRoot.dataset.prev_height = childRoot.style.height;
					setTimeout(()=>{
						childRoot.style.height = '0px';
						childRoot.style.overflow = 'hidden';
					}, 0);
				}else{
					childRoot.style.height = childRoot.dataset.prev_height;
					childRoot.ontransitionend = () => {
						childRoot.style.height = '';
						childRoot.style.overflow = '';
					}
					if(childRoot.childElementCount == 0){
						childRoot.style.height = '';
						childRoot.style.overflow = '';	
					}
				}
			})
		})
		let deleteButton  = Object.assign(document.createElement('button'),{
			className: 'css-gg-remove pointer',
			onclick: (event) => {
				window.myAPI.noticeBoard.deleteNoticeBoardGroup({
					roomId: roomHandler.roomId,
					workspaceId: workspaceHandler.workspaceId,
					groupId: li.dataset.group_id,
					parentGroupId: li.dataset.parent_group_id,
				})
				li.remove();
				markerObserve.disconnect();
			}
		});
		let updateButton = Object.assign(document.createElement('button'), {
			innerHTML: `<i class="css-gg-pen">`,
			className: 'icon_button pointer',
			onclick : (event) => {
				titleName.contentEditable = true;
				updateButton.remove();
				titleName.focus();
				window.getSelection().setPosition(titleName, titleName.childNodes.length);
				titleName.classList.remove('pointer');
			}
		});
		li.childElementMap = {
			marker, titleName, buttonWrapper,
			addButton, folderAddButton, childRoot, deleteButton, updateButton
		}
		common.jsonToSaveElementDataset(data, li).then(() => {
			childRoot.dataset.parent_group_id = li.dataset.group_id;
		})

		addButton.onclick = () => {
			this.refresh(childRoot);
			marker.dataset.is_open = true;
			this.createNoticeBoard(undefined, childRoot);
			childRoot.style.height = '';
			childRoot.style.overflow = '';	
		}
		folderAddButton.onclick = () => this.createNoticeBoardGroup(undefined, childRoot);
		
		markerObserve.observe(marker, {
			attributeFilter:['data-is_open'],
			attributeOldValue:true
		});
		marker.onclick = () => {
			childRoot.ontransitionend = '';
			marker.dataset.is_open = ! JSON.parse(marker.dataset.is_open)
			new Promise(resolve=>{
				this.refresh(childRoot);
				resolve();
			})
		}
		titleName.onclick = (event) => {
			if(document.activeElement == titleName){
				return;
			}
			marker.click();
		}
		titleName.onblur = (event) => {
			if(titleName.textContent != '' && ! deleteButton.hasAttribute('data-is_mouseover')){
				deleteButton.remove();
				titleName.contentEditable = false;
				titleName.classList.add('pointer');
				if( ! titleName.dataset.prev_titleName || titleName.dataset.prev_titleName != titleName.textContent){
					window.myAPI.noticeBoard.createNoticeBoardGroup({
						roomId: roomHandler.roomId,
						workspaceId: workspaceHandler.workspaceId,
						title: titleName.textContent,
						groupId: li.dataset.group_id,
						parentGroupId: parentRoot.dataset.parent_group_id
					}).then( result => {
						console.log(result);
						childRoot.dataset.parent_group_id = li.dataset.group_id;
						common.jsonToSaveElementDataset(result.data, li);
					})
				}
				titleName.dataset.prev_titleName = titleName.textContent
			}else if(titleName.textContent == '' && data.isEmpty){
				li.remove();
			}
		}
		this.#addItemEvent(li, parentRoot);
		return li;
	}
	createNoticeBoard(data = {isEmpty:true}, parentRoot){
		let isNoticeBoardActive = ! Boolean(data.isEmpty) && 
			this.#memory[workspaceHandler.workspaceId][roomHandler.roomId]?.
				[data.id]?.
				querySelector('notice_board_list_content_item_title_name')?.
				classList.contains('active');

		let li = Object.assign(document.createElement('li'), {
			className: 'notice_board_list_content_item type_notice_board',
			innerHTML: `
			<div class="notice_board_list_content_item_title_wrapper">
				<div class="notice_board_list_content_item_title">
					<span class="notice_board_list_content_item_title_name pointer ${isNoticeBoardActive ? 'active' : ''}" ${data.isEmpty ? '' : `data-prev_title-name="${data.title}"`} contentEditable=${Boolean(data.isEmpty)}>${data.title || ''}</span>
				</div>
				<div class="notice_board_list_content_button_wrapper">
				</div>
			</div>
			`
		});
		li.__parentRoot = parentRoot;
		let [titleName, buttonWrapper] = li.querySelectorAll('.notice_board_list_content_item_title_name, .notice_board_list_content_button_wrapper');
		let deleteButton  = Object.assign(document.createElement('button'),{
			className: 'css-gg-remove pointer',
			onclick: (event) => {
				window.myAPI.noticeBoard.deleteNoticeBoard({
					roomId: roomHandler.roomId,
					workspaceId: workspaceHandler.workspaceId,
					id: li.dataset.id,
					parentGroupId: li.dataset.parent_group_id,
				})
				li.remove();
				if(parentRoot.childElementCount == 0){
					parentRoot.__component.marker.dataset.is_open = false
				}
			}
		});
		let updateButton = Object.assign(document.createElement('button'), {
			innerHTML: `<i class="css-gg-pen"></i>`,
			className: 'icon_button pointer',
			onclick : (event) => {
				titleName.contentEditable = true;
				updateButton.remove();
				titleName.focus();
				titleName.classList.remove('pointer');
				window.getSelection().setPosition(titleName, titleName.childNodes.length);
			}
		})
		li.childElementMap = {
			titleName, buttonWrapper, deleteButton, updateButton
		};
		common.jsonToSaveElementDataset(data, li);

		let flexLayout = this.#element.closest('flex-layout');
		titleName.onclick = (event) => {
			if(document.activeElement == titleName){
				return;
			}else if(titleName.classList.contains('active')){
				flexLayout.closeFlex(noticeBoardDetail.element)
			}
			noticeBoardDetail.element.dataset.prev_grow = 1.5;
			noticeBoardDetail.element._openEndCallBack = () => {
				titleName.classList.add('active');
				//titleName.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
				titleName.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
			}
			noticeBoardDetail.element._closeEndCallBack = () => {
				noticeBoardDetail.element.dataset.prev_grow = 1.5;
				if( ! titleName.classList.contains('active') && this.prevOpenFlexTarget != titleName){
					flexLayout.openFlex(noticeBoardDetail.element, {isPrevSizeOpen: true}).then(()=>{
						noticeBoardHandler.noticeBoardId = data.id;
						this.prevOpenFlexTarget = titleName;
					})
				}else{
					titleName.classList.remove('active');
				}
			}

			if(flexLayout.isVisible(noticeBoardDetail.element)){
				noticeBoardHandler.noticeBoardId = data.id;
				this.prevOpenFlexTarget = titleName;
				titleName.classList.add('active');
				titleName.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
				//flexLayout.closeFlex(noticeBoardDetail.element).then(() => {
				//})
			}else{
				flexLayout.openFlex(noticeBoardDetail.element, {isPrevSizeOpen: true}).then(() => {
					this.prevOpenFlexTarget = titleName;
					noticeBoardHandler.noticeBoardId = data.id;
					//titleName.classList.add('active');
				})
			}
			this.#elementMap.noticeBoardList.querySelectorAll('.notice_board_list_content_item_title_name').forEach( async e=> {
				if(e == titleName)return;
				e.classList.remove('active');
			})
		}
		titleName.onblur = (event) => {
			if(titleName.textContent != '' && ! deleteButton.hasAttribute('data-is_mouseover')){
				deleteButton.remove();
				titleName.contentEditable = false;
				titleName.classList.add('pointer');
				if( ! titleName.dataset.prev_titleName || titleName.dataset.prev_titleName != titleName.textContent){
					window.myAPI.noticeBoard.createNoticeBoard({
						roomId: roomHandler.roomId,
						workspaceId: workspaceHandler.workspaceId,
						title: titleName.textContent,
						id: li.dataset.id,
						parentGroupId: parentRoot.dataset.parent_group_id
					}).then( result => {
						common.jsonToSaveElementDataset(result.data, li);
					})
				}
				titleName.dataset.prev_titleName = titleName.textContent
			}else if(titleName.textContent == '' && data.isEmpty){
				li.remove();
				if(parentRoot.childElementCount == 0){
					parentRoot.__component.marker.dataset.is_open = false
				}
			}
		}

		this.#addItemEvent(li, parentRoot);
		return li;
	}

    callData(workspaceId, roomId, searchTitle, searchContent, parentGroupId){
		return window.myAPI.noticeBoard.searchNoticeBoardList({
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
				content.map(async item => {
					return this.createItemElement(item, parentRoot)
				})
			).then((liList = [])=>{
				if(liList.length == 0){
                    resolve(liList);
                }
				//console.log(this.#memory);
				/*if(searchTitle == '' && searchContent == ''){
					this.#positionChanger.addPositionChangeEvent(liList);
				}*/
               resolve(liList);
            });
		});
	}

    createItemElement(item, parentRoot){
		return new Promise(resolve=>{
			let li = ! item.groupId ? this.createNoticeBoard(item, parentRoot) : this.createNoticeBoardGroup(item, parentRoot);
			this.#addMemory(li, item.groupId || item.id, parentRoot.dataset.parent_group_id);
			resolve(li);
		})
	}

    #addItemEvent(li, parentRoot){
		return new Promise(resolve => {
			let {titleName, buttonWrapper, deleteButton, updateButton} = li.childElementMap;

			if(Boolean(li.dataset.is_empty)){
				buttonWrapper.prepend(deleteButton);
			}
			deleteButton.onmouseover = (event) => {
				deleteButton.dataset.is_mouseover = '';
			}
			deleteButton.onmouseout = (event) => {
				deleteButton.removeAttribute('data-is_mouseover');
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
				if(titleName.isConnected && Boolean(li.dataset.is_empty)){
					titleName.focus();
					clearInterval(titleNameConnectedAwait);
				}
			}, 100);

			[titleName, buttonWrapper].forEach(e=> e.onmouseenter = (event) => {
				if(Boolean(li.dataset.is_empty) || document.activeElement == titleName){
					return;
				}
				buttonWrapper.prepend(updateButton);
			});
			[titleName, buttonWrapper].forEach(e=> e.onmouseleave = (event) => {
				if(Boolean(li.dataset.is_empty)){
					return;
				}
				updateButton.remove();
			});

			parentRoot.prepend(li);
			resolve(li);
		});
	}

    #addMemory(data, noticeBoardId){
		if( ! this.#memory.hasOwnProperty(workspaceHandler.workspaceId)){
			this.#memory[workspaceHandler.workspaceId] = {};
		}
		if( ! this.#memory[workspaceHandler.workspaceId].hasOwnProperty(roomHandler.roomId)){
			this.#memory[workspaceHandler.workspaceId][roomHandler.roomId] = {} ;
		}
		/*
		if( ! this.#memory[workspaceHandler.workspaceId][roomHandler.roomId].hasOwnProperty(parentGroupId)){
			this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][parentGroupId] = {};
		}
		this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][parentGroupId][noticeBoardId] = data;
		*/
		this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][noticeBoardId] = data;
    }

    refresh(parentRoot = this.#elementMap.noticeBoardList){
		parentRoot.replaceChildren();
		//let promise;
		let memory = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId] || {}).filter(e=>(e.dataset.parent_group_id || 0) == (parentRoot.dataset.parent_group_id || 0));
		let isSearchEmpty = this.#elementMap.searchTitle.value == '' && this.#elementMap.searchContent.value == '';
		
		if(isSearchEmpty && memory && memory.length != 0){
			//promise = Promise.resolve(memory);
			parentRoot.replaceChildren(
				...memory.sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort))
				);
		}else{
			this.callData(
				workspaceHandler.workspaceId,
				roomHandler.roomId, 
				this.#elementMap.searchTitle.value, 
				this.#elementMap.searchContent.value, 
				parentRoot?.dataset.parent_group_id
			)

		}
	}

	get element(){
		return this.#element;
	}
	
	get elementMap(){
		return this.#elementMap;
	}
}