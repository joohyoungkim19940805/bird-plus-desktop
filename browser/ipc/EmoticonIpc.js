const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log')
const emoticonController = require(path.join(__project_path, 'browser/contorller/EmoticonController.js'));
class EmoticonIpc {
	constructor() {
		this.#initHanlder();
		ipcMain.handle('createEmotionReaction', async (event, param = {}) => {
			return emoticonController.createEmotionReaction(event, param);
		});
        ipcMain.handle('deleteEmoticon', async (event, param = {}) => {
			return emoticonController.deleteEmoticon(event, param);
		});
		ipcMain.handle('getIsReaction', async (event, param = {}) => {
			return emoticonController.getIsReaction(event, param);
		});
    }

	#initHanlder(){


	}
	
}
const emoticonIpc = new EmoticonIpc();
module.exports = emoticonIpc