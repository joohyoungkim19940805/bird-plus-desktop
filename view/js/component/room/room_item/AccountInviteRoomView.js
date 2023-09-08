import workspaceHandler from "../../../handler/workspace/WorkspaceHandler";
import LayerPopupTemplate from "./../../LayerPopupTemplate"
import chattingHandler from "./../../../handler/chatting/ChattingHandler"

export default class AccountInviteRoomView extends LayerPopupTemplate{

	#layerContent = Object.assign(document.createElement('div'),{
		innerHTML: `
			<style>
				form#account_invite_room_view{
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					text-align: center;
					gap: 2vh;
					position: relative;
				}
				#account_invite_room_view_account_list{
					width: 50vw;
					height: 50vh;
					overflow-y: auto;
					max-height: 1%;
				}

				#account_invite_room_view_account_list::-webkit-scrollbar{
					display: none;
				}
				#account_invite_room_view_account_list:hover::-webkit-scrollbar{
					display: initial;
					width: 8px;
				}
				#account_invite_room_view_account_list::-webkit-scrollbar-track{
					background: #00000000;
				}
				#account_invite_room_view_account_list::-webkit-scrollbar-thumb {
					background: #d8a1b6;
					border-radius: 100px;
					box-shadow: inset 0 0 5px #000000;
				}
				#account_invite_room_view_account_list::-webkit-scrollbar-thumb:hover {
					/*background: #44070757;*/
					background: #893e3e
				}

				#account_invite_room_view_account_list > li{
					border-top: outset 1px;
					position: relative;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				#account_invite_room_view_account_list > li > input.add_account_check{
				}
				#account_invite_room_view_account_list > li .create_room_view_department, 
				#account_invite_room_view_account_list > li .create_room_view_job_grade,
				#account_invite_room_view_account_list > li .create_room_view_account_name{
					color: #b1b1b1;
				}
				#account_invite_room_view_account_list > li .create_room_view_department,
				#account_invite_room_view_account_list > li .create_room_view_account_name{
					font-weight: lighter;
				}
				#account_invite_room_view_account_list > li .create_room_view_separator{
					color: #6937a16b;
				}
				/*#account_invite_room_view_account_list > li .create_room_view_job_grade,*/
				#account_invite_room_view_account_list > li .create_room_view_full_name,
				#account_invite_room_view_account_list > li .create_room_view_separator{
					font-weight: bold;
				}
				#account_invite_room_view_account_list > li .create_room_view_full_name{
					color: #789bb9b8;
				}
				#account_invite_room_view_account_list > li .create_room_view_account_info{
					width: 100%
				}
			</style>
			<form id="account_invite_room_view">
				<div>
					<label for="account_invite_room_view_search_user">Please enter the users you want to invite.</label>
					<input type="search" id="account_invite_room_view_search_user" name="fullName"/>
				</div>
				<ul id="account_invite_room_view_account_list">
				</ul>
				<div>
					<button type="button" id="account_invite_room_view_button">Invite</button>
				</div>
			</from>
		`
	})

	/**
	 * full 네임으로 검색 ex) ${fullName}(${accountName}) 형식
	 */
	#accountInviteRoomViewAccountList = this.#layerContent.querySelector('#account_invite_room_view_account_list');
	page = 0;
	size = 10;
	#liList = [];
	#workspaceId;
	form = this.#layerContent.querySelector('#account_invite_room_view');
	#roomId;
	#visibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				entry.target.style.visibility = '';
				entry.target.style.opacity = '';
			}else{
				entry.target.style.visibility = 'hidden';
				entry.target.style.opacity = 0;
			}
		})
	}, {
		threshold: 0.1,
		root: this.#accountInviteRoomViewAccountList
	});

	#lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				this.page += 1;
				let roomName = this.form.fullName.value;
				this.callData(this.page, this.size, this.#workspaceId, roomName).then(data=>{
					this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
					if(this.page >= data.totalPages){
						this.#lastItemVisibleObserver.disconnect();
					}
				})
			}
		})
	}, {
		threshold: 0.1,
		root: document//this.#elementMap.roomContentList
	});

	#inviteAccountMapper = {};

	constructor(owner){
		super(owner);
		super.container.append(this.#layerContent)
		workspaceHandler.addWorkspaceIdChangedListener = {
			name: 'accountInviteRoomView',
			callBack: (handler) => {
				this.workspaceId = handler.workspaceId;
			},
			runTheFirst: true
		}
		this.form.onsubmit = (event) => {
			//console.log(event);
			event.preventDefault();
			/*let fullName = this.form.create_room_search_user.value;
			this.reset();
			this.callData(this.page, this.size, this.#workspaceId, fullName).then(data => {
				this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
			});*/
		};
		this.form.account_invite_room_view_search_user.onkeydown = (event) => {
			if(event.key != 'Enter'){
				return;
			}
			let fullName = this.form.account_invite_room_view_search_user.value;
			this.reset();
			this.callData(this.page, this.size, this.#workspaceId, fullName).then(data => {
				this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
			});
		}
		this.form.account_invite_room_view_search_user.oninput = (event) => {
			if(this.form.account_invite_room_view_search_user.value == ''){
				this.reset();
				this.callData(this.page, this.size, this.#workspaceId).then(data => {
					this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
				});
			}
		}
		
		this.form.account_invite_room_view_button.onclick = (event) => {
			super.close();
			console.log(chattingHandler.room);
			window.myAPI.room.createRoomInAccount(
				Object.values(this.#inviteAccountMapper).map(e=>{	
					return {
						roomId: chattingHandler.roomId,
						accountName: e.account_name,
						fullName: e.fullName,
						workspaceId: e.workspace_id,
						jobGrade: e.jobGrade,
						department: e.department,
						roomType: chattingHandler.room.roomType	
					};
				})
			)
		}
	}
	
	callData(page, size, workspaceId, fullName){
		return window.myAPI.workspace.searchWorkspaceInAccount({
			page, size, workspaceId, fullName
		}).then((data = {}) =>{
			return data.data;
		});
	}

	createPage(data, roomName = ''){
		return new Promise(resolve => {
			let {content = []} = data || {};
			if(content.length == 0){
				resolve(content);
			}

			let liList = content.map(item => {
				let {
					accountName,
					fullName,
					workspaceId,
					jobGrade,
					department
				} = item;
				
				let departmentHtml = department ? `<small class="create_room_view_department">${department}</small>` : '';
				let separatorHtml = department && jobGrade ? `<span class="create_room_view_separator">/&nbsp</span>` : '';
				let jobGradeHtml = jobGrade ? `${separatorHtml}<small class="create_room_view_job_grade">${jobGrade}</small>` : '';

				let li = Object.assign(document.createElement('li'), {
					className: 'pointer',
					innerHTML: `
						<div class="create_room_view_account_info">
							<div>
								<span class="create_room_view_full_name">${fullName}</span>
								<span class="create_room_view_account_name">(${accountName})</span>
							</div>
							<div>
								${departmentHtml}
								${jobGradeHtml}
							</div>
						</div>
						<input type="checkbox" name="add_account_check" class="add_account_check pointer" ${this.#inviteAccountMapper.hasOwnProperty(accountName) ? 'checked' : ''}/>
					`
				});
				Object.assign(li.dataset,{
					account_name: accountName,
					full_name: fullName,
					workspace_id: workspaceId,
					job_grade: jobGrade,
					department
				});
				this.#visibleObserver.observe(li);
				this.#addItemEvent(li);
				return li;
			})

			this.#liList.push(...liList);
			this.#accountInviteRoomViewAccountList.replaceChildren(...this.#liList);
			resolve(liList);
		});
	}

	addListItemVisibleEvent(liList){
		return new  Promise(resolve => {
			if(liList.length == 0){
				resolve(liList);
			}
			this.#lastItemVisibleObserver.disconnect();
			this.#lastItemVisibleObserver.observe(liList[liList.length - 1]);
			resolve(liList);
		})
	}
	#addItemEvent(li){
		return new Promise(resolve => {
			let checkbox = li.querySelector('[name="add_account_check"]');
			li.onclick = (event) => {
				if(event.target === checkbox){
					return;
				}
				checkbox.click();
			}
			checkbox.onchange = (event) => {
				if(checkbox.checked){
					this.#inviteAccountMapper[li.dataset.account_name] = Object.assign({}, li.dataset)
				}else{
					delete this.#inviteAccountMapper[li.dataset.account_name]
				}
			}
			resolve(li);
		});
	}
	reset(){
		this.page = 0;
		this.#liList = [];
		this.#visibleObserver.disconnect();
		this.#lastItemVisibleObserver.disconnect();
		this.#accountInviteRoomViewAccountList.replaceChildren();
	}

	set roomId(roomId){
		if( ! roomId){
			console.error('roomId is undefined');
            return;
        }
		this.#roomId = roomId;
	}

	get roomId(){
		return this.#roomId;
	}

	set workspaceId(workspaceId){
		this.#workspaceId = workspaceId;
	}
	get workspaceId(){
		return this.#workspaceId;
	}
}