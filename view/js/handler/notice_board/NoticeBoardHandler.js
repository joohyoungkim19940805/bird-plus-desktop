
export const noticeBoardHandler = new class NoticeBoardHandler{
    #noticeBoardId
    #noticeBoard = [];
    #addNoticeBoardIdChangeListener = {};
    #noticeBoardChangeDone;
    #noticeBoardChangeAwait;
    constructor(){

    }

    set addNoticeBoardIdChangeListener({name, callback, runTheFirst}){
        this.#addNoticeBoardIdChangeListener[name] = callback;
        if(runTheFirst && this.#noticeBoardId){
            callback(this);
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
        let startCallbackPromise = Promise.all(
            Object.values(this.#addNoticeBoardIdChangeListener).map(async callback => {
                return new Promise(res => {
                    callback(this);
                    res();
                })
            })
        )
        if( ! this.#noticeBoardChangeAwait){
            this.#noticeBoardChangeAwait = new Promise(resolve=>{
                this.#noticeBoardChangeDone = resolve;
                this.#noticeBoardChangeDone(startCallbackPromise);
            })
        }else{
            this.#noticeBoardChangeAwait.then(() => {
                startCallbackPromise.then(() => {
                    this.#noticeBoardChangeAwait = new Promise(resolve => {
                        this.#noticeBoardChangeDone = resolve;
                    })
                })
            })
        }
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