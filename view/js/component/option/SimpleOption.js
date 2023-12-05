import common from "../../common";
import IndexedDBHandler from "../../handler/IndexedDBHandler";

import { accountHandler } from "../../handler/account/AccountHandler";
import workspaceHandler from "../../handler/workspace/WorkspaceHandler";

export const simpleOption = new class SimpleOption{
    
    #wrap = Object.assign(document.createElement('div'), {
        className: 'simple_option'
    })
    #container = Object.assign(document.createElement('ul'), {
        className: 'simple_option_container'
    })

    #componentOption;

    #dbOpenPromise

    #indexedDBHandler

    #accountInfoPromise = accountHandler.accountInfo;

    #attendRequestObject = this.#createPermitRequest();

    constructor(){
        
        /*this.#accountInfoPromise.then((accountInfo)=>{
            console.log(accountInfo); // undefined
        })*/

        this.#indexedDBHandler = new IndexedDBHandler({
            dbName: 'simpleOptionDB',
            storeName: 'simpleOption',
            columnInfo: {
                optionName: ['optionName', 'optionName', {unique: true}],
                value: ['value', 'value'],
                lastModified: ['lastModified','lastModified'],
            },
            keyPathNameList: ['optionName'],
            pkAutoIncrement: false
        })

        this.#dbOpenPromise = this.#indexedDBHandler.open();

        this.#dbOpenPromise.then(() => {
            this.#indexedDBHandler.getItem('componentOption').then(dbRequest=>{
                if( ! dbRequest.result){
                    this.#componentOption = 'responsive'
                    return;
                }
                this.#componentOption = dbRequest.result.value;
                if(this.#componentOption == 'nomal'){
                    document.body.parentElement.style.fontSize = '100%';
                }else{
                    document.body.parentElement.style.fontSize = '';
                }
            })
        })

        let simpleMemory = {};
        window.myAPI.event.electronEventTrigger.addElectronEventListener('workspacePermitRequestAccept', (event)=>{
            let {content = event} = event;
            console.log(content);
            let {attendRequest} = this.#attendRequestObject
            let item = Object.assign(document.createElement('li'),{
                className: 'attend_request_item',
                innerHTML:`
                    <div class="attend_request_item_container">
                        <div class="attend_request_item_emain">
                            <span>${content.email}</span>
                        </div>
                        <div class="attend_request_item_name">
                            <span>${content.fullName}</span>
                        </div>
                        <div class="attend_request_item_position">
                            <span>${content.jobGrade}</span>
                            <span>${content.department}</span>
                        </div>
                    </div>
                    <div class="attend_request_item_button_wrapper">
                        <button class="attend_request_item_permit" value="PERMIT">permit</button>
                        <button class="attend_request_tiem_reject" value="REJECT">reject</button>
                    </div>
                `
            })
            let [permit, reject] = item.querySelectorAll('.attend_request_item_permit, .attend_request_tiem_reject');
            [permit, reject].forEach(e=>{
                e.onclick = () => {
                    window.myAPI.workspace.createPermitWokrspaceInAccount({
                        id:content.id,
                        workspaceId:content.workspaceId,
                        permitType:e.value,
                        accountName: content.accountName
                    })
                }
            })
            if( ! simpleMemory[content.workspaceId]){
                simpleMemory[content.workspaceId] = {};
            }

            simpleMemory[content.workspaceId][content.accountName] = item

            if(workspaceHandler.workspaceId == content.workspaceId){
                //console.log(Object.values(simpleMemory[content.workspaceId]))
                attendRequest.replaceChildren(
                    ...Object.values(simpleMemory[content.workspaceId])
                )
            }

        })
        window.myAPI.event.electronEventTrigger.addElectronEventListener('workspacePermitResultAccept', (event)=>{
            let {content = event} = event;
            console.log(event);
            if(workspaceHandler.workspaceId == content.workspaceId){
                let {attendRequest} = this.#attendRequestObject
                delete simpleMemory[content.workspaceId][content.accountName];
                attendRequest.replaceChildren(
                    ...Object.values(simpleMemory[content.workspaceId])
                )
            }
        })
        //console.log(workspaceHandler.workspaceId);
        workspaceHandler.addWorkspaceIdChangedListener = {
            name: 'simpleOptuon',
            callBack: () => {
                if(workspaceHandler.workspaceId){
                    window.myAPI.workspace.searchPermitRequestList({workspaceId: workspaceHandler.workspaceId}).then(result=>{
                        console.log('result >>> ', result);
                    });
                }
            },
            runTheFirst: false
        }
    }

    #createComponentOption(){
        let li = Object.assign(document.createElement('li'), {

        });
        
        let title = Object.assign(document.createElement('span'), {
            textContent: 'Component Option'
        })

        let optionContainer = Object.assign(document.createElement('div'), {
            className: 'component_option_container',
            innerHTML: `
                <div>
                    <label for="component_option_responsive">Responsive</label>
                    <input type="radio" name="component_option" id="component_option_responsive" value="responsive" ${this.#componentOption == "responsive" ? 'checked' : ''}/>
                        
                </div>
                <div>
                    <label for="component_option_nomal">Nomal</label>
                    <input type="radio" name="component_option" id="component_option_nomal" value="nomal" ${this.#componentOption == "nomal" ? 'checked' : ''}/>
                </div>
            `
        })

        optionContainer.onchange = (event) => {
            if(event.target.type != 'radio'){
                return;
            }
            this.#componentOption = event.target.value;
            if(event.target.value == 'nomal'){
                document.body.parentElement.style.fontSize = '100%';
            }else{
                document.body.parentElement.style.fontSize = '';
            }
            
            this.#indexedDBHandler.addItem({
                optionName: 'componentOption',
                value: event.target.value,
                lastModified: new Date().getTime()
            })
        }

        li.onmouseenter = () => {
            li.append(optionContainer)
        }

        li.onmouseleave = () => {
            optionContainer.remove();
        }

        li.append(title);

        return li;
    }

    #createPermitRequest(){
        let li = Object.assign(document.createElement('li'), {

        });
        let title = Object.assign(document.createElement('span'),{
            textContent: 'Attend Request'
        })
        


        let attendRequest = Object.assign(document.createElement('ul'), {
            className: 'attend_request_container',
        });

        li.append(title);
        li.onmouseenter = () => {
            li.append(attendRequest)
        }

        li.onmouseleave = () => {
            attendRequest.remove();
        }
        return {li, title, attendRequest};
    }
    
    open(){
        document.body.append(this.#wrap);
        this.#wrap.append(this.#container)
        let contentList = [this.#createComponentOption()];
        if(workspaceHandler.workspaceId){
            contentList.push(this.#attendRequestObject.li);
        }
        this.#container.replaceChildren(...contentList)
    }

    close(){
        this.#wrap.remove();
    }

    get wrap(){
        return this.#wrap;
    }
}
