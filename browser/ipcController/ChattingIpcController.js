const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const EventSource = require('eventsource');
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
class ChattingIpcController {
	source;
	#isConnectSource = false;
	workspaceObserver;
	constructor() {

		ipcMain.on('chattingReady', async (event, param) => {
			if(this.source?.connectionInProgress){
				return;
			}
			console.log(this.#isConnectSource)
			//console.log('isChattingReady !!', event);
			//console.log(axios.defaults.headers.common['Authorization']);
			console.log('param.workspaceId ::: ', param.workspaceId);
			console.log('axios.defaults.headers.common ::: ', axios.defaults.headers.common['Authorization'])
			this.source = new EventSource(`${__serverApi}/api/chatting/search/emission-stream/${param.workspaceId}/bearer-${axios.defaults.headers.common['Authorization']}`);
			/*
			this.source = new EventSource(`${__serverApi}/api/chatting/search/emission-stream/${param.workspaceId}`,{
				headers : {Authorization: axios.defaults.headers.common}
			});
			*/
			this.#isConnectSource = true;
			console.log("create EventSource");
			this.source.onmessage = (event) => {
				mainWindow.webContents.send("chattingAccept", event);
				console.log('on message: ', event.data);
			};
			this.source.onerror = (error) => {
				console.log('on stream err: ', error);
				console.log('source ::: ', this.source);
				//연결 실패되면 계속 시도하기에 임시 조치로 close
				this.#isConnectSource = false;
				//this.source.close();
				//stop();
			};
			this.source.onopen = (success) => {
				console.log('on success: ', success)
				this.#isConnectSource = true
			}
			this.source.onnotice = (notice) => {
				console.log('on notice ::: ' , notice);
			}
			this.source.onupdate = (update) => {
				console.log('on update ::: ', update);
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
				console.log('event notice', e.data);
			});
			/*
			* Similarly, this will listen for events
			* with the field `event: update`
			*/
			this.source.addEventListener("update", (e) => {
				console.log('event update ::: ',e.data);
			});
			/*
			* The event "message" is a special case, as it
			* will capture events without an event field
			* as well as events that have the specific type
			* `event: message` It will not trigger on any
			* other event type.
			*/
			this.source.addEventListener("message", (e) => {
				console.log('message !!!!! : ', e.data);
			});
			
		})
		ipcMain.handle('sendChatting', async (event, param) => {
			//console.log('param!!!!',param);
			return axios.post(`${__serverApi}/api/chatting/create/send-stream`, JSON.stringify(param), {
				headers:{
					'Content-Type': 'application/json'
				}
			})
			.then(windowUtil.responseCheck)
			.then(response => {
				//console.log('response ::: ??? ', response);
				return response.data;
			}).catch(err=>{
				console.error(err);
				return err.response.data;
			})
		})
		ipcMain.handle('searchChatting', async(event, param) => {
			return axios.post(`${__serverApi}/api/chatting/search/chatting-list`, JSON.stringify(param), {
				headers:{
					'Content-Type': 'application/json'
				}
			})
			.then(windowUtil.responseCheck)
			.then(response => {
				//console.log('response ::: ??? ', response);
				return response.data;
			}).catch(err=>{
				console.error(err);
				return err.response.data;
			})
		})
		
	}

}
const chattingIpcController = new ChattingIpcController();
module.exports = chattingIpcController