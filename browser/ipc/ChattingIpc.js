const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/windowUtil.js'))
const log = require('electron-log');
const chattingController = require(path.join(__project_path, 'browser/controller/ChattingController.js'))
class ChattingIpc {
	constructor() {
		ipcMain.handle('sendChatting', async (event, param) => {
			return chattingController.sendChatting(param);
		})
		ipcMain.handle('deleteChatting', async (event, param) => {
			return chattingController.deleteChatting(param);
		})
		ipcMain.handle('searchChattingList', async(event, param) => {
			return chattingController.searchChattingList(param);
		})
	}

}
const chattingIpc = new ChattingIpc();
module.exports = chattingIpc