import chattingHandler from "../../../handler/chatting/ChattingHandler"
import EditorHandler from "../../../handler/editor/EditorHandler"

export default new class ChattingInfo{
    
    chattingMemory = {}

    #element = Object.assign(document.createElement('div'), {
        id: 'chatting_info_wrapper',
        innerHTML: `
            <div class="chatting_info_container" data-bind_name="chattingInfoContainer">

            </div>
        `
    })
    
    #elementMap = (()=>{
        return [...this.#element.querySelectorAll('[data-bind_name]')].reduce((total, element) => {
            total[element.dataset.bind_name] = element;
            return total;
        }, {})
    })();

    #roomId

    constructor(){
        chattingHandler.addChattingEventListener = {
            name: 'chattingInfo',
            callBack: (chattingData) => {
                let wrap = Object.assign(document.createElement('div'), {
		
                });
                let content = new EditorHandler({isReadOnly : true});
                content.contentEditable = false;
                content.parseLowDoseJSON(chattingData.chatting);
                wrap.append(content);
                this.#elementMap.chattingInfoContainer.append(wrap);
            }
        }
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