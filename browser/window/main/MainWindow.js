/**
 * path 모듈 불러오기
 */
const path = require('path');

/**
 * 메인 윈도우를 만들기 위해 일렉트론 모듈에서 브라우저 윈도우를 가져온다. 
 */
const {BrowserWindow, ipcMain, shell, screen} = require('electron');

const {birdPlusOptions, OptionTemplate} = require(path.join(__project_path, 'BirdPlusOptions.js'))

// 자동 업데이트 모듈 호출
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');
const windowUtil = require(path.join(__project_path,'browser/window/windowUtil.js'))
const DBConfig = require(path.join(__project_path, 'DB/DBConfig.js'))
const axios = require('axios');
/**
 * 메인 윈도우를 정의한다.
 * @author kimjoohyoung
 * @constructor
 * @extends BrowserWindow
 */
class MainWindow extends BrowserWindow{
	
	#workspaceId
	#isOpening = true;
	#isOpeningCallbackList = [];

	subWindow = {};

	#webContentsResolve;
	webContentsAwait = new Promise(resolve=>{
		this.#webContentsResolve = resolve;
	})

	/**
	 * 메인 윈도우의 생성자
	 * @author mozu123
	 */
	constructor() {
		try{
			log.info('start MainWindow constructor')
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
				titleBarOverlay: false,
				movable : false,
				resizable : false,
				trafficLightPosition: {
					x: 15,
					y: 13,  // macOS traffic lights seem to be 14px in diameter. If you want them vertically centered, set this to `titlebar_height / 2 - 7`.
				},
				title: 'Grease Lightning Chat'
			});

			//super.setTitleBarOverlay

			super.on('maximize', (event) => {
				//console.log('max >>> ', event);
				super.webContents.send('maximize', {});
			})
			super.on('unmaximize', (event) => {
				//console.log('unmax >>> ', event);
				super.webContents.send('unmaximize', {});
			})
			super.on('minimize', (event) => {
				//console.log('minimize >>> ', event);
				super.webContents.send('minimize', {});
			})
			super.on('restore', (event) => {
				//console.log('restore >>> ' , event);
				super.webContents.send('restore', {});
			})
			super.on('close', event => {
				//console.log(event);
				//console.log(event.sender);
				if(this.#workspaceId){	
					this.hide()
					event.preventDefault(); // prevent quit process
				}
			})
			super.on('resize', (event) => {
				if(this.#isOpening){
					return;
				}
				let [w,h] = super.getSize();
				mainWindow.webContents.send("resized", super.getSize());
				birdPlusOptions.size = {w,h};
			});

			super.on('move' , (event) => {
				if(this.#isOpening){
					return;
				}
				let [x,y] =  super.getPosition();
				birdPlusOptions.position = {x,y};
			})
			ipcMain.handle('getProjectPath', (event) => {
				return global.__project_path;
			})
			ipcMain.handle('isMaximize', () => {
				return super.isMaximized()
			})
			ipcMain.on('closeRequest', () => {
				super.close();
			})
			ipcMain.on('maximizeRequest', () => {
				super.maximize();
			})
			ipcMain.on('unmaximizeRequest', () => {
				super.unmaximize();
			})
			ipcMain.on('minimizeRequest', () => {
				super.minimize();
			})
			ipcMain.on('restoreRequest', () => {
				super.restore();
			})

			ipcMain.handle('resetWorkspaceId', async () => {
				return this.resetWorkspace();
			})
			ipcMain.handle('getWorkspaceId', async () => {
				return this.workspaceId;
			})
			/*ipcMain.on('setTitle', async (event, param) => {
				console.log(param);
				super.setTitle = param.title;
			});*/

			ipcMain.on('createSubWindow', async (event, param) => {
				this.createSubWindow(param);
			});

			ipcMain.handle('getOption', async (event, optionName) => {
				return birdPlusOptions.optionLoadEnd.then(()=>{
					//birdPlusOptions.optionLoadEnd = Promise.resolve();  
					return birdPlusOptions.getOption(optionName)
				});
			})
			ipcMain.on('setOption', async (event, param) => {
				birdPlusOptions.optionLoadEnd.then(()=> {
					//birdPlusOptions.optionLoadEnd = Promise.resolve();
					let {name, value} = param;
					birdPlusOptions[name] = value;
					birdPlusOptions.setOption = new OptionTemplate({
						optionName : name,
						optionValue : value
					})
					mainWindow.webContents.send('optionChange', {name, value});
					Object.entries(mainWindow.subWindow).forEach( async ([k,v]) =>{
						if(v.isDestroyed()){
							delete mainWindow.subWindow[k];
							return;
						}
						v.webContents.send('optionChange', {name, value});
					})
				})
			})
			ipcMain.handle('isLogin', async (event, param) => {
				return windowUtil.isLogin((result => {
					return {isLogin:result.isLogin};
				}));
			})
			ipcMain.handle('getServerUrl', async (event, param)=> {
				return global.__serverApi;
			})
			ipcMain.handle('logout', async (event) => {
				windowUtil.resetLoginRemeber();
				axios.defaults.headers.common['Authorization'] = '';
				return new Promise(res=>{
					let db = DBConfig.getDB(DBConfig.sqlite3.OPEN_READWRITE);
					db.serialize( () => {
						Promise.all([this.deleteLastToken(db), this.deleteLastRoomInfo(db)]).then(()=>{
							
							res();
						})
					})
				})
			})

			ipcMain.on('changeLoginPage', async (event) => {
				this.changeLoginPage(event);
			});
			ipcMain.on('changeMainPage', async (event, param) => {
				this.changeMainPage(param);
			});
			ipcMain.on('changeWokrspacePage', async (event) => {
				this.changeWokrspacePage(event);
			})
			/*
			ipcMain.on('ondragstart', (event, param) => {
				console.log('event', event);
				console.log('filePath', filePath);
				event.sender.startDrag()
			})
			*/

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
					shell.openExternal(url);
				}

				return { action: 'deny' }
			});
			this.#webContentsResolve();
			log.info('end MainWindow constructor')
		}catch(err){
			log.error(err.message);
		}
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
		let position = super.getPosition();
		let size = super.getSize();
		let rect = {
			x: position[0],
			y: position[1],
			width: size[0],
			height : size[1]
		}
		let matchingDisplay = screen.getDisplayMatching(rect);
		
		let mathX = rect.x + param.x
		let mathY = rect.y + param.y

		let duplecateWindow = this.subWindow[param.pageId] || this.subWindow[param.pageName];

		if(duplecateWindow && duplecateWindow.isDestroyed()){
			delete this.subWindow[param.pageId];
			delete this.subWindow[param.pageName];
		}else if(duplecateWindow){
			duplecateWindow.loadFile(path.join(__project_path, `view/html/${param.pageName}.html`)).then(() => {
				if(param.roomId){
					duplecateWindow.webContents.send('roomChange', {
						roomId:param.roomId
					});
					//window.webContents.openDevTools();
				}
				if(param.noticeBoardId){
					duplecateWindow.webContents.send('noticeBoardChange', {
						noticeBoardId:param.noticeBoardId
					});
				}
				if(duplecateWindow.isMinimized()){
					// 앱이 최소화 된 상태인 경우 포커스가 미동작하기에 최소화 해제
					duplecateWindow.restore();
				}
				duplecateWindow.focus();
			});
			return;
		}
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
				x: mathX,
				y: mathY,
				title: param.title + ' - Grease Lightning Chat'
			}
		)
		window.loadFile(path.join(__project_path, `view/html/${param.pageName}.html`)).then(e=>{
			if(param.roomId){
				window.webContents.send('roomChange', {
					roomId:param.roomId
				});
				//window.webContents.openDevTools();
			}
			if(param.noticeBoardId){
				window.webContents.send('noticeBoardChange', {
					noticeBoardId:param.noticeBoardId
				});
			}
		})

		if(param.pageId){
			this.subWindow[param.pageId] = window;
		}else{
			this.subWindow[param.pageName] = window;
		}
	}
	
	changeLoginPage(){
		//SELECT TOKEN, ISSUED_AT, EXPIRES_AT FROM ACCOUNT_LOG WHERE EXPIRES_AT > datetime('now','localtime') LIMIT 1;
		this.resizable = true;
		this.movable = true;
		this.autoHideMenuBar = false;
		this.menuBarVisible = true;
		this.show();
		this.titleBarStyle = 'visibble'
		windowUtil.isLogin((result) => {
			if(result.isLogin){
				if( ! this.workspaceId){
					//mainWindow.loadFile(path.join(__project_path, 'view/html/workspacePage.html')).then(e=>{
					this.loadFile(path.join(__project_path, 'view/html/workspace3DPage.html')).then(e=>{
						this.isOpening = false;
						birdPlusOptions.optionLoadEnd.then(() => {
							birdPlusOptions.setLastWindowSize(this);
							birdPlusOptions.setLastWindowPosition(this);	
						})
					})
				}else{
					this.loadFile(path.join(__project_path, 'view/html/main.html')).then(e=>{
						birdPlusOptions.optionLoadEnd.then(() => {
							birdPlusOptions.setLastWindowSize(this);
							birdPlusOptions.setLastWindowPosition(this);	
						})
					}).then(()=>{
						this.workspaceId = this.workspaceId;
					})
				}
			}else{
				let db = DBConfig.getDB(DBConfig.sqlite3.OPEN_READONLY);
				db.serialize( () => {
					db.all(`
					SELECT 
						TOKEN, 
						ISSUED_AT, 
						EXPIRES_AT 
					FROM 
						ACCOUNT_LOG 
					WHERE 
						EXPIRES_AT >= datetime('now','localtime') 
					ORDER BY 
						EXPIRES_AT DESC
					LIMIT 1`,[], (err, rows) => {
						if(err){
							log.error(err);
						}
						if(rows[0]){
							//global.__apiToken = rows[0].TOKEN
							axios.defaults.headers.common['Authorization'] = rows[0].TOKEN;
							windowUtil.isLogin((result) => {
								if(result.isLogin){
									//mainWindow.loadFile(path.join(__project_path, 'view/html/workspacePage.html')).then(e=>{
									this.loadFile(path.join(__project_path, 'view/html/workspace3DPage.html')).then(e=>{
										this.isOpening = false;
										birdPlusOptions.optionLoadEnd.then(() => {
											birdPlusOptions.setLastWindowSize(this);
											birdPlusOptions.setLastWindowPosition(this);	
										})
									})
								}else{
									axios.defaults.headers.common['Authorization'] = '';
									this.moveLoginPage();
								}
							}).catch(error=>{
								axios.defaults.headers.common['Authorization'] = '';
								log.error(' changeLoginPage error ::: ', error.message)
								log.error(' changeLoginPage error stack :::', error.stack)
								this.moveLoginPage();
							});
						}else{
							this.moveLoginPage();
						}
					})
				});
			}
		}).catch(err=>{
			this.moveLoginPage();
		})
	}
		
	moveLoginPage(){
		//mainWindow.loadFile(path.join(__project_path, 'view/html/loginPage.html')).then(e=>{
		this.loadFile(path.join(__project_path, 'view/html/workspace3DPage.html')).then(e=>{
			this.isOpening = false;
			birdPlusOptions.optionLoadEnd.then(() => {
				birdPlusOptions.setLastWindowSize(this);
				birdPlusOptions.setLastWindowPosition(this);	
			})
			return 'done';
		})
	}
	changeMainPage(param){
		birdPlusOptions.optionLoadEnd.then(() => {
			birdPlusOptions.setLastWindowSize(this);
			birdPlusOptions.setLastWindowPosition(this);	
		})
		this.resizable = true;
		this.movable = true;
		this.autoHideMenuBar = false;
		this.menuBarVisible = true;
	   
		this.loadFile(path.join(__project_path, 'view/html/main.html')).then(e=>{
			this.titleBarStyle = 'visibble'
			this.show();
		}).then(()=>{
			this.workspaceId = param.workspaceId;
		})
	}
	
	changeWokrspacePage(){
		this.resizable = true;
		this.movable = true;
		this.autoHideMenuBar = false;
		this.menuBarVisible = true;

		//this.loadFile(path.join(__project_path, 'view/html/workspacePage.html')).then(e=>{
		this.loadFile(path.join(__project_path, 'view/html/workspace3DPage.html')).then(e=>{
			this.titleBarStyle = 'visibble'
			this.show();
			this.isOpening = false;
			birdPlusOptions.optionLoadEnd.then(() => {
				birdPlusOptions.setLastWindowSize(this);
				birdPlusOptions.setLastWindowPosition(this);	
			})
		})
	}
	
	send(eventName, data){
		this.webContents.send(eventName, data);
		Object.entries(this.subWindow).forEach( async ([k,v]) =>{
			if(v.isDestroyed()){
				delete this.subWindow[k];
				return;
			}
			v.webContents.send(eventName, data);
		})
	}

	deleteLastToken(db){
		return new Promise(resolve=>{
			db.run(`
				DELETE FROM 
					ACCOUNT_LOG
				WHERE
					TOKEN = (
						SELECT
							TOKEN
						FROM
							ACCOUNT_LOG
						WHERE 
							EXPIRES_AT >= datetime('now','localtime') 
						ORDER BY 
							EXPIRES_AT DESC
						LIMIT 1
					)
			`, (err, rows) => {
				if(err){
					log.error(err);
				}
				console.log(rows);
				resolve();
			})
		})
	}

	deleteLastRoomInfo(db){
		return new Promise(resolve => {	
			db.run(`
				DELETE FROM
					BIRD_PLUS_OPTIONS
				WHERE
					OPTION_NAME = 'lastRoomInfo'
			`, (err, rows) => {
				if(err){
					log.error(err);
				}
				console.log(rows);
				resolve();
			})
		})
	}
}

const mainWindow = new MainWindow();
module.exports = mainWindow