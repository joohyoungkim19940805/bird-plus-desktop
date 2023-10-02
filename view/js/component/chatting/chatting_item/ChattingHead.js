import roomHandler from "./../../../handler/room/RoomHandler"
import workspaceHandler from "./../../../handler/workspace/WorkspaceHandler"
import roomFavoritesList from "../../room/room_item/RoomFavoritesList";
import AccountInviteRoomView from "./AccountInviteRoomView";

export default new class ChattingHead{
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
                    <button type="button" class="favorites_add_button pointer" data-bind_name="favoritesAddButton">☆</button>
                    <button type="button" class="member_add_button pointer" data-bind_name="memberAddButton">+</button>
                </div>
            </div>
            <div class="chatting_head_menu_wrapper">
                <button type="button" class="pointer css-gg-list" data-bind_name="noticeBoardIconButton"></button>
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
		
        this.#accountInviteRoomView = new AccountInviteRoomView(this);
		this.#accountInviteRoomView.onOpenCloseCallBack = (status) => {
			this.#accountInviteRoomView.reset();
			if(status == 'open'){
				this.#accountInviteRoomView.callData(this.#accountInviteRoomView.page, this.#accountInviteRoomView.size, workspaceHandler.workspaceId, this.#accountInviteRoomView.form.fullName.value)
				.then(data => {
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
            
            scrollTarget.onwheel = (event) => {
                if(scrollTarget.hasAttribute('data-is_shft')){
                    return;
                }
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
            }
        })


        window.myAPI.event.electronEventTrigger.addElectronEventListener('roomInAccountCallBack', event => {

            this.#addChattingHeadMemory(this.createLiElement(event), event.roomId);

            if(event.roomId == this.#roomId){
                let memberList = Object.values(this.#chattingHeadMemory[workspaceHandler.workspaceId][event.roomId]);
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
                this.#elementMap.chattingHeadTitle.textContent = handler.room.roomName;
                if( ! this.#chattingHeadMemory[workspaceHandler.workspaceId]?.hasOwnProperty(handler.roomId)){
                    this.#elementMap.chattingHeadJoinedMembers.replaceChildren();
                    window.myAPI.room.searchRoomInAccountAllList({roomId: handler.roomId}).then(result=>{
                        console.log(result);
                    });
                }else{
                    let memberList = Object.values(this.#chattingHeadMemory[workspaceHandler.workspaceId][handler.roomId])
                    this.#elementMap.chattingHeadJoinedMembers.replaceChildren(...memberList);
                    this.#elementMap.chattingHeadJounedCount.textContent = `(${memberList.length} members)`
                }

                //let favoritesTarget = [...roomFavoritesList.elementMap.roomContentList.children].find(li => li.dataset.room_id == handler.roomId)
                window.myAPI.room.isRoomFavorites({roomId : handler.roomId}).then(result => {
                    if(result.data === true){
                        this.#elementMap.favoritesAddButton.classList.add('apply')
                        this.#elementMap.favoritesAddButton.textContent = '★'
                    }else{
                        this.#elementMap.favoritesAddButton.classList.remove('apply')
                        this.#elementMap.favoritesAddButton.textContent = '☆'
                    }
                })
                /*
                if(favoritesTarget){
                    this.#elementMap.favoritesAddButton.classList.add('apply')
                    this.#elementMap.favoritesAddButton.textContent = '★'
                }else{
                    this.#elementMap.favoritesAddButton.classList.remove('apply')
                    this.#elementMap.favoritesAddButton.textContent = '☆'
                }
                */
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
                    delete roomFavoritesList.roomFavoritesMemory[workspaceHandler.workspaceId];
                }else if(result.code == 0){
                    this.#elementMap.favoritesAddButton.classList.add('apply')
                    this.#elementMap.favoritesAddButton.textContent = '★'
                    delete roomFavoritesList.roomFavoritesMemory[workspaceHandler.workspaceId];
                }
                roomFavoritesList.refresh();
                
                //workspaceHandler.workspaceId = workspaceHandler.workspaceId;
            })
        }
        this.#elementMap.memberAddButton.onclick = () => {
            this.#accountInviteRoomView.open();
        }
    }

    #addChattingHeadMemory(data, roomId){
		if( ! this.#chattingHeadMemory.hasOwnProperty(workspaceHandler.workspaceId)){
			this.#chattingHeadMemory[workspaceHandler.workspaceId] = {};
		}
        if( ! this.#chattingHeadMemory[workspaceHandler.workspaceId].hasOwnProperty(roomId)){
            this.#chattingHeadMemory[workspaceHandler.workspaceId][roomId] = {};
        }
        this.#chattingHeadMemory[workspaceHandler.workspaceId][roomId][data.dataset.account_name] = data
    }

    createLiElement(obj){
        let {
            roomId, accountName, fullName, jobGrade,
            department, createMils, updateMils
        } = obj;
        let li = Object.assign(document.createElement('li'), {
            className: 'pointer',
            innerHTML: `
                <span>${fullName}</span>
            `
        });
        Object.assign(li.dataset,{
            room_id: roomId,
            account_name: accountName,
            full_name: fullName,
            job_grade: jobGrade,
            department,
            create_mils: createMils,
            update_mils: updateMils
        });

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
