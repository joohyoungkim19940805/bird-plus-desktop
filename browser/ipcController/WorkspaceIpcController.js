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
        this.#initHandler();
    }

	#initHandler(){
        ipcMain.on('changeWokrspacePage', async (event) => {
			this.changeWokrspacePage(event);
        })

        ipcMain.handle('searchWorkspaceMyJoined', async (event, param = {}) => {
			return this.searchWorkspaceMyJoined(event, param);
        })
		ipcMain.handle('searchWorkspaceInAccount', async (event, param = {}) => {
			return this.searchWorkspaceInAccount(event, param)
		})
		
		ipcMain.handle('getWorkspaceDetail', async (event, param = {}) => {
			return this.getWorkspaceDetail(event, param);
		})

		ipcMain.handle('createPermitWokrspaceInAccount', async (event, param = {}) =>{
			return this.createPermitWokrspaceInAccount(event, param);
		})

		ipcMain.handle('giveAdmin', async (event, param) => {
			return this.giveAdmin(event, param);
		})

		ipcMain.handle('searchPermitRequestList', async (event, param) => {
			return this.searchPermitRequestList(event, param);
		})
		
	}

	#send(eventName, data){
		mainWindow.webContents.send(eventName, data);
		Object.entries(mainWindow.subWindow).forEach( async ([k,v]) =>{
			if(v.isDestroyed()){
				delete mainWindow.subWindow[k];
				return;
			}
			v.webContents.send(eventName, data);
		})
	}

	changeWokrspacePage(event){
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
	}
	searchWorkspaceMyJoined(event, param = {}){
		return windowUtil.isLogin((result) => {
			if(result.isLogin){
				return axios.get(`${__serverApi}/api/workspace/search/my-joined-list?page=${param.page}&size=${param.size}`, {
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
	}
	searchWorkspaceInAccount(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '' && k != 'workspaceId')
					.map(([k,v]) => `${k}=${v}`).join('&')
				return axios.get(`${__serverApi}/api/workspace/search/joined-account-list/${param.workspaceId}?${queryString}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => {
					return response.data
				}).catch(err=>{
					log.error('IPC searchWorkspaceInAccount error : ', JSON.stringify(err));
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
	}
	getWorkspaceDetail(event, param = {}){
		if( ! param.workspaceId || isNaN(parseInt(param.workspaceId))){
			log.error(`workspaceId is ::: ${param.workspaceId}`);
			return undefined;
		}
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.get(`${__serverApi}/api/workspace/search/detail/${param.workspaceId}`, {
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
	}
	createPermitWokrspaceInAccount(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
					if(v != undefined && v != ''){
						total[k] = v;
					}
					return total;
				},{});
				return axios.post(`${__serverApi}/api/workspace/create/permit`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC createPermitWokrspaceInAccount error : ', JSON.stringify(err));
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
	}
	giveAdmin(event, param={}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
					if(v != undefined && v != ''){
						total[k] = v;
					}
					return total;
				},{});
				return axios.post(`${__serverApi}/api/workspace/create/give-admin`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC createPermitWokrspaceInAccount error : ', JSON.stringify(err));
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
	}
	searchPermitRequestList(event, param = {}){
		if( ! param.workspaceId || isNaN(parseInt(param.workspaceId))){
			log.error(`searchPermitRequestList workspaceId is ::: ${param.workspaceId}`);
			return undefined;
		}
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.get(`${__serverApi}/api/workspace/search/permit-request-list/${param.workspaceId}`, {
					headers:{
						'Content-Type': 'application/json',
						'Accept': 'text/event-stream',
					},
					responseType: 'stream'
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC searchPermitRequestList error : ', JSON.stringify(err));
					//axios.defaults.headers.common['Authorization'] = '';
					if(err.response){
						return err.response.data;
					}else{
						return err.message
					}
				}).then(stream => {
					let streamEndResolve;
					let promise = new Promise(res=>{
						streamEndResolve = res;
					})
					stream.on('data', bufferArr => {
						try{
                            let str = String(bufferArr);
							let obj = JSON.parse(str);
							this.#send('workspacePermitRequestAccept', obj)
						}catch(ignore){}
					})
					stream.on('end', () => {
						log.debug('end searchPermitRequestList stream ::: ')
						streamEndResolve();
					})
					return promise.then(()=>'done');
				})
			}else{
				return {'isLogin': false};
			}
		}).catch(error=>{
			log.error('error ::: ', error.message)
			log.error('error stack :::', error.stack)
			return undefined;
		})
	}
}
const workspaceIpcController = new WorkspaceIpcController();
module.exports = workspaceIpcController