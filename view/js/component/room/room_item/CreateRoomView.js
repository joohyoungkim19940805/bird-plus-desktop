import LayerPopupTemplate from "./../../LayerPopupTemplate"

export default class CreateRoomView extends LayerPopupTemplate{

	#layerContent = Object.assign(document.createElement('div'),{
		innerHTML: `
			<style>
				form#create_room_view{
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					text-align: center;
					gap: 2vh;
					position: relative;
				}
				label[for="room-is-private"]{
					display: flex;
    				align-items: center;
				}
				#create_room_view_account_list{
					width: 30vw;
					height: 30vh;
					overflow-y: auto;
					max-height: 1%;
				}
				#create_room_view_account_list > li{
					border-top: outset 1px;
				}
				#create_room_view_account_list > li .create_room_view_department, 
				#create_room_view_account_list > li .create_room_view_job_grade,
				#create_room_view_account_list > li .create_room_view_account_name{
					color: #b1b1b1;
				}
				#create_room_view_account_list > li .create_room_view_department,
				#create_room_view_account_list > li .create_room_view_account_name{
					font-weight: lighter;
				}
				#create_room_view_account_list > li .create_room_view_separator{
					color: #6937a16b;
				}
				/*#create_room_view_account_list > li .create_room_view_job_grade,*/
				#create_room_view_account_list > li .create_room_view_full_name,
				#create_room_view_account_list > li .create_room_view_separator{
					font-weight: bold;
				}
				
				#create_room_view_account_list > li .create_room_view_full_name{
					color: #789bb9b8;
				}
			</style>
			<form id="create_room_view">
				<div>
					<div>
						<label for="create_room_name">your room name</label>
					</div>
					<input name="roomName" id="create_room_name" />
				</div>
				<div>
					<label for"create_room_search_user">Please enter the users you want to invite.</label>
					<input type="text" name="fullName"/>
				</div>
				<ul id="create_room_view_account_list">
				</ul>
				<div>
					<label for="room-is-private" class="pointer">room is private?
						<input type="checkbox" id="room-is-private" name="roomType" class="pointer"/>
					</label>
				</div>
				<div>
					<button type="submit">Create</button>
				</div>
			</from>
		`
	})

	/**
	 * full 네임으로 검색 ex) ${fullName}(${accountName}) 형식
	 */
	#createRoomviewAccountList = this.#layerContent.querySelector('#create_room_view_account_list');
	#accountListPage = 0;
	#accountListSize = 10;
	#liList = [];
	#workspaceId;
	#form = this.#layerContent.querySelector('#create_room_view');

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
		root: this.#createRoomviewAccountList
	});

	#lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				this.#accountListPage += 1;
				let roomName = this.#form.fullName.value;
				this.callData(this.#accountListPage, this.#accountListSize, this.#workspaceId, roomName).then(data=>{
					this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
					if(this.#accountListPage >= data.totalPages){
						this.#lastItemVisibleObserver.disconnect();
					}
				})
			}
		})
	}, {
		threshold: 0.1,
		root: document//this.#elementMap.roomContentList
	});

	constructor(workspaceId){
		super();
		this.#workspaceId = workspaceId;
		console.log()
		this.#form = this.#layerContent.querySelector('#create_room_view');
		super.container.append(this.#layerContent)

		super.onOpenCloseCallBack = (status) => {
			console.log(status);
			if(status == 'open'){
				this.reset();
				this.callData(this.#accountListPage, this.#accountListSize, this.#workspaceId).then(data => {
					this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
				}).catch(e=>console.error(e))

			}else{

			}
		}

		this.#form.onsubmit = (event) => {
			event.preventDefault();
		};
		super.open();
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
			console.log(content);
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
						<div>
							<span class="create_room_view_full_name">${fullName}</span>
							<span class="create_room_view_account_name">(${accountName})</span>
						</div>
						<div>
							${departmentHtml}
							${jobGradeHtml}
						</div>
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
			this.#createRoomviewAccountList.replaceChildren(...this.#liList);
			resolve(liList);
		});
	}

	addListItemVisibleEvent(liList){
		console.log(liList);
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
			li.onclick = () => {
				console.log(li);
			}
			resolve(li);
		});
	}
	reset(){
		this.#accountListPage = 0;
		this.#liList = [];
		this.#visibleObserver.disconnect();
		this.#lastItemVisibleObserver.disconnect();
		this.#createRoomviewAccountList.replaceChildren();
	}
}