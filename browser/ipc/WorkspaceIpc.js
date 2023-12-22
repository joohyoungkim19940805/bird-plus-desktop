const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');
const EventSource = require('eventsource');
const workspaceController = require(path.join(__project_path, 'browser/contorller/WorkspaceController.js'));
class WorkspaceIpc {
	constructor() {

        ipcMain.handle('searchWorkspaceMyJoined', async (event, param = {}) => {
			return workspaceController.searchWorkspaceMyJoined(param);
        })
		ipcMain.handle('searchWorkspaceInAccount', async (event, param = {}) => {
			return workspaceController.searchWorkspaceInAccount(param)
		})
		
		ipcMain.handle('getWorkspaceDetail', async (event, param = {}) => {
			return workspaceController.getWorkspaceDetail(param);
		})

		ipcMain.handle('createPermitWokrspaceInAccount', async (event, param = {}) =>{
			return workspaceController.createPermitWokrspaceInAccount(param);
		})

		ipcMain.handle('giveAdmin', async (event, param) => {
			return workspaceController.giveAdmin(param);
		})

		ipcMain.handle('searchPermitRequestList', async (event, param) => {
			if( ! param.workspaceId || isNaN(parseInt(param.workspaceId))){
				log.error(`searchPermitRequestList workspaceId is ::: ${param.workspaceId}`);
				return undefined;
			}
			return windowUtil.isLogin( result => {
				if(result.isLogin){
					//return axios.get(`${__serverApi}/api/workspace/search/permit-request-list/${param.workspaceId}`, {
					return new Promise(resolve=>{
						let source = new EventSource(`${__serverApi}/api/workspace/search/permit-request-list/${param.workspaceId}`, {
							headers: {
								'Authorization' : axios.defaults.headers.common['Authorization'],
							},
							withCredentials : ! process.env.MY_SERVER_PROFILES == 'local'
						});
						source.onmessage = (event) => {
							//console.log('test message :::: ',event);
							let {data, lastEventId, origin, type} = event;
							data = JSON.parse(data);
							mainWindow.send('workspacePermitRequestAccept', data);
						}
						source.onerror = (event) => {
							//console.log('searchPermitRequestList error :::: ',event);
							source.close();
							resolve('done');
						}
					})
				}else{
					return {'isLogin': false};
				}
			}).catch(error=>{
				log.error('error ::: ', error.message)
				log.error('error stack :::', error.stack)
				return undefined;
			})
		})

		ipcMain.handle('getIsAdmin', async (event, param) => {
			return this.getIsAdmin(param);
		})
		
    }

}
const workspaceIpc = new WorkspaceIpc();
module.exports = workspaceIpc