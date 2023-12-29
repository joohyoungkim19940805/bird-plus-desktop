import {workspaceHandler} from "@handler/workspace/WorkspaceHandler";
import {roomHandler} from "@handler/room/RoomHandler";
import PositionChanger from "@handler/PositionChangeer";
import {noticeBoardDetail} from "./NoticeBoardDetail";
import common from "@root/js/common";
import {noticeBoardHandler} from "@handler/notice_board/NoticeBoardHandler";

export const noticeBoardList = new class NoticeBoardList{
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
					<button class="css-gg-folder-add" type="button" data-bind_name="rootFolderAdd">
						<svg style="zoom:125%;" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M11 14.5V16.5H13V14.5H15V12.5H13V10.5H11V12.5H9V14.5H11Z"
							fill="currentColor"/>
							<path fill-rule="evenodd" clip-rule="evenodd" d="M4 1.5C2.89543 1.5 2 2.39543 2 3.5V4.5C2 4.55666 2.00236 4.61278 2.00698 4.66825C0.838141 5.07811 0 6.19118 0 7.5V19.5C0 21.1569 1.34315 22.5 3 22.5H21C22.6569 22.5 24 21.1569 24 19.5V7.5C24 5.84315 22.6569 4.5 21 4.5H11.874C11.4299 2.77477 9.86384 1.5 8 1.5H4ZM9.73244 4.5C9.38663 3.9022 8.74028 3.5 8 3.5H4V4.5H9.73244ZM3 6.5C2.44772 6.5 2 6.94772 2 7.5V19.5C2 20.0523 2.44772 20.5 3 20.5H21C21.5523 20.5 22 20.0523 22 19.5V7.5C22 6.94772 21.5523 6.5 21 6.5H3Z"
							fill="currentColor"/>
						</svg>
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
		this.#positionChanger.onIfCancelCallback = (target, item) => {
			if(! item.dataset.parent_group_id && ! target.dataset.group_id){
				return true
			}
			return false;
		}

		this.#positionChanger.onDropDocumentOutCallback = ({target, event}) => {
			if(target.hasAttribute('data-gorup_id') || JSON.parse(target.dataset.group_id) ){
				return;
			}
			window.myAPI.createSubWindow({
				workspaceId: workspaceHandler.workspaceId,
				roomId: target.dataset.room_id,
				noticeBoardId: target.dataset.id,
				width: parseInt(window.outerWidth * 0.7),
				height: parseInt(window.outerHeight * 0.7),
				x: event.x,
				y: event.y,
				pageName: 'multipleNoticeBoard',
				pageId : target.dataset.room_id,
				title : roomHandler.room.roomName + ' - ' + target.dataset.title
			})
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
		}//
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
				let list = Object.values(this.#memory[content.workspaceId]?.[content.roomId] || {}).filter(e=>(e.dataset.parent_group_id || 0) == (parentRoot.dataset.parent_group_id || 0))
					.sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));
				if(list.length != 0){
					this.#positionChanger.addPositionChangeEvent(list, parentRoot)
					parentRoot.replaceChildren(...list);
				}
			})

		});
		window.myAPI.event.electronEventTrigger.addElectronEventListener('noticeBoardDeleteAccept', (data) => {
			let {content} = data;
			let id = content.groupId || content.id;
			if(! id) return;

			delete this.#memory[content.workspaceId][content.roomId]?.[id]
			
			let parentRoot = content.parentGroupId == null ? this.#elementMap.noticeBoardList : this.#element.querySelector(`ul[data-parent_group_id="${content.parentGroupId}"]`)
			
			let list = Object.values(this.#memory[content.workspaceId]?.[content.roomId] || {}).filter(e=>(e.dataset.parent_group_id || 0) == (parentRoot.dataset.parent_group_id || 0))
				.sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));
			this.#positionChanger.addPositionChangeEvent(list, parentRoot)
			parentRoot.replaceChildren(...list);
		})
        window.addEventListener('resize', (event) => {
			let activeTitleName = this.#elementMap.noticeBoardList.querySelector('.notice_board_list_content_item_title_name.active');
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
				<button class="marker" data-is_open=${Boolean(data.isEmpty)}></button>
				<div class="notice_board_list_content_item_title">
					<b class="notice_board_list_content_item_title_name ${data.isEmpty ? '' : 'pointer'}" ${data.isEmpty ? '' : `data-prev_title-name="${data.title}"`} contentEditable=${Boolean(data.isEmpty)}>${data.title || ''}</b>
				</div>
				<div class="notice_board_list_content_button_wrapper">
					<button class="css-gg-add" type="button">
						<svg style="zoom:125%;" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" 
							fill="currentColor"/>
							<path fill-rule="evenodd" clip-rule="evenodd" d="M13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7V11H7C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13H11V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13H17C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11H13V7Z" 
							fill="currentColor"/>
						</svg>
					</button>
					<button class="css-gg-folder-add" type="button">
						<svg style="zoom:125%;" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M11 14.5V16.5H13V14.5H15V12.5H13V10.5H11V12.5H9V14.5H11Z" 
							fill="currentColor" />
							<path fill-rule="evenodd" clip-rule="evenodd" d="M4 1.5C2.89543 1.5 2 2.39543 2 3.5V4.5C2 4.55666 2.00236 4.61278 2.00698 4.66825C0.838141 5.07811 0 6.19118 0 7.5V19.5C0 21.1569 1.34315 22.5 3 22.5H21C22.6569 22.5 24 21.1569 24 19.5V7.5C24 5.84315 22.6569 4.5 21 4.5H11.874C11.4299 2.77477 9.86384 1.5 8 1.5H4ZM9.73244 4.5C9.38663 3.9022 8.74028 3.5 8 3.5H4V4.5H9.73244ZM3 6.5C2.44772 6.5 2 6.94772 2 7.5V19.5C2 20.0523 2.44772 20.5 3 20.5H21C21.5523 20.5 22 20.0523 22 19.5V7.5C22 6.94772 21.5523 6.5 21 6.5H3Z" 
							fill="currentColor"/>
						</svg>
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
			className: 'css-gg-remove',
			innerHTML: `
				<svg style="zoom:125%;" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H8Z"
					fill="currentColor"/>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
					fill="currentColor"/>
				</svg>
			`,
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
			innerHTML: `
				<svg style="zoom:125%;" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M21.2635 2.29289C20.873 1.90237 20.2398 1.90237 19.8493 2.29289L18.9769 3.16525C17.8618 2.63254 16.4857 2.82801 15.5621 3.75165L4.95549 14.3582L10.6123 20.0151L21.2189 9.4085C22.1426 8.48486 22.338 7.1088 21.8053 5.99367L22.6777 5.12132C23.0682 4.7308 23.0682 4.09763 22.6777 3.70711L21.2635 2.29289ZM16.9955 10.8035L10.6123 17.1867L7.78392 14.3582L14.1671 7.9751L16.9955 10.8035ZM18.8138 8.98525L19.8047 7.99429C20.1953 7.60376 20.1953 6.9706 19.8047 6.58007L18.3905 5.16586C18 4.77534 17.3668 4.77534 16.9763 5.16586L15.9853 6.15683L18.8138 8.98525Z"
					fill="currentColor"/>
					<path d="M2 22.9502L4.12171 15.1717L9.77817 20.8289L2 22.9502Z"
					fill="currentColor"/>
				</svg>
			`,
			className: 'css-gg-pen',
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
		let flexLayout = this.#element.closest('flex-layout');
		let isNoticeBoardActive = ! Boolean(data.isEmpty) && data.id == noticeBoardHandler.noticeBoardId && flexLayout.isVisible(noticeBoardDetail.element)
		
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
			className: 'css-gg-remove',
			innerHTML: `
				<svg style="zoom:125%;" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H8Z"
					fill="currentColor"/>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
					fill="currentColor"/>
				</svg>
			`,
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
			innerHTML: `
				<svg style="zoom:125%;" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M21.2635 2.29289C20.873 1.90237 20.2398 1.90237 19.8493 2.29289L18.9769 3.16525C17.8618 2.63254 16.4857 2.82801 15.5621 3.75165L4.95549 14.3582L10.6123 20.0151L21.2189 9.4085C22.1426 8.48486 22.338 7.1088 21.8053 5.99367L22.6777 5.12132C23.0682 4.7308 23.0682 4.09763 22.6777 3.70711L21.2635 2.29289ZM16.9955 10.8035L10.6123 17.1867L7.78392 14.3582L14.1671 7.9751L16.9955 10.8035ZM18.8138 8.98525L19.8047 7.99429C20.1953 7.60376 20.1953 6.9706 19.8047 6.58007L18.3905 5.16586C18 4.77534 17.3668 4.77534 16.9763 5.16586L15.9853 6.15683L18.8138 8.98525Z"
					fill="currentColor"/>
					<path d="M2 22.9502L4.12171 15.1717L9.77817 20.8289L2 22.9502Z"
					fill="currentColor"/>
				</svg>
			`,
			className: 'css-gg-pen',
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

		titleName.onclick = (event) => {
			
			if(document.activeElement == titleName){
				return;
			}else if(titleName.classList.contains('active')){
				flexLayout.closeFlex(noticeBoardDetail.element)
			}
			noticeBoardDetail.element.dataset.prev_grow = 1.5;
			noticeBoardDetail.element._openEndCallback = () => {
				titleName.classList.add('active');
				//titleName.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
				titleName.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
			}
			noticeBoardDetail.element._closeEndCallback = () => {
				noticeBoardDetail.element.dataset.prev_grow = 1.5;
				if( ! titleName.classList.contains('active') && this.prevOpenFlexTarget != titleName){
					flexLayout.openFlex(noticeBoardDetail.element, {isPrevSizeOpen: true}).then(()=>{
						noticeBoardHandler.noticeBoardId = data.id;
						this.prevOpenFlexTarget = titleName;
						document.head.querySelector('title').textContent = roomHandler.room.roomName + ' - ' + titleName.textContent + ' - Grease Lightning Chat';
					})
				}else{
					titleName.classList.remove('active');
					document.head.querySelector('title').textContent = roomHandler.room.roomName + ' - Grease Lightning Chat';
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
					document.head.querySelector('title').textContent = roomHandler.room.roomName + ' - ' + titleName.textContent + ' - Grease Lightning Chat';
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
			this.#addMemory(li, item.workspaceId, item.roomId, item.groupId || item.id, parentRoot.dataset.parent_group_id);
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

    #addMemory(data, workspaceId, roomId, noticeBoardId){
		if( ! this.#memory.hasOwnProperty(workspaceId)){
			this.#memory[workspaceId] = {};
		}
		if( ! this.#memory[workspaceId].hasOwnProperty(roomId)){
			this.#memory[workspaceId][roomId] = {} ;
		}
		/*
		if( ! this.#memory[workspaceHandler.workspaceId][roomHandler.roomId].hasOwnProperty(parentGroupId)){
			this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][parentGroupId] = {};
		}
		this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][parentGroupId][noticeBoardId] = data;
		*/
		this.#memory[workspaceId][roomId][noticeBoardId] = data;
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