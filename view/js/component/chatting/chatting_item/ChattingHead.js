import chattingHandler from "./../../../handler/chatting/ChattingHandler"

export default new class ChattingHead{
    members = {};
    #element = Object.assign(document.createElement('div'), {
        id: 'chatting_head_wrapper',
        innerHTML: `
        <div class="chatting_head_container" data-bind_name="chattingHeadContainer">
            <div class="chatting_head_info_wrapper">
                <div class="chatting_head_info_container">
                    <h3 class="chatting_head_title" data-bind_name="chattingHeadTitle"></h3>
                    <span class="chatting_head_joined_count" data-bind_name="chattingHeadJounedCount"></span>
                </div>
                <div class="chatting_head_button_container">
                    <div class="chatting_head_info_search_container">
                        <input type="search" placeholder="search members" list="chatting_head_search_member_list" id="chatting_head_search_members" class="chatting_head_search_members" data-bind_name="searchMembers"/>
                        <datalist id="chatting_head_search_member_list" class="chatting_head_search_member_list" data-bind_name="searchMemberList">
                            <option value="abc">test</option>
                            <option value="greh">test</option>
                            <option value="etrtabc">test</option>
                        </datalist>
                    </div>
                    <button type="button" class="favorites_add_button pointer" data-bind_name="favoritesAddButton">☆</button>
                    <button type="button" class="member_add_button pointer" data-bind_name="memberAddButton">+</button>
                </div>
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

    constructor(){
        /*
        ul.scrollWidth - ul.offsetWidth
        chattingHeadJoinedMembers
        ul.onwheel = (event)=>console.log(event)
        */
        document.addEventListener('keydown',(event)=>{
            if(this.#elementMap.chattingHeadJoinedMembers.hasAttribute('data-is_shft')){
                return;
            }
            let {key} = event;
            if(key === 'Shift'){
                this.#elementMap.chattingHeadJoinedMembers.dataset.is_shft = '';
            }
        })

        document.addEventListener('keyup', (event)=>{
            if( ! this.#elementMap.chattingHeadJoinedMembers.hasAttribute('data-is_shft')){
                return;
            }    
            let {key} = event;
            if(key === 'Shift'){
                this.#elementMap.chattingHeadJoinedMembers.removeAttribute('data-is_shft');
            }
        })
        
        this.#elementMap.chattingHeadJoinedMembers.onwheel = (event) => {
            if(this.#elementMap.chattingHeadJoinedMembers.hasAttribute('data-is_shft')){
                return;
            }
            let {deltaY} = event;

            
            this.#elementMap.chattingHeadJoinedMembers.scrollTo(
                this.#elementMap.chattingHeadJoinedMembers.scrollLeft + deltaY, undefined
            );
            /*
            this.#elementMap.chattingHeadJoinedMembers.scrollTo(
            {
                left: this.#elementMap.chattingHeadJoinedMembers.scrollLeft + deltaY,
                behavior: 'smooth'
            });
            */
        }

        window.myAPI.event.electronEventTrigger.addElectronEventListener('roomInAccountCallBack', event => {
            if( ! this.members.hasOwnProperty(event.roomId)){
                this.members[event.roomId] = {};
            }
            if(this.members[event.roomId].hasOwnProperty(event.accountName)){
                return;
            }

            this.members[event.roomId][event.accountName] = this.createLiElement(event);

            if(event.roomId == this.#roomId){
                this.#elementMap.chattingHeadJoinedMembers.replaceChildren(...Object.values(this.members[event.roomId]));
            }
        })

        let memeberAddObserver = new MutationObserver( (mutationList, observer) => {
			mutationList.forEach((mutation) => {
                if(this.#elementMap.chattingHeadJoinedMembers.childElementCount == 0){
                    this.#elementMap.chattingHeadJounedCount.textContent = '';
                    return;
                }
                this.#elementMap.chattingHeadJounedCount.textContent = 
                    `(${this.#elementMap.chattingHeadJoinedMembers.childElementCount} members)`
            })
        } );
        memeberAddObserver.observe(this.#elementMap.chattingHeadJoinedMembers, {
			childList: true,
            subtree: false
        })

        chattingHandler.addRoomIdChangeListener = {
			name: 'chattingHead',
			callBack: (handler) => {
                if(this.#roomId != handler.roomId){
                    this.#elementMap.chattingHeadJoinedMembers.replaceChildren();
                    if(this.members[handler.roomId]){
                        Object.keys(this.members[handler.roomId]).forEach(k=>delete this.members[handler.roomId][k])
                    }
                }else{
                    this.#elementMap.chattingHeadJoinedMembers.replaceChildren(...Object.values(this.members[handler.roomId]));
                }

                this.#roomId = handler.roomId;
                this.#elementMap.chattingHeadTitle.textContent = handler.room.roomName;
                window.myAPI.room.searchRoomInAccountAllList({roomId: handler.roomId}).then(e=>{
                    console.log(e);
                })
			},
			runTheFirst: false
		}

        this.#elementMap.favoritesAddButton.onclick = () => {
            
        }
    }

    createLiElement(obj){
        let {
            roomId, accountName, fullName, jobGrade,
            department, createMils, updateMils
        } = obj;
        let li = Object.assign(document.createElement('li'), {
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
        if( ! this.members.hasOwnProperty(roomId)){
            this.members[roomId] = {};
        }
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
