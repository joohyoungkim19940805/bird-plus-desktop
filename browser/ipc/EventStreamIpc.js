const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const EventSource = require('eventsource');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');

class EventStreamIpc {
    #source;
    #isConnectSource = false;
	prevWorkspaceId;
    constructor(){
		ipcMain.on('initWorkspaceStream', async (event, {workspaceId}) => {

			if(this.prevWorkspaceId == workspaceId && (this.source?.connectionInProgress || this.#isConnectSource)){
				return;
			}else if(this.prevWorkspaceId != workspaceId && this.source?.connectionInProgress){
				this.source.close();
			}
			
			this.prevWorkspaceId = workspaceId;
	
			this.source = new EventSource(`${__serverApi}/api/event-stream/workspace/${workspaceId}`, {
				headers: {
					'Authorization' : axios.defaults.headers.common['Authorization'],
				},
				withCredentials : ! process.env.MY_SERVER_PROFILES == 'local'
			});
			this.#isConnectSource = true;
	
			this.source.onmessage = (event) => {
				let {data, lastEventId, origin, type} = event;
				data = JSON.parse(data);
				log.debug('event stream data ::: ', data);
	
				let eventName = data.serverSentStreamType.split('_').map((e, i)=>{
					if(i == 0){
						return e.toLowerCase(); 
					}
					return e.charAt(0) + e.substring(1).toLowerCase();
				}).join('');
	
				log.debug('on message: ', event.data, 'eventName ::', eventName);
	
				if(this[eventName]){
					this[eventName](eventName, data);
					return ;
				}
				mainWindow.send(eventName, data);
				
			};
	
			this.source.onerror = (error) => {
				log.error('on stream err: ', error);
				//log.debug('source ::: ', this.source);
				/*this.#isConnectSource = false;
				windowUtil.isLogin( result => {
					if( ! result.isLogin){
						axios.defaults.headers.common['Authorization'] = '';
						this.source.close();
						this.#send('needLoginRequest', result);
					}
				})*/
				//연결 실패되면 계속 시도하기에 임시 조치로 close
				//this.source.close();
				//stop();
			};
			this.source.onopen = (success) => {
				log.debug('on success: ', success)
				this.#isConnectSource = true
			}
			/*
			* This will listen only for events
			* similar to the following:
			*
			* event: notice
			* data: useful data
			* id: someid
			this.source.addEventListener("notice", (e) => {
				log.debug('event notice', e.data);
			});
			*/
	
			/*
			* Similarly, this will listen for events
			* with the field `event: update`
			this.source.addEventListener("update", (e) => {
				log.debug('event update ::: ',e.data);
			});
			*/
	
			/*
			* The event "message" is a special case, as it
			* will capture events without an event field
			* as well as events that have the specific type
			* `event: message` It will not trigger on any
			* other event type.
			this.source.addEventListener("message", (e) => {
				log.debug('message !!!!! : ', e.data);
			});
			*/
			//}
        })
    }

}

const eventStreamIpc = new EventStreamIpc();
module.exports = eventStreamIpc