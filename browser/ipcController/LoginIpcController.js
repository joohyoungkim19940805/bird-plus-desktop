const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const dbConfig = require(path.join(__project_path, 'DB/DBConfig.js'))
const axios = require('axios');
class LoginIpcController {
	constructor() {
		ipcMain.handle('loginProc', async (event, param) => {
			console.log('test>>>')
			console.log(param);
			console.log(JSON.stringify(param));

			return axios.post(__serverApi + 'login-processing', JSON.stringify(param), {
				headers:{
					'Content-Type': 'application/json'
				}
			}).then(response=>{
				let status = response.status;
				let {code, data} = response.data;

				if((status == '200' || status == '201') && code == '00'){
					let db = dbConfig.getDB();
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
				if(err.response){
					return err.response.data;
				}else{
					return err.message
				}
				
			})
		})

		ipcMain.handle('changeMainPage', async (event) => {
			mainWindow.setSize(1024, 768, true /* maxOS 전용애니메이션 true*/);
			mainWindow.center();
			mainWindow.resizable = true;
			mainWindow.movable = true;
			mainWindow.autoHideMenuBar = false;
			mainWindow.menuBarVisible = true;

			return await mainWindow.loadFile(path.join(__project_path, 'view/html/main.html')).then(e=>{
				mainWindow.titleBarStyle = 'visibble'
				mainWindow.show();
				//mainWindow.webContents.openDevTools();
				return 'done';
			})
		});

		//this.addIpcMainEvents()
	}
	test(){
		new EventSource()
	}


}
const loginIpcController = new LoginIpcController();
module.exports = LoginIpcController