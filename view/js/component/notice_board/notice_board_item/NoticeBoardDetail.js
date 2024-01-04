import FreeWillEditor from "@handler/editor/FreeWillEditor";
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
import Resources from "@handler/editor/tools/Resources";
import Code from "@handler/editor/tools/Code"
import Hyperlink from "@handler/editor/tools/Hyperlink"

import {workspaceHandler} from "@handler/workspace/WorkspaceHandler";
import {roomHandler} from "@handler/room/RoomHandler";
import common from "@root/js/common"
import PositionChanger from "@handler/PositionChangeer";
import {noticeBoardHandler} from "@handler/notice_board/NoticeBoardHandler";

import { accountHandler } from "@handler/account/AccountHandler";
import { s3EncryptionUtil } from "@handler/S3EncryptionUtil";

export class NoticeBoardLine extends FreeWillEditor{
    static{
        window.customElements.define('notice-board-line', NoticeBoardLine);
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
    
    __parentWrapper;

    constructor(parent){

		super(NoticeBoardLine.tools, NoticeBoardLine.option);

        this.__parentWrapper = parent;
        
        super.placeholder = ''
        super.spellcheck = true
    }

}

export const noticeBoardDetail = new class NoticeBoardDetail{
	#memory = {}

    #element = Object.assign(document.createElement('div'), {
        id: 'notice_board_detail_wrapper',
        innerHTML: `
            <div class="notice_board_detail_container list_scroll list_scroll-y" data-bind_name="noticeBoardDetailContainer">
                <ul class="notice_board_detail_content" data-bind_name="noticeBoardDetailList">
 
                </ul>
                <div class="toolbar" style="position: fixed; z-index: 2000;" data-bind_name="toolbar"></div>
            </div>
        `
    })

	#elementMap = (()=>{
		return 	[...this.#element.querySelectorAll('[data-bind_name]')].reduce((total, element) => {
			total[element.dataset.bind_name] = element;
			return total;
		}, {})
	})();

    #positionChanger;

    /*#prevRange;
    #prevContent;
    #prevStartOffset;
    #prevEndOffset;*/

    constructor(){
        this.#positionChanger = new PositionChanger({wrapper: this.#elementMap.noticeBoardDetailList});
		this.#positionChanger.onDropEndChangePositionCallback = (changeList, {item, target, wrapper}) => {
            window.myAPI.noticeBoard.updateNoticeBoardDetailOrder(
                changeList.map(e=>{
                    return {
                        id: e.dataset.id,
                        workspaceId: e.dataset.workspace_id,
                        roomId: e.dataset.room_id,
                        orderSort: e.dataset.order_sort,
                    }
                })
            ).then(result => {
                console.log(result);
            })
        };

        window.myAPI.event.electronEventTrigger.addElectronEventListener('noticeBoardDetailAccept', (data) => {
            //console.log(data);
            let lastTarget = document.activeElement;
            if(lastTarget.__parentWrapper) lastTarget.dataset.is_update = '';

            let isEventStream
            if(data && data.serverSentStreamType){
                isEventStream = true;
                data = data.content;
            }
            this.createItemElement(data)
            .then(li => {
                this.#addMemory(li, data.workspaceId, data.roomId, data.noticeBoardId, data.id);
                let list = Object.values(this.#memory[data.workspaceId]?.[data.roomId]?.[data.noticeBoardId] || {})
                .sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));
                
                this.#positionChanger.addPositionChangeEvent(list);

                let listObserver = new MutationObserver( (mutationList, observer) => {
                    mutationList.forEach((mutation) => {
                        let {addedNodes, removedNodes} = mutation;
                        let isAddedActiveTarget = [...addedNodes].some(e=> e == lastTarget.__parentWrapper)
                        if( ! isAddedActiveTarget) return;
                        lastTarget.contentEditable = true;
                        let cursorTarget = lastTarget.hasAttribute('is_cursor') ? lastTarget : lastTarget.querySelector('[is_cursor]');
                        if( ! cursorTarget) return;
                        let {'cursor_offset': offset, 'cursor_type': type, 'cursor_index': index, 'cursor_scroll_x': x, 'cursor_scroll_y': y} = cursorTarget.attributes;
                        let selection = window.getSelection();
                        if(type.value == Node.ELEMENT_NODE){
                            let node = cursorTarget.childNodes[index.value]; 
                            selection.setPosition(node, offset.value);
                        }else if(type.value == Node.TEXT_NODE){
                            selection.setPosition(cursorTarget, offset.value);
                        }
                    })
                });
                if(lastTarget && lastTarget.__parentWrapper){   
                    listObserver.observe(this.#elementMap.noticeBoardDetailList, {childList:true});
                }

                this.#elementMap.noticeBoardDetailList.replaceChildren(...list);

                let appendAwait = setInterval(()=>{
                    if( ! li.isConnected){
                        return;
                    }
                    clearInterval(appendAwait);
                    listObserver.disconnect();
                    lastTarget.removeAttribute('data-is_update');
                }, 50)
            })
        })

        this.#elementMap.noticeBoardDetailList
        noticeBoardHandler.addNoticeBoardIdChangeListener = {
            name: 'noticeBoardDetailIdChange',
            callback: (handler, data)=>{
                this.#elementMap.noticeBoardDetailList.replaceChildren();
                this.refresh();
                /*if(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[noticeBoardHandler.noticeBoardId]){
                    this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][noticeBoardHandler.noticeBoardId] = {};
                }*/
            }
        }

        let toolList = Object.values(NoticeBoardLine.tools).map(e=>e.toolHandler.toolButton);

        document.addEventListener('selectionchange', event => {
            if(document.activeElement.constructor != NoticeBoardLine){
                return;
            }
            let selection = window.getSelection();
            if (selection.rangeCount == 0){
                return;
            }
            
            /*let range = selection.getRangeAt(0);

            this.#prevRange = range.cloneRange();
            this.#prevStartOffset = range.startOffset;
            this.#prevEndOffset = range.endOffset;
            this.#prevContent = range.commonAncestorContainer;*/

            if( ! selection.isCollapsed){
                this.#elementMap.noticeBoardDetailContainer.append(this.#elementMap.toolbar);
                this.#elementMap.toolbar.replaceChildren(...toolList);
                common.processingElementPosition(this.#elementMap.toolbar, window.getSelection().getRangeAt(0).getBoundingClientRect())
            }else{
                this.#elementMap.toolbar.remove();
            }
        })
        this.#elementMap.noticeBoardDetailContainer.addEventListener("scroll", () => {
			if(this.#elementMap.toolbar.childElementCount == 0)return;
			common.processingElementPosition(this.#elementMap.toolbar, window.getSelection().getRangeAt(0).getBoundingClientRect());
		});
        window.addEventListener('resize', (event) => {
			if(this.#elementMap.toolbar.childElementCount == 0)return;
            common.processingElementPosition(this.#elementMap.toolbar, window.getSelection().getRangeAt(0).getBoundingClientRect());
		})
    }

    createItemElement(data){
        return new Promise(resolve=>{
            let li = Object.assign(document.createElement('li'),{
                className : 'notice_board_detail_item'
            });
            li.dataset.is_not_visible_target = '';
            li.style.minHeight = (parseInt(window.getComputedStyle(document.body).fontSize) || 16) * 2 + 'px';
            
            resolve(this.#addItemEvent(li, data));
        })
    }

    #addItemEvent(li, data){
        return new Promise(resolve=> {
            let addButton = Object.assign(document.createElement('button'), {
                className: 'notice_board_detail_item_add_content',
                textContent: '+'
            });
            let editor = new NoticeBoardLine(li);
            let positionChangeIcon = Object.assign(document.createElement('span'),{
                className: 'notice_board_detail_item_position_change_icon pointer',
                textContent: '〓'
            })

            let datasetPromise = common.jsonToSaveElementDataset(data, li);
            //console.log(data.content);
            if(data.content){
                let {content} = data;
                delete data.content;
                datasetPromise.then(() => {
                    li.removeAttribute('data-content');
                    
                    NoticeBoardLine.parseLowDoseJSON(editor, content).then(() => {
                        editor.contentEditable = false;
                        li.append(editor);
                        let appendAwait = setInterval(()=>{
                            if( ! editor.isConnected) return;
                            clearInterval(appendAwait);
                            if(editor.isEmpty){
                                editor.remove();
                                li.prepend(addButton);
                            }
                            /*if( ! editor.isEmpty){
                                li.append(positionChangeIcon)
                            }else {
                                editor.remove();
                                li.prepend(addButton);
                            }*/
                        },50)
                    })
                })
            }else{
                li.prepend(addButton);
                editor.startFirstLine();
            }
            li.onmouseenter = () => {
                if(addButton.isConnected){
                    addButton.classList.add('active');
                    return;
                }
                li.draggable = false;
                if( ! editor.isEmpty){
                    li.append(positionChangeIcon)
                }
            }
            li.onmouseleave = () => {
                if(addButton.isConnected){
                    addButton.classList.remove('active');
                    return;
                }
                if(positionChangeIcon.isConnected){
                    positionChangeIcon.remove();
                }
            }
            //let isPositionChangeIconOver = false;
            positionChangeIcon.onmousemove = () => {
                li.draggable = true;
            }
            positionChangeIcon.onmouseover = () => {
                //isPositionChangeIconOver = true;
                li.draggable = true;
            }
            positionChangeIcon.onmouseout = () => {
                //isPositionChangeIconOver = false;
                li.draggable = false;
            }

            addButton.onclick = (event) => {
                //console.log(event, editor.isConnected);
                editor.contentEditable = true;
                editor.firstLine.innerText = '\n'
                if(editor.isConnected){
                    return;
                }
                li.append(editor);
                li.append(positionChangeIcon);
                addButton.remove();
                window.getSelection().setPosition(editor, editor.childNodes.length);
            }
            let prevText;
            editor.onclick = () => {
                if(editor.contentEditable == 'false'){
                    editor.contentEditable = true;
                    if(editor.isEmpty){
                        editor.firstLine.innerText = '\n'
                    }
                    window.getSelection().setPosition(editor, editor.childNodes.length);
                }
            }
            editor.onfocus = (event) => {
                prevText = editor.innerHTML;
            }
            let isScriptBlur = false;
            editor.onblur = (event) => {
                if( ! isScriptBlur && (
                        editor.matches(':hover') || 
                        this.#elementMap.toolbar.matches(':hover') || 
                        document.activeElement == editor ||
                        editor.hasAttribute('data-is_update')
                    )
                ){
                    event.preventDefault();
                    return;
                }
                if(isScriptBlur){
                    isScriptBlur = ! isScriptBlur;
                }
                this.#elementMap.toolbar.remove();
                editor.contentEditable = false;
                if( ! event.relatedTarget?.hasAttribute('data-tool_status')){
                    this.#elementMap.toolbar.remove();
                }
                if(editor.isEmpty){
                    editor.replaceChildren();
                    editor.remove();
                    positionChangeIcon.remove();
                    li.prepend(addButton);
                    if(li.matches(':hover')){
                        addButton.classList.add('active');
                    }else{
                        addButton.classList.remove('active');
                    }
                    //return ;
                }else if(prevText == editor.innerHTML){
                    return;
                }
                prevText = editor.innerHTML;
                
                let param = {
                    id: li.dataset.id,
                    noticeBoardId: noticeBoardHandler.noticeBoardId,
                    roomId: roomHandler.roomId,
                    workspaceId: workspaceHandler.workspaceId,
                    orderSort: li.dataset.order_sort //([...this.#elementMap.noticeBoardDetailList.children].findIndex(e=>e==li) - 1) * -1,
                };
                this.#uploadNoticeBoard(editor, param);
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
                }else if(key == 'Enter'){// && editor.innerText.replaceAll('\n', '') != ''){
                    event.preventDefault();
                    isScriptBlur = true;
                    editor.blur();
                }
            }

            resolve(li);
        });
    }

    /**
     * 
     * @param {NoticeBoardLine} editor 
     * @param {Object} param
     */
    async #uploadNoticeBoard(editor, param){
        let promiseList = [];

        editor.contentEditable = false;
        NoticeBoardLine.getLowDoseJSON(editor, {
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
                console.log(node, file);
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
                    let putSignData = `${roomHandler.roomId}:${workspaceHandler.workspaceId}:${name}:${accountHandler.accountInfo.accountName}`;
                    let isUpload = await s3EncryptionUtil.callS3PresignedUrl(window.myAPI.s3.generateSecurityPutObjectPresignedUrl, putSignData, {newFileName, fileType, uploadType: 'NOTICE'})
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
                    console.log(isUpload);
                    if( ! isUpload){
                        resolve();
                        return;
                    }
                    let getSignData = `${roomHandler.roomId}:${workspaceHandler.workspaceId}:${json.data.new_file_name}:${accountHandler.accountInfo.accountName}`;
                    
                    s3EncryptionUtil.callS3PresignedUrl(window.myAPI.s3.generateSecurityGetObjectPresignedUrl, getSignData, {fileType, uploadType: 'NOTICE'})
                    .then( (result) => {
                        if(! result){
                            return;
                        }
                        let {data, encDncKeyPair} = result;

                        json.data.url = data.presignedUrl;
                        delete json.data.base64
                        json.data.upload_type = 'NOTICE';
                        resolve(json);
                    })
                }))
            }
        }).then(jsonList => {

            param.content = JSON.stringify(jsonList);
            if(param.content.length == 0) param.content = undefined
            window.myAPI.noticeBoard.createNoticeBoardDetail(param).then(res=>{
                let {data} = res
                this.innerText = '';
                Promise.all(promiseList).then((fileTargetList) => {
                    console.log(fileTargetList);
                    if(fileTargetList.length == 0){
                        //window.getSelection().setPosition(this, 1)
                        return;
                    }
                    fileTargetList.forEach(e=>{
                        delete e.data.is_loading
                        e.data.is_upload_end = '';
                        e.data.room_id = param.roomId;
                        e.data.workspace_id = param.workspaceId;
                    });
                    param.content = JSON.stringify(jsonList);
                    if(param.content.length == 0) param.content = undefined
                    window.myAPI.noticeBoard.createNoticeBoardDetail(param).then(response=>{
                        //window.getSelection().setPosition(this, 1)
                    });
                })
            });
            
        })
    }

    #callData(){
        return window.myAPI.noticeBoard.searchNoticeBoardDetailList({
            workspaceId: workspaceHandler.workspaceId, 
            roomId: roomHandler.roomId,
            noticeBoardId : noticeBoardHandler.noticeBoardId
        })
    }

    #addMemory(data, workspaceId, roomId, noticeBoardId, id){
		if( ! this.#memory.hasOwnProperty(workspaceId)){
			this.#memory[workspaceId] = {};
		}
		if( ! this.#memory[workspaceId].hasOwnProperty(roomId)){
			this.#memory[workspaceId][roomId] = {} ;
		}
        if( ! this.#memory[workspaceId][roomId].hasOwnProperty(noticeBoardId)){
            this.#memory[workspaceId][roomId][noticeBoardId] = {}
        }
        
        this.#memory[workspaceId][roomId][noticeBoardId][id] = data;
		
    }
    async refresh(){
        let list = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[noticeBoardHandler.noticeBoardId] || {})
        .sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));
        if(list.length == 0){
            this.#callData();
            return;
        }
        this.#positionChanger.addPositionChangeEvent(list);
        this.#elementMap.noticeBoardDetailList.replaceChildren(...list);  

	}

	get element(){
		return this.#element;
	}
	
	get elementMap(){
		return this.#elementMap;
	}
}