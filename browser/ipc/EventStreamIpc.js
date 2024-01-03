const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const EventSource = require('eventsource');
const windowUtil = require(path.join(__project_path,'browser/window/windowUtil.js'))
const log = require('electron-log');
const eventStreamController = require(path.join(__project_path, 'browser/controller/EventStreamController.js'))


class EventStreamIpc {

    constructor(){
		ipcMain.on('initWorkspaceStream', async (event, param) => {
			eventStreamController.initWorkspaceStream(param, EventSource, mainWindow);
        })
    }

}

const eventStreamIpc = new EventStreamIpc();
module.exports = eventStreamIpc