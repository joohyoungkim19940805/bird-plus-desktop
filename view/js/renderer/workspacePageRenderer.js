
new class WorkspacePageRenderer{
	constructor(){
		window.myAPI.chatting.searchMyWorkspaceList(param).then(data=>{
			console.log(data);
		});
	}
}();