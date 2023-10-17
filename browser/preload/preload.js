//const { contextBridge, ipcRenderer } = require('electron')
const { contextBridge, ipcRenderer } = require('electron')

const electronEventTrigger = {
	objectEventListener : {},
	onEvent : {},
	on : (eventName, callBack) => {
		electronEventTrigger.onEvent[eventName] = callBack;
		ipcRenderer.on(eventName, (event, message) => {
			electronEventTrigger.trigger(eventName, event, message);
		})
	},
	addElectronEventListener : (eventName, callBack) => {
		if(electronEventTrigger.objectEventListener.hasOwnProperty(eventName)){
			electronEventTrigger.objectEventListener[eventName].push({ [callBack.name] : callBack });
		}else{
			electronEventTrigger.objectEventListener[eventName] = [{ [callBack.name] : callBack }];
		}
		ipcRenderer.on(eventName, (event, message) => {
			electronEventTrigger.trigger(eventName, event, message);
		})
	},
	removeElectronEventListener : (eventName, callBack) => {
		if(electronEventTrigger.objectEventListener.hasOwnProperty(eventName)){
			if(callBack){
				electronEventTrigger.objectEventListener[eventName] = electronEventTrigger.objectEventListener[eventName].filter(e=> ! e.hasOwnProperty(callBack.name))
			}else{
				delete electronEventTrigger.objectEventListener[eventName]
			}
		}
	},
	trigger : (eventName, event, message) => {
		new Promise(resolve=> {
			if( ! electronEventTrigger.objectEventListener.hasOwnProperty(eventName)){
				resolve();
				return;
			}
			electronEventTrigger.objectEventListener[eventName].forEach(async obj => {
				Object.values(obj).forEach(async callBack => {
					if( ! callBack || ! callBack instanceof Function){
						return;
					}
					new Promise(res=>{	
						try{
							if(eventName == 'checkForUpdates' || eventName == 'updateAvailable' || eventName == 'updateDownloaded'){
								callBack(event,message);
								return;
							}
			
							callBack(message);
						}catch(err){
							console.error(`${eventName} error message ::: `,err.message);
							console.error(`${eventName} error stack ::: `,err.stack);
						}
						res();
					})
				})
			})
			resolve();
		})
		
		new Promise(resolve => {
			console.log(electronEventTrigger.onEvent[eventName]);
			if( ! electronEventTrigger.onEvent[eventName] || ! electronEventTrigger.onEvent[eventName] instanceof Function){
				resolve();
				return;
			}
			try{
				electronEventTrigger.onEvent[eventName](message);
			}catch(err){
				console.error(`${eventName} error message ::: `, err.message);
				console.error(`${eventName} error stack ::: `, err.stack);
			}
			resolve();
		})
		
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
