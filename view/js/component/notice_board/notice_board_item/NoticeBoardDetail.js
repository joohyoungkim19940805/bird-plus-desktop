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
class NoticdeBoardLine extends FreeWillEditor{
    static{
        window.customElements.define('notice-board-line', NoticdeBoardLine);
    }
    static tools = {
        'free-will-strong' : Strong,
    }
    static option = {
        isDefaultStyle : true
    }
    static toolbarWrapper = [
        Strong.toolHandler.toolButton
    ];
    
    parentLi;
    parentClass;
    constructor(parentLi, parentClass){

		super(NoticdeBoardLine.tools, NoticdeBoardLine.option);

        this.parentLi = parentLi;
        this.parentClass = parentClass;
        
        super.placeholder = ''
        super.spellcheck = true
        super.contentEditable = true;
    }

	connectedCallback(){
        super.connectedCallback();
        Promise.all([...new Array(Number(this.parentLi.dataset.empty_line_count || 0))].map(e=> this.parentClass.createItemElement(e))).then(emptyList => {
            this.parentLi.before(...emptyList);
        })
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

    constructor(){
        this.#positionChanger = new PositionChanger({wrapper: this.#elementMap.noticeBoardDetailList});
		this.#positionChanger.onDropEndChangePositionCallback = (changeList, {item, target, wrapper}) => {

        };

        noticeBoardHandler.addNoticeBoardAcceptListener = {
            name: 'noticeBoardDetailAccept',
            callBack: (handler, data)=>{
                this.createItemElement(data)
                .then(li => {
                    this.#addMemory(li);
                }).then( () => {
                    let list = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[noticeBoardHandler.noticeBoardId] || {})
                    .sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));
                    let firstEmptyLineLength = ( 
                        window.outerHeight / ( (parseInt(window.getComputedStyle(document.body).fontSize) || 16) * 2 ) 
                    ) - list.length - this.#elementMap.noticeBoardDetailList.childElementCount
                    
                    if(firstEmptyLineLength < 1){
                        firstEmptyLineLength = this.#defaultEmptyLine;
                    }

                    Promise.all( [...new Array(parseInt(firstEmptyLineLength))].map(e=> this.createItemElement(e)) ).then(emptyList =>{
                        this.#elementMap.noticeBoardDetailList.replaceChildren(...list, ...emptyList);    
                    });
                })
            },
            runTheFirst: false
        }
        noticeBoardHandler.addNoticeBoardAcceptEndListener = {
            name: 'noticeBoardDetailAcceptEndCallback',
            callBack: (handler, data)=>{
                let list = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[noticeBoardHandler.noticeBoardId] || {})
                .sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));

                let dataCount = list.length;
                
                let firstEmptyLineLength = ( 
                    window.outerHeight / ( (parseInt(window.getComputedStyle(document.body).fontSize) || 16) * 2 ) 
                ) - dataCount - this.#elementMap.noticeBoardDetailList.childElementCount
                if(firstEmptyLineLength < 1){
                    firstEmptyLineLength = this.#defaultEmptyLine;
                }

                Promise.all( [...new Array(parseInt(firstEmptyLineLength))].map(e=> this.createItemElement(e)) ).then(emptyList =>{

                    this.#elementMap.noticeBoardDetailList.replaceChildren(...list, ...emptyList);    
                });
            },
            runTheFirst: false
        }
        
        noticeBoardHandler.addNoticeBoardIdChangeListener = {
            name: 'noticeBoardDetailIdChange',
            callBack: (handler, data)=>{
                this.#elementMap.noticeBoardDetailList.replaceChildren();
                /*if(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[noticeBoardHandler.noticeBoardId]){
                    this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][noticeBoardHandler.noticeBoardId] = {};
                }*/
            }
        }

    }

    createItemElement(data){
        if(data && data.serverSentStreamType){
            data = data.content;
        }
        return new Promise(resolve=>{
            let li = Object.assign(document.createElement('li'),{
                className : 'notice_board_detail_item'
            });
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
            let editor = new NoticdeBoardLine(li, this);
            editor.startFirstLine()
            if(! data){
                li.append(addButton);
            }else{
                let {content} = data;
                delete data.content;
                common.jsonToSaveElementDataset(data, li).then(() => {
                    li.append(editor);
                    editor.parseLowDoseJSON(content)
                })
            }

            li.onmouseenter = () => {
                if(addButton.isConnected){
                    addButton.classList.add('active');
                }
            }
            
            li.onmouseleave = () => {
                if(addButton.isConnected){
                    addButton.classList.remove('active');
                }
            }
            addButton.onclick = () => {
                if(editor.isConnected){
                    return;
                }
                li.append(editor);
                addButton.remove();
            }
            let prevHTML;
            editor.onfocus = (event) => {
                prevHTML = editor.innerHTML;
            }
            editor.onblur = () => {
                console.log('??');
                if(editor.isEmpty){
                    editor.remove();
                    li.append(addButton);
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
                        emptyLineCount: emptyLineCount,
                        content : JSON.stringify(jsonList)
                    })
                })

            }

            resolve(li);
        });
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

	get element(){
		return this.#element;
	}
	
	get elementMap(){
		return this.#elementMap;
	}
}