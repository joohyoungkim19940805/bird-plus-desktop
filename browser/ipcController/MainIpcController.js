const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const EventSource = require('eventsource');
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))

class MainIpcController {
	source;
	workspaceObserver;
	constructor() {
		this.#initHandler();	
	}
	#initHandler(){
		ipcMain.on('changeMainPage', async (event, param) => {
			this.changeMainPage(event, param);
		});

	}
	#send(eventName, data){
		mainWindow.webContents.send(eventName, data);
		Object.entries(mainWindow.subWindow).forEach( async ([k,v]) =>{
			if(v.isDestroyed()){
				delete mainWindow.subWindow[k];
				return;
			}
			v.webContents.send(eventName, data);
		})
	}
	changeMainPage(event, param){
		birdPlusOptions.setLastWindowSize(mainWindow);
		birdPlusOptions.setLastWindowPosition(mainWindow);
		mainWindow.resizable = true;
		mainWindow.movable = true;
		mainWindow.autoHideMenuBar = false;
		mainWindow.menuBarVisible = true;
	   
		mainWindow.loadFile(path.join(__project_path, 'view/html/main.html')).then(e=>{
			mainWindow.titleBarStyle = 'visibble'
			mainWindow.show();
		}).then(()=>{
			mainWindow.workspaceId = param.workspaceId;
		})
	}

}
const mainIpcController = new MainIpcController();
module.exports = mainIpcController