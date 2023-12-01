export default new class RoomHandler{
    #roomId
    #room;
    #addRoomIdChangeListener = {};

    #roomChangeDone;
    #roomChangeAwait;

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
            let startCallbackPromise = Promise.all(
                Object.values(this.#addRoomIdChangeListener).map(async callBack => {
                    return new Promise(res => {
                        callBack(this);
                        res();
                    })
                })
            )
            if( ! this.#roomChangeAwait){
                this.#roomChangeAwait = new Promise(resolve=>{
                    this.#roomChangeDone = resolve;
                    this.#roomChangeDone(startCallbackPromise);
                })
            }else{
                this.#roomChangeAwait.then(()=>{
                    startCallbackPromise.then(()=>{
                        this.#roomChangeAwait = new Promise(resolve=>{
                            this.#roomChangeDone = resolve;
                        })
                    })
                })
            }
           
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