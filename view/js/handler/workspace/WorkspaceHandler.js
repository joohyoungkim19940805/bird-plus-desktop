
export default new class WorkspaceHandler{
    #workspaceId;
    workspace = {
        id: this.workspaceId
    }
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
                this.workspace.id = workspaceId;
                console.log(Object.values(this.#addWorkspaceIdChangedListener));
                Object.values(this.#addWorkspaceIdChangedListener).forEach(callBack => {
                    callBack(this.workspace);
                })
            })
        });
    }

    set addWorkspaceIdChangedListener({name, callBack, runTheFirst}){
        this.#addWorkspaceIdChangedListener[name] = callBack;
        if(runTheFirst && this.workspaceId){
            callBack(this.workspace);
        }
    }
    get addWorkspaceIdChangedListener(){
        this.#addWorkspaceIdChangedListener;
    }

    removeWorkspaceIdChangedListener(name){
        delete this.#addWorkspaceIdChangedListener(name);
    }
};