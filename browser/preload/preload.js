//const { contextBridge, ipcRenderer } = require('electron')
const { contextBridge, ipcRenderer } = require('electron')

const electronEventTrigger = {
	objectEventListener : {},
	addElectronEventListener : (eventName, callBack) => {
		if(electronEventTrigger.objectEventListener.hasOwnProperty(eventName)){
			electronEventTrigger.objectEventListener[eventName].push(callBack);
		}else{
			electronEventTrigger.objectEventListener[eventName] = [callBack];
		}
	},
	removeElectronEventListener : (eventName) => {
		if(electronEventTrigger.objectEventListener.hasOwnProperty(eventName)){
			delete electronEventTrigger.objectEventListener[eventName]
		}
	},
	trigger(eventName, event, message){
		if(electronEventTrigger.objectEventListener.hasOwnProperty(eventName)){
			electronEventTrigger.objectEventListener[eventName].forEach(async callBack=>{
				new Promise(res=>{
					try{
						callBack(message);
					}catch(err){
						console.error(`${eventName} error message ::: `,err.message);
						console.error(`${eventName} error message ::: `,err.stack);
					}
					res();
				})
			})
		}
	}
};

contextBridge.exposeInMainWorld('myAPI', {

	/**
	 * 단방향 ipc 통신
	 * 보안상의 이유로ipcRenderer.send 전체 API를 직접 노출하지 않습니다. 
	 * Electron API에 대한 렌더러의 액세스를 가능한 한 많이 제한해야 합니다.
	 */
	setTitle1 : (title) => ipcRenderer.send('test', title),
	/**
	 * dialog:IPC 채널 이름 의 접두사는 코드에 영향을 미치지 않습니다. 
	 * 코드 가독성에 도움이 되는 네임스페이스 역할만 합니다.
	 * 보안상의 이유로ipcRenderer.invoke 전체 API를 직접 노출하지 않습니다. 
	 * Electron API에 대한 렌더러의 액세스를 가능한 한 많이 제한해야 합니다. 
	 */
	//openFile : () => ipcRenderer.invoke('dialog:openFile'),
	
	scanningUserDirectory : () => ipcRenderer.invoke('scanningUserDirectory'),
	
	getProjectPath : () => ipcRenderer.invoke('getProjectPath'),

	event : {
		electronEventTrigger : electronEventTrigger,
	},

	stream : {
		initWorkspaceStream : (param) => ipcRenderer.send('initWorkspaceStream', param),
	},

	pageChange : {
		changeLoginPage : () => ipcRenderer.send('changeLoginPage'),
		changeWokrspacePage : () => ipcRenderer.send('changeWokrspacePage'),
		changeMainPage : (workspaceId) => ipcRenderer.send('changeMainPage', workspaceId),
	},

	account : {
		loginProcessing : (param) => ipcRenderer.invoke('loginProcessing', param),
		getAccountInfo : () => ipcRenderer.invoke('getAccountInfo')
	},

	chatting : {
		sendChatting : (param) => ipcRenderer.invoke('sendChatting', param),
		searchChattingList : (param) => ipcRenderer.invoke('searchChattingList', param),
	},
	
	workspace : {
		searchWorkspaceMyJoined : (param) => ipcRenderer.invoke('searchWorkspaceMyJoined', param),
		searchWorkspaceInAccount : (param) => ipcRenderer.invoke('searchWorkspaceInAccount', param),
		getWorkspaceId : () => ipcRenderer.invoke('getWorkspaceId'),
		getWorkspaceDetail : (param) => ipcRenderer.invoke('getWorkspaceDetail', param),
		resetWorkspaceId : () => ipcRenderer.invoke('resetWorkspaceId')
	},

	room : {
		createRoom : (param) => ipcRenderer.invoke('createRoom', param),
		createMySelfRoom : (param)=> ipcRenderer.invoke('createMySelfRoom', param),
		createRoomInAccount : (param) => ipcRenderer.invoke('createRoomInAccount', param),
		createRoomFavorites : (param) => ipcRenderer.invoke('createRoomFavorites', param),
		updateRoomInAccout : (param) => ipcRenderer.invoke('updateRoomInAccout', param),
		updateRoomFavorites : (param) => ipcRenderer.invoke('updateRoomFavorites', param),
		searchRoom : (param) => ipcRenderer.invoke('searchRoom', param),
		searchRoomMyJoined : (param) => ipcRenderer.invoke('searchRoomMyJoined', param),
		searchRoomMyJoinedName : (param) => ipcRenderer.invoke('searchRoomMyJoinedName', param),
		searchRoomFavoritesMyJoined : (param) => ipcRenderer.invoke('searchRoomFavoritesMyJoined', param),
		searchRoomFavoritesMyJoinedName : (param) => ipcRenderer.invoke('searchRoomFavoritesMyJoinedName', param),
		searchRoomInAccountAllList : (param) => ipcRenderer.invoke('searchRoomInAccountAllList', param),
		getRoomDetail : (param) => ipcRenderer.invoke('getRoomDetail', param),
		isRoomFavorites : (param) => ipcRenderer.invoke('isRoomFavorites', param)
	},

	noticeBoard : {
		createNoticeBoard : (param) => ipcRenderer.invoke('createNoticeBoard', param),
		createNoticeBoardGroup : (param) => ipcRenderer.invoke('createNoticeBoardGroup', param),
		deleteNoticeBoard : (param) => ipcRenderer.invoke('deleteNoticeBoard', param),
		deleteNoticeBoardGroup : (param) => ipcRenderer.invoke('deleteNoticeBoardGroup', param),
		searchNoticeBoard : (param) => ipcRenderer.invoke('searchNoticeBoard', param),
		getNoticeBoard : (param) => {},
	},


})

ipcRenderer.on('resized', (event, message) => {
	//console.log(event);
	electronEventTrigger.trigger('resized', event, message);
})

ipcRenderer.on('chattingAccept', (event, message) => {
	electronEventTrigger.trigger('chattingAccept', event, message);
})

ipcRenderer.on('workspaceChange', (event, message) => {
	electronEventTrigger.trigger('workspaceChange', event, message);
})

ipcRenderer.on('roomAccept', (event, message) => {
	electronEventTrigger.trigger('roomAccept', event, message);
})

ipcRenderer.on('roomInAccountAccept', (event, message) => {
	electronEventTrigger.trigger('roomInAccountAccept', event, message);
})

ipcRenderer.on('noticeBoardAccept', (event, message) => {
	electronEventTrigger.trigger('noticeBoardAccept', event, message);
});

ipcRenderer.on('checkForUpdates', (event, message) => {
	if(electronEventTrigger.objectEventListener.hasOwnProperty('checkForUpdates')){
		electronEventTrigger.objectEventListener['checkForUpdates'].forEach(callBack=>{
			callBack(event, message);
		})
	}
})
ipcRenderer.on('updateAvailable', (event, message) => {
	if(electronEventTrigger.objectEventListener.hasOwnProperty('updateAvailable')){
		electronEventTrigger.objectEventListener['updateAvailable'].forEach(callBack=>{
			callBack(event, message);
		})
	}
})
ipcRenderer.on('updateDownloaded', (event, message) => {
	if(electronEventTrigger.objectEventListener.hasOwnProperty('updateDownloaded')){
		electronEventTrigger.objectEventListener['updateDownloaded'].forEach(callBack=>{
			callBack(event, message);
		})
	}
})