import workspaceHandler from "../../handler/workspace/WorkspaceHandler";
import LayerPopupTemplate from "./../LayerPopupTemplate"
import chattingHandler from "./../../handler/chatting/ChattingHandler";

export default class CreateMessengerView extends LayerPopupTemplate{

	#layerContent = Object.assign(document.createElement('div'),{
		innerHTML: `
			<style>
				form#create_messenger_view{
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					text-align: center;
					gap: 2vh;
					position: relative;
				}
				#create_messenger_view_account_list{
					width: 30vw;
					height: 50vh;
					overflow-y: auto;
					max-height: 1%;
				}

				#create_messenger_view_account_list::-webkit-scrollbar{
					display: none;
				}
				#create_messenger_view_account_list:hover::-webkit-scrollbar{
					display: initial;
					width: 8px;
				}
				#create_messenger_view_account_list::-webkit-scrollbar-track{
					background: #00000000;
				}
				#create_messenger_view_account_list::-webkit-scrollbar-thumb {
					background: #d8a1b6;
					border-radius: 100px;
					box-shadow: inset 0 0 5px #000000;
				}
				#create_messenger_view_account_list::-webkit-scrollbar-thumb:hover {
					/*background: #44070757;*/
					background: #893e3e
				}

				#create_messenger_view_account_list > li{
					border-top: outset 1px;
					position: relative;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				#create_messenger_view_account_list > li > input.add_account_check{
				}
				#create_messenger_view_account_list > li .create_room_view_department, 
				#create_messenger_view_account_list > li .create_room_view_job_grade,
				#create_messenger_view_account_list > li .create_room_view_account_name{
					color: #b1b1b1;
				}
				#create_messenger_view_account_list > li .create_room_view_department,
				#create_messenger_view_account_list > li .create_room_view_account_name{
					font-weight: lighter;
				}
				#create_messenger_view_account_list > li .create_room_view_separator{
					color: #6937a16b;
				}
				/*#create_messenger_view_account_list > li .create_room_view_job_grade,*/
				#create_messenger_view_account_list > li .create_room_view_full_name,
				#create_messenger_view_account_list > li .create_room_view_separator{
					font-weight: bold;
				}
				#create_messenger_view_account_list > li .create_room_view_full_name{
					color: #789bb9b8;
				}
				#create_messenger_view_account_list > li .create_room_view_account_info{
					width: 100%
				}
			</style>
			<form id="create_messenger_view">
				<div>
					<label for="create_messenger_view_search_user">Please enter the users you want to invite.</label>
					<input type="search" id="create_messenger_view_search_user" name="fullName"/>
				</div>
				<ul id="create_messenger_view_account_list">
				</ul>
				<div>
					<button type="button" id="create_messenger_view_button">Create</button>
				</div>
			</from>
		`
	})

	/**
	 * full 네임으로 검색 ex) ${fullName}(${accountName}) 형식
	 */
	#accountInviteRoomViewAccountList = this.#layerContent.querySelector('#create_messenger_view_account_list');
	page = 0;
	size = 10;
	#liList = [];
	#workspaceId;
	form = this.#layerContent.querySelector('#create_messenger_view');
	#roomId;

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
			name: 'createMessengerView',
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
		this.form.create_messenger_view_search_user.onkeydown = (event) => {
			if(event.key != 'Enter'){
				return;
			}
			let fullName = this.form.create_messenger_view_search_user.value;
			this.reset();
			this.callData(this.page, this.size, this.#workspaceId, fullName).then(data => {
				this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
			});
		}
		this.form.create_messenger_view_search_user.oninput = (event) => {
			if(this.form.create_messenger_view_search_user.value == ''){
				this.reset();
				this.callData(this.page, this.size, this.#workspaceId).then(data => {
					this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
				});
			}
		}
		
		this.form.create_messenger_view_button.onclick = (event) => {
			window.myAPI.account.getAccountInfo()
			.then(accountInfo => {
				console.log(accountInfo);
				let createRoomParam = {
					roomName : Object.values(this.#inviteAccountMapper).map(e=>{
						return e.full_name
					}).join(', ') + ', ' +accountInfo.fullName,
					workspaceId : this.#workspaceId,
					roomType : 'MESSENGER'
				}
				window.myAPI.room.createRoom(createRoomParam).then((createRoomEvent)=>{
					console.log(createRoomEvent);
					if(createRoomEvent.code == 0){
						this.roomId = createRoomEvent.data.id;
						super.close();
						window.myAPI.room.createRoomInAccount(
							Object.values(this.#inviteAccountMapper).map(e=>{	
								return {
									roomId: createRoomEvent.data.id,
									accountName: e.account_name,
									fullName: e.fullName,
									workspaceId: e.workspace_id,
									jobGrade: e.jobGrade,
									department: e.department,
									roomType: 'MESSENGER',
								};
							})
						)
						return;
					}
					alert(createRoomEvent.message);
				});
			})
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