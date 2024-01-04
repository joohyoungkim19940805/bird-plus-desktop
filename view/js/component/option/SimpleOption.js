import common from "@root/js/common";
import IndexedDBHandler from "@handler/IndexedDBHandler";

import { accountHandler } from "@handler/account/AccountHandler";
import {workspaceHandler} from "@handler/workspace/WorkspaceHandler";

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
        let {li, attendRequest, attendRequestFilter, attendRequestSearch} = this.#attendRequestObject
        
        attendRequestSearch.oninput = (event) => {
            if(event.constructor.name == Event.name){
                li.dataset.is_not_leave = '';
            }
            let itemList = Object.values(simpleMemory[workspaceHandler.workspaceId]).filter(e=> 
                (e.__filterOption.value.includes(attendRequestSearch.value) || e.__filterOption.textContent.includes(attendRequestSearch.value))
            )
            attendRequest.style.minHeight = attendRequest.getBoundingClientRect().height + 'px';;
            attendRequest.replaceChildren(
                ...itemList
            )
            attendRequestFilter.replaceChildren(
                ...itemList.map(e=>e.__filterOption)
            )
            attendRequest.style.minHeight = '';
        }
        
        window.myAPI.event.electronEventTrigger.addElectronEventListener('workspacePermitRequestAccept', (event)=>{
            
            if( ! this.#isAdmin) return;

            let {content = event} = event;

            let item = Object.assign(document.createElement('li'),{
                className: 'attend_request_item',
                innerHTML:`
                    <div class="attend_request_item_container">
                        <div class="attend_request_item_email">
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
            item.__filterOption = Object.assign(document.createElement('option'), {
                value : content.fullName,
                textContent: content.email
            });
            //item.__filterOption.__targetLi = item;

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
                let itemList = Object.values(simpleMemory[content.workspaceId]);
                attendRequest.replaceChildren(
                    ...itemList
                )
                attendRequestFilter.replaceChildren(
                    ...itemList.map(e=>e.__filterOption)
                )
            }

        })
        window.myAPI.event.electronEventTrigger.addElectronEventListener('workspacePermitResultAccept', (event)=>{
            if( ! this.#isAdmin) return;
            let {content = event} = event;

            if(workspaceHandler.workspaceId == content.workspaceId){

                delete simpleMemory[content.workspaceId][content.accountName];
                
                let itemList = Object.values(simpleMemory[content.workspaceId])
                attendRequest.replaceChildren(
                    ...itemList
                );
                attendRequest.replaceChildren(
                    ...itemList.map(e=>e.__filterOption)
                )
            }
        })
        //console.log(workspaceHandler.workspaceId);
        workspaceHandler.addWorkspaceIdChangedListener = {
            name: 'simpleOptuon',
            callback: () => {
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
            this.#positionRemain(optionContainer)
        }
        li.onmouseleave = () => {
            optionContainer.remove();
        }
        li.onclick = (event) => {
            if(event.target != li && event.target != title) return;

            if(optionContainer.isConnected){
                optionContainer.remove();
            }else {
                li.append(optionContainer)
                this.#positionRemain(optionContainer)
            }
        }

        li.append(title);

        return li;
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
                <img class="profile_image" src="${accountHandler.accountInfo.profileImage}"/>
                <input id="simple_profile_image" type="file" accept="image/*">
            </div>
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
        let profileImageInput = simpleProfileContainer.simple_profile_image;
        let profileImage = simpleProfileContainer.querySelector('.profile_image')
        let imgTempUrlList = []; 
        profileImageInput.oninput = (event) => {
            console.log(event);
            if(event.constructor.name == Event.name){
                li.dataset.is_not_leave = '';
            }
            profileImage.src = URL.createObjectURL(profileImageInput.files[0], profileImageInput.files[0].type); 
            imgTempUrlList.push(profileImage.src);
        }
        
        simpleProfileContainer.onsubmit = async (event)=>{
            event.preventDefault();

            let fullName = simpleProfileContainer.simple_profile_full_name.value;
            let jobGrade = simpleProfileContainer.simple_profile_job_grade.value;
            let department = simpleProfileContainer.simple_profile_department.value;
            
            if(
                accountHandler.accountInfo.fullName == fullName &&
                accountHandler.accountInfo.jobGrade == jobGrade &&
                accountHandler.accountInfo.department == department &&
                profileImageInput.files.length == 0
            ){
                common.showToastMessage(['변동 사항이 없습니다.']);
                return;
            }
            let profileImageUrl;
            let profileChangeFailed = false;
            if(profileImageInput.files.length == 0){
                profileImageUrl = accountHandler.accountInfo.profileImage;
            }else{
                profileImageUrl = await window.myAPI.s3.generateGetObjectPresignedUrl({
                    fileName : profileImageInput.files[0].name,
                    uploadType : 'PROFILE'
                }).then(async result=>{
                    if(result.code != 0){
                        common.showToastMessage(result.message.split('\n'));
                        return ;
                    }
                    return await fetch(result.data, {
                        method: 'PUT',
                        headers: {
                            'Content-Encoding' : 'base64',
				            'Content-Type' : 'application/octet-stream',
                        },
                        body: profileImageInput.files[0]
                    }).then(res=>{
                        if( ! (res.status == 200 || res.status == 201) ) throw new Error(res.status)
                        return result.data.split('?')[0]
                    }).catch(err=>{
                        console.error(err);
                        return;
                    })
                })
                if( ! profileImageUrl) {
                    profileImageUrl = accountHandler.accountInfo.profileImage;
                    profileChangeFailed = true;
                }
                profileImageInput.files = new DataTransfer().files;
            }
            
            window.myAPI.account.updateSimpleAccountInfo({
                fullName, jobGrade, department, profileImage : profileImageUrl
            }).then(result => {
                console.log('result updateSimpleAccountInfo ::: ', result);
                
                if(accountHandler.accountInfo.fullName != fullName){
                    window.myAPI.room.createMySelfRoom({workspaceId : workspaceHandler.workspaceId});
                }

                accountHandler.searchAccountInfo();
                imgTempUrlList.forEach(async e=> {
                    URL.revokeObjectURL(e);
                })
                if(profileChangeFailed){ 
                    common.showToastMessage([result.message, '그러나 프로필 이미지 변경은 실패하였습니다.']);
                }else{
                    common.showToastMessage([result.message]);
                }
                simpleProfileContainer.remove();
            })

        }
        simpleProfileContainer.simple_profile_cancel_button.onclick = () => {
            simpleProfileContainer.remove();
        }
        li.append(title);
        li.onmouseenter = () => {
            if(document.activeElement == profileImageInput) {
                return;
            }else if(li.hasAttribute('data-is_not_leave')){
                li.removeAttribute('data-is_not_leave')
                return;
            }
            li.append(simpleProfileContainer)
            this.#positionRemain(simpleProfileContainer)
        }
        li.onmouseleave = () => {
            if(document.activeElement == profileImageInput) {
                return;
            }else if(li.hasAttribute('data-is_not_leave')){
                li.removeAttribute('data-is_not_leave')
                return;
            }
            simpleProfileContainer.remove();
        }
        li.onclick = (event) => {
            if(event.target != li && event.target != title) return;
            
            if(simpleProfileContainer.isConnected){
                simpleProfileContainer.remove()
            }else{
                li.append(simpleProfileContainer)
                this.#positionRemain(simpleProfileContainer)
            }
        }

        return li;
    }
    #createPermitRequest(){
        let li = Object.assign(document.createElement('li'), {

        });
        let title = Object.assign(document.createElement('span'),{
            textContent: 'Attend Request'
        })
        
        let attendRequestWrapper = Object.assign(document.createElement('div'), {
            className: 'attend_request_wrapper',
            innerHTML : `
                <div class="attend_request_search_container">
                    <input type="search" placeholder="search user" list="attend_request_filter" class="attend_request_search"/>
                    <datalist id="attend_request_filter" class="attend_request_filter">
                    </datalist>
                </div>
            `
        })
        let attendRequestSearch = attendRequestWrapper.querySelector('.attend_request_search');
        
        let attendRequestFilter = attendRequestWrapper.querySelector('.attend_request_filter');
        
        let attendRequest = Object.assign(document.createElement('ul'), {
            className: 'attend_request_container list_scroll list_scroll-y',
        });

        attendRequestWrapper.append(attendRequest);

        li.append(title);
        li.onmouseenter = () => {
            if(document.activeElement == attendRequestSearch) {
                return;
            }else if(li.hasAttribute('data-is_not_leave')){
                li.removeAttribute('data-is_not_leave')
                return;
            }
            li.append(attendRequestWrapper)
            this.#positionRemain(attendRequestWrapper)
        }
        li.onmouseleave = (event) => {
            if(document.activeElement == attendRequestSearch) {
                return;
            }else if(li.hasAttribute('data-is_not_leave')){
                li.removeAttribute('data-is_not_leave')
                return;
            }
            attendRequestWrapper.remove();
        }

        li.onclick = (event) => {
            if(event.target != li && event.target != title) return;
            
            if(attendRequestWrapper.isConnected){
                attendRequestWrapper.remove()
            }else{
                li.append(attendRequestWrapper)
                this.#positionRemain(attendRequestWrapper)
            }
        }
        return {li, title, attendRequest, attendRequestWrapper, attendRequestSearch, attendRequestFilter};
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

    #createLogout(){
        let li = Object.assign(document.createElement('li'), {
            className: 'pointer'
        })
        let title = Object.assign(document.createElement('span'), {
            textContent : 'Logout'
        });
        li.append(title);
        li.onclick = () => {
            window.myAPI.logout().then( () => {
                window.myAPI.pageChange.changeWokrspacePage();
            });
        }

        return li
    }

    /**
     * 
     * @param {HTMLElement} target 
     */
    #positionRemain(target){
        target.style.display = 'none';
        let appendAwait = setInterval(()=>{
            if( ! target.isConnected) return;
            target.style.display = '';
            clearInterval(appendAwait);
            let originRect = target.getBoundingClientRect() 

            if(originRect.left < 0){
                target.style.left = '100%';
            }

            if(target.getBoundingClientRect().right > window.outerWidth){
                target.style.left = '0%';
                target.style.right = '0%';
                if(window.getComputedStyle(target).position != 'fixed'){
                    target.style.top = '100%';
                }
                //target.style.top = this.#container.getBoundingClientRect().bottom + 'px';
                
            }
        },50);
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
        contentList.push(this.#createLogout());
        this.#container.replaceChildren(...contentList)
    }

    close(){
        this.#wrap.remove();
    }

    get wrap(){
        return this.#wrap;
    }
    

}
