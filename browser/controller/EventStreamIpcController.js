const path = require('path');
const axios = require('axios');
const log = require('electron-log');

class EventStreamController {
    #source;
    #isConnectSource = false;
	prevWorkspaceId;
    constructor(){
    }

	initWorkspaceStream(event, workspaceId){
		
	}

}

const eventStreamController = new EventStreamController();
module.exports = eventStreamController