const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');
const apiS3Controller = require(path.join(__project_path, 'browser/controller/ApiS3Controller.js'))
class ApiS3Ipc {
	constructor() {
		ipcMain.handle('generateSecurityPutObjectPresignedUrl', async (event, param) => {
			return apiS3Controller.generateSecurityPutObjectPresignedUrl(param);
		})
		ipcMain.handle('generateSecurityGetObjectPresignedUrl', async (event, param) => {
			return apiS3Controller.generateSecurityGetObjectPresignedUrl(param);
		})
		ipcMain.handle('generateGetObjectPresignedUrl', async (event, param) => {
			return apiS3Controller.generateGetObjectPresignedUrl(param);
		})
	}
	
}
const apiS3Ipc = new ApiS3Ipc();
module.exports = apiS3Ipc