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
class NoticeBoardLine extends FreeWillEditor{
    static{
        window.customElements.define('notice-board-line', NoticeBoardLine);
    }
	static tools = {
        'free-will-strong' : Strong,
        'free-will-color' : Color,
        'free-will-background' : Background,
        'free-will-strikethrough' : Strikethrough,
        'free-will-underline' : Underline,
        'free-will-font-family' : FontFamily,
        'free-will-font-quote' : Quote,
        'free-will-numeric-point' : NumericPoint,
        'free-will-bullet-point' : BulletPoint,
        'free-will-sort' : Sort,
        'free-will-editor-font-size' : FontSize,
        'free-will-editor-italic' : Italic,
        'free-will-editor-image' : Image,
        'free-will-editor-video' : Video,
        'free-will-editor-code' : Code,
        'free-will-editor-link' : Hyperlink,
    }

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
        super.contentEditable = true;
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

        };
        window.myAPI.event.electronEventTrigger.addElectronEventListener('noticeBoardDetailAccept', (data) => {
            this.createItemElement(data)
            .then(li => {
                this.#addMemory(li);
            }).then( async () => {
                console.log(data);
                let list = (await Promise.all(Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[noticeBoardHandler.noticeBoardId] || {})
                    .map(async item=> {
                        let result = await Promise.all([...new Array(Number(item.dataset.empty_line_count || 0))]
                            .map((e,i)=> this.createItemElement(e, Number(item.dataset.order_sort) + i )));
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
            let positionChangeIcon = Object.assign(document.createElement('span'),{
                className: 'notice_board_detail_item_position_change_icon',
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
            let isPositionChangeIconOver = false;
            positionChangeIcon.onmousemove = () => {
                li.draggable = true;
            }
            positionChangeIcon.onmouseover = () => {
                isPositionChangeIconOver = true;
                li.draggable = true;
            }
            positionChangeIcon.onmouseout = () => {
                isPositionChangeIconOver = false;
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
                if(editor.isConnected){
                    return;
                }
                li.append(editor);
                console.log('append end');
                li.append(positionChangeIcon);
                addButton.remove();
                window.getSelection().setPosition(editor, editor.childNodes.length);
            }
            let prevHTML;
            editor.onfocus = (event) => {
                prevHTML = editor.innerHTML;
            }
            editor.onblur = (event) => {
                if(editor.matches(':hover') || this.#elementMap.test.matches(':hover')){
                    return;
                }
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
                }else if(prevHTML == editor.innerHTML){
                    return;
                }
                

                let emptyLineCount = 0;
                let prevItem = li.previousElementSibling;
                
                let i = 0;
                while(prevItem){
                    let prevContent = prevItem.querySelector('notice-board-line');
                    if(! prevContent){
                        emptyLineCount += 1;
                        prevItem = prevItem.previousElementSibling;
                    }else {
                        break;    
                    }

                    i += 1;
                    if(i > 1000){
                        console.error('while infiniti loop error ::: addItemEvent');
                        break;
                    }
                }
                editor.getLowDoseJSON().then(jsonList => {
                    window.myAPI.noticeBoard.createNoticeBoardDetail({
                        id : li.dataset.id,
                        noticeBoardId: noticeBoardHandler.noticeBoardId,
                        roomId: roomHandler.roomId,
                        workspaceId: workspaceHandler.workspaceId,
                        emptyLineCount,
                        orderSort: [...this.#elementMap.noticeBoardDetailList.children].reverse().findIndex(e=>e==li) - Math.abs(Number(this.#elementMap.noticeBoardDetailList.lastElementChild.dataset.order_sort) || 0),
                        content : JSON.stringify(jsonList)
                    })
                })

            }

            resolve(li);
        });
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
        let list = (await Promise.all(Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[noticeBoardHandler.noticeBoardId] || {})
            .map(async item=> {
                let result = await Promise.all([...new Array(Number(item.dataset.empty_line_count || 0))]
                    .map((e,i)=> this.createItemElement(e, Number(item.dataset.order_sort) + i) ));
                result.push(item);
                return result;
            })
        )).flatMap(e=>e)
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