import RoomContainer from "./../component/room/RoomContainer"
import ChattingContainer from "./../component/chatting/ChattingContainer"

import roomHandler from "../handler/room/RoomHandler"
import chattingHandler from "../handler/chatting/ChattingHandler"
import EditorHandler from "../handler/editor/EditorHandler"

window.customElements.define('free-will-editor', EditorHandler);

const visibleObserver = new IntersectionObserver((entries, observer) => {
	entries.forEach(entry =>{
		let {isIntersecting, target} = entry;
		if (isIntersecting){
			target.style.visibility = '';
			target.style.opacity = '';
		}else{
			target.style.visibility = 'hidden';
			target.style.opacity = 0;
		}
	})
}, {
	threshold: 0.1,
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
		const roomContainer = new RoomContainer(
			document.querySelector('#room')
		)
		
		const chattingContainer = new ChattingContainer(
			document.querySelector('#chatting')
		)
		
		window.myAPI.room.createMySelfRoom({workspaceId}).then(result => {
			// 사용자가 초대되어서 입장한 건지 뭔지 구분하기 귀찮으니 
			// 방에 접속하면 자기 자신의 방을 무조건 생성하는 리퀘스트를 날린다.(어차피 서버에서 체크)
			if(result.code == 0){
				roomHandler.roomId = result.data.id;
			}
		})

		window.myAPI.chatting.chattingReady({workspaceId});

	})
});
