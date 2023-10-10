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
		})
		ipcMain.handle('createMySelfRoom', async (event, param = {})=> {
			return this.createMySelfRoom(event, param);
		})
		ipcMain.handle('createRoomInAccount', async (event, param = []) => {
			return this.createRoomInAccount(event, param);
		})
		ipcMain.handle('createRoomFavorites', async (event, param = {}) => {
			return this.createRoomFavorites(event, param);
		})
		ipcMain.handle('updateRoomInAccout', async (event, param = []) => {
			return this.updateRoomInAccout(event, param);
		})
		ipcMain.handle('updateRoomFavorites', async (event, param = []) => {
			return this.updateRoomFavorites(event, param);
		})
        ipcMain.handle('searchRoom', async (event, param = {}) => {
			return this.searchRoom(event, param);
		})
		ipcMain.handle('searchRoomMyJoined', async (event, param = {}) => {
			return this.searchRoomMyJoined(event, param);
		})
		ipcMain.handle('searchRoomMyJoinedName', async (event, param = {}) => {
			return this.searchRoomMyJoinedName(event, param);
		})
		ipcMain.handle('searchRoomFavoritesMyJoined', async (event, param = {}) => {
			return this.searchRoomFavoritesMyJoined(event, param);
		})
		ipcMain.handle('searchRoomFavoritesMyJoinedName', async (event, param = {}) => {
			return this.searchRoomFavoritesMyJoinedName(event, param);
		})
		ipcMain.handle('searchRoomInAccountAllList', async (event, param = {}) => {
			return this.searchRoomInAccountAllList(event, param);
		})
		ipcMain.handle('getRoomDetail', async (event, param = {}) => {
			return this.getRoomDetail(event. param);
		})
		ipcMain.handle('isRoomFavorites', async (event, param = {}) => {
			return this.isRoomFavorites(event, param);
		});
	}

	#send(eventName, data){
		mainWindow.webContents.send(eventName, data);
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
				return axios.post(`${__serverApi}/api/room/create/room`, JSON.stringify(param), {
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
				return axios.post(`${__serverApi}/api/room/create/room-in-account`, JSON.stringify(param), {
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
	updateRoomInAccout(event, param = []){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.post(`${__serverApi}/api/room/update/room-in-account-order`, JSON.stringify(param), {
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
	createRoomFavorites(){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
					if(v != undefined && v != ''){
						total[k] = v;
					}
					return total;
				},{});
				return axios.post(`${__serverApi}/api/room/create/room-favorites`, JSON.stringify(param), {
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
				return axios.post(`${__serverApi}/api/room/update/room-favorites-order`, JSON.stringify(param), {
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
	searchRoom(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				log.debug('param!!! : ' , param);
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '')
					.map(([k,v]) => `${k}=${v}`).join('&')
				return axios.get(`${__serverApi}/api/room/search/room-list?${queryString}`, {
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
	searchRoomMyJoined(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '')
					.map(([k,v]) => {
						if(v instanceof Array){
							v = v.map(val=>`${k}=${val}`).join('&')
							return v;
						}
						return `${k}=${v}`
					}).join('&')
					
				return axios.get(`${__serverApi}/api/room/search/room-my-joined-list?${queryString}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC searchRoomMyJoined error : ', err.message);
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
	searchRoomMyJoinedName(event, param){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '')
					.map(([k,v]) => {
						if(v instanceof Array){
							v = v.map(val=>`${k}=${val}`).join('&')
							return v;
						}
						return `${k}=${v}`
					}).join('&')
				return axios.get(`${__serverApi}/api/room/search/room-my-joined-name-list?${queryString}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
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
	}
	searchRoomFavoritesMyJoined(event, param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '')
					.map(([k,v]) => {
						if(v instanceof Array){
							v = v.map(val=>`${k}=${val}`).join('&')
							return v;
						}
						return `${k}=${v}`
					}).join('&')
					
				return axios.get(`${__serverApi}/api/room/search/room-my-joined-favorites-list?${queryString}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC searchRoomMyJoined error : ', JSON.stringify(err));
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
	searchRoomFavoritesMyJoinedName(event, param){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '')
					.map(([k,v]) => `${k}=${v}`).join('&')
				log.debug('kjh test <<< ', queryString);
				return axios.get(`${__serverApi}/api/room/search/room-my-joined-favorites-name-list?${queryString}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
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
	}
	searchRoomInAccountAllList(event, param = {}){
		if( ! param.roomId || isNaN(parseInt(param.roomId))){
			log.error(`searchRoomInAccountAllList roomId is ::: ${param.roomId}`);
			return undefined;
		}
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.get(`${__serverApi}/api/room/search/room-in-account-all-list/${param.roomId}`, {
					headers:{
						'Content-Type': 'application/json',
						'Accept': 'text/event-stream',
					},
					responseType: 'stream'
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
				}).then(stream => {
					let streamEndResolve;
					let promise = new Promise(res=>{
						streamEndResolve = res;
					})
					stream.on('data', bufferArr => {
						let obj;
						try{
							obj = JSON.parse(String(bufferArr));
							this.#send('roomInAccountAccept', obj)
						}catch(ignore){
							//log.error(err);
						}
					})
					stream.on('end', () => {
						log.debug('end searchRoomInAccountAllList stream ::: ')
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
				return axios.get(`${__serverApi}/api/room/search/room-detail/${param.roomId}`, {
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