const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const EventSource = require('eventsource');
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');

class EventStreamIpcController {
    #source;
    #isConnectSource = false;
	prevWorkspaceId;
    constructor(){
		this.#initHandler();
    }
	#initHandler(){
		ipcMain.on('initWorkspaceStream', async (event, {workspaceId}) => {
			this.initWorkspaceStream(event, workspaceId);
        })
	}
	#send(eventName, data){
		mainWindow.webContents.send(eventName, data);
	}
	initWorkspaceStream(event, workspaceId){
		//log.debug('param.workspaceId ::: ', workspaceId);
		//log.debug('axios.defaults.headers.common ::: ', axios.defaults.headers.common['Authorization'])
		
		if(this.prevWorkspaceId == workspaceId && (this.source?.connectionInProgress || this.#isConnectSource)){
			return;
		}else if(this.prevWorkspaceId != workspaceId && this.source?.connectionInProgress){
			this.source.close();
		}
		
		this.prevWorkspaceId = workspaceId;

		this.source = new EventSource(`${__serverApi}/api/event-stream/workspace/${workspaceId}/bearer-${axios.defaults.headers.common['Authorization']}`);
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

			if(this[eventName]){
				this[eventName]();
				return ;
			}
			this.#send(eventName, data);
			log.debug('on message: ', event.data, 'eventName ::', eventName);
		};

		this.source.onerror = (error) => {
			log.debug('on stream err: ', error);
			log.debug('source ::: ', this.source);
			this.#isConnectSource = false;
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
	}
	chattingAccept(data){
		log.debug('chattingAccept stream ::: ', data);
		this.#send("chattingAccept", data);
	}
	roomAccept(data){
		log.debug('roomAccept stream ::: ', data);
		this.#send('roomAccept', data);
	}
	roomInAccountAccept(data){
		log.debug('roomInAccountAccept stream ::: ', data);
		this.#send('roomInAccountAccept', data);
	}
	noticeBoardAccept(data){
		log.debug('noticeBoardAccept stream ::: ', data);
		this.#send('noticeBoardAccept', data);
	}
}

const eventStreamIpcController = new EventStreamIpcController();
module.exports = eventStreamIpcController