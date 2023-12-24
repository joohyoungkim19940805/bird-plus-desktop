import workspaceHandler from "@handler/workspace/WorkspaceHandler";
import LayerPopupTemplate from "@component/LayerPopupTemplate";
import roomHandler from "@handler/room/RoomHandler";

import { accountHandler } from "@handler/account/AccountHandler";

export default class GiveAdminView extends LayerPopupTemplate{

	#layerContent = Object.assign(document.createElement('div'),{
		innerHTML: `
			<style>
				form#give_admin_view{
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					text-align: center;
					gap: 2vh;
					position: relative;
				}
				#give_admin_view_account_list{
					width: 80%;
					height: 50vh;
					overflow-y: auto;
					max-height: 1%;
				}

				#give_admin_view_account_list::-webkit-scrollbar{
					display: none;
				}
				#give_admin_view_account_list:hover::-webkit-scrollbar{
					display: initial;
					width: 8px;
				}
				#give_admin_view_account_list::-webkit-scrollbar-track{
					background: #00000000;
				}
				#give_admin_view_account_list::-webkit-scrollbar-thumb {
					background: #d8a1b6;
					border-radius: 100px;
					box-shadow: inset 0 0 5px #000000;
				}
				#give_admin_view_account_list::-webkit-scrollbar-thumb:hover {
					/*background: #44070757;*/
					background: #893e3e
				}

				#give_admin_view_account_list > li{
					border-top: outset 1px;
					position: relative;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				#give_admin_view_account_list > li > input.add_account_check{
				}
				#give_admin_view_account_list > li .create_room_view_department, 
				#give_admin_view_account_list > li .create_room_view_job_grade,
				#give_admin_view_account_list > li .create_room_view_account_name{
					color: #b1b1b1;
				}
				#give_admin_view_account_list > li .create_room_view_department,
				#give_admin_view_account_list > li .create_room_view_account_name{
					font-weight: lighter;
				}
				#give_admin_view_account_list > li .create_room_view_separator{
					color: #6937a16b;
				}
				/*#give_admin_view_account_list > li .create_room_view_job_grade,*/
				#give_admin_view_account_list > li .create_room_view_full_name,
				#give_admin_view_account_list > li .create_room_view_separator{
					font-weight: bold;
				}
				#give_admin_view_account_list > li .create_room_view_full_name{
					color: #789bb9b8;
				}
				#give_admin_view_account_list > li .create_room_view_account_info{
					width: 100%
				}
			</style>
			<form id="give_admin_view">
				<div>
					<label for="give_admin_view_search_user">Please enter the users you want to invite.</label>
					<input type="search" id="give_admin_view_search_user" name="fullName"/>
				</div>
				<ul id="give_admin_view_account_list">
				</ul>
				<div>
					<button type="button" id="give_admin_view_button">Give Admin</button>
				</div>
			</from>
		`
	})

	/**
	 * full 네임으로 검색 ex) ${fullName}(${accountName}) 형식
	 */
	#accountInviteRoomViewAccountList = this.#layerContent.querySelector('#give_admin_view_account_list');
	page = 0;
	size = 10;
	#liList = [];
	form = this.#layerContent.querySelector('#give_admin_view');

	#lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				this.page += 1;
				this.callData(this.page, this.size, workspaceHandler.workspaceId, this.form.fullName.value).then(data=>{
					this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList))
					.then((liList)=>{
						if(this.page >= data.totalPages || liList.length == 0){
							this.#lastItemVisibleObserver.disconnect();
						}
					});
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
			name: 'giveAdminView',
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
		this.form.give_admin_view_search_user.onkeydown = (event) => {
			if(event.key != 'Enter'){
				return;
			}
			let fullName = this.form.give_admin_view_search_user.value;
			this.reset();
			this.callData(this.page, this.size, workspaceHandler.workspaceId, fullName).then(data => {
				this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
			});
		}
		this.form.give_admin_view_search_user.oninput = (event) => {
			if(this.form.give_admin_view_search_user.value == ''){
				this.reset();
				this.callData(this.page, this.size, workspaceHandler.workspaceId).then(data => {
					this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
				});
			}
		}
		
		this.form.give_admin_view_button.onclick = (event) => {
			
			Object.values(this.#inviteAccountMapper).forEach(e=>{
				console.log(e);
				window.myAPI.workspace.createGiveAdmin({
					id:e.id,
					workspaceId: e.workspace_id
				}).then((result)=>{
					console.log(result)
				})
			})
			this.#inviteAccountMapper = {};
			super.close();
		}
	}
	
	callData(page, size, workspaceId, fullName){
		console.log({page, size, workspaceId, fullName})
		return window.myAPI.workspace.searchWorkspaceInAccount({
			page, size, workspaceId, fullName
		}).then((data = {}) =>{
			console.log(data);
			return data.data;
		});
	}

	createPage(data, roomName = ''){
		return new Promise(resolve => {
			let {content = []} = data || {};
			if(content.length == 0){
				resolve(content);
			}

			let liList = content.filter(e=> ! e.isAdmin).map(item => {
				let {
					id,
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
					id,
					account_name: accountName,
					full_name: fullName,
					workspace_id: workspaceId,
					job_grade: jobGrade,
					department
				});
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
			this.#lastItemVisibleObserver.observe(liList.at(-1));
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
		this.#lastItemVisibleObserver.disconnect();
		this.#accountInviteRoomViewAccountList.replaceChildren();
	}

}