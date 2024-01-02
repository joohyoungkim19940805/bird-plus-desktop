
export const chattingHandler = new class ChattingHandler{
	#lastChattingId;
	#lastChatting;
    #addChattingEventListener = {};
    constructor(){
		window.myAPI.event.electronEventTrigger.addElectronEventListener('chattingAccept', data => {
			let {content} = data;
			//let {id, accountId, accountName, chatting, createAt, createBy, roomId, updateAt, updateBy} = data.content;
			this.#lastChattingId = content.id;
			this.#lastChatting = content;
			/*
			data:"{\"id\":null,\"accountId\":null,\"accountName\":\"test\",\"roomId\":null,\"chatting\":\"[{\\\"type\\\":1,\\\"name\\\":\\\"Line\\\",\\\"data\\\":{},\\\"cursor_offset\\\":\\\"10\\\",\\\"cursor_type\\\":\\\"3\\\",\\\"cursor_index\\\":\\\"0\\\",\\\"cursor_scroll_x\\\":null,\\\"cursor_scroll_y\\\":\\\"0\\\",\\\"childs\\\":[{\\\"type\\\":3,\\\"name\\\":\\\"Text\\\",\\\"text\\\":\\\"qweasdxzxc\\\"}]}]\",\"createAt\":null,\"createBy\":null,\"updateAt\":null,\"updateBy\":null}"
			lastEventId: ""
			origin: "http://localhost:8079"
			type: "message"
			*/
			
			Object.values(this.#addChattingEventListener).forEach(async callback => {
                new Promise(res => {
                    callback(content);
                    res();
                })
            });
		});
    }

    set addChattingEventListener({name, callback}){
        this.#addChattingEventListener[name] = callback;
    }

    get addChattingEventListener(){
        return this.#addChattingEventListener;
    }

	get lastChattingId(){
		return Number(this.#lastChattingId);
	}

	get lastChatting(){
		return Number(this.#lastChatting);
	}

}
