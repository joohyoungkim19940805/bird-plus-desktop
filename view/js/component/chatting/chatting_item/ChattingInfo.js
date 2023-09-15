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
    
    likeAndScrapWrapper;

	#lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				this.#page += 1;
                let promise;
                let memory = Object.values(this.#chattingMemory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[this.#page] || {});
                if(memory && memory.length != 0){
                    promise = Promise.resolve(
                        memory
                        .sort((a,b) => Number(b.dataset.create_mils) - Number(a.dataset.create_mils))
                    );
                }else{
                    promise = this.callData(this.#page, this.#size, workspaceHandler.workspaceId, roomHandler.roomId)
                        .then(async data=> 
                            this.createPage(data).then(liList => {        
                                if(this.#page >= data.totalPages){
                                    this.#lastItemVisibleObserver.disconnect();
                                }
                                return liList;
                            })
                        )
                }
                
                promise.then(liList => {
                    this.#lastItemVisibleObserver.disconnect();
                    let lastVisibleTarget = liList[liList.length - 1];
                    if(lastVisibleTarget){
                        this.#lastItemVisibleObserver.observe(lastVisibleTarget);
                    }
                    this.#liList.push(...liList);
                    let lastItem = this.#elementMap.chattingContentList.children[this.#elementMap.chattingContentList.children.length - 1];
                    this.#elementMap.chattingContentList.replaceChildren(...this.#liList);
                    lastItem.previousElementSibling.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
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
                this.createItemElement(chattingData).then(liElement => {
                    this.#elementMap.chattingContentList.prepend(liElement);
                    this.#addChattingMemory(liElement)
                    this.#elementMap.chattingContentList.scrollBy(undefined, 
                        this.#elementMap.chattingContentList.scrollHeight
                    )
                });
            }
        }
        roomHandler.addRoomIdChangeListener = {
            name: 'chattingInfo',
            callBack: () => {
                this.reset();
                let promise;
                let memory = Object.values(this.#chattingMemory[workspaceHandler.workspaceId]?.[roomHandler.roomId] || {});
                if(memory && memory.length != 0){
                    promise = Promise.resolve(
                        memory.flatMap(e=>Object.values(e))
                        .sort((a,b) => Number(b.dataset.create_mils) - Number(a.dataset.create_mils))
                    );
                }else{
                    promise = this.callData(this.#page, this.#size, workspaceHandler.workspaceId, roomHandler.roomId)
                    .then(async data=> 
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
                    this.#elementMap.chattingContentList.replaceChildren(...this.#liList);
                    this.#elementMap.chattingContentList.scrollBy(undefined, 
                        this.#elementMap.chattingContentList.scrollHeight
                    )
                    this.#lastItemVisibleObserver.disconnect();
                    let lastVisibleTarget = liList[liList.length - 1];
                    if(lastVisibleTarget){
                        this.#lastItemVisibleObserver.observe(lastVisibleTarget)
                    }
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
                this.createItemElement(item)
            )).then((liList = [])=>{
                console.log(liList);
                if(liList.length == 0){
                    resolve(liList);
                }
               resolve(liList);
            });
        })
    }

    createItemElement(data){
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
        console.log(data);
        return new Promise(resolve => {
            let li = Object.assign(document.createElement('li'), {
                innerHTML: `
                    <div class="chatting_content_description_wrapper">
                        <div class="chatting_content_description_profile">
                        </div>
                        <div class="chatting_content_description_name_wrapper">
                            <div class="chatting_content_description_name">${fullName}</div>
                        </div>
                        <div class="chatting_content_description_time">${this.#processingTimeText(createMils)}</div>
                    </div>
                `
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
            this.#addItemEvent(li);
            resolve(li);
        })
    }

    #addItemEvent(li){
        new Promise(resolve=> {
            let likeAndScrapWrapper;
            li.onmouseenter = (event) => {
            }
            li.onmouseleave = (event) => {
            }
            resolve();
        })
    }

    #addChattingMemory(data, id){
        return new Promise(resolve => {
            if( ! this.#chattingMemory.hasOwnProperty(workspaceHandler.workspaceId)){
                this.#chattingMemory[workspaceHandler.workspaceId] = {};
            }
            if( ! this.#chattingMemory[workspaceHandler.workspaceId].hasOwnProperty(roomHandler.roomId)){
                this.#chattingMemory[workspaceHandler.workspaceId][roomHandler.roomId] = {} ;
            }
            if( ! this.#chattingMemory[workspaceHandler.workspaceId][roomHandler.roomId].hasOwnProperty(this.#page)){
                this.#chattingMemory[workspaceHandler.workspaceId][roomHandler.roomId][this.#page] = {};
            }
            this.#chattingMemory[workspaceHandler.workspaceId][roomHandler.roomId][this.#page][id] = data;
            resolve();
        })
    }

    #processingTimeText(createMils){
        return new Date(createMils).toLocaleTimeString();
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