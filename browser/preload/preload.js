//const { contextBridge, ipcRenderer } = require('electron')
const { contextBridge, ipcRenderer } = require('electron')

/**
 * @author kimjoohyoung
 * @description 기본적으로 사용 할 preload 정의
 */

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
							throw new Error('');
						}
						res();
					})
				})
			})
			resolve();
		})
		
		new Promise(resolve => {
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
	//setTitle : (param) => ipcRenderer.send('setTitle', param),
	/**
	 * dialog:IPC 채널 이름 의 접두사는 코드에 영향을 미치지 않습니다. 
	 * 코드 가독성에 도움이 되는 네임스페이스 역할만 합니다.
	 * 보안상의 이유로ipcRenderer.invoke 전체 API를 직접 노출하지 않습니다. 
	 * Electron API에 대한 렌더러의 액세스를 가능한 한 많이 제한해야 합니다. 
	 */
	//openFile : () => ipcRenderer.invoke('dialog:openFile'),
	
	/**
	 * key-value가 아닌 함수는 일렉트론에서만쓰고 웹버전에서는 쓰지 않도록 합니다.
	 * event.electronEventTrigger은 일렉트론 + 웹이 함께써야 하는 부분이 있어 예외입니다.
	 */

	scanningUserDirectory : () => ipcRenderer.send('scanningUserDirectory'),
	
	getProjectPath : () => ipcRenderer.invoke('getProjectPath'),

	createSubWindow : (param) => ipcRenderer.send('createSubWindow', param), 

	closeRequest : (param) => ipcRenderer.send('closeRequest'),
	
	maximizeRequest : () => ipcRenderer.send('maximizeRequest'),

	unmaximizeRequest : () => ipcRenderer.send('unmaximizeRequest'),
	
	minimizeRequest : () => ipcRenderer.send('minimizeRequest'),
	
	restoreRequest : () => ipcRenderer.send('restoreRequest'),
	
	isMaximize : () => ipcRenderer.invoke('isMaximize'),

	resetWorkspaceId: () => ipcRenderer.invoke('resetWorkspaceId'),

	getWorkspaceId: () => ipcRenderer.invoke('getWorkspaceId'),

	notifications: (param) => ipcRenderer.send('notifications', param),

	getOption: (optionName) => ipcRenderer.invoke('getOption', optionName),
	setOption: (param) => ipcRenderer.send('setOption', param),

	isLogin: () => ipcRenderer.invoke('isLogin'),

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
		getAccountInfo : () => ipcRenderer.invoke('getAccountInfo'),
		updateSimpleAccountInfo : (param) => ipcRenderer.invoke('updateSimpleAccountInfo', param)
	},

	chatting : {
		sendChatting : (param) => ipcRenderer.invoke('sendChatting', param),
		deleteChatting : (param) => ipcRenderer.invoke('deleteChatting', param),
		searchChattingList : (param) => ipcRenderer.invoke('searchChattingList', param),
	},
	
	workspace : {
		searchWorkspaceMyJoined : (param) => ipcRenderer.invoke('searchWorkspaceMyJoined', param),
		searchWorkspaceInAccount : (param) => ipcRenderer.invoke('searchWorkspaceInAccount', param),
		getWorkspaceDetail : (param) => ipcRenderer.invoke('getWorkspaceDetail', param),
		createPermitWokrspaceInAccount: (param) => ipcRenderer.invoke('createPermitWokrspaceInAccount', param),
		giveAdmin : (param) => ipcRenderer.invoke('giveAdmin', param),
		searchPermitRequestList : (param) => ipcRenderer.invoke('searchPermitRequestList', param),
		getIsAdmin : (param) => ipcRenderer.invoke('getIsAdmin', param),
	},

	room : {
		createRoom : (param) => ipcRenderer.invoke('createRoom', param),
		createMySelfRoom : (param)=> ipcRenderer.invoke('createMySelfRoom', param),
		createRoomInAccount : (param) => ipcRenderer.invoke('createRoomInAccount', param),
		createRoomFavorites : (param) => ipcRenderer.invoke('createRoomFavorites', param),
		updateRoomInAccoutOrder : (param) => ipcRenderer.invoke('updateRoomInAccoutOrder', param),
		updateRoomFavorites : (param) => ipcRenderer.invoke('updateRoomFavorites', param),
		searchRoom : (param) => ipcRenderer.invoke('searchRoom', param),
		searchMyJoinedRoomList : (param) => ipcRenderer.invoke('searchMyJoinedRoomList', param),
		searchRoomFavoritesList : (param) => ipcRenderer.invoke('searchRoomFavoritesList', param),
		searchRoomJoinedAccountList : (param) => ipcRenderer.invoke('searchRoomJoinedAccountList', param),
		getRoomDetail : (param) => ipcRenderer.invoke('getRoomDetail', param),
		isRoomFavorites : (param) => ipcRenderer.invoke('isRoomFavorites', param)
	},

	noticeBoard : {
		createNoticeBoard : (param) => ipcRenderer.invoke('createNoticeBoard', param),
		createNoticeBoardGroup : (param) => ipcRenderer.invoke('createNoticeBoardGroup', param),
		createNoticeBoardDetail : (param) => ipcRenderer.invoke('createNoticeBoardDetail', param),
		deleteNoticeBoard : (param) => ipcRenderer.invoke('deleteNoticeBoard', param),
		deleteNoticeBoardGroup : (param) => ipcRenderer.invoke('deleteNoticeBoardGroup', param),
		updateNoticeBoardOrder : (param) => ipcRenderer.invoke('updateNoticeBoardOrder', param),
		updateNoticeBoardDetailOrder : (param) => ipcRenderer.invoke('updateNoticeBoardDetailOrder', param),
		searchNoticeBoardList : (param) => ipcRenderer.invoke('searchNoticeBoardList', param),
		searchNoticeBoardDetailList : (param) => ipcRenderer.invoke('searchNoticeBoardDetailList', param),
	},
	s3: {
		generatePutObjectPresignedUrl : (param) => ipcRenderer.invoke('generatePutObjectPresignedUrl', param),
		generateGetObjectPresignedUrl : (param) => ipcRenderer.invoke('generateGetObjectPresignedUrl', param),
	},
	emoticon: {
		createEmotionReaction : (param) => ipcRenderer.invoke('createEmotionReaction', param),
		getIsReaction : (param) => ipcRenderer.invoke('getIsReaction', param)
	}

})
