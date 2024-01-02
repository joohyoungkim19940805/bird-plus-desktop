
import {roomContainer} from "@component/room/RoomContainer"
import {chattingContainer} from "@component/chatting/ChattingContainer"
import {noticeBoardContainer} from "@component/notice_board/NoticeBoardContainer"

import {roomHandler} from "@handler/room/RoomHandler"

import {workspaceHandler} from "@handler/workspace/WorkspaceHandler"

import HeaderDefault from "@component/header/HeaderDefault"

import CommonInit from "@root/js/CommonInit";

window.customElements.define('header-default', HeaderDefault);

new CommonInit('mainPage');

window.addEventListener("DOMContentLoaded", (event) => {

	document.body.classList.add('default')
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
			roomContainer.wrap,
			chattingContainer.wrap
		)
		workspaceHandler.addWorkspaceIdChangedListener = {
			name: 'mainPageRenderer',
			callback : () => {
				window.myAPI.room.createMySelfRoom({workspaceId}).then(result => { 
					console.log(result);
					// 방에 접속하면 자기 자신의 방을 무조건 생성하는 리퀘스트를 날린다.(어차피 서버에서 체크)
					if(result.code == 0){
						window.myAPI.getOption('lastRoomInfo').then(option=>{
							if( ! option || ! option.OPTION_VALUE){
								roomHandler.roomId = result.data.id;
								return;
							}
							let lastRoomInfo = JSON.parse(option.OPTION_VALUE);
							if(lastRoomInfo.workspaceId != workspaceId){
								roomHandler.roomId = result.data.id;
								return;
							}
							roomHandler.roomId = lastRoomInfo.id;
						})
					}
				})
			},
			runTheFirst: true
		}
		
		window.myAPI.stream.initWorkspaceStream({workspaceId});
	})
});
