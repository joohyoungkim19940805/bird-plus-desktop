const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
const log = require('electron-log');
class RoomIpcController {
	constructor() {
		this.#initHanlder();
    }

	#initHanlder(){
		ipcMain.handle('createRoom', async (event, param = {}) => {
			return this.createRoom(event, param);
		});
		ipcMain.handle('createMySelfRoom', async (event, param = {})=> {
			return this.createMySelfRoom(event, param);
		});
		ipcMain.handle('createRoomInAccount', async (event, param = []) => {
			return this.createRoomInAccount(event, param);
		});
		ipcMain.handle('createRoomFavorites', async (event, param = {}) => {
			return this.createRoomFavorites(event, param);
		});
		ipcMain.handle('updateRoomInAccoutOrder', async (event, param = []) => {
			return this.updateRoomInAccoutOrder(event, param);
		});
		ipcMain.handle('updateRoomFavorites', async (event, param = []) => {
			return this.updateRoomFavorites(event, param);
		});
        ipcMain.handle('searchRoom', async (event, param = {}) => {
			return this.searchRoom(event, param);
		});
		ipcMain.handle('searchMyJoinedRoomList', async (event, param = {}) => {
			return this.searchMyJoinedRoomList(event, param);
		});
		ipcMain.handle('searchRoomFavoritesList', async (event, param = {}) => {
			return this.searchRoomFavoritesList(event, param);
		});
		ipcMain.handle('searchRoomJoinedAccountList', async (event, param = {}) => {
			return this.searchRoomJoinedAccountList(event, param);
		});
		ipcMain.handle('getRoomDetail', async (event, param = {}) => {
			return this.getRoomDetail(event, param);
		});
		ipcMain.handle('isRoomFavorites', async (event, param = {}) => {
			return this.isRoomFavorites(event, param);
		});
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

	createRoom(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
					if(v != undefined && v != ''){
						total[k] = v;
					}
					return total;
				},{});
				return axios.post(`${__serverApi}/api/room/create/`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC createRoom error : ', JSON.stringify(err));
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
	createMySelfRoom(event, param = {}){
		if( ! param.workspaceId || isNaN(parseInt(param.workspaceId))){
			log.error(`createMySelfRoom workspaceId is ::: ${param.workspaceId}`);
			return undefined;
		}
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.post(`${__serverApi}/api/room/create/my-self-room/${param.workspaceId}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC createMySelfRoom error : ', JSON.stringify(err));
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
	createRoomInAccount(event, param = []){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.post(`${__serverApi}/api/room/create/in-account`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.then(data => {
					log.debug('createRoomInAccount ::: ',data)
					return data;
				})
				.catch(err=>{
					log.error('IPC createRoomInAccount error : ', JSON.stringify(err));
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
	updateRoomInAccoutOrder(event, param = []){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.post(`${__serverApi}/api/room/update/order`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC updateRoomInAccoutOrder error : ', JSON.stringify(err));
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
	createRoomFavorites(event, param){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
					if(v != undefined && v != ''){
						total[k] = v;
					}
					return total;
				},{});
				return axios.post(`${__serverApi}/api/room/create/favorites`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC createRoomFavorites error : ', JSON.stringify(err));
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
	updateRoomFavorites(event, param = []){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.post(`${__serverApi}/api/room/update/favorites-order`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC createRoom error : ', JSON.stringify(err));
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
	searchRoomList(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				let {roomId} = param;
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '' && k != 'roomId')
					.map(([k,v]) => `${k}=${v}`).join('&')
				return axios.get(`${__serverApi}/api/room/search/list/${roomId}?${queryString}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC searchRoom error : ', JSON.stringify(err));
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
	searchMyJoinedRoomList(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				let {workspaceId} = param;
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '' && k != 'workspaceId')
					.map(([k,v]) => {
						if(v instanceof Array){
							v = v.map(val=>`${k}=${val}`).join('&')
							return v;
						}
						return `${k}=${v}`
					}).join('&')
				return axios.get(`${__serverApi}/api/room/search/my-joined-list/${workspaceId}?${queryString}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC searchMyJoinedRoomList error : ', JSON.stringify(err));
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
	searchRoomFavoritesList(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				let {workspaceId} = param;
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '' && k != 'workspaceId')
					.map(([k,v]) => {
						if(v instanceof Array){
							v = v.map(val=>`${k}=${val}`).join('&')
							return v;
						}
						return `${k}=${v}`
					}).join('&')
				return axios.get(`${__serverApi}/api/room/search/favorites-list/${workspaceId}?${queryString}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC searchMyJoinedRoomList error : ', JSON.stringify(err));
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
	searchRoomJoinedAccountList(event, param = {}){
		if( ! param.roomId || isNaN(parseInt(param.roomId))){
			log.error(`searchRoomJoinedAccountList roomId is ::: ${param.roomId}`);
			return undefined;
		}
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.get(`${__serverApi}/api/room/search/in-account-list/${param.roomId}`, {
					headers:{
						'Content-Type': 'application/json',
						'Accept': 'text/event-stream',
					},
					responseType: 'stream'
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC searchRoomJoinedAccountList error : ', JSON.stringify(err));
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
							this.#send('roomInAccountAccept', obj)
						}catch(ignore){}
					})
					stream.on('end', () => {
						log.debug('end searchRoomJoinedAccountList stream ::: ')
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
	getRoomDetail(event, param = {}){
		if( ! param.roomId || isNaN(parseInt(param.roomId))){
			log.error(`getRoomDetail roomId is ::: ${param.roomId}`);
			return undefined;
		}
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.get(`${__serverApi}/api/room/search/detail/${param.roomId}`, {
					headers: {
						'Content-Type' : 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
			}else{
				return {'isLogin': false};
			}
		});
	}
	isRoomFavorites(event, param = {}){
		if( ! param.roomId || isNaN(parseInt(param.roomId))){
			log.error(`isRoomFavorites roomId is ::: ${param.roomId}`);
			return undefined;
		}
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.get(`${__serverApi}/api/room/search/is-room-favorites/${param.roomId}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC isRoomFavorites error : ', JSON.stringify(err));
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
}
const roomIpcController = new RoomIpcController();
module.exports = roomIpcController