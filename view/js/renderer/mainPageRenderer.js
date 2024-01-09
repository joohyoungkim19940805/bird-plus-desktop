
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
						roomHandler.selfRoomId = result.data.id;
						window.myAPI.getOption('lastRoomInfo').then(async option=>{
							//마지막에 접속 했던 방 정보가 없는 경우 내 방으로 이동
							if( ! option || ! option.OPTION_VALUE){
								roomHandler.roomId = result.data.id;
								return;
							}
							
							let lastRoomInfo = JSON.parse(option.OPTION_VALUE);
							//마지막에 접속 했던 방 정보가 존재하지만, 워크스페이스 영역이 다른 경우 내 방으로 이동
							if(lastRoomInfo.workspaceId != workspaceId){
								roomHandler.roomId = result.data.id;
								return;
							}

							//마지막에 접속 했던 정보가 존재하지만 내가 참여 한 방이 아닌 경우(로그인 정보가 바뀐 경우가 해당 될 수 있음)
							let isMyAttend = await window.myAPI.room.isMyAttendRoom({roomId: lastRoomInfo.id});
							if( ! isMyAttend){
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
