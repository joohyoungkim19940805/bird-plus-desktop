import chattingHandler from "../../../handler/chatting/ChattingHandler"
import roomHandler from "../../../handler/room/RoomHandler"
import workspaceHandler from "../../../handler/workspace/WorkspaceHandler"
import chattingRegist from "./ChattingRegist"
import common from "./../../../common"
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
                                    // 마지막 페이지인 경우 - 가장 마지막 채팅에는 날짜가 붙지 않기에 
                                    // 날짜 관련 함수 코드 실행
                                    this.#processingTimeGrouping(
                                        this.#liList.at(-2), 
                                        this.#liList.at(-1)
                                    ); 
                                }
                                return liList;
                            })
                        )
                }
                
                promise.then(liList => {
                    this.#lastItemVisibleObserver.disconnect();
                    let lastVisibleTarget = liList.at(-1);
                    if(lastVisibleTarget){
                        this.#lastItemVisibleObserver.observe(lastVisibleTarget);
                    }
                    this.#liList.push(...liList);
                    let visibilityLastItem = [...this.#elementMap.chattingContentList.querySelectorAll('[data-visibility="v"]')].at(-1);
                    this.#elementMap.chattingContentList.replaceChildren(...this.#liList);
                    visibilityLastItem?.previousElementSibling?.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" });
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

    #second = 1000;
    #minute = this.#second * 60;
    #hour = this.#minute * 60;
    #day = this.#hour * 24;

    #lastLiItem;
    /*
    this.timerElement.querySelector('.hour').textContent = `${Math.floor( ms / this.hour )}`.padStart(2,'0');
    this.timerElement.querySelector('.minute').textContent = `${Math.floor( ms % this.hour / this.minute )}`.padStart(2,'0');
    this.timerElement.querySelector('.seconds').textContent = `${Math.floor( ms % this.minute / this.second )}`.padStart(2,'0');
    this.timerElement.querySelector('.millisecond').textContent = `${ ms % this.second }`.padStart(2,'0').slice(0, 2);
    */
    constructor(){

        chattingHandler.addChattingEventListener = {
            name: 'chattingInfo',
            callBack: (chattingData) => {
                this.createItemElement(chattingData).then(liElement => {
                    this.#elementMap.chattingContentList.prepend(liElement);
                    this.#addChattingMemory(liElement)
                    this.#processingTimeGrouping(
                        this.#liList[0],
                        liElement
                    ); 
                    this.#liList.unshift(liElement);
                    this.#elementMap.chattingContentList.scrollBy(undefined, 
                        9999999
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
                    this.#page = memory.length - 1;
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
                                // 마지막 페이지인 경우 - 가장 마지막 채팅에는 날짜가 붙지 않기에 
                                // 날짜 관련 함수 코드 실행
                                this.#processingTimeGrouping(
                                    this.#liList.at(-2), 
                                    this.#liList.at(-1)
                                ); 
                            }
                            return liList;
                        })
                    )
                }
                promise.then(liList => {
                    this.#liList.push(...liList);
                    this.#elementMap.chattingContentList.replaceChildren(...this.#liList);
                    let isConnectedAwait = setInterval(()=>{
                        if( ! this.#liList[0]){
                            clearInterval(isConnectedAwait);
                            return;
                        }
                        if( ! this.#liList[0].isConnected){
                            return;
                        }
                        this.#elementMap.chattingContentList.scrollBy(undefined, 
                            this.#elementMap.chattingContentList.scrollHeight
                        )
                        clearInterval(isConnectedAwait);
                    },50);
                   
                    this.#lastItemVisibleObserver.disconnect();
                    let lastVisibleTarget = liList.at(-1);
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
            let prevItemPromise;
            return Promise.all(content.map(item => {
                prevItemPromise = this.createItemElement(item, prevItemPromise);
                return prevItemPromise;
            })).then((liList = [])=>{
                if(liList.length == 0){
                    resolve(liList);
                }
               resolve(liList);
            });
        })
    }

    createItemElement(data, prevItemPromise){
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
            let content = new chattingRegist.constructor({isReadOnly : true});
            content.contentEditable = false;
            content.parseLowDoseJSON(chatting).then((e)=>{
                resolve(li)
            });
            li.append(content);
            common.jsonToSaveElementDataset(data, li);

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
            if( ! prevItemPromise && this.#lastLiItem){
                this.#processingTimeGrouping(li, this.#lastLiItem);
            }else{
               prevItemPromise?.then(prevItem => this.#processingTimeGrouping(li, prevItem));
            }
            this.#lastLiItem = li;
            //resolve(li);
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
        if(data.dataset.room_id != roomHandler.roomId || data.dataset.workpsace_id != workspaceHandler.workspaceId){
            return;
        }

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
    }

    #processingTimeText(createMils){
        return new Date(createMils).toLocaleTimeString();
    }

    async #processingTimeGrouping(li, prevItem){
        return new Promise(resolve=>{
            if( ! prevItem){
                return;
            }
            let prevDate = new Date(Number(prevItem.dataset.create_mils));
            let prevDateYearMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, prevDate.getDate());
            let currentDate = new Date(Number(li.dataset.create_mils));
            let currentDateYearMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
            let diffMils = prevDateYearMonth.getTime() - currentDateYearMonth.getTime();
            if(Math.abs(diffMils) < this.#day){
                resolve();
                return;
            }else if(prevItem.querySelector('.time_grouping')){
                resolve();
                return;
            }
            
            let timeText;
            
            if(prevDate.toDateString() == new Date().toDateString()){
                timeText = 'to day'
            }else{
                timeText = prevDate.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: '2-digit',
                    formatMatcher: 'best fit'
                })
            }
            //첫번째 매개변수 html 객체와 두번째 매개변수 html 객체간에 하루 이상 차이 나는 경우
            let timeGroupingElement = Object.assign(document.createElement('div'), {
                className: 'time_grouping',
                innerHTML: `
                    <small class="time_grouping_text">${timeText}</small>
                `
            })
            prevItem.prepend(timeGroupingElement)
            resolve();
        });
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