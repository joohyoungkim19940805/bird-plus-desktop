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
    
    toolbarWrapper = [];
    
	#isLoaded = false;
    
    parentLi;
    parentClass;
    constructor(parentLi, parentClass){
        this.parentLi = parentLi;
        this.parentClass = parentClass;
        let tools = {
			'free-will-strong' : Strong,

		}
		let option = {
			isDefaultStyle : true
		}
		super(tools, option);

        this.toolbarWrapper.push(
            Strong.toolHandler.toolButton
        );
        
        super.placeholder = ''
        super.spellcheck = true
    }

	connectedCallback(){
        if( ! this.#isLoaded){
			this.#isLoaded = true;
            Promise.all([...new Array(Number(parentLi.dataset.empty_line_count || 0))].map(e=> parentClass.createItemElement(e))).then(emptyList => {
                this.parentLi.before(...emptyList);
            })
        }
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
    
    #lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {

    })

    constructor(){
        this.#positionChanger = new PositionChanger({wrapper: this.#elementMap.noticeBoardDetailList});
		this.#positionChanger.onDropEndChangePositionCallback = (changeList, {item, target, wrapper}) => {

        };

        noticeBoardHandler.addNoticeBoardAcceptListener = {
            name: 'noticeBoardDetailAccept',
            callBack: (handler, data)=>{
                console.log(data);
                this.createItemElement(data)
                .then(li => {
                    this.#addMemory(li);
                }).then( () => {
                    let list = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[handler.noticeBoardId] || {})
                        .sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));
                    this.#elementMap.noticeBoardDetailList.replaceChildren(...list);
                })
            },
            runTheFirst: false
        }
        noticeBoardHandler.addNoticeBoardIdChangeListener = {
            name: 'noticeBoardDetailIdChange',
            callBack: (handler, data)=>{
                this.#elementMap.noticeBoardDetailList.replaceChildren();
            }
        }
        noticeBoardHandler.addNoticeBoardAcceptEndListener = {
            name: 'noticeBoardDetailAcceptEndCallback',
            callBack: (handler, data)=>{
                let dataCount = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[handler.noticeBoardId] || {}).length;
                let firstEmptyLineLength = ( 
                    window.outerHeight / ( (parseInt(window.getComputedStyle(document.body).fontSize) || 16) * 2 ) 
                ) - dataCount - this.#elementMap.noticeBoardDetailList.childElementCount
                if(firstEmptyLineLength < 1){
                    firstEmptyLineLength = this.#defaultEmptyLine;
                }
                console.log(firstEmptyLineLength);
                Promise.all( [...new Array(parseInt(firstEmptyLineLength))].map(e=> this.createItemElement(e)) ).then(emptyList =>{
                    let list = Object.values(this.#memory[workspaceHandler.workspaceId]?.[roomHandler.roomId]?.[handler.noticeBoardId] || {})
                        .sort((a,b) => Number(b.dataset.order_sort) - Number(a.dataset.order_sort));
                    this.#elementMap.noticeBoardDetailList.replaceChildren(...list, ...emptyList);    
                });
            },
            runTheFirst: false
        }

    }

    createItemElement(data){
        return new Promise(resolve=>{
            let li = Object.assign(document.createElement('li'),{
                className : 'notice_board_detail_item'
            });
            li.style.minHeight = (parseInt(window.getComputedStyle(document.body).fontSize) || 16) * 2 + 'px';
            this.#addItemEvent(li, data);
            if(!data){
                resolve(li);
                return;
            }
            
            let content = data.content;
            delete data.content;
            common.jsonToSaveElementDataset(data, li).then(() => {
                let editor = new NoticdeBoardLine(li, this);
                li.append(editor);
                editor.parseLowDoseJSON(content).then(e=>{
                    resolve(li);
                });
            })

        })
    }

    #addItemEvent(li, data){

        return new Promise(resolve=> {
            const addButtonEvent = () => {
                if(data){
                    return
                }
                let addButton = Object.assign(document.createElement('button'), {
                    className: 'notice_board_detail_item_add_content',
                    textContent: '+'
                });
                li.append(addButton);
                
                li.onmouseenter = () => {
                    addButton.classList.add('active');
                }
                
                li.onmouseleave = () => {
                    //addButton.classList.remove('active');
                }
                addButton.onclick = () => {
                    
                }
            }           
            addButtonEvent();
            resolve(li);
        });
    }

    #addMemory(data, noticeBoardId){
		if( ! this.#memory.hasOwnProperty(workspaceHandler.workspaceId)){
			this.#memory[workspaceHandler.workspaceId] = {};
		}
		if( ! this.#memory[workspaceHandler.workspaceId].hasOwnProperty(roomHandler.roomId)){
			this.#memory[workspaceHandler.workspaceId][roomHandler.roomId] = {} ;
		}
        if( ! this.#memory[workspaceHandler.workspaceId][roomHandler.roomId].hasOwnProperty(noticeBoardId)){
            this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][noticeBoardId] = {}
        }
        
        this.#memory[workspaceHandler.workspaceId][roomHandler.roomId][noticeBoardId][data.dataset.id] = data;
		
    }

	get element(){
		return this.#element;
	}
	
	get elementMap(){
		return this.#elementMap;
	}
}