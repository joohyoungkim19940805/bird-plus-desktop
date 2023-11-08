import chattingContainer from "./../component/chatting/ChattingContainer"
import noticeBoardContainer from "../component/notice_board/NoticeBoardContainer"

import roomHandler from "../handler/room/RoomHandler"
import chattingHandler from "../handler/chatting/ChattingHandler"

const visibleObserver = new IntersectionObserver((entries, observer) => {
	entries.forEach(entry =>{
		let {isIntersecting, target} = entry;
		if(target.hasAttribute('data-visibility_not')){
			return;
		}
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
			noticeBoardContainer.wrap,
			chattingContainer.wrap
		)

        window.myAPI.event.electronEventTrigger.addElectronEventListener('roomChange', event => {
            roomHandler.roomId = event.roomId;
        })

		window.myAPI.stream.initWorkspaceStream({workspaceId});
	})
});