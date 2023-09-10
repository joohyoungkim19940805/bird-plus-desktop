import EditorHandler from "../editor/EditorHandler";

export default new class ChattingHandler{
	#lastChattingId;
	#lastChatting;
    #addChattingEventListener = {};
	chattingLineElement = Object.assign(document.createElement('div'),{
		className: 'content',
		id: 'chatting_read_only'
	});
    constructor(){
		alert();
		window.myAPI.event.electronEventTrigger.addElectronEventListener('chattingAccept', event => {
			let {data, lastEventId, origin, type} = event;
			let {id, accountId, accountName, chatting, createAt, createBy, roomId, updateAt, updateBy} = JSON.parse(data);
			this.#lastChattingId = id;
			this.#lastChatting = data;
			console.log(data);
			/*
			data:"{\"id\":null,\"accountId\":null,\"accountName\":\"test\",\"roomId\":null,\"chatting\":\"[{\\\"type\\\":1,\\\"name\\\":\\\"Line\\\",\\\"data\\\":{},\\\"cursor_offset\\\":\\\"10\\\",\\\"cursor_type\\\":\\\"3\\\",\\\"cursor_index\\\":\\\"0\\\",\\\"cursor_scroll_x\\\":null,\\\"cursor_scroll_y\\\":\\\"0\\\",\\\"childs\\\":[{\\\"type\\\":3,\\\"name\\\":\\\"Text\\\",\\\"text\\\":\\\"qweasdxzxc\\\"}]}]\",\"createAt\":null,\"createBy\":null,\"updatedAt\":null,\"updatedBy\":null}"
			lastEventId: ""
			origin: "http://localhost:8079"
			type: "message"
			*/
			//여기부터
			let wrap = Object.assign(document.createElement('div'),{
		
			});
		
			let content = new EditorHandler({isReadOnly : true});
			console.log(chatting)
			content.contentEditable = false;
			content.parseLowDoseJSON(chatting);
		
			wrap.append(content);
			this.chattingLineElement.append(wrap);
			//여기까지 챗팅 인포 list 클래스에서 해결 할 것

			Object.values(this.#addChattingEventListener).forEach(async callBack => {
                new Promise(res => {
                    callBack(data);
                    res();
                })
            });
		});
    }

    set addChattingEventListener({name, callBack}){
        this.#addChattingEventListener[name] = callBack;
    }

    get addChattingEventListener(){
        return this.#addChattingEventListener;
    }

	get lastChattingId(){
		return this.#lastChattingId;
	}

	get lastChatting(){
		return this.#lastChatting
	}

}
