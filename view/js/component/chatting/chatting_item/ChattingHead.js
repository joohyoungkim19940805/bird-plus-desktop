import {roomHandler} from "@handler/room/RoomHandler"
import {workspaceHandler} from "@handler/workspace/WorkspaceHandler"
import {roomFavoritesList} from "@component/room/room_item/RoomFavoritesList";
import AccountInviteRoomView from "./AccountInviteRoomView";

import {roomContainer} from "@component/room/RoomContainer";
import {noticeBoardContainer} from "@component/notice_board/NoticeBoardContainer";
import common from "@root/js/common"

import { accountHandler } from "@handler/account/AccountHandler"

export const chattingHead = new class ChattingHead{
    #chattingHeadMemory = {};
    //electron datalist 위치 문제 -> electrom 23버전으로 업그레이드
    #element = Object.assign(document.createElement('div'), {
        id: 'chatting_head_wrapper',
        innerHTML: `
        <div class="chatting_head_container" data-bind_name="chattingHeadContainer">
            <div class="chatting_head_info_wrapper list_scroll list_scroll-x" data-bind_name="chattingHeadInfoWrapper">
                <div class="chatting_head_info_container">
                    <h3 class="chatting_head_title" data-bind_name="chattingHeadTitle"></h3>
                    <span class="chatting_head_joined_count" data-bind_name="chattingHeadJounedCount"></span>
                </div>
                <div class="chatting_head_button_container">
                    <div class="chatting_head_info_search_container">
                        <input type="search" placeholder="search members" list="chatting_head_member_list" class="chatting_head_search_members" data-bind_name="searchMembers"/>
                        <datalist id="chatting_head_member_list" class="chatting_head_search_member_list" data-bind_name="searchMemberList">
                        </datalist>
                    </div>
                    <button type="button" class="favorites_add_button" data-bind_name="favoritesAddButton">☆</button>
                    <button type="button" class="member_add_button" data-bind_name="memberAddButton">+</button>
                </div>
            </div>
            <div class="chatting_head_menu_wrapper">
                <button type="button" class="css-gg-list" data-bind_name="noticeBoardIconButton" title="notice board">
                    <svg style="zoom:135%" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M20 4H4C3.44771 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V5C21 4.44771 20.5523 4 20 4ZM4 2C2.34315 2 1 3.34315 1 5V19C1 20.6569 2.34315 22 4 22H20C21.6569 22 23 20.6569 23 19V5C23 3.34315 21.6569 2 20 2H4ZM6 7H8V9H6V7ZM11 7C10.4477 7 10 7.44772 10 8C10 8.55228 10.4477 9 11 9H17C17.5523 9 18 8.55228 18 8C18 7.44772 17.5523 7 17 7H11ZM8 11H6V13H8V11ZM10 12C10 11.4477 10.4477 11 11 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H11C10.4477 13 10 12.5523 10 12ZM8 15H6V17H8V15ZM10 16C10 15.4477 10.4477 15 11 15H17C17.5523 15 18 15.4477 18 16C18 16.5523 17.5523 17 17 17H11C10.4477 17 10 16.5523 10 16Z"
                        fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <ul class="chatting_head_joined_members list_scroll list_scroll-x" data-bind_name="chattingHeadJoinedMembers">

            </ul>
        </div>
        `
    });

    #elementMap = (()=>{
		return 	[...this.#element.querySelectorAll('[data-bind_name]')].reduce((total, element) => {
			total[element.dataset.bind_name] = element;
			return total;
		}, {})
	})();

    #roomId

    #accountInviteRoomView

    constructor(){
		
        this.#accountInviteRoomView = new AccountInviteRoomView(this, roomHandler.roomId);
		this.#accountInviteRoomView.onOpenCloseCallback = (status) => {
			this.#accountInviteRoomView.reset();
			if(status == 'open'){
                this.#accountInviteRoomView.roomId = roomHandler.roomId;
				this.#accountInviteRoomView.callData(this.#accountInviteRoomView.page, this.#accountInviteRoomView.size, workspaceHandler.workspaceId, roomHandler.roomId, this.#accountInviteRoomView.form.fullName.value)
				.then(data => {
                    console.log(data);
					this.#accountInviteRoomView.createPage(data).then(liList => {
						this.#accountInviteRoomView.addListItemVisibleEvent(liList);
					})
				})
			}
		}
        [this.#elementMap.chattingHeadJoinedMembers, this.#elementMap.chattingHeadInfoWrapper].forEach(scrollTarget=>{
            document.addEventListener('keydown',(event)=>{
                if(scrollTarget.hasAttribute('data-is_shft')){
                    return;
                }
                let {key} = event;
                if(key === 'Shift'){
                    scrollTarget.dataset.is_shft = '';
                }
            })

            document.addEventListener('keyup', (event)=>{
                if( ! scrollTarget.hasAttribute('data-is_shft')){
                    return;
                }    
                let {key} = event;
                if(key === 'Shift'){
                    scrollTarget.removeAttribute('data-is_shft');
                }
            })
            
            scrollTarget.addEventListener('wheel', (event) => {
                if(scrollTarget.hasAttribute('data-is_shft')){
                    return;
                }
                //event.preventDefault();
                let {deltaY} = event;
                
                scrollTarget.scrollTo(
                    scrollTarget.scrollLeft + deltaY, undefined
                );
                /*
                this.#elementMap.chattingHeadJoinedMembers.scrollTo(
                {
                    left: this.#elementMap.chattingHeadJoinedMembers.scrollLeft + deltaY,
                    behavior: 'smooth'
                });
                */
            }, {passive: true})
        })


        window.myAPI.event.electronEventTrigger.addElectronEventListener('roomInAccountAccept', event => {
            let {content = event} = event;

            this.#addMemory(this.createLiElement(content), content.workspaceId, content.roomId, content.accountName);
            if(content.roomId == roomHandler.roomId){

                let memberList = Object.values(this.#chattingHeadMemory[content.workspaceId]?.[content.roomId] || {})
                    .sort((a,b)=> a.dataset.full_name.localeCompare(b.dataset.full_name));

                new Promise(res => {
                    let optionList = memberList.map(li => {
                        let option = Object.assign(document.createElement('option'), {
                            value : li.dataset.full_name,
                            textContent: li.dataset.department
                        })
                        option.__target_member = li;
                        return option;
                    })
                    this.#elementMap.searchMemberList.replaceChildren(...optionList);
                    res();
                })
                if(roomHandler.room.roomType == 'MESSENGER'){
                    this.#elementMap.chattingHeadTitle.textContent = memberList.map(e=>e.dataset.full_name).join(', ')
                }
                this.#elementMap.chattingHeadJoinedMembers.replaceChildren(...memberList);
                
                this.#elementMap.chattingHeadJounedCount.textContent = 
                    `(${memberList.length} members)`
            }
        })

        const memberAddButton = this.#elementMap.memberAddButton;
        roomHandler.addRoomIdChangeListener = {
			name: 'chattingHead',
			callBack: (handler) => {
                this.#roomId = handler.roomId;
                if(handler.room.roomType == 'MESSENGER'){
                    let roomNameList = handler.room.roomName.split(',');
                    let targetIndex = roomNameList.findIndex(e=> e == accountHandler.accountInfo.fullName);
                    if(targetIndex != -1){
                        roomNameList.splice(roomNameList.findIndex(e=> e == accountHandler.accountInfo.fullName), 1);
                    }
                    this.#elementMap.chattingHeadTitle.textContent = roomNameList.sort((a,b)=> a.localeCompare(b)).join(', ');
                }else{
                    this.#elementMap.chattingHeadTitle.textContent = handler.room.roomName;
                }
                this.#elementMap.chattingHeadJoinedMembers.replaceChildren();
                window.myAPI.room.searchRoomJoinedAccountList({roomId: handler.roomId}).then(result=>{
                    console.log(result);
                });

                window.myAPI.room.isRoomFavorites({roomId : handler.roomId}).then(result => {
                    if(result.data === true){
                        this.#elementMap.favoritesAddButton.classList.add('apply')
                        this.#elementMap.favoritesAddButton.textContent = '★'
                    }else{
                        this.#elementMap.favoritesAddButton.classList.remove('apply')
                        this.#elementMap.favoritesAddButton.textContent = '☆'
                    }
                })

                if(handler.room.roomType == 'SELF'){
                    memberAddButton.remove();
                }else{
                    this.#elementMap.favoritesAddButton.after(memberAddButton);
                }
			},
			runTheFirst: false
		}

        this.#elementMap.searchMembers.oninput = () => {
            let searchText = this.#elementMap.searchMembers.value;
            if(searchText.value == ''){
                this.#elementMap.chattingHeadJoinedMembers.replaceChildren(...Object.values(this.#chattingHeadMemory[workspaceHandler.workspaceId][this.#roomId]));  
            }
            this.#elementMap.chattingHeadJoinedMembers.replaceChildren(
                ...[...this.#elementMap.searchMembers.list.options].map(option => {
                    if(option.value.includes(searchText) || option.textContent.includes(searchText)){
                        option.__target_member.style.visibility = ''
                        option.__target_member.style.opacity = '';
                        return option.__target_member;
                    }
                    return undefined;
                }).filter(e=>e)
            );
            
        }

        this.#elementMap.favoritesAddButton.onclick = () => {
            window.myAPI.room.createRoomFavorites({
                roomId: this.#roomId,
                workspaceId: workspaceHandler.workspaceId
            }).then((result)=>{
                if(! result || result == ''){
                    this.#elementMap.favoritesAddButton.classList.remove('apply')
                    this.#elementMap.favoritesAddButton.textContent = '☆'
                    delete roomFavoritesList.memory[workspaceHandler.workspaceId];
                }else if(result.code == 0){
                    this.#elementMap.favoritesAddButton.classList.add('apply')
                    this.#elementMap.favoritesAddButton.textContent = '★'
                    delete roomFavoritesList.memory[workspaceHandler.workspaceId];
                }
                roomFavoritesList.refresh();
                
                //workspaceHandler.workspaceId = workspaceHandler.workspaceId;
            })
        }
        this.#elementMap.memberAddButton.onclick = () => {
            this.#accountInviteRoomView.open();
        }
  
        let isFirstOpen = false;
        this.#elementMap.noticeBoardIconButton.onclick = () => {
            let flexLayout = noticeBoardContainer.wrap.closest('flex-layout');
            if(this.#elementMap.noticeBoardIconButton.hasAttribute('data-is_close')){
                this.#elementMap.noticeBoardIconButton.removeAttribute('data-is_close');
                flexLayout.closeFlex(noticeBoardContainer.wrap).then(()=>{
                    //noticeBoardContainer.wrap.dataset.is_resize = false;
                    flexLayout.openFlex(roomContainer.wrap, {isPrevSizeOpen: true}).then(()=>{
                    
                    });
                })
            }else{
                this.#elementMap.noticeBoardIconButton.setAttribute('data-is_close', '');
                flexLayout.closeFlex(roomContainer.wrap).then(()=>{
                    flexLayout.openFlex(noticeBoardContainer.wrap, {isPrevSizeOpen: true, isResize: ! isFirstOpen}).then(() => {
                        isFirstOpen = true;
                    });
                    roomContainer.wrap.dataset.is_resize = false;
                });
               
            }   
        }
        
    }

    #addMemory(data, workspaceId, roomId, accountName){
		if( ! this.#chattingHeadMemory.hasOwnProperty(workspaceId)){
			this.#chattingHeadMemory[workspaceId] = {};
		}
        if( ! this.#chattingHeadMemory[workspaceId].hasOwnProperty(roomId)){
            this.#chattingHeadMemory[workspaceId][roomId] = {};
        }
        this.#chattingHeadMemory[workspaceId][roomId][accountName] = data
    }

    createLiElement(obj){

        let li = Object.assign(document.createElement('li'), {
            className: 'pointer',
            innerHTML: `
                <span>${obj.fullName}</span>
            `
        });
        common.jsonToSaveElementDataset(obj, li);
        return li
    }

    set roomId(roomId){
        if( ! roomId){
            console.error('roomId is undefined');
            return;
        }
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
