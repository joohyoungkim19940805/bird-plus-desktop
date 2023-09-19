//const { contextBridge, ipcRenderer } = require('electron')
const { contextBridge, ipcRenderer } = require('electron')
//console.log('test<<<', __project_path);
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

	pageChange : {
		changeLoginPage : () => ipcRenderer.send('changeLoginPage'),
		changeWokrspacePage : () => ipcRenderer.send('changeWokrspacePage'),
		changeMainPage : (workspaceId) => ipcRenderer.send('changeMainPage', workspaceId),
	},

	account : {
		loginProcessing : (param) => ipcRenderer.invoke('loginProcessing', param),
		getAccountInfo : () => ipcRenderer.invoke('getAccountInfo')
	},
	
	event : {
		electronEventTrigger : electronEventTrigger,
	},

	chatting : {
		chattingReady : (param) => ipcRenderer.send('chattingReady', param),
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
	}

})

ipcRenderer.on('resized', (event, message) => {
	//console.log(event);
	if(electronEventTrigger.objectEventListener.hasOwnProperty('resized')){
		electronEventTrigger.objectEventListener['resized'].forEach(callBack=>{
			/**
			 * event 객체에 메인 프로세스에 접근할 수 있는 내용이 포함되어 있는 것 처럼 보이는데
			 * 렌더러 프로세스로 이벤트 객체를 전송해도 되는지?
			 */
			callBack(message);
		})
	}
})

ipcRenderer.on('chattingAccept', (event, message) => {
	if(electronEventTrigger.objectEventListener.hasOwnProperty('chattingAccept')){
		electronEventTrigger.objectEventListener['chattingAccept'].forEach(callBack=>{
			callBack(message);
		})
	}
})

ipcRenderer.on('workspaceChange', (event, message) => {
	if(electronEventTrigger.objectEventListener.hasOwnProperty('workspaceChange')){
		electronEventTrigger.objectEventListener['workspaceChange'].forEach(callBack=>{
			callBack(message);
		})
	}
})

ipcRenderer.on('roomInAccountCallBack', (event, message) => {
	if(electronEventTrigger.objectEventListener.hasOwnProperty('roomInAccountCallBack')){
		electronEventTrigger.objectEventListener['roomInAccountCallBack'].forEach(async callBack=>{
			new Promise(res=>{
				callBack(message);
				res();
			})
		})
	}
})

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