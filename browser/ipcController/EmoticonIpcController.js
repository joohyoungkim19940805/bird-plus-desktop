const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
const log = require('electron-log');
class EmoticonIpcController {
	constructor() {
		this.#initHanlder();
    }

	#initHanlder(){
		ipcMain.handle('createEmotionReaction', async (event, param = {}) => {
			return this.createEmotionReaction(event, param);
		});
        ipcMain.handle('deleteEmoticon', async (event, param = {}) => {
			return this.deleteEmoticon(event, param);
		});
		ipcMain.handle('getIsReaction', async (event, param = {}) => {
			return this.getIsReaction(event, param);
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

	createEmotionReaction(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
					if(v != undefined && v != ''){
						total[k] = v;
					}
					return total;
				},{});
				return axios.post(`${__serverApi}/api/emoticon/create/reaction`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC createEmotion error : ', JSON.stringify(err));
					//axios.defaults.headers.common['Authorization'] = '';
					if(err.response){
						return err.response.data;
					}else{
						return err.message
					}
				})
			}else{
				return {'isLogin': false};
			}
		}).catch(error=>{
			log.error('error ::: ', error.message)
			log.error('error stack :::', error.stack)
			return undefined;
		})
	}
    deleteEmotion(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
					if(v != undefined && v != ''){
						total[k] = v;
					}
					return total;
				},{});
				return axios.post(`${__serverApi}/api/emoticon/delete/`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC deleteEmotion error : ', JSON.stringify(err));
					//axios.defaults.headers.common['Authorization'] = '';
					if(err.response){
						return err.response.data;
					}else{
						return err.message
					}
				})
			}else{
				return {'isLogin': false};
			}
		}).catch(error=>{
			log.error('error ::: ', error.message)
			log.error('error stack :::', error.stack)
			return undefined;
		})
	}
	getIsReaction(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				let {workspaceId} = param;
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '' && k != 'workspaceId')
					.map(([k,v]) => {
						if(v instanceof Array){
							v = v.map(val=>`${k}=${val}`).join('&')
							return v;
						}
						return `${k}=${v}`
					}).join('&')
				return axios.get(`${__serverApi}/api/emoticon/search/is-reaction?${queryString}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC searchMyJoinedRoomList error : ', JSON.stringify(err));
					//axios.defaults.headers.common['Authorization'] = '';
					if(err.response){
						return err.response.data;
					}else{
						return err.message
					}
				})
			}else{
				return {'isLogin': false};
			}
		}).catch(error=>{
			log.error('error ::: ', error.message)
			log.error('error stack :::', error.stack)
			return undefined;
		})
	}
	
}
const roomIpcController = new EmoticonIpcController();
module.exports = roomIpcController