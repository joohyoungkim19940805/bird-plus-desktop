export default new class ChattingHead{
    members = {};
    #element = Object.assign(document.createElement('div'), {
        id: 'chatting_head_wrapper',
        innerHTML: `
        <div class="chatting_head_container" data-bind_name="chattingHeadContainer">
            <div class="chatting_head_info">
                <h3 class="chatting_head_title" data-bind_name="chattingHeadTitle">roomName</h3>
                <span class="chatting_head_joined_count" data-bind_name="chattingHeadJounedCount">15members</span>
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
            console.log(event);
            if(this.members.hasOwnProperty(event.accountName)){
                console.log(this.members)
                return;
            }
            console.log(this.members);
            this.members[event.accountName] = event;
            this.#elementMap.chattingHeadJoinedMembers.append(this.createLiElement(event));
            /*
            this.#elementMap.chattingHeadJoinedMembers.replaceChildren(
                Object.values(
                    [...this.#elementMap.chattingHeadJoinedMembers.children].reduce((total, item) => {
                        if(total.hasOwnProperty(item.accountName)){
                            return total;
                        }
                        return total;
                    }, {})
                )
            );
            */
        })
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
