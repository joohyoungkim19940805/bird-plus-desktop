const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const EventSource = require('eventsource');
class MainIpcController {
	source;
	constructor() {
		ipcMain.on('isChattingReady', async event => {
			//console.log('isChattingReady !!', event);
			//console.log(axios.defaults.headers.common['Authorization']);
			this.source = new EventSource(__serverApi + 'api/chatting/stream' + '/bearer-' + axios.defaults.headers.common['Authorization']);
			console.log("create EventSource");
			this.source.onmessage = (event) => {
				mainWindow.webContents.send("chattingAccept", event);
				console.log('on message: ', event.data);
			};
			this.source.onerror = (error) => {
				console.log('on err: ', error);
				//stop();
			};
			this.source.onopen = (success) => {
				console.log('on success: ', success)
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
				console.log(e.data);
			});
			/*
			* Similarly, this will listen for events
			* with the field `event: update`
			*/
			this.source.addEventListener("update", (e) => {
				console.log(e.data);
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
			return axios.post(__serverApi + 'api/chatting/stream', JSON.stringify(param), {
				headers:{
					'Content-Type': 'application/json'
				}
			}).then(response => {
				let status = response.status;
				let {code, data} = response.data;
				if((status == '200' || status == '201') && code == '00'){
					console.log('success :: ', data);
				}
				//console.log('response ::: ??? ', response);
				return response.data;
			}).catch(err=>{
				console.error(err);
				return err.response.data;
			})
		})
	}

}
const mainIpcController = new MainIpcController();
module.exports = mainIpcController