export default new class ChattingHandler{
    #roomId
    #room;
    #addRoomIdChangeListener = {};
    constructor(){

    }

    set addRoomIdChangeListener({name, callBack, runTheFirst}){
        this.#addRoomIdChangeListener[name] = callBack;
        if(runTheFirst && this.#roomId){
            callBack();
        }
    }

    get addRoomIdChangeListener(){
        return this.#addRoomIdChangeListener;
    }

    set roomId(roomId){
        this.#roomId = roomId;
        window.myAPI.getRoomDetail({roomId}).then(room => {
            this.#room = room;
        });
        Object.values(this.#addRoomIdChangeListener).forEach(async callBack => {
            new Promise(res => {
                callBack(this);
                res();
            })
        });
    }

    get roomId(){
        return this.#roomId;
    }
}