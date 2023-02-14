const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const dbConfig = require(path.join(__project_path, 'DB/DBConfig.js'))
const axios = require('axios');
class LoginIpcController {
	constructor() {
		/**
		 * dialog:IPC 채널 이름 의 접두사는 코드에 영향을 미치지 않습니다. 
		 * 코드 가독성에 도움이 되는 네임스페이스 역할만 합니다.
		 */
		ipcMain.handle('loginProc', async (event, param) => {
			console.log('test>>>')
			console.log(param);
			console.log(JSON.stringify(param));
			return axios.post(__serverApi + 'loginProc', JSON.stringify(param), {
				headers:{
					'Content-Type': 'application/json'
				}
			}).then(response=>{
				if(response.status == '200' || response.status == '201'){
					let db = dbConfig.getDB();
					console.log(response.data)
					db.serialize(function() {
						/*
						db.run("INSERT INTO Foo (name) VALUES ('bar')");

						db.each("SELECT id, name FROM Foo", function(err, row) {
						  console.log(row.id + ": " + row.name);
						});
						*/
					})
				}
				return response.data;
			}).catch(e=>{
				return e.response.data;
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