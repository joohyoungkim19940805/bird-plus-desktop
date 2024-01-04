
import {noticeBoardHandler} from "@handler/notice_board/NoticeBoardHandler"
import {noticeBoardDetail} from "@component/notice_board/notice_board_item/NoticeBoardDetail"

import CommonInit from "@root/js/CommonInit";

new CommonInit('multipleNoticeBoard');

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
            noticeBoardDetail.element
		)
        noticeBoardDetail.element.dataset.is_resize = false;
        noticeBoardDetail.element.grow = 1;

        window.myAPI.event.electronEventTrigger.addElectronEventListener('noticeBoardChange', event => {
            noticeBoardHandler.noticeBoardId = event.noticeBoardId;
        })

		window.myAPI.stream.initWorkspaceStream({workspaceId});
	})
});
