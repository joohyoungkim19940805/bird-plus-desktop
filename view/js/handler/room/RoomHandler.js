export default new class RoomHandler{
    #roomId
    #room;
    #addRoomIdChangeListener = {};

    #roomChangeDone;
    #roomChangeAwait = new Promise(resolve=>{
        this.#roomChangeDone = resolve;
    });

    constructor(){

        window.myAPI.event.electronEventTrigger.addElectronEventListener('roomChange', event => {
            this.roomId = event.roomId
        })

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
            throw new Error('roomId is undefined')
        }
        this.#roomId = roomId;
        window.myAPI.room.getRoomDetail({roomId}).then(result => {
            this.#room = result.data;
            window.myAPI.setOption({
                name: 'lastRoomInfo', value : JSON.stringify(this.#room)
            })
            let startCallbackPromise = Promise.all(
                Object.values(this.#addRoomIdChangeListener).map(async callBack => {
                    return new Promise(res => {
                        callBack(this);
                        res();
                    })
                })
            )
            startCallbackPromise.then(()=>{
                this.#roomChangeDone();
            })
            this.#roomChangeAwait.then(()=>{
                this.#roomChangeAwait = new Promise(resolve=>{
                    this.#roomChangeDone = resolve;
                })
            })
            //window.myAPI.setTitle({title:this.#room.roomName})
            
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
    get roomChangeAwait(){
        return this.#roomChangeAwait;
    }
}