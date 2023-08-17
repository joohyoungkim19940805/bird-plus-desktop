/**
 * global에 무분별하게 네임스페이스를 추가하지 말 것
 * global에 네임스페이스를 추가하는 경우는 반드시 필요한 경우에만 사용 할 것
 * global에 네임스페이스를 추가하는 것은 한 파일에서 전부 모아놓고 사용 할 것
 */
global.__project_path = require.main.paths[0].split('node_modules')[0];
global.__serverApi = (()=>{
	if(! process.env.MY_SERVER_PROFILES || process.env.MY_SERVER_PROFILES == 'local'){
		return 'http://localhost:8079/';
	}
})();

// 일렉트론 모듈 호출
const { app, BrowserWindow /*, ipcMain, dialog, shell*/ } = require('electron');
// path 모듈 호출
const path = require('path');
// 파일 모듈 호출
const fs = require('fs');
// 자동 업데이트 모듈 호출
const {autoUpdater} = require('electron-updater')

var mainWindow;

//Electron 앱을 시작한 후 예를 들어 사용자 지정 프로토콜이 포함된 URL을 브라우저에 입력하면 "electron-fiddle://open"애플리케이션이 응답하고 
//오류 대화 상자를 표시하는지 확인할 수 있습니다.
if(process.defaultApp && process.argv.length >= 2){
	app.setAsDefaultProtocolClient('bird-plus-desktop', process.execPath, [path.resolve(process.argv[1])])
}else{
	app.setAsDefaultProtocolClient('electron-fiddle')
}

// 앱이 이미 켜져있는데 중복실행하여 접근할 경우
// window 및 linux인 경우
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
	autoUpdater.quitAndInstall();
	app.quit();
}else{
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		if(mainWindow) {
			if(mainWindow.isMinimized()){
				// 앱이 최소화 된 상태인 경우 포커스가 미동작하기에 최소화 해제
				mainWindow.restore();
			}
			mainWindow.focus();
		}
		dialog.showErrorBox(`이미 애플리케이션이 실행 중입니다. commandLine : ${commandLine.pop()}`);
	})
}
// mac os인 경우
app.on('open-url', (event, url) => {
	dialog.showErrorBox(`이미 애플리케이션이 실행 중입니다. url : ${url}`);
})

// app이 실행 될 때, 프로미스를 반환받고 창을 만든다.
app.whenReady().then(()=>{
	mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
	
	const mainTray = require(path.join(__project_path, 'browser/window/tray/MainTray.js'))

	const openingIpcController = require(path.join(__project_path, 'browser/ipcController/OpeningIpcController.js'))
	const mainIpcController = require(path.join(__project_path, 'browser/ipcController/MainIpcController.js'))
	const loginIpcController = require(path.join(__project_path, 'browser/ipcController/LoginIpcController.js'));
	
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
	autoUpdater.checkForUpdates();
});

// 창을 종료하였을 때의 이벤트를 정의한다.
// 윈도우 및 리눅스의 경우 창을 종료할 시 응용 프로그램이 완전히 종료되어야 한다.
app.on('window-all-closed', ()=>{
	//mac os가 아닌 경우... ! darwin
	//autoUpdater.quitAndInstall();
	//mac os인 경우
	if(process.platform !== 'darwin'){
		// 이 응용 프로그램을 종료시킨다.
		autoUpdater.quitAndInstall();
		//app.quit();
	}
});

/*
ipcMain.on('app_version', (event) => {
	event.sender.send('app_version', { version: app.getVersion() });
});
*/
/*
autoUpdater.on('update-available', () => {
	//mainWindow.webContents.send('update_available');
});
*/
/*
autoUpdater.on('update-downloaded', () => {
	mainWindow.webContents.send('update_downloaded');
});
*/
/*
ipcMain.on('restart_app', () => {
	autoUpdater.quitAndInstall();
});
*/

//console.log('process', process)
console.log('hoem ::: ', app.getPath('home'))
//console.log('hoem showItemInFolder ::: ', shell.showItemInFolder(app.getPath('home')))

console.log('appData ::: ', app.getPath('appData'))
//console.log('appData showItemInFolder ::: ', shell.showItemInFolder(app.getPath('appData')))

console.log('userData ::: ', app.getPath('userData'))
//console.log('userData showItemInFolder ::: ', shell.showItemInFolder(app.getPath('userData')))

console.log('sessionData ::: ', app.getPath('sessionData'))
console.log('exe ::: ', app.getPath('exe'))
console.log('module ::: ', app.getPath('module'))

console.log('desktop ::: ', app.getPath('desktop'))
//console.log('desktop showItemInFolder ::: ', shell.showItemInFolder(app.getPath('desktop')))

console.log('documents ::: ', app.getPath('documents'))
//console.log('documents showItemInFolder ::: ', shell.showItemInFolder(app.getPath('documents')))

console.log('downloads ::: ', app.getPath('downloads'))
//console.log('downloads showItemInFolder ::: ', shell.showItemInFolder(app.getPath('downloads')))

console.log('music ::: ', app.getPath('music'))
//console.log('music showItemInFolder ::: ', shell.showItemInFolder(app.getPath('music')))

console.log('pictures ::: ', app.getPath('pictures'))
//console.log('music pictures ::: ', shell.showItemInFolder(app.getPath('pictures')))

console.log('videos ::: ', app.getPath('videos'))
//console.log('videos pictures ::: ', shell.showItemInFolder(app.getPath('videos')))

console.log('recent ::: ', app.getPath('recent'))
//console.log('recent pictures ::: ', shell.showItemInFolder(app.getPath('recent')))

console.log('logs ::: ', app.getPath('logs'))
//console.log('crashDumps ::: ', app.getPath('crashDumps'))

//console.log('recent pictures ::: ', shell.showItemInFolder('C:/dev/sts-4.6.1.RELEASE'))
//console.log('recent pictures ::: ', shell.showItemInFolder('C:/dev/sts-4.6.1.RELEASE/test'))
//console.log('recent pictures ::: ', shell.openPath('C:/dev/sts-4.6.1.RELEASE/SpringToolSuite4.exe'))



/*
// Callback
fs.readdir(app.getPath('downloads'), (err, files) => {
    console.log(files);
})
// Sync
fs.readdirSync(app.getPath('downloads'))
*/

//const roots = fs.readdirSync('/')
/*
roots.then((error, result)=>{
	console.log(result);
})
*/

//let list = []

//console.log('list 1 :::',list);
/*
fs.readdir('C:/', {encoding : 'utf8'}, (err, files) => {
	console.log('err:::',err);
    console.log('files:::',files);
	console.log('files:::',files[files.length - 1]);
	console.log('files is 새 폴더 == ', files[files.length - 1] === '새 폴더')
	fs.readdir('C:/'+files[files.length - 1], (err,files)=>{
		console.log(files)
		console.log(fs.Stats)
	})
	//console.log('files[0]:::',files[0]);
	//console.log(fs.statSync('C:/'+files[0]).isDirectory())
})
*/

//const allDirectoryPathScanning = require(path.join(__project_path, 'browser/service/AllDirectoryPathScanning.js'))

//allDirectoryPathScanning.scaninngStart().then(()=>console.log('done22222'));
