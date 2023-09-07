
export default new class WorkspaceHandler{
    #workspace;
    #workspaceId;
    #addWorkspaceIdChangedListener = {};
    constructor(){
        let isLoadEnd = false;
        //window.addEventListener("DOMContentLoaded", (event) => {
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
                    
                    if( ! isLoadEnd && newWorkspaceId != undefined){
                        workspaceIdResolve(newWorkspaceId)
                    }else if(isLoadEnd){
                        this.workspaceId = newWorkspaceId;
                    }
                    //event.workspaceId
                })
            })
            workspaceIdPromise.then(workspaceId => {
                this.#workspaceId = workspaceId;
                window.myAPI.workspace.getWorkspaceDetail({workspaceId}).then((workspace) => {
                    this.#workspace = workspace;
                });
                Object.values(this.#addWorkspaceIdChangedListener).forEach(async callBack => {
                    new Promise(res => {
                        callBack(this);
                        res();
                    });
                });
                isLoadEnd = true;
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
        this.#workspaceId = workspaceId;
        window.myAPI.workspace.getWorkspaceDetail({workspaceId}).then((workspace) => {
            this.#workspace = workspace;
        });
        Object.values(this.#addWorkspaceIdChangedListener).forEach(async callBack => {
            new Promise(res => {
                callBack(this);
                res();
            });
        });
    }
    get workspaceId(){
        return this.#workspaceId;
    }
    get workspace(){
        return this.#workspace;
    }
    removeWorkspaceIdChangedListener(name){
        delete this.#addWorkspaceIdChangedListener(name);
    }
};