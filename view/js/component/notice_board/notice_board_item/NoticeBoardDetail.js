import FreeWillEditor from "./../../../handler/editor/FreeWillEditor";
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

import workspaceHandler from "../../../handler/workspace/WorkspaceHandler";
import roomHandler from "../../../handler/room/RoomHandler";
import common from "./../../../common"
import PositionChanger from "../../../handler/PositionChangeer";
import noticeBoardHandler from "../../../handler/notice_board/NoticeBoardHandler";

import { accountHandler } from "../../../handler/account/AccountHandler";
import { s3EncryptionUtil } from "../../../handler/S3EncryptionUtil";
import { rsqrt } from "@tensorflow/tfjs";

class NoticeBoardLine extends FreeWillEditor{
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
        Code,
        Hyperlink,
    ]

    static option = {
        isDefaultStyle : true
    }
    
    parentLi;
    parentClass;
    constructor(parentLi, parentClass){

		super(NoticeBoardLine.tools, NoticeBoardLine.option);

        this.parentLi = parentLi;
        this.parentClass = parentClass;
        
        super.placeholder = ''
        super.spellcheck = true
    }

}

export default new class NoticeBoardDetail{
	#memory = {}

    #element = Object.assign(document.createElement('div'), {
        id: 'notice_board_detail_wrapper',
        innerHTML: `
            <div class="notice_board_detail_container list_scroll list_scroll-y" data-bind_name="noticeBoardDetailContainer">
                <ul class="notice_board_detail_content" data-bind_name="noticeBoardDetailList">
 
                </ul>
            <div class="toolbar" style="position: fixed;" data-bind_name="test"></div>
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
    
    #defaultEmptyLine = 20;

    #prevRange;
    #prevContent;
    #prevStartOffset;
    #prevEndOffset;

    constructor(){
        this.#positionChanger = new PositionChanger({wrapper: this.#elementMap.noticeBoardDetailList});
		this.#positionChanger.onDropEndChangePositionCallback = (changeList, {item, target, wrapper}) => {
            window.myAPI.noticeBoard.updateNoticeBoardDetailOrder(
                changeList.filter(e=> ! e.hasAttribute('data-is_empty')).map(e=>{
                    return {
                        id: e.dataset.id,
                        workspaceId: e.dataset.workspace_id,
                        roomId: e.dataset.room_id,
                        orderSort: e.dataset.order_sort,
                        emptyLineCount: this.#mathEmptyLineCount(e, 'notice-board-line')
                    }
                })
            ).then(result => {
                console.log(result);
            })
        };
        window.myAPI.event.electronEventTrigger.addElectronEventListener('noticeBoardDetailAccept', (data) => {
            this.createItemElement(data)
            .then(li => {
                this.#addMemory(li);
            }).then( async () => {

                let list = (await Promise.all(Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[noticeBoardHandler.noticeBoardId] || {})
                    .map(async (item, i)=> {
                        //let weight = i + 1;
                       
                        let result = await Promise.all([...new Array(Number(item.dataset.empty_line_count || 0))]
                            .map((e,j)=> {
                                return this.createItemElement(e, Number(item.dataset.order_sort) + j).then(emptyItem=>{
                                    console.log(emptyItem);
                                    emptyItem.dataset.connect_target_id = item.dataset.id;
                                    return emptyItem;
                                })
                            })
                        )
                        result.push(item);
                        return result;
                    })
                ))
                .flatMap(e=>e)
                .sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));
                let firstEmptyLineLength = ( 
                    window.outerHeight / ( (parseInt(window.getComputedStyle(document.body).fontSize) || 16) * 2 ) 
                ) - list.length - this.#elementMap.noticeBoardDetailList.childElementCount
                
                if(firstEmptyLineLength < 1){
                    firstEmptyLineLength = this.#defaultEmptyLine;
                }

                Promise.all([...new Array(parseInt(firstEmptyLineLength))]
                    .map((e, i) => this.createItemElement(e, Number(list[list.length - 1]?.dataset.order_sort || 0) - i - 2)) 
                )
                .then(emptyList =>{
                    let totalList = [...list, ...emptyList];
                    this.#positionChanger.addPositionChangeEvent(totalList);
                    this.#elementMap.noticeBoardDetailList.replaceChildren(...totalList);    
                });
            })
        })
        
        noticeBoardHandler.addNoticeBoardIdChangeListener = {
            name: 'noticeBoardDetailIdChange',
            callBack: (handler, data)=>{
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
            let range = selection.getRangeAt(0);
            if(range.commonAncestorContainer.nodeType != Node.TEXT_NODE){
                return;
            }
            
            this.#prevRange = range.cloneRange();
            this.#prevStartOffset = range.startOffset;
            this.#prevEndOffset = range.endOffset;
            this.#prevContent = range.commonAncestorContainer;

            if( ! selection.isCollapsed){
                this.#elementMap.noticeBoardDetailContainer.append(this.#elementMap.test);
                this.#elementMap.test.replaceChildren(...toolList);
                common.processingElementPosition(this.#elementMap.test ,document.activeElement)
            }else{
                this.#elementMap.test.remove();
            }
        })

    }

    createItemElement(data, emptyIndex){
        if(data && data.serverSentStreamType){
            data = data.content;
        }
        return new Promise(resolve=>{
            let li = Object.assign(document.createElement('li'),{
                className : 'notice_board_detail_item'
            });
            li.dataset.is_not_visible_target = '';
            if(! data) li.dataset.order_sort = emptyIndex + 1; 
            li.style.minHeight = (parseInt(window.getComputedStyle(document.body).fontSize) || 16) * 2 + 'px';
            this.#addItemEvent(li, data);
            
            resolve(li);
        })
    }

    #addItemEvent(li, data){

        return new Promise(resolve=> {
            let addButton = Object.assign(document.createElement('button'), {
                className: 'notice_board_detail_item_add_content',
                textContent: '+'
            });
            let editor = new NoticeBoardLine(li, this);
            editor.contentEditable = false;
            editor.classList.add('pointer');
            let positionChangeIcon = Object.assign(document.createElement('span'),{
                className: 'notice_board_detail_item_position_change_icon pointer',
                textContent: '〓'
            })
            
            if(! data){
                li.append(addButton);
                li.dataset.is_empty = '';
                editor.startFirstLine();
            }else{
                let {content} = data;
                delete data.content;
                common.jsonToSaveElementDataset(data, li).then(() => {
                    li.append(editor);
                    li.append(positionChangeIcon)
                    editor.parseLowDoseJSON(content)
                })
            }

            li.onmouseenter = () => {
                if(addButton.isConnected){
                    addButton.classList.add('active');
                    return;
                }
                li.draggable = false;
            }
            li.onmouseleave = () => {
                if(addButton.isConnected){
                    addButton.classList.remove('active');
                    return;
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
            //li.onpointerdown = (event) => {
                //console.log(isPositionChangeIconOver);
                //if(isPositionChangeIconOver || ! editor.isConnected){
                //    return;
                //}
                //li.setPointerCapture(event.pointerId);
            //}
            //li.onpointerup = (event) => {
                //li.releasePointerCapture(event.pointerId);
            //}
            /*
            li.__dragendCallback = () => {
                let selection = window.getSelection()
                let range = selection.getRangeAt(0);
                if(this.#prevRange){
                    range.setEnd(this.#prevContent, this.#prevEndOffset);
                    range.setStart(this.#prevContent, this.#prevStartOffset);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }else{
                    selection.setPosition(editor, editor.childNodes.length);
                }
            }
            */
            addButton.onclick = (event) => {
                console.log(event, editor.isConnected);
                editor.contentEditable = true;
                editor.classList.remove('pointer');
                editor.firstLine.innerText = '\n'
                if(editor.isConnected){
                    return;
                }
                li.append(editor);
                console.log('append end');
                li.append(positionChangeIcon);
                addButton.remove();
                window.getSelection().setPosition(editor, editor.childNodes.length);
            }
            let prevText;
            editor.onclick = () => {
                if(editor.contentEditable == 'false'){
                    editor.classList.remove('pointer')
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
            editor.onblur = (event) => {
                if(editor.matches(':hover') || this.#elementMap.test.matches(':hover') || document.activeElement == editor){
                    return;
                }
                editor.contentEditable = false;
                editor.classList.add('pointer');
                if( ! event.relatedTarget?.hasAttribute('data-tool_status')){
                    this.#elementMap.test.remove();
                }
                if(editor.isEmpty){
                    editor.remove();
                    positionChangeIcon.remove();
                    li.append(addButton);
                    if(li.matches(':hover')){
                        addButton.classList.add('active');
                    }else{
                        addButton.classList.remove('active');
                    }
                    return ;
                }else if(prevText == editor.innerHTML){
                    return;
                }
                prevText = editor.innerHTML;

                let emptyLineCount = this.#mathEmptyLineCount(li, 'notice-board-line')
                let param = {
                    id: li.dataset.id,
                    noticeBoardId: noticeBoardHandler.noticeBoardId,
                    roomId: roomHandler.roomId,
                    workspaceId: workspaceHandler.workspaceId,
                    emptyLineCount,
                    orderSort: li.dataset.order_sort //([...this.#elementMap.noticeBoardDetailList.children].findIndex(e=>e==li) - 1) * -1,
                };
                li.dataset.empty_line_count = emptyLineCount;
                
                this.#uploadNoticeBoard(editor, param);

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
        let accountInfo = (await accountHandler.accountInfo);
        editor.contentEditable = false;
        editor.getLowDoseJSON(editor, {
            afterCallback: (json) => {
                if(json.tagName != Image.toolHandler.defaultClass && json.tagName != Video.toolHandler.defaultClass){
                    return;
                }
                promiseList.push(new Promise(async resolve => {

                    let {name, size, lastModified, contentType, newFileName} = await common.underbarNameToCamelName(json.data);
                    console.log(json.data, json.data.new_file_name);
                    let putSignData = `${roomHandler.roomId}:${workspaceHandler.workspaceId}:${name}:${accountInfo.accountName}`;
                    let isUpload = await s3EncryptionUtil.callS3PresignedUrl(window.myAPI.s3.generatePutObjectPresignedUrl, putSignData, 'NOTICE', {newFileName})
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
                            let base64 = json.data.base64;
                            if(! base64){
                                let blob = await fetch(json.data.url).then(res=>res.blob())
                                base64 = await new Promise(resolve => {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(blob);
                                    reader.onloadend = () => {
                                        resolve(reader.result);
                                    }
                                });
                            }
                            let res = await s3EncryptionUtil.fetchPutObject(data.presignedUrl, k, m, base64);
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
                    let getSignData = `${roomHandler.roomId}:${workspaceHandler.workspaceId}:${json.data.new_file_name}:${accountInfo.accountName}`;
                    
                    s3EncryptionUtil.callS3PresignedUrl(window.myAPI.s3.generatePutObjectPresignedUrl, getSignData, 'NOTICE')
                    .then( (result) => {
                        if(! result){
                            return;
                        }
                        let {data, encDncKeyPair} = result;

                        json.data.url = data.presignedUrl;
                        delete json.data.base64;
                        json.data.upload_type = 'NOTICE';
                        resolve(json);
                    })
                }))
            }
        }).then(jsonList => {
            param.content = JSON.stringify(jsonList);
            console.log(param);
            Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[noticeBoardHandler.noticeBoardId] || {}).forEach(e=>{
                e.dataset.empty_line_count = this.#mathEmptyLineCount(e, 'notice-board-line');
            })
            window.myAPI.noticeBoard.createNoticeBoardDetail(param).then(res=>{
                let {data} = res
                this.innerText = '';
                Promise.all(promiseList).then((fileTargetList) => {
                    if(fileTargetList.length == 0){
                        //editor.contentEditable = true;
                        return;
                    }
                    fileTargetList.forEach(e=>e.data.target_id = data.id);
                    param.id = data.id;
                    param.content = JSON.stringify(jsonList);
                    window.myAPI.noticeBoard.createNoticeBoardDetail(param).then(response=>{
                        //editor.contentEditable = true;
                        console.log('response', response)
                    });
                })
            });
        })
    }

    #mathEmptyLineCount(target, standardQuerySelectorName){
        let emptyLineCount = 0;
        let prevItem = target.previousElementSibling;
        
        while(prevItem){
            let prevContent = prevItem.querySelector(standardQuerySelectorName);
            if(! prevContent){
                emptyLineCount += 1;
                prevItem = prevItem.previousElementSibling;
            }else {
                break;    
            }
        }
        return emptyLineCount
    }

    #callData(){
        return window.myAPI.noticeBoard.searchNoticeBoardDetailList({
            workspaceId: workspaceHandler.workspaceId, 
            roomId: roomHandler.roomId,
            noticeBoardId : noticeBoardHandler.noticeBoardId
        })
    }

    #addMemory(data){
		if( ! this.#memory.hasOwnProperty(workspaceHandler.workspaceId)){
			this.#memory[workspaceHandler.workspaceId] = {};
		}
		if( ! this.#memory[workspaceHandler.workspaceId].hasOwnProperty(roomHandler.roomId)){
			this.#memory[workspaceHandler.workspaceId][roomHandler.roomId] = {} ;
		}
        if( ! this.#memory[workspaceHandler.workspaceId][roomHandler.roomId].hasOwnProperty(noticeBoardHandler.noticeBoardId)){
            this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][noticeBoardHandler.noticeBoardId] = {}
        }
        
        this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][noticeBoardHandler.noticeBoardId][data.dataset.id] = data;
		
    }
    async refresh(){
        let list = (
            await Promise.all(
                Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[noticeBoardHandler.noticeBoardId] || {})
                .map(async (item, i)=> {
                    //let weight = i + 1;
                    let result = await Promise.all(
                        [...new Array(Number(item.dataset.empty_line_count || 0))].map((e,j)=> {
                            return this.createItemElement(e, Number(item.dataset.order_sort) + j).then(emptyItem=>{
                                emptyItem.dataset.connect_target_id = item.dataset.id;
                                return emptyItem;
                            })
                        })
                    )
                    result.push(item);
                    return result;
                })
            )
        ).flatMap(e=>e)
        .sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));
        if(list.length == 0){
            this.#callData();
        }
        let dataCount = list.length;
        
        let firstEmptyLineLength = ( 
            window.outerHeight / ( (parseInt(window.getComputedStyle(document.body).fontSize) || 16) * 2 ) 
        ) - dataCount - this.#elementMap.noticeBoardDetailList.childElementCount
        
        if(firstEmptyLineLength < 1){
            firstEmptyLineLength = this.#defaultEmptyLine;
        }

        Promise.all([...new Array(parseInt(firstEmptyLineLength))]
            .map((e, i) => this.createItemElement(e, Number(list[list.length - 1]?.dataset.order_sort || 0) - i - 2)) 
        )
        .then(emptyList =>{
            let totalList = [...list, ...emptyList];
            this.#positionChanger.addPositionChangeEvent(totalList);
            this.#elementMap.noticeBoardDetailList.replaceChildren(...totalList);    
        });
	}

	get element(){
		return this.#element;
	}
	
	get elementMap(){
		return this.#elementMap;
	}
}