import chattingHandler from "../../../handler/chatting/ChattingHandler"
import EditorHandler from "../../../handler/editor/EditorHandler"

export default new class ChattingInfo{
    
    chattingMemory = {}

    #page = 0;
	#size = 10;

    #element = Object.assign(document.createElement('div'), {
        id: 'chatting_info_wrapper',
        innerHTML: `
            <div class="chatting_info_container" data-bind_name="chattingInfoContainer">
                <ul class="chatting_content_list" data-bind_name="chattingContentList">

                </ul>
            </div>
        `
    })
    
    #elementMap = (()=>{
        return [...this.#element.querySelectorAll('[data-bind_name]')].reduce((total, element) => {
            total[element.dataset.bind_name] = element;
            return total;
        }, {})
    })();

    #roomId

    constructor(){
        chattingHandler.addChattingEventListener = {
            name: 'chattingInfo',
            callBack: (chattingData) => {
                let wrap = Object.assign(document.createElement('li'), {
		
                });
                let content = new EditorHandler({isReadOnly : true});
                content.contentEditable = false;
                content.parseLowDoseJSON(chattingData.chatting);
                wrap.append(content);
                this.#elementMap.chattingInfoContainer.append(wrap);
            }
        }
    }

    callData(page, size, workspaceId, chatting){
		let searchPromise;
		if(chatting && chatting != ''){
			searchPromise = window.myAPI.chatting.searchChattingList({
				page, size, workspaceId, roomId, chatting
			})
		}else{
			searchPromise = window.myAPI.chatting.searchRoomMyJoined({
				page, size, workspaceId, roomId, chatting
			})
		}
		return searchPromise.then((data = {}) =>{
			console.log(data)
			return data.data;
		});
	}

    createPage(data, chatting = ''){
        return new Promise(resolve => {
            let {content = []} = data || {};
            if(content.length == 0){
                resolve(content);
                return;
            }
            let liList = content.map(item => {

            })
        })
    }

    createLiElement({
            chattingId,
            roomId,
            workspaceId,
            chatting,
            createMils,
            updatedMils,
            fullName,
            accountName
    }){
        new Promise(resolve => {
            let li = Object.assign(document.createElement('div'), {

            });
            let content = new EditorHandler({isReadOnly : true});
            content.contentEditable = false;
            content.parseLowDoseJSON(chatting);
            li.append(content);
            Object.assign(li.dataset, {
                chatting_id: chattingId,
                room_id: roomId,
                workpsace_id: workspaceId,
                create_mils: createMils,
                update_mils: updatedMils,
                full_name: fullName,
                account_name: accountName
            });
            li.__editor = content;
            resolve(li);
        })
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