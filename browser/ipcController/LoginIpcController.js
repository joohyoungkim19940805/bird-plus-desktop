const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const DBConfig = require(path.join(__project_path, 'DB/DBConfig.js'))
const axios = require('axios');
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
class LoginIpcController {
	constructor() {

		ipcMain.on('changeLoginPage', async (event) => {
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
						console.error(err);
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
								this.moveLoginPage(mainWindow);
							}
						}).catch(error=>{
							console.error('error ::: ', error.message)
							console.error('error stack :::', error.stack)
							return undefined;
						});
					}else{
						this.moveLoginPage(mainWindow);
					}
				})
			});
		});

		ipcMain.handle('loginProcessing', async (event, param) => {

			return axios.post(__serverApi + '/login-processing', JSON.stringify(param), {
				headers:{
					'Content-Type': 'application/json'
				}
			}).then(response=>{
				let status = response.status;
				let {code, data} = response.data;

				if((status == '200' || status == '201') && code == '00'){
					let db = DBConfig.getDB();
					db.serialize( () => {
						//console.log(data)
						let {token, issuedAt, expiresAt} = data;
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
								console.error('login account log insert error', err);
							}
							global.__apiToken = token
						});
						//console.log(axios.defaults);
						
						axios.defaults.headers.common['Authorization'] = token;
					})
					
				}
				return response.data;
			}).catch(err=>{
				console.error('error : ', JSON.stringify(err));
				axios.defaults.headers.common['Authorization'] = '';
				if(err.response){
					return err.response.data;
				}else{
					return err.message
				}
				
			})
		});
	}

	moveLoginPage(mainWindow){
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