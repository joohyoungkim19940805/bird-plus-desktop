
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

    set addWorkspaceIdChangedListener({name, callback, runTheFirst}){
        this.#addWorkspaceIdChangedListener[name] = callback;
        if(runTheFirst && this.workspaceId){
            callback(this);
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
            let startCallbackPromise = Promise.all(Object.values(this.#addWorkspaceIdChangedListener).map(async callback => {
                return new Promise(res => {
                    callback(this);
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