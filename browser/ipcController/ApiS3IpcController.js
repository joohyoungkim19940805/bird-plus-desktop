const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');
class ApiS3IpcController {
	constructor() {
		this.#initHandler();
	}
	#initHandler(){
		ipcMain.handle('generatePutObjectPresignedUrl', async (event, param) => {
			return this.generatePutObjectPresignedUrl(event, param);
		})
		ipcMain.handle('generateGetObjectPresignedUrl', async (event, param) => {
			return this.generateGetObjectPresignedUrl(event, param);
		})
	}
	#send(eventName, data){
		mainWindow.webContents.send(eventName, data);
	}
	generatePutObjectPresignedUrl(event, param){
		return windowUtil.isLogin( result => {
			param = Object.entries(param).reduce((total, [k,v]) => {
				if(v != undefined && v != ''){
					total[k] = v;
				}
				return total;
			},{});
			if(result.isLogin){
				return axios.post(`${__serverApi}/api/generate-presigned-url/create/`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => {
					return response.data;
				}).catch(err=>{
					log.error('IPC sendChatting error', err);
					return err.response.data;
				})
			}else{
				return {'isLogin': false};
			}
		}).catch(error=>{
			log.error('sendChatting login error ::: ', error.message);
			log.error('sendChatting login error stack ::: ', error.stack);
			return undefined;
		});
	}
	generateGetObjectPresignedUrl(event, param){
		return windowUtil.isLogin( result => {
			param = Object.entries(param).reduce((total, [k,v]) => {
				if(v != undefined && v != ''){
					total[k] = v;
				}
				return total;
			},{});
			if(result.isLogin){
				return axios.post(`${__serverApi}/api/generate-presigned-url/search/`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => {
					return response.data;
				}).catch(err=>{
					log.error('IPC sendChatting error', err);
					return err.response.data;
				})
			}else{
				return {'isLogin': false};
			}
		}).catch(error=>{
			log.error('sendChatting login error ::: ', error.message);
			log.error('sendChatting login error stack ::: ', error.stack);
			return undefined;
		});
	}
}
const apiS3IpcController = new ApiS3IpcController();
module.exports = apiS3IpcController