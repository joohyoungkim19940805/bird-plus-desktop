const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');
const EventSource = require('eventsource');
const workspaceController = require(path.join(__project_path, 'browser/controller/WorkspaceController.js'));
class WorkspaceIpc {
	constructor() {

        ipcMain.handle('searchWorkspaceMyJoined', async (event, param = {}) => {
			return workspaceController.searchWorkspaceMyJoined(param);
        })
		ipcMain.handle('searchNameSpecificList', async (event, param = {}) => {
			return workspaceController.searchNameSpecificList(param);
        })
		ipcMain.handle('searchWorkspaceInAccount', async (event, param = {}) => {
			return workspaceController.searchWorkspaceInAccount(param)
		})
		
		ipcMain.handle('getWorkspaceDetail', async (event, param = {}) => {
			return workspaceController.getWorkspaceDetail(param);
		})
		ipcMain.handle('getWorkspaceInAccountCount', async(event, param = {}) => {
			return workspaceController.getWorkspaceInAccountCount(param);
		})
		ipcMain.handle('createPermitWokrspaceInAccount', async (event, param = {}) =>{
			return workspaceController.createPermitWokrspaceInAccount(param);
		})

		ipcMain.handle('createGiveAdmin', async (event, param) => {
			return workspaceController.createGiveAdmin(param);
		})

		ipcMain.handle('searchPermitRequestList', async (event, param) => {
			return workspaceController.searchPermitRequestList(param, EventSource, mainWindow);
		})

		ipcMain.handle('getIsAdmin', async (event, param) => {
			return workspaceController.getIsAdmin(param);
		})

		ipcMain.handle('createWorkspaceJoined', async(event, param) => {
			return workspaceController.createWorkspaceJoined(param);
		})
		
		ipcMain.handle('createWorkspace', async (event, param) => {
			return workspaceController.createWorkspace(param);
		})
    }

}
const workspaceIpc = new WorkspaceIpc();
module.exports = workspaceIpc