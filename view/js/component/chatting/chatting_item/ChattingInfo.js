import chattingHandler from "@handler/chatting/ChattingHandler"
import roomHandler from "@handler/room/RoomHandler"
import workspaceHandler from "@handler/workspace/WorkspaceHandler"
import {accountHandler} from "@handler/account/AccountHandler"

import FreeWillEditor from "@handler/editor/FreeWillEditor"
import Strong from "@handler/editor/tools/Strong"
import Color from "@handler/editor/tools/Color"
import Background from "@handler/editor/tools/Background"
import Strikethrough from "@handler/editor/tools/Strikethrough"
import Underline from "@handler/editor/tools/Underline"
import FontFamily from "@handler/editor/tools/FontFamily"
import Quote from "@handler/editor/tools/Quote"
import NumericPoint from "@handler/editor/tools/NumericPoint"
import BulletPoint from "@handler/editor/tools/BulletPoint"
import Sort from "@handler/editor/tools/Sort"
import FontSize from "@handler/editor/tools/FontSize"
import Italic from "@handler/editor/tools/Italic"
import Image from "@handler/editor/tools/Image"
import Video from "@handler/editor/tools/Video"
import Resources from "@handler/editor/tools/Resources"
import Code from "@handler/editor/tools/Code"
import Hyperlink from "@handler/editor/tools/Hyperlink"

import common from "@root/js/common";

import { s3EncryptionUtil } from "@handler/S3EncryptionUtil";
import { emoticon, defaultEmoticon, toneTypeMapper, groupKind, subgroupKind } from "@handler/editor/module/emoticon"

import EmoticonBox from "@handler/editor/component/EmoticonBox"

import NotificationsIcon from "@component/NotificationsIcon"

import roomList from "@component/room/room_item/RoomList"
import roomFavoritesList from "@component/room/room_item/RoomFavoritesList"
import roomMessengerList from "@component/room/room_item/RoomMessengerList"


class ChattingInfoLine extends FreeWillEditor{
    static{
        window.customElements.define('chatting-info-line', ChattingInfoLine);
    }
    static tools = [
        Strong,
        Color,
        Background,
        Strikethrough,
        Underline,
        FontFamily,
        Quote,
        NumericPoint,
        BulletPoint,
        Sort,
        FontSize,
        Italic,
        Image,
        Video,
        Resources,
        Code,
        Hyperlink,
    ]

    static option = {
        isDefaultStyle : true
    }
    
    constructor(){
        super(ChattingInfoLine.tools, ChattingInfoLine.option);
        super.contentEditable = false;
        super.placeholder = ''
    }
}

export default new class ChattingInfo{
    
    #memory = {}

    #page = 0;
	#size = 10;

    #element = Object.assign(document.createElement('div'), {
        id: 'chatting_info_wrapper',
        innerHTML: `
            <div class="chatting_info_container" data-bind_name="chattingInfoContainer">
                <ul class="chatting_content_list list_scroll list_scroll-y" data-bind_name="chattingContentList">

                </ul>
                <div class="toolbar" style="position: fixed;" data-bind_name="toolbar"></div>
            </div>
        `
    })
    
    likeAndScrapWrapper;
    
    #totalPages

    #lastVisibleTarget;
    #firstVisibleTarget;

    #lastPageNumber;
    #firstPageNumber;

	#lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if ( ! entry.isIntersecting){
                return;
            }
            //console.log(entry.target);
            console.log(this.#lastVisibleTarget);
            //console.log(this.#firstVisibleTarget);
            //this.#lastItemVisibleObserver.disconnect();
            //return ;
            if(entry.target == this.#lastVisibleTarget){
                this.#page = this.#lastPageNumber;
                if(this.#lastVisibleTarget) this.#lastItemVisibleObserver.unobserve(this.#lastVisibleTarget);
            }else{ //if(entry.target == this.#firstVisibleTarget){
                this.#page = this.#firstPageNumber;
                if(this.#firstVisibleTarget) this.#lastItemVisibleObserver.unobserve(this.#firstVisibleTarget); 
            }
            let promise;
            let memory = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[this.#page] || {});
            
            if(memory && memory.length != 0){
                promise = new Promise(res => {
                    setTimeout(()=>{ 
                        res(
                            memory
                            .sort((a,b) => Number(b.dataset.create_mils) - Number(a.dataset.create_mils))
                        )
                    },50);
                })
            }else{
                promise = this.callData(this.#page, this.#size, workspaceHandler.workspaceId, roomHandler.roomId)
                    .then(async data=> 
                        this.createPage(data).then(liList => {
                            console.log(this.#page,liList);
                            this.#totalPages = data.totalPages;        
                            if(this.#page >= data.totalPages){
                                // 마지막 페이지인 경우 - 가장 마지막 채팅에는 날짜가 붙지 않기에 
                                // 날짜 관련 함수 코드 실행
                                let date = new Date(Number(this.elementMap.chattingContentList.lastChild.dataset.create_mils));
                                let timeText; 
                                if(date.toDateString() == new Date().toDateString()){
                                    timeText = 'to day'
                                }else{
                                    timeText = date.toLocaleDateString(undefined, {
                                        weekday: 'short',
                                        month: 'short',
                                        day: '2-digit',
                                        formatMatcher: 'best fit'
                                    })
                                }
                                this.#createTimeGroupingElement(this.elementMap.chattingContentList.lastChild, timeText)
                            }
                            return liList;
                        })
                    )
            }
            
            promise.then(liList => {
                if(liList.length == 0){
                    return;
                }
                
                this.#liList = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId] || {})
                    //.flatMap(e=>Object.values(e))
                    .sort((a,b) => Number(b.dataset.create_mils) - Number(a.dataset.create_mils))
                this.#elementMap.chattingContentList.replaceChildren(...this.#liList);
                
                let isConnectedAwait = setInterval(()=>{
                    if( ! this.#liList[0]){
                        clearInterval(isConnectedAwait);
                        return;
                    }
                    if( ! this.#liList[0].isConnected){
                        return;
                    }

                    this.#lastVisibleTarget = this.#liList.at(-1);
                    this.#firstVisibleTarget = this.#liList[0];
                    if(this.#lastVisibleTarget){
                        this.#lastItemVisibleObserver.observe(this.#lastVisibleTarget);
                        this.#lastPageNumber += 1 //this.#page <= 0 ? 1 : this.#page + 1
                    }  
                    if(this.#firstVisibleTarget){
                        this.#lastItemVisibleObserver.observe(this.#firstVisibleTarget);
                        this.#firstPageNumber = this.#firstPageNumber <= 0 ? -1 : this.#firstPageNumber - 1 // this.#page <= 0 ? -1: this.#page - 1
                    }

                    entry.target.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" });
                    clearInterval(isConnectedAwait);
                },50);

                //let visibilityLastItem = [...this.#elementMap.chattingContentList.querySelectorAll('[data-visibility="v"]')].at(-1);
                //visibilityLastItem?.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" });
                
            });

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

    #emoticonBox = new EmoticonBox();

    #lastEmoticonBoxTarget;

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

                    this.#addMemory(liElement, chattingData.workspaceId, chattingData.roomId, chattingData.id)
                    if(roomHandler.roomId != chattingData.roomId){
                        setTimeout(()=>{
                            window.myAPI.notifications({
                                fullName: liElement.dataset.full_name, 
                                content: liElement.__editor.innerText.split('\n'),
                                workspaceId: liElement.dataset.workspace_id,
                                roomId: liElement.dataset.room_id
                            });
                            new Promise(resolve => {
                                let list = [
                                    ...roomList.liList || [],
                                    ...roomFavoritesList.liList || [],
                                    ...roomMessengerList.liList || []
                                ]
                                list.flatMap(e=>e).filter(e=>e.dataset.room_id == chattingData.roomId).forEach(e=>{
                                    if( ! e.isConnected){
                                        console.log(roomHandler.roomMessengerListMemory);
                                        return;
                                    }
                                    
                                    let notificationsIcon
                                    if( ! e.__notificationsIcon){
                                        notificationsIcon = new NotificationsIcon({target: e, positionOption : NotificationsIcon.PositionOption.RIGHT_CENTER})
                                        e.__notificationsIcon = notificationsIcon;
                                    }else{
                                        notificationsIcon = e.__notificationsIcon;
                                    }
                                    notificationsIcon.addCount(liElement, chattingData.id);
                                    let liElementObserver = new IntersectionObserver((entries, observer) => {
                                        entries.forEach(entry =>{
                                            if (entry.isIntersecting){
                                                notificationsIcon.deleteCount(chattingData.id);
                                                liElementObserver.disconnect();
                                            }
                                        })
                                    }, {
                                        threshold: 0.01,
                                        root: this.#element
                                    });
                                    liElementObserver.observe(liElement);
                                });
                                resolve();
                            }) 
                        },1000)
                        return;
                    }
                    let memory = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId] || {});
                    if(memory && memory.length != 0){
                        this.#page = memory.length - 1;
                        this.#liList = memory
                            .sort((a,b) => Number(b.dataset.create_mils) - Number(a.dataset.create_mils))
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

                            Promise.all(this.#liList.map(async (e,i)=>{
                                if(i == 0 || i == this.#liList.length - 1)return;
                                return this.#processingTimeGrouping(e, this.#liList[i - 1])    
                            }))
                            //this.#processingTimeGrouping(this.#liList[1], this.#liList[0])
                            //.then(()=>this.#processingTimeGrouping(this.#liList[0], this.#liList[1]))
                            .then(result => {
                                //if(result){
                                //    return;
                                //}
                                let date = new Date(Number(this.elementMap.chattingContentList.lastChild.dataset.create_mils));
                                let timeText; 
                                if(date.toDateString() == new Date().toDateString()){
                                    timeText = 'to day'
                                }else{
                                    timeText = date.toLocaleDateString(undefined, {
                                        weekday: 'short',
                                        month: 'short',
                                        day: '2-digit',
                                        formatMatcher: 'best fit'
                                    })
                                }
                                this.#createTimeGroupingElement(this.elementMap.chattingContentList.lastChild, timeText)
                            });
                        },50);
                        
                    }
                });
            }
        }
        let firstOpenCheckMapper = {};
        roomHandler.addRoomIdChangeListener = {
            name: 'chattingInfo',
            callBack: () => {
                this.reset();
                let promise;
                let memory = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId] || {});
                let isMemory = memory && memory.length != 0 && firstOpenCheckMapper[roomHandler.roomId];
                if( isMemory ){
                    this.#page = memory.length - 1;
                    promise = Promise.resolve(
                        memory
                        .sort((a,b) => Number(b.dataset.create_mils) - Number(a.dataset.create_mils))
                    );
                }else{
                    promise = this.callData(this.#page, this.#size, workspaceHandler.workspaceId, roomHandler.roomId)
                    .then(async data=> 
                        this.createPage(data)
                        .then(liList => {
                            if(this.#page >= data?.totalPages){
                                //this.#lastItemVisibleObserver.disconnect();
                                if(this.#lastVisibleTarget) this.#lastItemVisibleObserver.unobserve(this.#lastVisibleTarget);
                                // 마지막 페이지인 경우 - 가장 마지막 채팅에는 날짜가 붙지 않기에 
                                // 날짜 관련 함수 코드 실행
                                this.#processingTimeGrouping(
                                    this.#liList.at(-2), 
                                    this.#liList.at(-1)
                                ); 
                            }else if(this.#page <= 0){
                                //this.#lastItemVisibleObserver.disconnect();
                                if(this.#firstVisibleTarget) this.#lastItemVisibleObserver.unobserve(this.#firstVisibleTarget);
                                // 마지막 페이지인 경우 - 가장 마지막 채팅에는 날짜가 붙지 않기에 
                                // 날짜 관련 함수 코드 실행
                                this.#processingTimeGrouping(
                                    this.#liList[1], 
                                    this.#liList[0]
                                );
                            }
                            return liList;
                        })
                    )
                }

                promise.then(liList => {

                    if(this.#lastVisibleTarget?.dataset.visibility == 'v') this.#lastItemVisibleObserver.unobserve(this.#lastVisibleTarget)
                    if(this.#firstVisibleTarget?.dataset.visibility == 'v') this.#lastItemVisibleObserver.unobserve(this.#firstVisibleTarget)    

                    if(liList.length == 0){
                        //this.#lastItemVisibleObserver.disconnect();
                        return;
                    }

                    if( ! firstOpenCheckMapper[roomHandler.roomId]){
                        this.#liList.push(...liList, ...memory);
                        this.#liList = Object.values(this.#liList.reduce((total, item)=>{
                            total[item.dataset.id] = item;
                            return total;
                        }, {}))
                        .sort((a,b) => Number(b.dataset.create_mils) - Number(a.dataset.create_mils))
                    }else{
                        this.#liList.push(...liList);
                    }
                  
                    this.#elementMap.chattingContentList.replaceChildren(...this.#liList);
                    let isConnectedAwait = setInterval(()=>{
                        if( ! this.#liList[0]){
                            clearInterval(isConnectedAwait);
                            return;
                        }
                        if( ! this.#liList[0].isConnected){
                            return;
                        }
                        if(isMemory){
                            Promise.all(this.#liList.map(async (e,i)=>{
                                if(i == 0 || i == this.#liList.length - 1)return;
                                return this.#processingTimeGrouping(e, this.#liList[i - 1])    
                            }))
                        }
                        this.#elementMap.chattingContentList.scrollBy(undefined, 
                            this.#elementMap.chattingContentList.scrollHeight
                        )

                        this.#lastVisibleTarget = this.#liList.at(-1);
                        this.#firstVisibleTarget = this.#liList[0];
                        if(this.#lastVisibleTarget){
                            this.#lastItemVisibleObserver.observe(this.#lastVisibleTarget);
                            this.#lastPageNumber = this.#page <= 0 ? 1 : this.#page + 1
                        }  
                        if(this.#firstVisibleTarget){
                            this.#lastItemVisibleObserver.observe(this.#firstVisibleTarget);
                            this.#firstPageNumber = this.#page <= 0 ? -1 : this.#page - 1
                        }

                        clearInterval(isConnectedAwait);
                    },50);
                    firstOpenCheckMapper[roomHandler.roomId] = '';
                })

            },
            runTheFirst: false
        }
        window.myAPI.event.electronEventTrigger.addElectronEventListener('chattingReactionAccept', event => {
            let {content} = event
            
            let memory = Object.values(this.#memory[content.workspaceId]?.[content.roomId] || {});
            let targetLi = memory.find(e=>e.dataset.id == content.chattingId) //memory.find(e=>e[content.chattingId])//?.[content.chattingId];
            if( ! targetLi || ! targetLi.isConnected){
                targetLi = this.#liList.find(e=>e.dataset.id == content.chattingId);
                if(! targetLi){
                    return
                }
            }

            if(content.emoticonType == 'CODE'){
                let ul = targetLi.querySelector('.chatting_reaction_list');
                let duplicationLi = ul.querySelector(`[data-emoticon="${content.emoticon}"]`);
                if(duplicationLi && content.count == 0){
                    duplicationLi.remove();
                    return;
                }else if(duplicationLi){
                    duplicationLi.dataset.count = content.count;
                    duplicationLi.querySelector('.chatting_reaction_count').textContent = content.count;
                }else{
                    let emoticonItem = this.#createReactionEmoticon(content);
                    ul.append(emoticonItem);
                }
            }
        })
        window.myAPI.event.electronEventTrigger.addElectronEventListener('chattingDeleteAccept', event => {
            let {content} = event
            console.log('delete accept content', content);
            this.reset();
            console.log(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId])
            delete this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId][content.chattingId];
            if(roomHandler.roomId == content.roomId){
                let memory = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId] || {});
                //if( memory && memory.length != 0 && firstOpenCheckMapper[roomHandler.roomId] ){
                Promise.all(this.#liList.map(async (e,i)=>{
                    if(i == 0 || i == this.#liList.length - 1)return;
                    return this.#processingTimeGrouping(e, this.#liList[i - 1])    
                }))
                this.#page = memory.length - 1;
                this.#liList = memory.sort((a,b) => Number(b.dataset.create_mils) - Number(a.dataset.create_mils));
                this.#elementMap.chattingContentList.replaceChildren(...this.#liList);
                //}
            }
            
        })
        
        let toolList = Object.values(ChattingInfoLine.tools).map(e=>e.toolHandler.toolButton);

        document.addEventListener('selectionchange', event => {
            if(document.activeElement.constructor != ChattingInfoLine){
                return;
            }
            let selection = window.getSelection();
            if (selection.rangeCount == 0){
                return;
            }
            
            if( ! selection.isCollapsed){
                this.#elementMap.chattingInfoContainer.append(this.#elementMap.toolbar);
                this.#elementMap.toolbar.replaceChildren(...toolList);
                common.processingElementPosition(this.#elementMap.toolbar, window.getSelection().getRangeAt(0).getBoundingClientRect())
            }else{
                this.#elementMap.toolbar.remove();
            }
        })
        this.#elementMap.chattingInfoContainer.addEventListener("scroll", () => {
			if(this.#elementMap.toolbar.childElementCount == 0)return;
			common.processingElementPosition(this.#elementMap.toolbar, window.getSelection().getRangeAt(0).getBoundingClientRect());
		});
        window.addEventListener('resize', (event) => {
			if(this.#elementMap.toolbar.childElementCount == 0)return;
            common.processingElementPosition(this.#elementMap.toolbar, window.getSelection().getRangeAt(0).getBoundingClientRect());
		})

        this.#elementMap.chattingContentList.addEventListener("scroll", () => {
			if(this.#emoticonBox.emoticonBox.isConnected && this.#lastEmoticonBoxTarget){
				common.processingElementPosition(this.#emoticonBox.emoticonBox, this.#lastEmoticonBoxTarget);
			}
		});
        window.addEventListener('resize', (event) => {
			if(this.#emoticonBox.emoticonBox.isConnected && this.#lastEmoticonBoxTarget){
				common.processingElementPosition(this.#emoticonBox.emoticonBox, this.#lastEmoticonBoxTarget);
			}
		})
    }

    callData(page, size, workspaceId, roomId, chatting){
		if(page < 0){
           return Promise.resolve({});
        }
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
			return result.data || {};
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
        return new Promise(async resolve => {
            let li = Object.assign(document.createElement('li'), {
            });
            let descriptionWrap = Object.assign(document.createElement('div'),{
                className: 'chatting_content_description_wrapper',
                innerHTML: `
                    <div class="chatting_content_description_profile">
                        <img src="${(await common.getProjectPathPromise())}image/user.png"/>
                    </div>
                    <div class="chatting_container">
                        <div class="chatting_content_description_name_wrapper">
                            <div class="chatting_content_description_name_container">
                                <div class="chatting_content_description_name">${accountHandler.accountInfo.accountName == accountName ? '나' : fullName}</div>
                                <div class="chatting_content_description_time">${this.#processingTimeText(createMils)}</div>
                            </div>
                            <div class="chatting_content_description_option_container">
                                <button class="chatting_hover_on_off_button">
                                    <svg width="1rem" height="1rem" style="zoom:125%;color: #bfbfbf;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 6C14 7.10457 13.1046 8 12 8C10.8954 8 10 7.10457 10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6Z" fill="currentColor"/>
                                        <path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" fill="currentColor"/>
                                        <path d="M14 18C14 19.1046 13.1046 20 12 20C10.8954 20 10 19.1046 10 18C10 16.8954 10.8954 16 12 16C13.1046 16 14 16.8954 14 18Z" fill="currentColor"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <ul class="chatting_reaction_list">
                        </ul>
                    </div>
                `
            });
            li.append(descriptionWrap);
            let content = new ChattingInfoLine();
            content.parseLowDoseJSON(chatting).then((e)=>{
                resolve(li)
            });
            descriptionWrap.querySelector('.chatting_container .chatting_content_description_name_wrapper').after(content);
            delete data.chatting
            
            if(data.reaction && data.reaction != ''){
                // createAt - 단순 솔팅용으로, mils가 아니기 때문에 시차 이슈 있을 수 있음 (단순 솔트로서 이슈 없을 뿐)
                let reactionList = JSON.parse(data.reaction).sort((a,b) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime()).map(e=> {
                    e.chattingId = data.id;
                    return this.#createReactionEmoticon(e)
                })
                descriptionWrap.querySelector('.chatting_reaction_list').replaceChildren(...reactionList);
            }
            delete data.reaction;

            li.__editor = content;
            this.#addMemory(li, workspaceId, roomId, id);
            this.#lastLiItem = li;
            
            common.jsonToSaveElementDataset(data, li).then(() => {
                this.#createDescription(li, descriptionWrap);
                if( ! prevItemPromise && this.#lastLiItem){
                    this.#processingTimeGrouping(li, this.#lastLiItem);
                }else{
                   prevItemPromise?.then(prevItem => this.#processingTimeGrouping(li, prevItem));
                }
            });


            //resolve(li);
        })
    }

    #createDescription(li, descriptionWrap){
        let editor = li.__editor;
        new Promise(resolve=> {
            let hoverButtonWrapper = Object.assign(document.createElement('div'),{
                className: 'chatting_hover_wrapper',
            });
            let recommendEmojiContainer = Object.assign(document.createElement('div'),{
                className: 'chatting_hover_recommend_emoticon_container'
            })
            let buttonContainer = Object.assign(document.createElement('div'), {
                className: 'chatting_hover_button_container'
            })
            let anotherEmoji = Object.assign(document.createElement('button'), {
                className: 'chatting_hover_another_emoticon',
                innerHTML: `
                <svg class="css-gg-smile" style="zoom:125%;" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 13H14C14 14.1046 13.1046 15 12 15C10.8954 15 10 14.1046 10 13H8C8 15.2091 9.79086 17 12 17C14.2091 17 16 15.2091 16 13Z" fill="currentColor"/>
                    <path d="M10 10C10 10.5523 9.55228 11 9 11C8.44772 11 8 10.5523 8 10C8 9.44771 8.44772 9 9 9C9.55228 9 10 9.44771 10 10Z" fill="currentColor"/>
                    <path d="M15 11C15.5523 11 16 10.5523 16 10C16 9.44771 15.5523 9 15 9C14.4477 9 14 9.44771 14 10C14 10.5523 14.4477 11 15 11Z" fill="currentColor"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" fill="currentColor"/>
                </svg>
                <svg class="css-gg-add" style="zoom:125%;" width="0.5rem" height="0.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="currentColor"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7V11H7C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13H11V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13H17C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11H13V7Z" fill="currentColor"/>
                </svg>
                `,
                onclick : (event) => {
                    anotherEmoji.toggleAttribute('open');
                    if(anotherEmoji.hasAttribute('open')){
                        if(this.#lastEmoticonBoxTarget != anotherEmoji){
                            this.#lastEmoticonBoxTarget?.toggleAttribute('open');
                            this.#lastEmoticonBoxTarget = anotherEmoji;
                        }
                        this.#emoticonBox.open(hoverButtonWrapper);
                        common.processingElementPosition(this.#emoticonBox.emoticonBox, anotherEmoji)
                        if( ! this.#emoticonBox.emoticonBox.querySelector('.empty_padding')){
                            let emptyPadding = Object.assign(document.createElement('div'), {
                                className : 'empty_padding'
                            })
                            Object.assign(emptyPadding.style, {
                                height: '1.4vh',
                                width: '100%',
                                background: '#ffffff00'
                            })
                            this.#emoticonBox.emoticonBox.append(emptyPadding)
                        }
                        this.#emoticonBox.applyCallback = (emoticonObject) => {
                            this.#emoticonBox.close();
                            anotherEmoji.removeAttribute('open');
                            this.#lastEmoticonBoxTarget?.removeAttribute('open');
                            window.myAPI.emoticon.createEmotionReaction({
                                emoticon: emoticonObject.emoticon, description: emoticonObject.description,
                                emoticonType: 'CODE', groupTitle: emoticonObject.groupTitle,
                                subgroupTitle: emoticonObject.subgroupTitle, chattingId: li.dataset.id,
                                roomId: roomHandler.roomId, workspaceId: workspaceHandler.workspaceId
                            }).then(result => {
                                console.log(result);
                            })
                        }
                    }else{
                        this.#emoticonBox.close();
                        this.#lastEmoticonBoxTarget = undefined;
                    }
                }
            })
            let prevText;
            let isScriptBlur = false;
            let updateButton = Object.assign(document.createElement('button'), {
                className: 'css-gg-pen',
                innerHTML: `
                <svg style="zoom:125%;" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M21.2635 2.29289C20.873 1.90237 20.2398 1.90237 19.8493 2.29289L18.9769 3.16525C17.8618 2.63254 16.4857 2.82801 15.5621 3.75165L4.95549 14.3582L10.6123 20.0151L21.2189 9.4085C22.1426 8.48486 22.338 7.1088 21.8053 5.99367L22.6777 5.12132C23.0682 4.7308 23.0682 4.09763 22.6777 3.70711L21.2635 2.29289ZM16.9955 10.8035L10.6123 17.1867L7.78392 14.3582L14.1671 7.9751L16.9955 10.8035ZM18.8138 8.98525L19.8047 7.99429C20.1953 7.60376 20.1953 6.9706 19.8047 6.58007L18.3905 5.16586C18 4.77534 17.3668 4.77534 16.9763 5.16586L15.9853 6.15683L18.8138 8.98525Z"
					fill="currentColor"
					/>
					<path
					d="M2 22.9502L4.12171 15.1717L9.77817 20.8289L2 22.9502Z"
					fill="currentColor"
					/>
				</svg>
                `,
                onclick : (event) => {
                    editor.contentEditable = true;
                    this.#emoticonBox.close();
                    anotherEmoji.removeAttribute('open');
                    hoverButtonWrapper.remove();
                    window.getSelection().setPosition(editor, editor.childElementCount)
                }
            })
            editor.onfocus = (event) => {
                prevText = editor.innerHTML;
            }
            editor.onblur = (event) => {
                if( ! isScriptBlur && (editor.matches(':hover') || this.#elementMap.toolbar.matches(':hover') || document.activeElement == editor)){
                    return;
                }
                if(isScriptBlur){
                    isScriptBlur = ! isScriptBlur;
                }
                editor.contentEditable = false;
                if( ! event.relatedTarget?.hasAttribute('data-tool_status')){
                    this.#elementMap.toolbar.remove();
                }
                if(prevText == editor.innerHTML){
                    return;
                }
                prevText = editor.innerHTML;
                this.#sendChatting(li);
            }
            editor.onkeydown = (event) => {
                let {altKey, ctrlKey, shiftKey, key} = event;
                if(key == 'Enter' && (altKey || ctrlKey || shiftKey)){
                    event.preventDefault();
                    let LineBreakMode;
                    if(altKey){
                        LineBreakMode = FreeWillEditor.LineBreakMode.NEXT_LINE_FIRST
                    }else if(ctrlKey){
                        LineBreakMode = FreeWillEditor.LineBreakMode.NEXT_LINE_LAST
                    }else{
                        LineBreakMode = FreeWillEditor.LineBreakMode.NO_CHANGE
                    }
                    editor.lineBreak(LineBreakMode);
                }else if(key == 'Enter' && editor.innerText.replaceAll('\n', '') != ''){
                    event.preventDefault();
                    isScriptBlur = true;
                    editor.blur();
                }
            }
            let deleteButton = Object.assign(document.createElement('button'),{
                className : `css-gg-trash`,
                innerHTML: `
                <svg style="zoom:125%" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M17 5V4C17 2.89543 16.1046 2 15 2H9C7.89543 2 7 2.89543 7 4V5H4C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H5V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H17ZM15 4H9V5H15V4ZM17 7H7V18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18V7Z"
                        fill="currentColor"
                    />
                    <path d="M9 9H11V17H9V9Z" fill="currentColor" />
                    <path d="M13 9H15V17H13V9Z" fill="currentColor" />
                </svg>
                `,
                onclick : (event) => {
                    window.myAPI.chatting.deleteChatting({
                        id: li.dataset.id,
                        workspaceId : li.dataset.workspace_id,
                        roomId: li.dataset.room_id
                    }).then((result)=>{
                        console.log('deleteChatting', result);
                    })
                }
            })
            let replyButton = Object.assign(document.createElement('button'),{
                className : `css-gg-trash`,
                innerHTML: `
                <svg style="zoom:125%" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M17.1495 13.4005C18.2541 13.4005 19.1495 12.5051 19.1495 11.4005V3.40051H21.1495V11.4005C21.1495 13.6097 19.3587 15.4005 17.1495 15.4005H6.84398L10.6286 19.1852L9.21443 20.5994L2.85046 14.2354L9.21443 7.87146L10.6286 9.28567L6.5138 13.4005H17.1495Z"
                        fill="currentColor"
                    />
                </svg>
                `
            })
            recommendEmojiContainer.append(...defaultEmoticon.map(e=>{
                let button = document.createElement('button');
                button.textContent = e.emoticon;
                button.onclick = () => {
                    window.myAPI.emoticon.createEmotionReaction({
                        emoticon: e.emoticon,
                        description: e.description,
                        emoticonType: 'CODE',
                        groupTitle: e.groupTitle,
                        subgroupTitle: e.subgroupTitle,
                        chattingId: li.dataset.id,
                        roomId: roomHandler.roomId,
                        workspaceId: workspaceHandler.workspaceId
                    }).then(result => {
                        console.log(result);
                    })
                }
                return button;
            }))
            hoverButtonWrapper.append(recommendEmojiContainer, buttonContainer);
            if(li.dataset.is_my_chatting == 'true'){
                buttonContainer.append(anotherEmoji, deleteButton, updateButton, replyButton);
            }else{
                buttonContainer.append(anotherEmoji, replyButton);
            }
            descriptionWrap.onmouseenter = (event) => {
                if(editor.contentEditable == 'true'){
                    return;
                }
                descriptionWrap.append(hoverButtonWrapper);
            }
            let emoticonBoxSearch = this.#emoticonBox.emoticonBox.querySelector('#emoticon-box-search');
            descriptionWrap.onmouseleave = (event) => {
                if(document.activeElement == emoticonBoxSearch || editor.contentEditable == 'true'){
                    return;
                }
                this.#emoticonBox.close();
                anotherEmoji.removeAttribute('open');
                hoverButtonWrapper.remove();
            }
            descriptionWrap.querySelector('.chatting_hover_on_off_button').onclick = () => {
                if(hoverButtonWrapper.isConnected){
                    hoverButtonWrapper.remove();
                }else{
                    descriptionWrap.append(hoverButtonWrapper);
                }
            }
            resolve();
        })
    }
    /**
     * 
     * @param {ChattingInfoLine} editor 
     * @param {Object} param
     */
    async #sendChatting(li){
        let editor = li.__editor;
        let promiseList = [];
        editor.getLowDoseJSON(editor, {
            afterCallback : (json) => {
                if(json.tagName != Image.toolHandler.defaultClass && 
                    json.tagName != Video.toolHandler.defaultClass &&
                    json.tagName != Resources.toolHandler.defaultClass
                ){
                    return;
                }else if(json.data.hasOwnProperty('is_upload_end')){
                    return;
                }
                let node = json.node;
                let file = node.selectedFile;
                json.data.is_loading = '';
                let fileType;
                if(json.tagName == Image.toolHandler.defaultClass){
                    fileType = 'IMAGE';
                }else if(json.tagName == Video.toolHandler.defaultClass){
                    fileType = 'VIDEO';
                }else {
                    fileType = 'FILE';
                }
                promiseList.push(new Promise(async resolve => {

                    let {name, size, lastModified, contentType, newFileName} = await common.underbarNameToCamelName(json.data);
                    let putSignData = `${li.dataset.roomId}:${li.dataset.workspaceId}:${name}:${accountHandler.accountInfo.accountName}`;
                    let isUpload = await s3EncryptionUtil.callS3PresignedUrl(window.myAPI.s3.generatePutObjectPresignedUrl, putSignData, {newFileName, fileType, uploadType: 'CHATTING'})
                    .then( (result) => {
                        if(! result){
                            return;
                        }
                        let {data, encDncKeyPair} = result;

                        json.data.new_file_name = data.newFileName;

                        return Promise.all([
                            s3EncryptionUtil.convertBase64ToBuffer(data.encryptionKey).then( async (buffer) => {
                                return s3EncryptionUtil.decryptMessage(encDncKeyPair.privateKey, buffer, s3EncryptionUtil.secretAlgorithm)
                                    .then(buf=>String.fromCharCode(...new Uint8Array(buf)))
                            }),
                            s3EncryptionUtil.convertBase64ToBuffer(data.encryptionMd).then( async (buffer) => {
                                return s3EncryptionUtil.decryptMessage(encDncKeyPair.privateKey, buffer, s3EncryptionUtil.secretAlgorithm)
                                    .then(buf=>String.fromCharCode(...new Uint8Array(buf)))
                            })
                        ]).then( async ([k,m]) => {
                            /*let base64 = json.data.base64;
                            if(! base64){
                                let blob = await fetch(json.data.url).then(res=>res.blob())
                                base64 = await new Promise(resolve => {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(blob);
                                    reader.onloadend = () => {
                                        resolve(reader.result);
                                    }
                                });
                            }*/
                            let res = await s3EncryptionUtil.fetchPutObject(data.presignedUrl, k, m, file.files[0]);
                            if( ! (res.status == 200 || res.status == 201) ){
                                return;
                            }
                            return true;
                        })
                    })
                    if( ! isUpload){
                        resolve();
                        return;
                    }
                    let getSignData = `${li.dataset.roomId}:${li.dataset.workspaceId}:${json.data.new_file_name}:${accountHandler.accountInfo.accountName}`;
                    
                    s3EncryptionUtil.callS3PresignedUrl(window.myAPI.s3.generatePutObjectPresignedUrl, getSignData, {fileType, uploadType: 'CHATTING'})
                    .then( (result) => {
                        if(! result){
                            return;
                        }
                        let {data, encDncKeyPair} = result;

                        json.data.url = data.presignedUrl;
                        delete json.data.base64
                        json.data.upload_type = 'CHATTING';
                        resolve(json);
                    })
                }))
            }
        }).then(jsonList => {

            window.myAPI.chatting.sendChatting({
                id: li.dataset.id,
                workspaceId: li.dataset.workspace_id,
                roomId: li.dataset.room_id,
                chatting: JSON.stringify(jsonList)
            }).then(res=>{
                console.log(res);
                let {data} = res
                this.innerText = '';
                Promise.all(promiseList).then((fileTargetList) => {
                    if(fileTargetList.length == 0){
                        //window.getSelection().setPosition(this, 1)
                        return;
                    }
                    fileTargetList.forEach(e=>{
                        delete e.data.is_loading
                        e.data.is_upload_end = '';
                    });
                    window.myAPI.chatting.sendChatting({
                        id: data.id,
                        workspaceId: li.dataset.workspace_id,
                        roomId: li.dataset.room_id,
                        chatting: JSON.stringify(jsonList)
                    }).then(res=>{
                        //window.getSelection().setPosition(this, 1)
                    });
                })
            });
            
        })
    }

    #createReactionEmoticon(emoticonData){
        let targetEmoticonObject = emoticon[emoticonData.groupTitle][emoticonData.subgroupTitle].find(e=>e.emoticon == emoticonData.emoticon);
        let li = Object.assign(document.createElement('li'),{
            className: 'chatting_reaction_item'
        });
        common.jsonToSaveElementDataset(emoticonData, li);
        let button = Object.assign(document.createElement('button'),{
            className: 'chatting_reaction_button',
            type: 'button',
            innerHTML: `
                <span class="chatting_reaction_emoticon">${emoticonData.emoticon}</span>
                <span class="chatting_reaction_count">${emoticonData.reactionList.length}</span>
            `,
            onclick: (event) => {
                window.myAPI.emoticon.createEmotionReaction({
                    emoticon: targetEmoticonObject.emoticon,
                    description: targetEmoticonObject.description,
                    emoticonType: 'CODE',
                    groupTitle: targetEmoticonObject.groupTitle,
                    subgroupTitle: targetEmoticonObject.subgroupTitle,
                    chattingId: emoticonData.chattingId,
                    roomId: roomHandler.roomId,
                    workspaceId: workspaceHandler.workspaceId
                }).then(result => {
                    console.log(result);
                })
            }
        })
        li.append(button);
        return li;
    }

    #addMemory(data, workspaceId, roomId, id){
        /*if(data.dataset.room_id != roomHandler.roomId || data.dataset.workpsace_id != workspaceHandler.workspaceId){
            return;
        }*/

        if( ! this.#memory.hasOwnProperty(workspaceId)){
            this.#memory[workspaceId] = {};
        }
        if( ! this.#memory[workspaceId].hasOwnProperty(roomId)){
            this.#memory[workspaceId][roomId] = {} ;
        }
        /*if(Object.values(this.#memory[workspaceId][roomId]).some(e=>e[id])){
            return;
        }*/
        this.#memory[workspaceId][roomId][id] = data;
    }

    #processingTimeText(createMils){
        return new Date(createMils).toLocaleTimeString();
    }

    async #processingTimeGrouping(li, prevItem){
        return new Promise(resolve=>{
            if( ! prevItem || ! li){
                resolve();
                return;
            }
            let prevDate = new Date(Number(prevItem.dataset.create_mils));
            let prevDateYearMonth = new Date(Number(prevItem.dataset.create_mils));
            prevDateYearMonth.setHours(0,0,0,0);
            //let currentDate = new Date(Number(li.dataset.create_mils));
            let currentDateYearMonth = new Date(Number(li.dataset.create_mils));
            currentDateYearMonth.setHours(0,0,0,0);
            let diffMils = prevDateYearMonth.getTime() - currentDateYearMonth.getTime();

            //하루 이상 차이 나는 경우
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
            resolve(
                this.#createTimeGroupingElement(prevItem, timeText)
            );
        });
    }

    #createTimeGroupingElement(target, timeText){
        if(target.querySelector('.time_grouping')){
            return;
        }
        let timeGroupingElement = Object.assign(document.createElement('div'), {
            className: 'time_grouping',
            innerHTML: `
                <small class="time_grouping_text">${timeText}</small>
            `
        })
        target.prepend(timeGroupingElement)
        return timeGroupingElement;
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

    get memory(){
        return this.#memory;
    }
}