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

class NoticdeBoardLine extends FreeWillEditor{
    static{
        window.customElements.define('notice-board-line', NoticdeBoardLine);
    }
    toolbarWrapper = [];
    constructor(){
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
        
        super.placeholder = '텍스트를 입력해주세요.'
        super.spellcheck = true
    }
}

export default new class NoticeBoardDetail{
	#memory = {}

    #element = Object.assign(document.createElement('div'), {
        id: 'notice_board_detail_wrapper',
        innerHTML: `
            <div class="notice_board_detail_container" data-bind_name="noticeBoardDetailContainer">
                <ul class="notice_board_detail_content list_scroll list_scroll-y" data-bind_name="noticeBoardDetail">
                    <li>t1</li>
                    <li>t2</li>
                    <li>t3</li>
                    <li>t4</li>
                    <li>t5</li>
                    <li>t6</li>
                    <li>t7</li>
                    <li>t8</li>
                    <li>t9</li>
                    <li>t10</li> 
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

    refresh(parentRoot = this.#elementMap.noticeBoardDetail){

	}

    #addMemory(data, noticeBoardId){
		if( ! this.#memory.hasOwnProperty(workspaceHandler.workspaceId)){
			this.#memory[workspaceHandler.workspaceId] = {};
		}
		if( ! this.#memory[workspaceHandler.workspaceId].hasOwnProperty(roomHandler.roomId)){
			this.#memory[workspaceHandler.workspaceId][roomHandler.roomId] = {} ;
		}
    }

	get element(){
		return this.#element;
	}
	
	get elementMap(){
		return this.#elementMap;
	}
}