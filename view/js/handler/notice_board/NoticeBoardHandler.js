import workspaceHandler from "../workspace/WorkspaceHandler";
import roomHandler from "../room/RoomHandler";

export default new class NoticeBoardHandler{
    #noticeBoardId
    #noticeBoard = [];
    #addNoticeBoardAcceptListener = {};
    #addNoticeBoardIdChangeListener = {};
    #addNoticeBoardAcceptEndListener = {};
    constructor(){
        window.myAPI.event.electronEventTrigger.addElectronEventListener('noticeBoardDetailAccept', (data) => {
            //this.#noticeBoard.push(data);
            Object.values(this.#addNoticeBoardAcceptListener).forEach(async callBack => {
                new Promise(res => {
                    callBack(this, data);
                    res();
                })
            });
        })
    }
    
    set addNoticeBoardAcceptListener({name, callBack, runTheFirst}){
        this.#addNoticeBoardAcceptListener[name] = callBack;
        if(runTheFirst && this.#noticeBoardId){
            callBack(this);
        }
    }

    get addNoticeBoardAcceptListener(){
        return this.#addNoticeBoardAcceptListener;
    }

    set addNoticeBoardIdChangeListener({name, callBack, runTheFirst}){
        this.#addNoticeBoardIdChangeListener[name] = callBack;
        if(runTheFirst && this.#noticeBoardId){
            callBack(this);
        }
    }

    get addNoticeBoardIdChangeListener(){
        return this.#addNoticeBoardIdChangeListener;
    }

    set addNoticeBoardAcceptEndListener({name, callBack, runTheFirst}){
        this.#addNoticeBoardAcceptEndListener[name] = callBack;
        if(runTheFirst && this.#noticeBoardId){
            callBack(this);
        }
    }

    get addNoticeBoardAcceptEndListener(){
        return this.#addNoticeBoardIdChangeListener;
    }

    set noticeBoardId(noticeBoardId){
        if( ! noticeBoardId){
            console.error('noticeBoardId is undefined');
            return;
        }
        this.#noticeBoard = [];
        this.#noticeBoardId = noticeBoardId;
        Object.values(this.#addNoticeBoardIdChangeListener).forEach(async callBack => {
            new Promise(res => {
                callBack(this);
                res();
            })
        });

        window.myAPI.noticeBoard.searchNoticeBoardDetailList({
            workspaceId: workspaceHandler.workspaceId, 
            roomId: roomHandler.roomId,
            noticeBoardId
        }).then(result => {
            console.log(result);
            Object.values(this.#addNoticeBoardAcceptEndListener).forEach(async callBack => {
                new Promise(res => {
                    callBack(this);
                    res();
                })
            });
        });
        
    }

    get noticeBoardId(){
        return this.#noticeBoardId;
    }

    get noticeBoard(){
        return this.#noticeBoard;
    }
    removeNoticeBoardAcceptListener(name){
        delete this.#addNoticeBoardAcceptListener(name);
    }

    removeNoticeBoardIdChangeListener(name){
        delete this.#addNoticeBoardIdChangeListener(name);
    }

    removeNoticeBoardAcceptEndListener(name){
        delete this.#addNoticeBoardAcceptEndListener(name);
    }
}