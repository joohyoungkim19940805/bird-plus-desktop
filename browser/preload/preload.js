//const { contextBridge, ipcRenderer } = require('electron')
const { contextBridge, ipcRenderer } = require('electron')
//console.log('test<<<', __project_path);
const electronEventTrigger = {
	objectEventListener : {},
	addElectronWindowEventListener : (eventName, callBack) => {
		if(electronEventTrigger.objectEventListener.hasOwnProperty(eventName)){
			electronEventTrigger.objectEventListener[eventName].push(callBack);
		}else{
			electronEventTrigger.objectEventListener[eventName] = [callBack];
		}
	},
	removeElectronWindowEventListener : (eventName) => {
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
	
	pageChange : {
		changeLoginPage : () => ipcRenderer.invoke('changeLoginPage'),
		changeMainPage : () => ipcRenderer.invoke('changeMainPage'),
	},

	regist : {
		sendChatting : (param) => ipcRenderer.invoke('sendChatting', param),
	},

	account : {
		loginProc : (param) => ipcRenderer.invoke('loginProc', param),
	},
	
	event : {
		electronEventTrigger : electronEventTrigger,
	},

	chatting : {
		isChattingReady : () => ipcRenderer.send('isChattingReady')
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
