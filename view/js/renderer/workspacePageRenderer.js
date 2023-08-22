
new class WorkspacePageRenderer{
	page = 1;
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
					console.log(this.page, this.size);
					this.createPage(data)
						.then(liList=>this.addListItemVisibleEvent(liList));
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
			this.createPage(data)
				.then(liList=>this.addListItemVisibleEvent(liList));
		})
	}

	callData(page = 1, size = 10){
		return window.myAPI.workspace.searchMyWorkspaceList({page, size}).then(data=>{
			return data;
		});
	}

	createPage(data){
		return new Promise(resolve=>{
			let {content} = data;
			console.log(content);
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
					<div class="workspace_list_container">
						<img src="/images/user.png">
						<div>
							<div><b>${workspaceName}</b></div>
							<div>${joinedCount} members</div>
						</div>
					</div>
					`
				});
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
				window.myAPI.pageChange.changeMainPage({workspaceId});
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
			this.lastItemVisibleObserver.observe(liList[liList.length - 1]);
			resolve(liList);
		})
	}
}();