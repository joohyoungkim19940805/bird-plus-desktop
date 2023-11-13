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
    static{
        
        window.addEventListener('load', async () => {
            let accountInfo = (await window.myAPI.account.getAccountInfo()).data;

            const imageOrVidepCallback = (targetTools) => {
                this.callS3PresignedUrl(window.myAPI.s3.generateGetObjectPresignedUrl, targetTools.dataset.new_file_name, accountInfo.accountName)
                .then( (result) => {
                    if(! result){
                        return;
                    }
                    let {data, encDncKeyPair} = result;
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
                        return fetch(data.presignedUrl, {
                            method:"GET",
                            headers: {
                                'Content-Encoding' : 'base64',
                                'Content-Type' : 'application/octet-stream',
                                'x-amz-server-side-encryption-customer-algorithm': 'AES256',
                                'x-amz-server-side-encryption-customer-key': k,
                                'x-amz-server-side-encryption-customer-key-md5': m,
                            }
                        }).then(async response=> {
                            if(response.status != 200 && response.status != 201){
                                throw new Error('s3 connect failed')
                            }
                            return response.body;
                        }).then((body) => {
                            const reader = body.getReader();
                            return new ReadableStream(
                                {
                                    start(controller) {
                                        return pump();
                                        function pump() {
                                            return reader.read().then(({ done, value }) => {
                                                // When no more data needs to be consumed, close the stream
                                                if (done) {
                                                    controller.close();
                                                    return;
                                                }
                                                // Enqueue the next data chunk into our target stream
                                                controller.enqueue(value);
                                                return pump();
                                            });
                                        }
                                    },
                                }
                            );
                            /*
                            let newBlob = new Blob([buffer], { type: imageEditor.dataset.content_type });
                            let imgUrl = URL.createObjectURL(newBlob);
                            */
                        })
                        .then(stream => new Response(stream))
                        .then(res => res.blob())
                        .then(blob => URL.createObjectURL(blob))
                        .then(url => {
                            targetTools.dataset.url = url;
                            if(targetTools.image){
                                targetTools.image.src = url;
                            }else{
                                targetTools.video.src = url;
                            }
                        })
                        .catch(err=>{
                            console.error(err);
                        })
                    
                    })
                })
            }

            Image.customImageCallback = (imageEditor) => imageOrVidepCallback(imageEditor)
            Video.customVideoCallback = (videoEditor) => imageOrVidepCallback(videoEditor)
            
        })
    }
    static mergeUint8Arrays(oneArr = [], twoArr = []){
        let result = new Uint8Array(oneArr.length + twoArr.length);
        result.set(oneArr);
        result.set(twoArr, oneArr.length);
        return result;
    }
    
    static async callS3PresignedUrl(callFunction, fileName, accountName){
		return Promise.all( [s3EncryptionUtil.generateKeyPair(s3EncryptionUtil.signAlgorithm, ["sign", "verify"]), s3EncryptionUtil.generateKeyPair(s3EncryptionUtil.secretAlgorithm, ["encrypt", "decrypt"])] )
		.then( ([signKeyPair, encDncKeyPair]) => {
			return Promise.all( [
				s3EncryptionUtil.exportKey('spki', signKeyPair.publicKey),
				s3EncryptionUtil.exportKey('spki', encDncKeyPair.publicKey), 
				Promise.resolve(encDncKeyPair), 
				Promise.resolve(signKeyPair)
			] )		
		}).then( async ([exportSignKey, exportEncKey, encDncKeyPair, signKeyPair]) => {

			let signData = await s3EncryptionUtil.keySign(
				`${roomHandler.roomId},${workspaceHandler.workspaceId},${fileName},${accountName},${exportEncKey}}`, 
				signKeyPair.privateKey
			)
			
			let result = await callFunction({
				data: window.btoa(String.fromCodePoint(...signData.message)), 
				dataKey: exportSignKey, 
				sign: window.btoa( String.fromCodePoint(...new Uint8Array(signData.signature)) ), 
				uploadType: 'CHATTING'
			})
			let {code, data} = result;
			
			if(code != 0){
				return ;
			}
			
			return {data, encDncKeyPair};
		})
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
            let content = new ChattingInfoLine();
            content.parseLowDoseJSON(chatting).then((e)=>{
                resolve(li)
            });
            li.append(content);
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