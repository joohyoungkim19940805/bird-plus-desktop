import common from "@root/js/common";
import IndexedDBHandler from "@handler/IndexedDBHandler";

import { accountHandler } from "@handler/account/AccountHandler";
import workspaceHandler from "@handler/workspace/WorkspaceHandler";

import GiveAdminView from "@component/option/GiveAdminView"

/**
 * @author kimjoohyoung
 * @description 간단한 옵션 내용 정의
 */
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

    #attendRequestObject = this.#createPermitRequest();

    #giveAdminObject = this.#createGiveAdmin();

    #isAdmin;

    #giveAdminView = new GiveAdminView(this);

    constructor(){
        
        /*this.#accountInfoPromise.then((accountInfo)=>{
            console.log(accountInfo); // undefined
        })*/

        window.myAPI.getOption('componentOption').then((option) => {
            this.componentOption = option?.OPTION_VALUE || 'responsive';
        });
        window.myAPI.event.electronEventTrigger.addElectronEventListener('optionChange', ({name, value}) => {
            if(name == 'componentOption'){
                this.componentOption = value;
            }
        })
        /* 멀티 윈도우에서 동시에 동일한 데이터베이스를 바라볼 수 없어서 주석 처리 20231214
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
        */

        let simpleMemory = {};
        
        window.myAPI.event.electronEventTrigger.addElectronEventListener('workspacePermitRequestAccept', (event)=>{
            
            if( ! this.#isAdmin) return;

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
                    if( ! this.#isAdmin) return;
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
            if( ! this.#isAdmin) return;
            let {content = event} = event;

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
                window.myAPI.workspace.getIsAdmin({workspaceId : workspaceHandler.workspaceId}).then(result => {
                    if(result.code == 0){
                        this.#isAdmin = result.data;
                    }else{
                        //alert('admin authentication failed, ::: ' + result.message);
                    }
                    if(this.#isAdmin){
                        window.myAPI.workspace.searchPermitRequestList({workspaceId: workspaceHandler.workspaceId}).then(result=>{
                            console.log('result >>> ', result);
                        });
                    }
                    if(this.#wrap.isConnected) this.open();
                });
                
            },
            runTheFirst: false
        }

        this.#giveAdminView.onOpenCloseCallback = (status) => {
            this.#giveAdminView.reset();
			if(status == 'open'){
				this.#giveAdminView.callData(this.#giveAdminView.page, this.#giveAdminView.size, workspaceHandler.workspaceId, this.#giveAdminView.form.fullName.value)
				.then(data => {
					this.#giveAdminView.createPage(data).then(liList => {
						this.#giveAdminView.addListItemVisibleEvent(liList);
					})
				})
			}
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
            this.componentOption = event.target.value;

            window.myAPI.setOption({name : 'componentOption', value : this.#componentOption});

            this.open();

            /* 멀티 윈도우에서 동시에 동일한 데이터베이스를 바라볼 수 없어서 주석 처리 20231214
            this.#indexedDBHandler.addItem({
                optionName: 'componentOption',
                value: event.target.value,
                lastModified: new Date().getTime()
            })
            */
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

    #createGiveAdmin(){
        
        let li = Object.assign(document.createElement('li'), {
            className: 'pointer'
        });
        let title = Object.assign(document.createElement('span'),{
            textContent: 'Give Admin'
        })

        li.append(title);
        li.onclick = () => {
            this.#giveAdminView.open();
        }

        return {li, title};
    }
    
    #createSimpleProfile(){
        if( ! accountHandler.accountInfo) return '';
        console.log(accountHandler.accountInfo);

        let li = Object.assign(document.createElement('li'), {

        });
        let title = Object.assign(document.createElement('span'), {
            textContent: 'Edit Profile'
        });
        li.append(title);
        let simpleProfileContainer = Object.assign(document.createElement('form'), {
            id : 'simple_profile_container',
            innerHTML : `
            <div class="simple_profile_input_container">
                <label for="simple_profile_full_name">Full Name</label>
                <input type="text" id="simple_profile_full_name" name="fullName" value="${accountHandler.accountInfo?.fullName || ''}"/>
            </div>
            <div class="simple_profile_input_container">
                <label for="simple_profile_job_grade">Job Grade</label>
                <input type="text" id="simple_profile_job_grade" name="jobGrade" value="${accountHandler.accountInfo?.jobGrade || ''}"/>
            </div>
            <div class="simple_profile_input_container">
                <label for="simple_profile_department">Department</label>
                <input type="text" id="simple_profile_department" name="department" value="${accountHandler.accountInfo?.department || ''}"/>
            </div>
            <br/>
            <div class="simple_profile_button_container">
                <button type="submit" id="simple_profile_apply_button">apply</button>
                <button type="button" id="simple_profile_cancel_button">cancel</button>
            </div>
            `,
        });

        simpleProfileContainer.onsubmit = (event)=>{
            event.preventDefault();
            let fullName = simpleProfileContainer.simple_profile_full_name.value;
            let jobGrade = simpleProfileContainer.simple_profile_job_grade.value;
            let department = simpleProfileContainer.simple_profile_department.value;
            
            if(
                accountHandler.accountInfo.fullName == fullName &&
                accountHandler.accountInfo.jobGrade == jobGrade &&
                accountHandler.accountInfo.fullName == department
            ){
                return;
            }

            window.myAPI.account.updateSimpleAccountInfo({
                fullName, jobGrade, department
            }).then(result => {
                console.log('result updateSimpleAccountInfo ::: ', result);
                if(accountHandler.accountInfo.fullName != fullName){
                    window.myAPI.room.createMySelfRoom({workspaceId : workspaceHandler.workspaceId});
                }
                accountHandler.searchAccountInfo();
            })

        }
        simpleProfileContainer.simple_profile_cancel_button.onclick = () => {
            simpleProfileContainer.remove();
        }
        li.append(title);
        li.onmouseenter = () => {
            li.append(simpleProfileContainer)
        }

        li.onmouseleave = () => {
            simpleProfileContainer.remove();
        }
        return li;
    }
    set componentOption(option){
        this.#componentOption = option;
        if(this.#componentOption == 'nomal'){
            document.body.parentElement.style.fontSize = '100%';
        }else{
            document.body.parentElement.style.fontSize = '';
        }
    }
    get componentOption(){return this.#componentOption;}

    async open(){
        document.body.append(this.#wrap);
        this.#wrap.append(this.#container)
        let contentList = [this.#createComponentOption(), this.#createSimpleProfile()];
        if(workspaceHandler.workspaceId && this.#isAdmin){
            contentList.push(this.#attendRequestObject.li);
            contentList.push(this.#giveAdminObject.li);
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
