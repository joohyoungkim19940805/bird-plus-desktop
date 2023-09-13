import chattingHandler from "../../../handler/chatting/ChattingHandler"
import roomHandler from "../../../handler/room/RoomHandler"
import workspaceHandler from "../../../handler/workspace/WorkspaceHandler"
import EditorHandler from "../../../handler/editor/EditorHandler"

export default new class ChattingInfo{
    
    #chattingMemory = {}

    #page = 0;
	#size = 10;

    #element = Object.assign(document.createElement('div'), {
        id: 'chatting_info_wrapper',
        innerHTML: `
            <div class="chatting_info_container" data-bind_name="chattingInfoContainer">
                <ul class="chatting_content_list list_scroll list_scroll-y" data-bind_name="chattingContentList">

                </ul>
            </div>
        `
    })
    
    
	#lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				this.#page += 1;
                this.callData(this.#page, this.#size, workspaceHandler.workspaceId, roomHandler.roomId)
                .then(data=> {
                    return this.createPage(data).then(liList => {        
                        if(this.#page >= data.totalPages){
                            this.#lastItemVisibleObserver.disconnect();
                        }
                        return liList;
                    })
                })
                .then(liList => {
                    this.#liList.push(...liList);
                    this.#elementMap.chattingContentList.replaceChildren(...this.#liList);
                    if(this.#page > 2){
                        this.#elementMap.chattingContentList.scrollBy(undefined, 
                            liList[liList.length - 1].getBoundingClientRect().y
                        )
                    }
                });
			}
		})
	}, {
		threshold: 0.1,
		root: document
	});

    #elementMap = (()=>{
        return [...this.#element.querySelectorAll('[data-bind_name]')].reduce((total, element) => {
            total[element.dataset.bind_name] = element;
            return total;
        }, {})
    })();

    #roomId

    #liList = [];

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
                this.#elementMap.chattingContentList.prepend(wrap);
                this.#addChattingMemory(wrap)
                this.#elementMap.chattingContentList.scrollBy(undefined, 
                    this.#elementMap.chattingContentList.scrollHeight
                )
            }
        }
        roomHandler.addRoomIdChangeListener = {
            name: 'chattingInfo',
            callBack: () => {
                this.reset();
                this.callData(this.#page, this.#size, workspaceHandler.workspaceId, roomHandler.roomId)
                .then(data=>this.createPage(data))
                .then(liList => {
                    this.#liList.push(...liList);
                    this.#elementMap.chattingContentList.replaceChildren(...this.#liList);
                    this.#elementMap.chattingContentList.scrollBy(undefined, 
                        this.#elementMap.chattingContentList.scrollHeight
                    )
                })
            },
            runTheFirst: false
        }

    }

    callData(page, size, workspaceId, roomId, chatting){
		let searchPromise;

		if(chatting && chatting != ''){
			searchPromise = window.myAPI.chatting.searchChattingList({
				page, size, workspaceId, roomId, chatting
			})
		}else{
			searchPromise = window.myAPI.chatting.searchChattingList({
				page, size, workspaceId, roomId, chatting
			})
		}
		return searchPromise.then((result = {}) =>{
			console.log(result)
			return result.data;
		});
	}

    createPage(data, chatting = ''){
        return new Promise(resolve => {
            let {content = []} = data || {};
            if(content.length == 0){
                resolve(content);
                return;
            }
           return Promise.all(content.map(item => 
                this.createLiElement(item)
            )).then((liList = [])=>{
                console.log(liList);
                if(liList.length == 0){
                    resolve(liList);
                }
                this.#lastItemVisibleObserver.disconnect();
                this.#lastItemVisibleObserver.observe(liList[liList.length - 1])
                resolve(liList);
            });
        })
    }

    createLiElement(data){
        if( ! data){
            return;
        }
        let {
            id,
            roomId,
            workspaceId,
            chatting,
            createAt,
            updateAt,
            createMils,
            updateMils,
            fullName,
            accountName
        } = data;
        return new Promise(resolve => {
            let li = Object.assign(document.createElement('li'), {
                
            });
            let content = new EditorHandler({isReadOnly : true});
            content.contentEditable = false;
            content.parseLowDoseJSON(chatting);
            li.append(content);
            
            Object.assign(li.dataset, {
                id,
                room_id: roomId,
                workpsace_id: workspaceId,
                create_at: createAt,
                update_at: updateAt,
                create_mils: createMils,
                update_mils: updateMils,
                full_name: fullName,
                account_name: accountName
            });
            li.__editor = content;
            this.#addChattingMemory(li, id);
            resolve(li);
        })
    }

    #addChattingMemory(data, chattingId){
        if( ! this.#chattingMemory.hasOwnProperty(workspaceHandler.workspaceId)){
            this.#chattingMemory[workspaceHandler.workspaceId] = {};
        }
        if( ! this.#chattingMemory[workspaceHandler.workspaceId].hasOwnProperty(roomHandler.roomId)){
            this.#chattingMemory[workspaceHandler.workspaceId][roomHandler.roomId] = {} ;
        }
        if( ! this.#chattingMemory[workspaceHandler.workspaceId][roomHandler.roomId].hasOwnProperty(this.#page)){
            this.#chattingMemory[workspaceHandler.workspaceId][roomHandler.roomId][this.#page] = {};
        }
        if(this.#chattingMemory[workspaceHandler.workspaceId][roomHandler.roomId][this.#page].hasOwnProperty(chattingId)){
            this.#chattingMemory[workspaceHandler.workspaceId][roomHandler.roomId][this.#page] = {};
        }
        this.#chattingMemory[workspaceHandler.workspaceId][roomHandler.roomId][this.#page][chattingId] = data;
    }

    #processingTimeText(){

    }

    reset(){
		this.#page = 0;
		this.#liList = [];
		this.#lastItemVisibleObserver.disconnect();
		this.#elementMap.chattingContentList.replaceChildren();
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