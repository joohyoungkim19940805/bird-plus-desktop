const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const {birdPlusOptions, OptionTemplate} = require(path.join(__project_path, 'BirdPlusOptions.js'))
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');
class ChattingIpcController {
	constructor() {
		this.#initHandler();
	}
	#initHandler(){
		ipcMain.handle('sendChatting', async (event, param) => {
			return this.sendChatting(event, param);
		})
		ipcMain.handle('deleteChatting', async (event, param) => {
			return this.deleteChatting(event, param);
		})
		ipcMain.handle('searchChattingList', async(event, param) => {
			return this.searchChattingList(event, param);
		})
	}
	#send(eventName, data){
		mainWindow.webContents.send(eventName, data);
		Object.entries(mainWindow.subWindow).forEach( async ([k,v]) =>{
			if(v.isDestroyed()){
				delete mainWindow.subWindow
				return;
			}
			e.webContents.send(eventName, data);
		})
	}
	sendChatting(event, param){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
                    if(v != undefined && v != ''){
                        total[k] = v;
                    }
                    return total;
                },{});
				return axios.post(`${__serverApi}/api/chatting/create/send-chatting`, JSON.stringify(param), {
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
	deleteChatting(event, param){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
                    if(v != undefined && v != ''){
                        total[k] = v;
                    }
                    return total;
                },{});
				return axios.post(`${__serverApi}/api/chatting/delete/`, JSON.stringify(param), {
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
	searchChattingList(event, param){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				let {workspaceId, roomId} = param;
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '' && k != 'workspaceId' && k != 'roomId')
					.map(([k,v]) => `${k}=${v}`).join('&')
				return axios.get(`${__serverApi}/api/chatting/search/chatting-list/${workspaceId}/${roomId}?${queryString}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => {
					return response.data;
				}).catch(err=>{
					log.error('IPC searchChatting error' , err);
					return err.response.data;
				})
			}else{
				return {'isLogin': false};
			}
		}).catch(error=>{
			log.error('searchChatting login error ::: ', error.message);
			log.error('searchChatting login error stack ::: ', error.stack);
			return undefined;
		})
	}
}
const chattingIpcController = new ChattingIpcController();
module.exports = chattingIpcController