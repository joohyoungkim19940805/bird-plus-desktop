
export const noticeBoardHandler = new class NoticeBoardHandler{
    #noticeBoardId
    #noticeBoard = [];
    #addNoticeBoardIdChangeListener = {};
    #noticeBoardChangeDone;
    #noticeBoardChangeAwait;
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
        let startCallbackPromise = Promise.all(
            Object.values(this.#addNoticeBoardIdChangeListener).map(async callBack => {
                return new Promise(res => {
                    callBack(this);
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