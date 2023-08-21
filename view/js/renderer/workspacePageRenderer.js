
new class WorkspacePageRenderer{
	constructor(){
		window.myAPI.chatting.searchMyWorkspaceList({page:1,size:10}).then(data=>{
			console.log(data);
		});
	}
}();