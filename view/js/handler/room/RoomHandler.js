export default new class RoomHandler{
    #roomId
    #room;
    #addRoomIdChangeListener = {};
    constructor(){

    }

    set addRoomIdChangeListener({name, callBack, runTheFirst}){
        this.#addRoomIdChangeListener[name] = callBack;
        if(runTheFirst && this.#roomId){
            callBack(this);
        }
    }

    get addRoomIdChangeListener(){
        return this.#addRoomIdChangeListener;
    }

    set roomId(roomId){
        if( ! roomId){
            console.error('roomId is undefined');
            return;
        }
        this.#roomId = roomId;
        window.myAPI.room.getRoomDetail({roomId}).then(result => {
            this.#room = result.data;
            Object.values(this.#addRoomIdChangeListener).forEach(async callBack => {
                new Promise(res => {
                    callBack(this);
                    res();
                })
            });
            //window.myAPI.setTitle({title:this.#room.roomName})
            document.head.querySelector('title').textContent = this.#room.roomName + ' - Grease Lightning Chat';
        });
    }

    get roomId(){
        return Number(this.#roomId);
    }

    get room(){
        return this.#room;
    }
    removeRoomIdChangeListener(name){
        delete this.#addRoomIdChangeListener(name);
    }
}