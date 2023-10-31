import workspaceHandler from "../workspace/WorkspaceHandler";
import roomHandler from "../room/RoomHandler";

export default new class NoticeBoardHandler{
    #noticeBoardId
    #noticeBoard = [];
    #addNoticeBoardIdChangeListener = {};
    constructor(){

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

    set noticeBoardId(noticeBoardId){
        if( ! noticeBoardId){
            console.error('noticeBoardId is undefined');
            return;
        }
        this.#noticeBoard = [];
        this.#noticeBoardId = noticeBoardId;
        new Promise(resolve => {
            Object.values(this.#addNoticeBoardIdChangeListener).forEach(async callBack => {
                new Promise(res => {
                    callBack(this);
                    res();
                })
            });
            resolve();
        })
        
    }

    get noticeBoardId(){
        return this.#noticeBoardId;
    }

    get noticeBoard(){
        return this.#noticeBoard;
    }

    removeNoticeBoardIdChangeListener(name){
        delete this.#addNoticeBoardIdChangeListener(name);
    }

}