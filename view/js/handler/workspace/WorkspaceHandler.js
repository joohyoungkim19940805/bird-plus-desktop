
export const workspaceHandler = new class WorkspaceHandler{
    #workspace;
    #workspaceId;
    #addWorkspaceIdChangedListener = {};
    #workspaceChangeDone;
    #workspaceChangeAwait;
    constructor(){
        //window.addEventListener("DOMContentLoaded", (event) => {
            window.myAPI.getWorkspaceId().then(workspaceId=>{
                this.workspaceId = workspaceId;
            })
            window.myAPI.event.electronEventTrigger.addElectronEventListener('workspaceChange', event => {
                this.workspaceId = event.workspaceId;
            })
        //});
    }

    set addWorkspaceIdChangedListener({name, callBack, runTheFirst}){
        this.#addWorkspaceIdChangedListener[name] = callBack;
        if(runTheFirst && this.workspaceId){
            callBack(this);
        }
    }
    get addWorkspaceIdChangedListener(){
        return this.#addWorkspaceIdChangedListener;
    }

    set workspaceId(workspaceId){
        if(!workspaceId)return;
        this.#workspaceId = workspaceId;
        window.myAPI.workspace.getWorkspaceDetail({workspaceId}).then((workspace) => {
            this.#workspace = workspace;
            let startCallbackPromise = Promise.all(Object.values(this.#addWorkspaceIdChangedListener).map(async callBack => {
                return new Promise(res => {
                    callBack(this);
                    res();
                });
            }));
            if( ! this.#workspaceChangeAwait){
                this.#workspaceChangeAwait = new Promise(resolve=>{
                    this.#workspaceChangeDone = resolve;
                    this.#workspaceChangeDone(startCallbackPromise);
                })
            }else{
                this.#workspaceChangeAwait.then(() => {
                    startCallbackPromise.then(() => {
                        this.#workspaceChangeAwait = new Promise(resolve => {
                            this.#workspaceChangeDone = resolve;
                        })
                    })
                })
            }
        });
    }
    get workspaceId(){
        return Number(this.#workspaceId);
    }
    get workspace(){
        return this.#workspace;
    }
    removeWorkspaceIdChangedListener(name){
        delete this.#addWorkspaceIdChangedListener(name);
    }
};