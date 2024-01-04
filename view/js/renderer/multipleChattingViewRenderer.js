
import {chattingContainer} from "@component/chatting/ChattingContainer"
import {noticeBoardContainer} from "@component/notice_board/NoticeBoardContainer"

import {roomHandler} from "@handler/room/RoomHandler"

import CommonInit from "@root/js/CommonInit";

new CommonInit('multipleChatting');
window.addEventListener("DOMContentLoaded", (event) => {
	let workspaceIdResolve;
	let workspaceIdPromise = new Promise(resolve=>{
		workspaceIdResolve = resolve;
	})
	window.myAPI.getWorkspaceId().then(workspaceId=>{
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
