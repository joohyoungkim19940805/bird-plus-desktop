import chattingHandler from "../../../handler/chatting/ChattingHandler"
import roomHandler from "../../../handler/room/RoomHandler"
import workspaceHandler from "../../../handler/workspace/WorkspaceHandler"

import FreeWillEditor from "../../../handler/editor/FreeWillEditor"
import Strong from "./../../../handler/editor/tools/Strong"
import Color from "./../../../handler/editor/tools/Color"
import Background from "./../../../handler/editor/tools/Background"
import Strikethrough from "./../../../handler/editor/tools/Strikethrough"
import Underline from "./../../../handler/editor/tools/Underline"
import FontFamily from "./../../../handler/editor/tools/FontFamily"
import Quote from "./../../../handler/editor/tools/Quote"
import NumericPoint from "./../../../handler/editor/tools/NumericPoint"
import BulletPoint from "./../../../handler/editor/tools/BulletPoint"
import Sort from "./../../../handler/editor/tools/Sort"
import FontSize from "./../../../handler/editor/tools/FontSize"
import Italic from "./../../../handler/editor/tools/Italic"
import Image from "./../../../handler/editor/tools/Image"
import Video from "./../../../handler/editor/tools/Video"
import Code from "./../../../handler/editor/tools/Code"
import Hyperlink from "./../../../handler/editor/tools/Hyperlink"

import common from "../../../common";

import { s3EncryptionUtil } from "../../../handler/S3EncryptionUtil";
import { emoticon, defaultEmoji, toneTypeMapper, groupKind, subgroupKind } from "../../../handler/editor/module/emoticon"

import EmoticonBox from "../../../handler/editor/component/EmoticonBox"

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
            </div>
        `
    })
    
    likeAndScrapWrapper;

	#lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				this.#page += 1;
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
                                let lastVisibleTarget = liList.at(-1);
                                if(lastVisibleTarget){
                                    this.#lastItemVisibleObserver.disconnect();
                                    this.#lastItemVisibleObserver.observe(lastVisibleTarget);
                                }
                                if(this.#page >= data.totalPages){
                                    this.#lastItemVisibleObserver.disconnect();
                                    // 마지막 페이지인 경우 - 가장 마지막 채팅에는 날짜가 붙지 않기에 
                                    // 날짜 관련 함수 코드 실행
                                    this.#processingTimeGrouping(
                                        liList.at(-2), 
                                        liList.at(-1)
                                    ).then(() => {
                                        if(this.elementMap.chattingContentList.querySelectorAll('.time_grouping').length == 0){
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
                                    }); 
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
                        .flatMap(e=>Object.values(e))
                        .sort((a,b) => Number(b.dataset.create_mils) - Number(a.dataset.create_mils))
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

    #emoticonBox = new EmoticonBox();

    #lastEmoticonBoxTarget;

    /*
    this.timerElement.querySelector('.hour').textContent = `${Math.floor( ms / this.hour )}`.padStart(2,'0');
    this.timerElement.querySelector('.minute').textContent = `${Math.floor( ms % this.hour / this.minute )}`.padStart(2,'0');
    this.timerElement.querySelector('.seconds').textContent = `${Math.floor( ms % this.minute / this.second )}`.padStart(2,'0');
    this.timerElement.querySelector('.millisecond').textContent = `${ ms % this.second }`.padStart(2,'0').slice(0, 2);
    */
    constructor(){
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
        chattingHandler.addChattingEventListener = {
            name: 'chattingInfo',
            callBack: (chattingData) => {
                this.createItemElement(chattingData).then(liElement => {
                    this.#addMemory(liElement, chattingData.id)
                    if(roomHandler.roomId != chattingData.roomId){
                        return;
                    }
                    let memory = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId] || {});
                    if(memory && memory.length != 0){
                        this.#page = memory.length - 1;
                        this.#liList = memory.flatMap(e=>Object.values(e))
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
                        },50);
                    }
                    /*
                    this.#elementMap.chattingContentList.prepend(liElement);
                    this.#processingTimeGrouping(
                        this.#liList[0],
                        liElement
                    ).then(() => {
                        if(this.elementMap.chattingContentList.querySelectorAll('.time_grouping').length == 0){
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
                    }); 
                    this.#liList.unshift(liElement);
                    this.#elementMap.chattingContentList.scrollBy(undefined, 
                        9999999
                    )
                    */
                });
            }
        }
        roomHandler.addRoomIdChangeListener = {
            name: 'chattingInfo',
            callBack: () => {
                this.reset();
                let promise;
                /*let memory = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId] || {});
                if(memory && memory.length != 0){
                    this.#page = memory.length - 1;
                    promise = Promise.resolve(
                        memory.flatMap(e=>Object.values(e))
                        .sort((a,b) => Number(b.dataset.create_mils) - Number(a.dataset.create_mils))
                    );
                }else{*/
                    promise = this.callData(this.#page, this.#size, workspaceHandler.workspaceId, roomHandler.roomId)
                    .then(async data=> 
                        this.createPage(data)
                        .then(liList => {       
                            let lastVisibleTarget = liList.at(-1);
                            if(lastVisibleTarget){
                                this.#lastItemVisibleObserver.disconnect();
                                this.#lastItemVisibleObserver.observe(lastVisibleTarget)
                            } 

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
                //}
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
        return new Promise(async resolve => {
            let li = Object.assign(document.createElement('li'), {
            });
            let descriptionWrap = Object.assign(document.createElement('div'),{
                className: 'chatting_content_description_wrapper',
                innerHTML: `
                    <div class="chatting_content_description_profile">
                        <img src="${(await common.getProjectPathPromise())}view/image/user.png"/>
                    </div>
                    <div class="chatting_container">
                        <div class="chatting_content_description_name_wrapper">
                            <div class="chatting_content_description_name">${fullName}</div>
                            <div class="chatting_content_description_time">${this.#processingTimeText(createMils)}</div>
                        </div>
                        <ul class="chatting_reaction_list">
                            <li class="chatting_reaction_item">
                                <button class="chatting_reaction_button">
                                    <span class="chatting_reaction_emoticon">😍</span>
                                    <span class="chatting_reaction_count">125</span>
                                </button>
                            </li>
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
            this.#addMemory(li, id);
            this.#addItemEvent(li, descriptionWrap);
            if( ! prevItemPromise && this.#lastLiItem){
                this.#processingTimeGrouping(li, this.#lastLiItem);
            }else{
               prevItemPromise?.then(prevItem => this.#processingTimeGrouping(li, prevItem));
            }
            this.#lastLiItem = li;
            //resolve(li);
        })
    }

    #addItemEvent(li, descriptionWrap){
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
                <svg class="css-gg-smile" style="zoom:125%;"
                width="1rem"
                height="1rem"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M16 13H14C14 14.1046 13.1046 15 12 15C10.8954 15 10 14.1046 10 13H8C8 15.2091 9.79086 17 12 17C14.2091 17 16 15.2091 16 13Z"
                        fill="currentColor"
                    />
                    <path
                        d="M10 10C10 10.5523 9.55228 11 9 11C8.44772 11 8 10.5523 8 10C8 9.44771 8.44772 9 9 9C9.55228 9 10 9.44771 10 10Z"
                        fill="currentColor"
                    />
                    <path
                        d="M15 11C15.5523 11 16 10.5523 16 10C16 9.44771 15.5523 9 15 9C14.4477 9 14 9.44771 14 10C14 10.5523 14.4477 11 15 11Z"
                        fill="currentColor"
                    />
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z"
                        fill="currentColor"
                    />
                </svg>
                <svg class="css-gg-add" style="zoom:125%;"
                width="0.5rem"
                height="0.5rem"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
                    fill="currentColor"
                />
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7V11H7C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13H11V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13H17C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11H13V7Z"
                    fill="currentColor"
                />
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
                        //this.#emoticonBox.emoticonBox.style.position = 'absolute';
                        //this.#emoticonBox.emoticonBox.style.bottom = '100%';
                        common.processingElementPosition(this.#emoticonBox.emoticonBox, anotherEmoji)
                        this.#emoticonBox.applyCallback = (emoticonObject) => {
                            //emoticonObject
                        }
                    }else{
                        this.#emoticonBox.close();
                        this.#lastEmoticonBoxTarget = undefined;
                    }
                }
            })
            let updateButton = Object.assign(document.createElement('button'), {
                className: 'css-gg-pen',
                innerHTML: `
                <svg style="zoom:125%;"
				width="1rem"
				height="1rem"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg">
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
                `
            })
            let deleteButton = Object.assign(document.createElement('button'),{
                className : `css-gg-trash`,
                innerHTML: `
                <svg style="zoom:125%"
                width="1rem"
                height="1rem"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M17 5V4C17 2.89543 16.1046 2 15 2H9C7.89543 2 7 2.89543 7 4V5H4C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H5V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H17ZM15 4H9V5H15V4ZM17 7H7V18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18V7Z"
                        fill="currentColor"
                    />
                    <path d="M9 9H11V17H9V9Z" fill="currentColor" />
                    <path d="M13 9H15V17H13V9Z" fill="currentColor" />
                </svg>
                `
            })
            recommendEmojiContainer.append(...defaultEmoji.map(e=>{
                let button = document.createElement('button');
                button.textContent = e.emoticon;
                return button;
            }))
            hoverButtonWrapper.append(recommendEmojiContainer, buttonContainer);
            buttonContainer.append(anotherEmoji, updateButton, deleteButton)
            
            descriptionWrap.onmouseenter = (event) => {
                descriptionWrap.append(hoverButtonWrapper);
            }
            let emoticonBoxSearch = this.#emoticonBox.emoticonBox.querySelector('#emoticon-box-search');
            descriptionWrap.onmouseleave = (event) => {
                if(document.activeElement == emoticonBoxSearch){
                    return;
                }
                hoverButtonWrapper.remove();
            }
            resolve();
        })
    }

    #createReactionEmoticon(emoticonObject){
        let li = Object.assign(document.createElement('li'),{
            className: 'chatting_reaction_item'
        });
        let button = Object.assign(document.createElement('button'),{
            className: 'chatting_reaction_button',
            innerHTML: `
                <span class="chatting_reaction_emoticon">${emoticonObject.emoticon}</span>
                <span class="chatting_reaction_count">${emoticonObject.count}</span>
            `,
            onclick: (event) => ()=>{} 
        })
        li.append(button);
        return li;
    }

    #addMemory(data, id){
        if(data.dataset.room_id != roomHandler.roomId || data.dataset.workpsace_id != workspaceHandler.workspaceId){
            return;
        }

        if( ! this.#memory.hasOwnProperty(workspaceHandler.workspaceId)){
            this.#memory[workspaceHandler.workspaceId] = {};
        }
        if( ! this.#memory[workspaceHandler.workspaceId].hasOwnProperty(roomHandler.roomId)){
            this.#memory[workspaceHandler.workspaceId][roomHandler.roomId] = {} ;
        }
        if( ! this.#memory[workspaceHandler.workspaceId][roomHandler.roomId].hasOwnProperty(this.#page)){
            this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][this.#page] = {};
        }

        this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][this.#page][id] = data;
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
}