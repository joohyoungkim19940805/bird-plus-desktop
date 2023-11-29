/**
 * path 모듈 불러오기
 */
const path = require('path');

/**
 * 메인 윈도우를 만들기 위해 일렉트론 모듈에서 브라우저 윈도우를 가져온다. 
 */
const {BrowserWindow, ipcMain, shell} = require('electron');

const EasyObserver = require(path.join(__project_path, 'browser/service/EasyObserver.js'))

const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))

// 자동 업데이트 모듈 호출
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');
/**
 * 메인 윈도우를 정의한다.
 * @author mozu123
 * @constructor
 * @extends BrowserWindow
 */
class MainWindow extends BrowserWindow{
	
	#workspaceId
	#isOpening = true;
	#isOpeningCallbackList = [];

	subWindow = {};

	/**
	 * 메인 윈도우의 생성자
	 * @author mozu123
	 */
	constructor() {
		//console.log('__project_path in MainWindow :::', __project_path);
		super({
			width : 800,
			height : 300,
			icon: path.join(__project_path, 'view/image/icon.ico'),
			webPreferences : {
				preload : path.join(__project_path, 'browser/preload/preload.js'),
				protocol: "file",
      			slashes: true
			},
			center : true,
			autoHideMenuBar : true,
			titleBarStyle: 'hidden',
			movable : false,
			resizable : false,
			trafficLightPosition: {
				x: 15,
				y: 13,  // macOS traffic lights seem to be 14px in diameter. If you want them vertically centered, set this to `titlebar_height / 2 - 7`.
			},
			title: 'Grease Lightning Chat'
		});

		//super.setTitleBarOverlay
		
		super.loadFile(path.join(__project_path, 'view/html/opening.html')).then(e=>{
			super.webContents.openDevTools();
			this.#isOpening = true;
			
			autoUpdater.checkForUpdates().then(result=>{
				log.debug('checkForUpdates ::: ',result);
				super.webContents.send('checkForUpdates', result)
			});
	
			autoUpdater.on('update-available', (event) => {
				log.debug('update-available',event);
				super.webContents.send('updateAvailable');
			});
	
	
			autoUpdater.on('update-downloaded', (event) => {
				log.debug('update-downloaded', event);
				super.webContents.send('updateDownloaded');
			});
		});

		super.on('close', event => {
			console.log(event);
			console.log(event.sender);
			if(this.#workspaceId){	
				this.hide()
				event.preventDefault(); // prevent quit process
			}
		})

		super.on('resize', (event) => {
			if(this.#isOpening){
				return;
			}
			mainWindow.webContents.send("resized", super.getSize());
			birdPlusOptions.size = super.getSize();
		});

		super.on('move' , (event) => {
			if(this.#isOpening){
				return;
			}
			birdPlusOptions.position = super.getPosition();
		})

		/*ipcMain.on('setTitle', async (event, param) => {
			console.log(param);
			super.setTitle = param.title;
		});*/

		ipcMain.on('createSubWindow', async (event, param) => {
			this.createSubWindow(param);
		});

		//새창 팝업 열릴시 트리거
		super.webContents.setWindowOpenHandler((event) => {
			/*
			event{
			 	url: 'https://naver.com/',
				frameName: '',
				features: '',
				disposition: 'foreground-tab',
				referrer: { url: '', policy: 'strict-origin-when-cross-origin' },
				postBody: undefined
			}
			*/
			let {url} = event;
			console.log('event !! ::: ',event);
			log.debug('MainWindow Line 100 ::: open url :::', url);
			if(url.includes('blob:file:///')){
				return {
					action: 'allow',
					outlivesOpener: false,
					overrideBrowserWindowOptions: {
						frame: true,
						fullscreenable: true,
						backgroundColor: 'black',
						autoHideMenuBar : true,
						//autoHideMenuBar : false,
						movable : true,
						resizable : true,
						titleBarStyle: 'visible',
						titleBarOverlay: true,
						webPreferences: {
							preload : path.join(__project_path, 'browser/preload/imageAndVideoDetailPreload.js')
						}
					}
				}
			}else{
				/*
				return {
					action: 'allow',
					outlivesOpener: false,
					overrideBrowserWindowOptions: {
						frame: true,
						fullscreenable: true,
						backgroundColor: 'black',
						//autoHideMenuBar : true,
						//autoHideMenuBar : false,
						movable : true,
						resizable : true,
						//titleBarStyle: 'visible',
						titleBarOverlay: true,
						//webPreferences: {
						//	preload : path.join(__project_path, 'browser/preload/imageAndVideoDetailPreload.js')
						//}
					}
				}
				*/
				shell.openExternal(url);
			}

			return { action: 'deny' }
		});
	
	}
	set workspaceId(workspaceId){
		if(this.#workspaceId === workspaceId){
            return;
        }
		this.#workspaceId = workspaceId;
		mainWindow.webContents.send("workspaceChange", {workspaceId: this.workspaceId});
		/*Object.entries(mainWindow.subWindow).forEach( async ([k,v]) =>{
			if(v.isDestroyed){
				delete mainWindow.subWindow[k];
				return;
			}
			v.webContents.send("workspaceChange", {workspaceId: this.#workspaceId});
		})*/
	}
	get workspaceId(){
		return this.#workspaceId;
	}

	set isOpening(isOpening){
		this.#isOpening = isOpening;

	}

	resetWorkspace(){
		this.#workspaceId = undefined;
	}

	createSubWindow(param){
		if(! param.pageName){
			throw new Error('pageName is null');
		}

		let duplecateWindow = this.subWindow[param.pageId] || this.subWindow[param.pageName];

		if(duplecateWindow && duplecateWindow.isDestroyed()){
			delete this.subWindow[param.pageId];
			delete this.subWindow[param.pageName];
		}else if(duplecateWindow){
			return;
		}
		console.log(param);
		let window = new BrowserWindow(
			{
				width : param.width,
				height : param.height,
				icon: path.join(__project_path, 'view/image/icon.ico'),
				webPreferences : {
					preload : path.join(__project_path, 'browser/preload/preload.js'),
					protocol: "file",
					  slashes: true
				},
				autoHideMenuBar : true,
				titleBarStyle: 'visible',
				movable : true,
				resizable : true,
				trafficLightPosition: {
					x: 15,
					y: 13,  // macOS traffic lights seem to be 14px in diameter. If you want them vertically centered, set this to `titlebar_height / 2 - 7`.
				},
				x: parseInt( param.x - (param.width / 2) ),
				y: parseInt( param.y - 20), //parseInt( param.y - (param.height / 2) )
				title: param.title
			}
		)
		window.loadFile(path.join(__project_path, `view/html/${param.pageName}.html`)).then(e=>{
			if(param.roomId){
				window.webContents.send('roomChange', {
					roomId:param.roomId
				});
				window.webContents.openDevTools();
			}
		})

		if(param.pageId){
			this.subWindow[param.pageId] = window;
		}else{
			this.subWindow[param.pageName] = window;
		}

	}
}

const mainWindow = new MainWindow();
module.exports = mainWindow