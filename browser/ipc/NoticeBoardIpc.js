const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');
const EventSource = require('eventsource');
const noticeBoardController = require(path.join(__project_path, 'browser/controller/NoticeBoardController.js'));
class NoticeBoardIpc {
	constructor() {
        ipcMain.handle('createNoticeBoardGroup', async (event, param = {}) => {
			return noticeBoardController.createNoticeBoardGroup(param);
		});
		ipcMain.handle('createNoticeBoard', async (event, param = {}) => {
			return noticeBoardController.createNoticeBoard(param);
		});
        ipcMain.handle('createNoticeBoardDetail', async (event, param = {}) => {
            return noticeBoardController.createNoticeBoardDetail(param)
        })
        ipcMain.handle('searchNoticeBoardList', async (event, param = {}) => {
            return windowUtil.isLogin( result => {
                if(result.isLogin){
                    let {workspaceId, roomId} = param;
                    let queryString = Object.entries(param)
                        .filter(([k,v]) => v != undefined && v != '' && k != 'workspaceId' && k != 'roomId')
                        .map(([k,v]) => `${k}=${v}`).join('&')
                        //console.log('queryString ::: ', queryString);
                    //return axios.get(`${__serverApi}/api/notice-board/search/notice-board-list/${workspaceId}/${roomId}?${queryString}`, {
                    return new Promise(resolve=>{
                        let source = new EventSource(`${__serverApi}/api/notice-board/search/notice-board-list/${workspaceId}/${roomId}?${queryString}`, {
                            headers: {
                                'Authorization' : axios.defaults.headers.common['Authorization'],
                            },
                            withCredentials : ! process.env.MY_SERVER_PROFILES == 'local'
                        });
                        source.onmessage = (event) => {
                            //console.log('test message :::: ',event);
                            let {data, lastEventId, origin, type} = event;
                            data = JSON.parse(data);
                            mainWindow.send('noticeBoardAccept', data);
                        }
                        source.onerror = (event) => {
                            //console.log('searchNoticeBoardList error :::: ',event);
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
            });
		});
        ipcMain.handle('searchNoticeBoardDetailList', async (event, param = {}) => {
            return windowUtil.isLogin( result => {
                if(result.isLogin){
                    let {workspaceId, roomId, noticeBoardId} = param;
                    if(! noticeBoardId){
                        return;
                    }
                    let queryString = Object.entries(param)
                        .filter(([k,v]) => v != undefined && v != '' && k != 'workspaceId' && k != 'roomId' && k != 'noticeBoardId')
                        .map(([k,v]) => `${k}=${v}`).join('&')
                        //console.log('queryString ::: ', queryString);
                    //return axios.get(`${__serverApi}/api/notice-board/search/notice-board-detail-list/${workspaceId}/${roomId}/${noticeBoardId}?${queryString}`, {
                    return new Promise(resolve=>{
                        let source = new EventSource(`${__serverApi}/api/notice-board/search/notice-board-detail-list/${workspaceId}/${roomId}/${noticeBoardId}?${queryString}`, {
                            headers: {
                                'Authorization' : axios.defaults.headers.common['Authorization'],
                            },
                            withCredentials : ! process.env.MY_SERVER_PROFILES == 'local'
                        });
                        source.onmessage = (event) => {
                            //console.log('test message :::: ',event);
                            let {data, lastEventId, origin, type} = event;
                            data = JSON.parse(data);
                            mainWindow.send('noticeBoardDetailAccept', data);
                        }
                        source.onerror = (event) => {
                            console.log('searchNoticeBoardDetailList error :::: ',event);
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
            });
        })
        ipcMain.handle('deleteNoticeBoardGroup', async (event, param = {}) => {
			return noticeBoardController.deleteNoticeBoardGroup(param);
		});
		ipcMain.handle('deleteNoticeBoard', async (event, param = {}) => {
			return noticeBoardController.deleteNoticeBoard(param);
		});
		ipcMain.handle('updateNoticeBoardOrder', async (event, param = []) => {
			return noticeBoardController.updateNoticeBoardOrder(param);
		});
        ipcMain.handle('updateNoticeBoardDetailOrder', async (event, param = []) => {
			return noticeBoardController.updateNoticeBoardDetailOrder(param);
		});
    }
}
const noticeBoardIpc = new NoticeBoardIpc();
module.exports = noticeBoardIpc