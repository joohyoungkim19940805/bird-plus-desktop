import roomContainer from "./../component/room/RoomContainer"
import chattingContainer from "./../component/chatting/ChattingContainer"

import roomHandler from "../handler/room/RoomHandler"
import chattingHandler from "../handler/chatting/ChattingHandler"

const visibleObserver = new IntersectionObserver((entries, observer) => {
	entries.forEach(entry =>{
		let {isIntersecting, target} = entry;
		if (isIntersecting){
			target.style.visibility = '';
			target.style.opacity = '';
			target.dataset.visibility = 'v';
		}else{
			target.style.visibility = 'hidden';
			target.style.opacity = 0;
			target.dataset.visibility = 'h';
		}
	})
}, {
	threshold: 0.01,
	root: document
});
new MutationObserver( (mutationList, observer) => {
	mutationList.forEach((mutation) => {
		let {addedNodes, removedNodes} = mutation;
		new Promise(resolve=> {
			addedNodes.forEach(async e => {
				if(e.nodeType !== Node.ELEMENT_NODE || (e.nodeType === Node.ELEMENT_NODE && e.hasAttribute('data-is_not_visible_target'))){
					return;
				}
				new Promise(res=>{
					visibleObserver.observe(e);
					res();
				})
			})
			resolve();
		})
		new Promise(resolve=> {
			removedNodes.forEach(async e => {
				if(e.nodeType !== Node.ELEMENT_NODE || (e.nodeType === Node.ELEMENT_NODE && e.hasAttribute('data-is_not_visible_target'))){
					return;
				}
				new Promise(res=>{
					visibleObserver.unobserve(e);
					res();
				})
			})
			resolve();
		})
	})
}).observe(document, {
	childList: true,
	subtree: true
})

window.addEventListener("DOMContentLoaded", (event) => {
	let workspaceIdResolve;
	let workspaceIdPromise = new Promise(resolve=>{
		workspaceIdResolve = resolve;
	})
	window.myAPI.workspace.getWorkspaceId().then(workspaceId=>{
		if(workspaceId != undefined){
			workspaceIdResolve(workspaceId);
		}
		window.myAPI.event.electronEventTrigger.addElectronEventListener('workspaceChange', event => {
			let newWorkspaceId = event.workspaceId
			if(workspaceId == newWorkspaceId){
				return;
			}
			if(newWorkspaceId != undefined){
				workspaceIdResolve(newWorkspaceId)
			}
			//event.workspaceId
		})
	})
	workspaceIdPromise.then(workspaceId => {
		document.querySelector('#main').append(
			roomContainer.wrap,
			chattingContainer.wrap
		)

		window.myAPI.room.createMySelfRoom({workspaceId}).then(result => { 
			// 방에 접속하면 자기 자신의 방을 무조건 생성하는 리퀘스트를 날린다.(어차피 서버에서 체크)
			if(result.code == 0){
				roomHandler.roomId = result.data.id;
			}
		})
		
		window.myAPI.stream.initWorkspaceStream({workspaceId});
	})
});
