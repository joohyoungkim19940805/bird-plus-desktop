import EditorHandler from "../editor/EditorHandler";

export default new class ChattingHandler{
	#lastChattingId;
	#lastChatting;
    #addChattingEventListener = {};
    constructor(){
		window.myAPI.event.electronEventTrigger.addElectronEventListener('chattingAccept', event => {
			let {data, lastEventId, origin, type} = event;
			data = JSON.parse(data);
			let {id, accountId, accountName, chatting, createAt, createBy, roomId, updateAt, updateBy} = data;
			this.#lastChattingId = id;
			this.#lastChatting = data;
			console.log(data);
			/*
			data:"{\"id\":null,\"accountId\":null,\"accountName\":\"test\",\"roomId\":null,\"chatting\":\"[{\\\"type\\\":1,\\\"name\\\":\\\"Line\\\",\\\"data\\\":{},\\\"cursor_offset\\\":\\\"10\\\",\\\"cursor_type\\\":\\\"3\\\",\\\"cursor_index\\\":\\\"0\\\",\\\"cursor_scroll_x\\\":null,\\\"cursor_scroll_y\\\":\\\"0\\\",\\\"childs\\\":[{\\\"type\\\":3,\\\"name\\\":\\\"Text\\\",\\\"text\\\":\\\"qweasdxzxc\\\"}]}]\",\"createAt\":null,\"createBy\":null,\"updateAt\":null,\"updateBy\":null}"
			lastEventId: ""
			origin: "http://localhost:8079"
			type: "message"
			*/

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
