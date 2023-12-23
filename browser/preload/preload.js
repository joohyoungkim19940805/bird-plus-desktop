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

	scanningUserDirectory : async () => ipcRenderer.send('scanningUserDirectory'),
	
	getProjectPath : async () => ipcRenderer.invoke('getProjectPath').then(data=>data + '/view/'),

	createSubWindow : async (param) => ipcRenderer.send('createSubWindow', param), 

	closeRequest : async (param) => ipcRenderer.send('closeRequest'),
	
	maximizeRequest : async () => ipcRenderer.send('maximizeRequest'),

	unmaximizeRequest : async () => ipcRenderer.send('unmaximizeRequest'),
	
	minimizeRequest : async () => ipcRenderer.send('minimizeRequest'),
	
	restoreRequest : async () => ipcRenderer.send('restoreRequest'),
	
	isMaximize : async () => ipcRenderer.invoke('isMaximize'),

	resetWorkspaceId: async () => ipcRenderer.invoke('resetWorkspaceId'),

	getWorkspaceId: async () => ipcRenderer.invoke('getWorkspaceId'),

	notifications: async (param) => ipcRenderer.send('notifications', param),

	getOption: async (optionName) => ipcRenderer.invoke('getOption', optionName),
	setOption: async (param) => ipcRenderer.send('setOption', param),

	isLogin: async () => ipcRenderer.invoke('isLogin'),

	getServerUrl : async () => ipcRenderer.invoke('getServerUrl'),

	event : {
		electronEventTrigger : electronEventTrigger,
	},

	stream : {
		initWorkspaceStream : async (param) => ipcRenderer.send('initWorkspaceStream', param),
	},

	pageChange : {
		changeLoginPage : async () => ipcRenderer.send('changeLoginPage'),
		changeWokrspacePage : async () => ipcRenderer.send('changeWokrspacePage'),
		changeMainPage : async (workspaceId) => ipcRenderer.send('changeMainPage', workspaceId),
	},

	account : {
		loginProcessing : async (param) => ipcRenderer.invoke('loginProcessing', param),
		getAccountInfo : async () => ipcRenderer.invoke('getAccountInfo'),
		updateSimpleAccountInfo : async (param) => ipcRenderer.invoke('updateSimpleAccountInfo', param)
	},

	chatting : {
		sendChatting : async (param) => ipcRenderer.invoke('sendChatting', param),
		deleteChatting : async (param) => ipcRenderer.invoke('deleteChatting', param),
		searchChattingList : async (param) => ipcRenderer.invoke('searchChattingList', param),
	},
	
	workspace : {
		searchWorkspaceMyJoined : async (param) => ipcRenderer.invoke('searchWorkspaceMyJoined', param),
		searchNameSpecificList: async (param) => ipcRenderer.invoke('searchNameSpecificList', param),
		searchWorkspaceInAccount : async (param) => ipcRenderer.invoke('searchWorkspaceInAccount', param),
		getWorkspaceDetail : async (param) => ipcRenderer.invoke('getWorkspaceDetail', param),
		createPermitWokrspaceInAccount: async (param) => ipcRenderer.invoke('createPermitWokrspaceInAccount', param),
		createGiveAdmin : async (param) => ipcRenderer.invoke('createGiveAdmin', param),
		searchPermitRequestList : async (param) => ipcRenderer.invoke('searchPermitRequestList', param),
		getIsAdmin : async (param) => ipcRenderer.invoke('getIsAdmin', param),
		createWorkspaceJoined: async (param) => ipcRenderer.invoke('createWorkspaceJoined', param),
		createWorkspace : async (param) => ipcRenderer.invoke('createWorkspace', param),
		getWorkspaceInAccountCount : async (param) => ipcRenderer.invoke('getWorkspaceInAccountCount', param),
	},

	room : {
		createRoom : async (param) => ipcRenderer.invoke('createRoom', param),
		createMySelfRoom : async (param)=> ipcRenderer.invoke('createMySelfRoom', param),
		createRoomInAccount : async (param) => ipcRenderer.invoke('createRoomInAccount', param),
		createRoomFavorites : async (param) => ipcRenderer.invoke('createRoomFavorites', param),
		updateRoomInAccoutOrder : async (param) => ipcRenderer.invoke('updateRoomInAccoutOrder', param),
		updateRoomFavorites : async (param) => ipcRenderer.invoke('updateRoomFavorites', param),
		searchRoom : async (param) => ipcRenderer.invoke('searchRoom', param),
		searchMyJoinedRoomList : async (param) => ipcRenderer.invoke('searchMyJoinedRoomList', param),
		searchRoomFavoritesList : async (param) => ipcRenderer.invoke('searchRoomFavoritesList', param),
		searchRoomJoinedAccountList : async (param) => ipcRenderer.invoke('searchRoomJoinedAccountList', param),
		getRoomDetail : async (param) => ipcRenderer.invoke('getRoomDetail', param),
		isRoomFavorites : async (param) => ipcRenderer.invoke('isRoomFavorites', param)
	},

	noticeBoard : {
		createNoticeBoard : async (param) => ipcRenderer.invoke('createNoticeBoard', param),
		createNoticeBoardGroup : async (param) => ipcRenderer.invoke('createNoticeBoardGroup', param),
		createNoticeBoardDetail : async (param) => ipcRenderer.invoke('createNoticeBoardDetail', param),
		deleteNoticeBoard : async (param) => ipcRenderer.invoke('deleteNoticeBoard', param),
		deleteNoticeBoardGroup : async (param) => ipcRenderer.invoke('deleteNoticeBoardGroup', param),
		updateNoticeBoardOrder : async (param) => ipcRenderer.invoke('updateNoticeBoardOrder', param),
		updateNoticeBoardDetailOrder : async (param) => ipcRenderer.invoke('updateNoticeBoardDetailOrder', param),
		searchNoticeBoardList : async (param) => ipcRenderer.invoke('searchNoticeBoardList', param),
		searchNoticeBoardDetailList : async (param) => ipcRenderer.invoke('searchNoticeBoardDetailList', param),
	},
	s3: {
		generatePutObjectPresignedUrl : async (param) => ipcRenderer.invoke('generatePutObjectPresignedUrl', param),
		generateGetObjectPresignedUrl : async (param) => ipcRenderer.invoke('generateGetObjectPresignedUrl', param),
	},
	emoticon: {
		createEmotionReaction : async (param) => ipcRenderer.invoke('createEmotionReaction', param),
		getIsReaction : async (param) => ipcRenderer.invoke('getIsReaction', param)
	}

})
