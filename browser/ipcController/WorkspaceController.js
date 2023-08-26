const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/windowUtil.js'))
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))

class WorkspaceController {
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
			})
        })

        ipcMain.handle('searchMyWorkspaceList', async (event, param = {}) => {
            return windowUtil.isLogin((result) => {
                if(result.isLogin){
                    return axios.get(`${__serverApi}/api/workspace/search-workspace-joined?page=${param.page}&size=${param.size}`, {
                        headers:{
                            'Content-Type': 'application/json'
                        }
                    }).then(response=>{
                        let status = response.status;
                        let {code, data} = response.data;
        
                        if((status == '200' || status == '201') && code == '00'){
                            return data;
                        }else{
                            return {content: []};
                        }
                    }).catch(err=>{
                        console.error('error : ', JSON.stringify(err));
                        if(err.response){
                            if( ! err.response.data.content){
                                err.response.data.content = [];
                            }
                            return err.response.data;
                        }else{

                        }
                    })
                }else{
                    return undefined;
                }
            }) 
        })

    }

}
const workspaceController = new WorkspaceController();
module.exports = workspaceController