const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const EventSource = require('eventsource');
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
class MainIpcController {
	source;
	workspaceObserver;
	constructor() {
		ipcMain.on('changeMainPage', async (event, param) => {
			birdPlusOptions.setLastWindowSize(mainWindow);
			birdPlusOptions.setLastWindowPosition(mainWindow);
			mainWindow.resizable = true;
			mainWindow.movable = true;
			mainWindow.autoHideMenuBar = false;
			mainWindow.menuBarVisible = true;
           
			mainWindow.loadFile(path.join(__project_path, 'view/html/main.html')).then(e=>{
				mainWindow.titleBarStyle = 'visibble'
				mainWindow.show();
				//mainWindow.webContents.openDevTools();
			}).then(()=>{
				mainWindow.workspaceId = param.workspaceId;
			})
		});

		ipcMain.handle('getWorkspaceId', async () => {
			return mainWindow.workspaceId;
		})
		ipcMain.handle('resetWorkspaceId', async () => {
			mainWindow.resetWorkspace();
		})
	}

}
const mainIpcController = new MainIpcController();
module.exports = mainIpcController