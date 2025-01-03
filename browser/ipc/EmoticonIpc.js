const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/windowUtil.js'))
const log = require('electron-log')
const emoticonController = require(path.join(__project_path, 'browser/controller/EmoticonController.js'));
class EmoticonIpc {
	constructor() {
		this.#initHanlder();
		ipcMain.handle('createEmotionReaction', async (event, param = {}) => {
			return emoticonController.createEmotionReaction(param);
		});
        ipcMain.handle('deleteEmoticon', async (event, param = {}) => {
			return emoticonController.deleteEmoticon(param);
		});
		ipcMain.handle('getIsReaction', async (event, param = {}) => {
			return emoticonController.getIsReaction(param);
		});
    }

	#initHanlder(){


	}
	
}
const emoticonIpc = new EmoticonIpc();
module.exports = emoticonIpc