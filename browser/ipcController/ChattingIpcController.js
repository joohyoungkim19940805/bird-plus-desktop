const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const EventSource = require('eventsource');
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');
class ChattingIpcController {
	source;
	#isConnectSource = false;
	constructor() {

		ipcMain.handle('sendChatting', async (event, param) => {
			windowUtil.isLogin( result => {
				if(result.isLogin){
					return axios.post(`${__serverApi}/api/chatting/create/send-chatting`, JSON.stringify(param), {
						headers:{
							'Content-Type': 'application/json'
						}
					})
					.then(windowUtil.responseCheck)
					.then(response => {
						//log.debug('response ::: ??? ', response);
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
			})
		})
		ipcMain.handle('searchChattingList', async(event, param) => {
			return windowUtil.isLogin( result => {
				if(result.isLogin){
					let queryString = Object.entries(param)
						.filter(([k,v]) => v != undefined && v != '')
						.map(([k,v]) => `${k}=${v}`).join('&')
					return axios.get(`${__serverApi}/api/chatting/search/chatting-list?${queryString}`, {
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
		})
	}

}
const chattingIpcController = new ChattingIpcController();
module.exports = chattingIpcController