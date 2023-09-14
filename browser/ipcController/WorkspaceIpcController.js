const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
const log = require('electron-log');
class WorkspaceIpcController {
	constructor() {
        
        ipcMain.on('changeWokrspacePage', async (event) => {
            birdPlusOptions.setLastWindowSize(mainWindow);
			birdPlusOptions.setLastWindowPosition(mainWindow);
			mainWindow.resizable = true;
			mainWindow.movable = true;
			mainWindow.autoHideMenuBar = false;
			mainWindow.menuBarVisible = true;

			mainWindow.loadFile(path.join(__project_path, 'view/html/workspacePage.html')).then(e=>{
				mainWindow.titleBarStyle = 'visibble'
				mainWindow.show();
				mainWindow.isOpening = false;
			})
        })

        ipcMain.handle('searchWorkspaceMyJoined', async (event, param = {}) => {
            return windowUtil.isLogin((result) => {
                if(result.isLogin){
                    return axios.get(`${__serverApi}/api/workspace/search/workspace-my-joined-list?page=${param.page}&size=${param.size}`, {
                        headers:{
                            'Content-Type': 'application/json'
                        }
                    })
					.then(windowUtil.responseCheck)
					.then(response=>{
						return response.data;
                    }).catch(err=>{
                        log.error('error : ', JSON.stringify(err));
                        if(err.response){
                            if( ! err.response.data.content){
                                err.response.data.content = [];
                            }
                            return err.response.data;
                        }else{

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
		ipcMain.handle('searchWorkspaceInAccount', async (event, param = {}) => {
			return windowUtil.isLogin( result => {
				if(result.isLogin){
					let queryString = Object.entries(param)
						.filter(([k,v]) => v != undefined && v != '' && k != 'workspaceId')
						.map(([k,v]) => `${k}=${v}`).join('&')
					return axios.get(`${__serverApi}/api/workspace/search/workspace-in-account-list/${param.workspaceId}?${queryString}`, {
						headers:{
							'Content-Type': 'application/json'
						}
					})
					.then(windowUtil.responseCheck)
					.then(response => {
						return response.data
					}).catch(err=>{
						log.error('IPC searchRoomMyJoinedName error : ', JSON.stringify(err));
						//axios.defaults.headers.common['Authorization'] = '';
						if(err.response){
							return err.response.data;
						}else{
							return err.message
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
		
		ipcMain.handle('getWorkspaceDetail', async (event, param) => {
			if( ! param.workspaceId || isNaN(parseInt(param.workspaceId))){
				log.error(`workspaceId is ::: ${param.workspaceId}`);
				return undefined;
			}
			return windowUtil.isLogin( result => {
				if(result.isLogin){
					return axios.get(`${__serverApi}/api/workspace/search/workspace-detail/${param.workspaceId}`, {
						headers: {
							'Content-Type' : 'application/json'
						}
					})
					.then(windowUtil.responseCheck)
					.then(response => {
						return response.data.data;
					})
				}else{
					return {'isLogin': false};
				}
			});
		})
    }

}
const workspaceIpcController = new WorkspaceIpcController();
module.exports = workspaceIpcController