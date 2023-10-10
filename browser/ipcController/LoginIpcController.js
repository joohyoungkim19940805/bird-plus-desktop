const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const DBConfig = require(path.join(__project_path, 'DB/DBConfig.js'))
const axios = require('axios');
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
const log = require('electron-log');

class LoginIpcController {
	constructor() {
		this.#initHandler();	
	}
	#initHandler(){
		ipcMain.on('changeLoginPage', async (event) => {
			return this.changeLoginPage(event);
		});

		ipcMain.handle('loginProcessing', async (event, param) => {
			return this.loginProcessing(event, param);
		});

		ipcMain.handle('getAccountInfo', async (event) => {
			return this.getAccountInfo(event);
		})
	}
	#send(eventName, data){
		mainWindow.webContents.send(eventName, data);
	}
	changeLoginPage(event){
		//SELECT TOKEN, ISSUED_AT, EXPIRES_AT FROM ACCOUNT_LOG WHERE EXPIRES_AT > datetime('now','localtime') LIMIT 1;
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
				birdPlusOptions.setLastWindowSize(mainWindow);
				birdPlusOptions.setLastWindowPosition(mainWindow);
				mainWindow.resizable = true;
				mainWindow.movable = true;
				mainWindow.autoHideMenuBar = false;
				mainWindow.menuBarVisible = true;

				if(rows[0]){
					//global.__apiToken = rows[0].TOKEN
					axios.defaults.headers.common['Authorization'] = rows[0].TOKEN;
					windowUtil.isLogin((result) => {
						if(result.isLogin){
							mainWindow.loadFile(path.join(__project_path, 'view/html/workspacePage.html')).then(e=>{
								mainWindow.titleBarStyle = 'visibble'
								mainWindow.show();
								mainWindow.isOpening = false;
							})
						}else{
							axios.defaults.headers.common['Authorization'] = '';
							this.#moveLoginPage(mainWindow);
						}
					}).catch(error=>{
						log.error('error ::: ', error.message)
						log.error('error stack :::', error.stack)
						return undefined;
					});
				}else{
					this.#moveLoginPage(mainWindow);
				}
			})
		});
	}
	loginProcessing(event, param){
		param = Object.entries(param).reduce((total, [k,v]) => {
			if(v != undefined && v != ''){
				total[k] = v;
			}
			return total;
		},{});
		return axios.post(__serverApi + '/login-processing', JSON.stringify(param), {
			headers:{
				'Content-Type': 'application/json'
			}
		})
		.then(response=>{
			let status = response.status;
			let {data} = response;
			if((status == '200' || status == '201') && data.code == 0){
				let db = DBConfig.getDB();
				db.serialize( () => {
					let {token, issuedAt, expiresAt} = data.data;
					//global.__apiToken = token; 
					db.run(`
						INSERT INTO ACCOUNT_LOG (
							TOKEN,
							ISSUED_AT,
							EXPIRES_AT
						)
						VALUES (?,?,?)
					`,[token, issuedAt, expiresAt], (err) => {
						if(err){
							log.error('login account log insert error', err);
						}
						global.__apiToken = token
					});
					axios.defaults.headers.common['Authorization'] = token;
					windowUtil.isLogin();
				})
			}
			return data;
		}).catch(err=>{
			log.error('loginProcessing error : ', err.message);
			axios.defaults.headers.common['Authorization'] = '';
			console.log(err);
			if(err.response){
				return err.response.data;
			}else{
				return err.message
			}
			
		})
	}
	getAccountInfo(event){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.get(`${__serverApi}/api/account/search/get-account-info`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response=>response.data)
				.catch(err=>{
					log.error('IPC getAccountInfo error : ', JSON.stringify(err));
					//axios.defaults.headers.common['Authorization'] = '';
					if(err.response){
						return err.response.data;
					}else{
						return err.message
					}
				})
			}else{
				return {'isLogin': false};
			}
		});
	}
	#moveLoginPage(mainWindow){
		mainWindow.loadFile(path.join(__project_path, 'view/html/loginPage.html')).then(e=>{
			mainWindow.titleBarStyle = 'visibble'
			mainWindow.show();
			mainWindow.isOpening = false;
			return 'done';
		})
	}
}
const loginIpcController = new LoginIpcController();
module.exports = loginIpcController