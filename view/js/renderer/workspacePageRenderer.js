import common from "./../common"; 

import HeaderDefault from "../component/header/HeaderDefault"

window.customElements.define('header-default', HeaderDefault);

new class WorkspacePageRenderer{
	page = 0;
	size = 10;
	workspaceListUl = document.querySelector('#joined_workspace_list');
	liList = [];
	visibleObserver = new IntersectionObserver((entries, observer) => {
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
		root: this.workspaceListUl
	});

	lastItemVisibleObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry =>{
			if (entry.isIntersecting){
				this.page += 1;
				this.callData(this.page, this.size).then(data=>{
					this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
					if(this.page >= data.totalPages){
						this.lastItemVisibleObserver.disconnect();
					}
				})
			}
		})
	}, {
		threshold: 0.1,
		root: this.workspaceListUl
	});

	constructor(){
		this.callData(this.page, this.size).then(data=>{
			this.createPage(data).then(liList=>this.addListItemVisibleEvent(liList));
		})
	}

	callData(page = 1, size = 10){
		return window.myAPI.workspace.searchWorkspaceMyJoined({
			page, size
		}).then((data = {})=>{
			console.log('data ::: ', data.data);
			return data.data;
		});
	}

	createPage(data){
		return new Promise(resolve=>{
			let {content = []} = data || {};
			let liList = content.map(item=>{
				let {accessFilter,
					isEnabled,
					isFinallyPermit,
					joinedCount,
					workspaceId,
					workspaceName
				} = item;
				let li = Object.assign(document.createElement('li'),{
					className: 'pointer',
					innerHTML: `
					<div class="workspace_list_container" style="display: flex;align-items: center;">
						<div>
							<div><b>${workspaceName}</b></div>
							<div>${joinedCount} members</div>
						</div>
					</div>
					`
				});
				common.getProjectPathPromise().then(path => {
					let img = Object.assign(document.createElement('img'),{
						src: `${path}view\\image\\user.png`,
						width: 30
					})
					li.querySelector('.workspace_list_container').prepend(img);
				})
				this.visibleObserver.observe(li);
				this.addItemEvent(li, workspaceId);
				return li;
			});
			this.liList.push(...liList);
			this.workspaceListUl.replaceChildren(...this.liList);
			resolve(liList);
		});
	}

	addItemEvent(li, workspaceId){
		return new Promise(resolve => {
			li.onclick = (event) => {
				window.myAPI.resetWorkspaceId().then(()=>{
					window.myAPI.pageChange.changeMainPage({workspaceId});
				});
			}
			resolve(li);
		});
	}

	addListItemVisibleEvent(liList){
		return new Promise(resolve=>{
			if(liList.length == 0){
				resolve(liList);
			}
			this.lastItemVisibleObserver.disconnect();
			this.lastItemVisibleObserver.observe(liList.at(-1));
			resolve(liList);
		})
	}

	reset(){
		this.page = 1;
		this.liList = [];
		this.visibleObserver.disconnect();
		this.lastItemVisibleObserver.disconnect();
		this.workspaceListUl.replaceChildren();
	}
}();