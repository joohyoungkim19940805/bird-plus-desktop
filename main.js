/**
 * global에 무분별하게 네임스페이스를 추가하지 말 것
 * global에 네임스페이스를 추가하는 경우는 반드시 필요한 경우에만 사용 할 것
 * global에 네임스페이스를 추가하는 것은 한 파일에서 전부 모아놓고 사용 할 것
 */

const log = require('electron-log');
const path = require('path');
const axios = require('axios');

// 일렉트론 모듈 호출
const { app, BrowserWindow, ipcMain, dialog/*, ipcMain, shell*/ } = require('electron');
app.setAppUserModelId(app.name);
// 자동 업데이트 모듈 호출
const {autoUpdater} = require('electron-updater');
autoUpdater.logger = log
//autoUpdater.autoDownload = false;
//log.transports.file.level = 'info'
//app.disableHardwareAcceleration();
// web and electron 양쪽에서 쓸 top 변수 선언 (window == top) 
global.top = {};
global.top.__isLocal = process.env.MY_SERVER_PROFILES == 'local';
global.__project_path = app.getAppPath() + '/';
global.__serverApi = (()=>{
	if(top.__isLocal){
		//autoUpdater.updateConfigPath = path.join(__project_path, 'dev-app-update.yml');
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
		/*Object.defineProperty(app, 'isPackaged', {
			get() {
				return true;
			}
		});*/
		return 'https://localhost:8443';
	}else{
		return 'https://mozu.co.kr'
	}
})();
const DBConfig = require(path.join(__project_path, 'DB/DBConfig.js'))

//global.__birdPlusOptions = 

// path 모듈 호출

// 파일 모듈 호출
const fs = require('fs');

var mainWindow 

if(top.__isLocal && ! app.isPackaged){
	const { default: electronReload } = require('electron-reload');
	require('electron-reload')(__project_path, {
		electron: path.join(__project_path, 'node_modules', '.bin', 'electron'),
		hardResetMethod: 'exit'
	});
	require('electron-reloader')(module, {
		debug: false,
		watchRenderer: true
	});
}

//myapp:// param
//Electron 앱을 시작한 후 예를 들어 사용자 지정 프로토콜이 포함된 URL을 브라우저에 입력하면 "electron-fiddle://open"애플리케이션이 응답하고 
//오류 대화 상자를 표시하는지 확인할 수 있습니다.
if(process.defaultApp && process.argv.length >= 2){
	log.debug(process.execPath);
	log.debug([path.resolve(process.argv[1])]);
	if( ! app.isDefaultProtocolClient('grease-lightning-chat')){
		app.setAsDefaultProtocolClient('grease-lightning-chat', process.execPath, [path.resolve(process.argv[1])])
	}
}else{
	if( ! app.isDefaultProtocolClient('grease-lightning-chat')){
		app.setAsDefaultProtocolClient('grease-lightning-chat')
	}
}

const gotTheLock = app.requestSingleInstanceLock();
//const gotTheLock = true

if (!gotTheLock) {
	//autoUpdater.quitAndInstall();
	app.quit();
}else{
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		if(mainWindow) {
			let params = commandLine.at(-1).split('?').at(-1).split('&').reduce( (t, e)=> {
				let [k, v] = e.split('=');
				t[k] = v;
				return t;
			}, {});
			mainWindow.workspaceId = params.workspaceId;
			axios.defaults.headers.common['Authorization'] = params.Authorization
			
			mainWindow.loadFile(path.join(__project_path, 'view/html/main.html')).then(e=>{
				mainWindow.titleBarStyle = 'visibble'
				mainWindow.show();
				mainWindow.isOpening = false;
			})

			if(mainWindow.isMinimized()){
				// 앱이 최소화 된 상태인 경우 포커스가 미동작하기에 최소화 해제
				mainWindow.restore();
			}
			mainWindow.focus();
		}

		dialog.showErrorBox(`Welcome Back`, `You arrived from: ${commandLine.pop().slice(0, -1)}`)
	})
}

// mac os인 경우
app.on('open-url', (event, url) => {
	dialog.showErrorBox(`이미 애플리케이션이 실행 중입니다. url : ${url}, event : ${event}`);
})

// app이 실행 될 때, 프로미스를 반환받고 창을 만든다.
app.whenReady().then(()=>{

	//app.setPath(app.getPath('userData'), "DB_NEW_LOCATION");
	DBConfig.loadEndPromise.then(() => {
		log.info('DBConfig loadEndPromise');

		mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'));
		mainWindow.webContentsAwait.then( () => {
			log.info('webContentsAwait start!!!!');
			try{
				const openingIpc = require(path.join(__project_path, 'browser/ipc/OpeningIpc.js'));
				log.info('openingIpcController');
				//const mainIpcController = require(path.join(__project_path, 'browser/ipc/MainIpc.js'));
				//log.info('mainIpcController');
				const accountIpc = require(path.join(__project_path, 'browser/ipc/AccountIpc.js'));
				log.info('accountIpcController');
				const workspaceIpc = require(path.join(__project_path, 'browser/ipc/WorkspaceIpc.js'));
				log.info('workspaceIpcController');
				const chattingIpc = require(path.join(__project_path, 'browser/ipc/ChattingIpc.js'));
				log.info('chattingController');
				const roomIpc = require(path.join(__project_path, 'browser/ipc/RoomIpc.js'));
				log.info('roomController');
				const eventStreamIpc = require(path.join(__project_path, 'browser/ipc/EventStreamIpc.js'));
				log.info('eventStreamIpcController');
				const noticeBoardIpc = require(path.join(__project_path, 'browser/ipc/NoticeBoardIpc.js'));
				log.info('noticeBoardIpccontroller');
				const apiS3Ipc = require(path.join(__project_path, 'browser/ipc/ApiS3Ipc.js'));
				log.info('apiS3IpcController');
				const emoticonIpc = require(path.join(__project_path, 'browser/ipc/EmoticonIpc.js'));
				log.info('emoticonIpcController');
			}catch(err){
				log.error(JSON.stringify(err));
				log.error(err.message);
			}
			log.info('create IPC END')
		})

		mainWindow.loadFile(path.join(__project_path, 'view/html/opening.html')).then(e=>{
			mainWindow.webContents.openDevTools();
			mainWindow.isOpening = true;
			
		});
				
		//mainWindow.webContents.on('did-finish-load', () => {
						autoUpdater.checkForUpdates().then(result=>{
			//autoUpdater.checkForUpdatesAndNotify().then(result => {
				log.debug('checkForUpdates ::: ',result);
				mainWindow.webContents.send('checkForUpdates', result)
			});
	
			autoUpdater.on('update-available', (event) => {
				log.debug('update-available',event);
				//
				mainWindow.webContents.send('updateAvailable');
				dialog.showMessageBox({
					type:'info',
					buttons: ['Ok'],
					defaultId:1,
					title:'UpdateMessage',
					message: 'Find Update Latest',
					detail: '업데이트 내역이 있습니다. 백그라운드에서 업데이트를 진행하며, 필요한 경우 재시작 할 수 있습니다.',
				}).then(() => {
					try{
						//해당 코드가 autoUpdater.autoDownload = true; 인 경우 오류 발생
						//autoUpdater.downloadUpdate();
						autoUpdater.on('update-downloaded', () => {
							autoUpdater.quitAndInstall();
						})
					}catch(err){
						log.error(JSON.stringify(err));
						log.error(err.message);
					}
				})
				//dialog.showErrorBox('Find Update Latest','업데이트 내역이 있습니다. 확인을 누르면 10초 후 종료되며, 업데이트를 진행합니다.')
			});

			autoUpdater.on('update-downloaded', (event) => {
				log.debug('update-downloaded', event);
				mainWindow.webContents.send('updateDownloaded');
			});
			//})
		log.info('create mainWindow');
		const mainTray = require(path.join(__project_path, 'browser/window/tray/MainTray.js'))
		log.info('create mainTray');



		if(process.argv[2]?.includes('grease-lightning-chat://')){
			let params = process.argv[2].split('?').at(-1).split('&').reduce( (t, e)=> {
				let [k, v] = e.split('=');
				t[k] = v;
				return t;
			}, {});
			try{
				mainWindow.workspaceId = params.workspaceId;
				axios.defaults.headers.common['Authorization'] = params.Authorization
			}catch(err){
				dialog.showErrorBox('test4:::', err.message);
			}
			
		}	

		//autoUpdater.checkForUpdatesAndNotify();
		// 앱이 이미 켜져있는데 중복실행하여 접근할 경우
		// window 및 linux인 경우

	/*
		let icons = new BrowserWindow({
			show: false, webPreferences: {offscreen: true}});
		icons.loadURL("https://trends.google.com/trends/hottrends/visualize");
		icons.webContents.on("paint", (event, dirty, image) => {
			if (mainTray) {
				mainTray.setImage(image.resize({width: 16, height: 16}));
			}
		});
	*/
		//앱이 활성화 되었을 때의 이벤트를 정의한다.
		//mac os 의 경우 창이 열려있지 않아도 백그라운드에서 계속 실행 상태이다.
		app.on('activate', ()=>{
			// 가용 가능한 창이 없을 경우..
			if(BrowserWindow.getAllWindows().length === 0){
				// 창을 띄운다.
				createWindow();
			}
		});
	})
});

// 창을 종료하였을 때의 이벤트를 정의한다.
// 윈도우 및 리눅스의 경우 창을 종료할 시 응용 프로그램이 완전히 종료되어야 한다.
app.on('window-all-closed', ()=>{
	//mac os가 아닌 경우... ! darwin
	//autoUpdater.quitAndInstall();
	//mac os인 경우
	if(process.platform !== 'darwin'){
		// 이 응용 프로그램을 종료시킨다.
		//autoUpdater.quitAndInstall();
		app.quit();
	}
});

app.setUserTasks([
	{
	  program: process.execPath,
	  arguments: '--new-window',
	  iconPath: process.execPath,
	  iconIndex: 0,
	  title: 'New Window',
	  description: 'Create a new window'
	}
  ])

/*
ipcMain.on('app_version', (event) => {
	event.sender.send('app_version', { version: app.getVersion() });
});
*/

/*
ipcMain.on('restart_app', () => {
	autoUpdater.quitAndInstall();
});
*/

//log.debug('process', process)
log.debug('hoem ::: ', app.getPath('home'))
//log.debug('hoem showItemInFolder ::: ', shell.showItemInFolder(app.getPath('home')))

log.debug('appData ::: ', app.getPath('appData'))
//log.debug('appData showItemInFolder ::: ', shell.showItemInFolder(app.getPath('appData')))

log.debug('userData ::: ', app.getPath('userData'))
//log.debug('userData showItemInFolder ::: ', shell.showItemInFolder(app.getPath('userData')))

log.debug('sessionData ::: ', app.getPath('sessionData'))
log.debug('exe ::: ', app.getPath('exe'))
log.debug('module ::: ', app.getPath('module'))

log.debug('desktop ::: ', app.getPath('desktop'))
//log.debug('desktop showItemInFolder ::: ', shell.showItemInFolder(app.getPath('desktop')))

log.debug('documents ::: ', app.getPath('documents'))
//log.debug('documents showItemInFolder ::: ', shell.showItemInFolder(app.getPath('documents')))

log.debug('downloads ::: ', app.getPath('downloads'))
//log.debug('downloads showItemInFolder ::: ', shell.showItemInFolder(app.getPath('downloads')))

log.debug('music ::: ', app.getPath('music'))
//log.debug('music showItemInFolder ::: ', shell.showItemInFolder(app.getPath('music')))

log.debug('pictures ::: ', app.getPath('pictures'))
//log.debug('music pictures ::: ', shell.showItemInFolder(app.getPath('pictures')))

log.debug('videos ::: ', app.getPath('videos'))
//log.debug('videos pictures ::: ', shell.showItemInFolder(app.getPath('videos')))

log.debug('recent ::: ', app.getPath('recent'))
//log.debug('recent pictures ::: ', shell.showItemInFolder(app.getPath('recent')))

log.debug('logs ::: ', app.getPath('logs'))
//log.debug('crashDumps ::: ', app.getPath('crashDumps'))

//log.debug('recent pictures ::: ', shell.showItemInFolder('C:/dev/sts-4.6.1.RELEASE'))
//log.debug('recent pictures ::: ', shell.showItemInFolder('C:/dev/sts-4.6.1.RELEASE/test'))
//log.debug('recent pictures ::: ', shell.openPath('C:/dev/sts-4.6.1.RELEASE/SpringToolSuite4.exe'))



/*
// Callback
fs.readdir(app.getPath('downloads'), (err, files) => {
    log.debug(files);
})
// Sync
fs.readdirSync(app.getPath('downloads'))
*/

//const roots = fs.readdirSync('/')
/*
roots.then((error, result)=>{
	log.debug(result);
})
*/

//let list = []

//log.debug('list 1 :::',list);
/*
fs.readdir('C:/', {encoding : 'utf8'}, (err, files) => {
	log.debug('err:::',err);
    log.debug('files:::',files);
	log.debug('files:::',files[files.length - 1]);
	log.debug('files is 새 폴더 == ', files[files.length - 1] === '새 폴더')
	fs.readdir('C:/'+files[files.length - 1], (err,files)=>{
		log.debug(files)
		log.debug(fs.Stats)
	})
	//log.debug('files[0]:::',files[0]);
	//log.debug(fs.statSync('C:/'+files[0]).isDirectory())
})
*/

//const allDirectoryPathScanning = require(path.join(__project_path, 'browser/service/AllDirectoryPathScanning.js'))

//allDirectoryPathScanning.scaninngStart().then(()=>log.debug('done22222'));
