
export default new class WorkspaceHandler{
    #workspaceId;
    #addWorkspaceIdChangedListener = {};
    constructor(){
        window.addEventListener("DOMContentLoaded", (event) => {
            let workspaceIdResolve;
            let workspaceIdPromise = new Promise(resolve=>{
                workspaceIdResolve = resolve;
            })
            window.myAPI.workspace.getWorkspaceId().then(workspaceId=>{
                if(workspaceId != undefined){
                    workspaceIdResolve(workspaceId);
                }
                window.myAPI.event.electronEventTrigger.addElectronEventListener('workspaceChange', event => {
                    let newWorkspaceId = event.workspaceId
                    if(workspaceId == newWorkspaceId){
                        return;
                    }
                    if(newWorkspaceId != undefined){
                        workspaceIdResolve(newWorkspaceId)
                    }
                    //event.workspaceId
                })
            })
            workspaceIdPromise.then(workspaceId => {
                this.#workspaceId = workspaceId;
                Object.values(this.#addWorkspaceIdChangedListener).forEach(callBack => {
                    callBack(this);
                })
            })
        });
    }

    set addWorkspaceIdChangedListener({name, callBack, runTheFirst}){
        this.#addWorkspaceIdChangedListener[name] = callBack;
        if(runTheFirst && this.workspaceId){
            callBack(this);
        }
    }
    get addWorkspaceIdChangedListener(){
        this.#addWorkspaceIdChangedListener;
    }

    set workspaceId(workspaceId){
        this.#workspaceId = workspaceId;
        Object.values(this.#addWorkspaceIdChangedListener).forEach(callBack => {
            callBack(this);
        })
    }
    get workspaceId(){
        return this.#workspaceId;
    }
    removeWorkspaceIdChangedListener(name){
        delete this.#addWorkspaceIdChangedListener(name);
    }
};