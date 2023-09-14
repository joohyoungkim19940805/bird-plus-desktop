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
	workspaceObserver;
	constructor() {

		ipcMain.on('chattingReady', async (event, param) => {
			if(this.source?.connectionInProgress || this.#isConnectSource){
				return;
			}
			log.debug(this.#isConnectSource)
			//log.debug('isChattingReady !!', event);
			//log.debug(axios.defaults.headers.common['Authorization']);
			log.debug('param.workspaceId ::: ', param.workspaceId);
			log.debug('axios.defaults.headers.common ::: ', axios.defaults.headers.common['Authorization'])
			this.source = new EventSource(`${__serverApi}/api/chatting/search/emission-stream/${param.workspaceId}/bearer-${axios.defaults.headers.common['Authorization']}`);
			/*
			this.source = new EventSource(`${__serverApi}/api/chatting/search/emission-stream/${param.workspaceId}`,{
				headers : {Authorization: axios.defaults.headers.common}
			});
			*/
			this.#isConnectSource = true;
			log.debug("create EventSource");
			this.source.onmessage = (event) => {
				mainWindow.webContents.send("chattingAccept", event);
				log.debug('on message: ', event.data);
			};
			this.source.onerror = (error) => {
				log.debug('on stream err: ', error);
				log.debug('source ::: ', this.source);
				//연결 실패되면 계속 시도하기에 임시 조치로 close
				//this.source.close();
				//stop();
			};
			this.source.onopen = (success) => {
				log.debug('on success: ', success)
				this.#isConnectSource = true
			}
			this.source.onnotice = (notice) => {
				log.debug('on notice ::: ' , notice);
			}
			this.source.onupdate = (update) => {
				log.debug('on update ::: ', update);
			}
			/*
			* This will listen only for events
			* similar to the following:
			*
			* event: notice
			* data: useful data
			* id: someid
			*/
			this.source.addEventListener("notice", (e) => {
				log.debug('event notice', e.data);
			});
			/*
			* Similarly, this will listen for events
			* with the field `event: update`
			*/
			this.source.addEventListener("update", (e) => {
				log.debug('event update ::: ',e.data);
			});
			/*
			* The event "message" is a special case, as it
			* will capture events without an event field
			* as well as events that have the specific type
			* `event: message` It will not trigger on any
			* other event type.
			*/
			this.source.addEventListener("message", (e) => {
				log.debug('message !!!!! : ', e.data);
			});
			
		})
		ipcMain.handle('sendChatting', async (event, param) => {
			//log.debug('param!!!!',param);
			windowUtil.isLogin( result => {
				if(result.isLogin){
					return axios.post(`${__serverApi}/api/chatting/create/send-stream`, JSON.stringify(param), {
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