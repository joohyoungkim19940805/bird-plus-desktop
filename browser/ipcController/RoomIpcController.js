const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))

class RoomIpcController {
	constructor() {
		/*
		createRoom : (param) => ipcRenderer.invoke('createRoom', param),
		searchRoom : (param) => ipcRenderer.invoke('searchRoom', param),
		searchRoomMyJoined : (param) => ipcRenderer.invoke('searchRoomMyJoined', param),
		searchRoomMyJoinedName : (param) => ipcRenderer.invoke('searchRoomMyJoinedName', param)
		*/
		ipcMain.handle('createRoom', async (event, param = {}) => {
			return windowUtil.isLogin( result => {
				if(result.isLogin){
					param = Object.entries(param).reduce((total, [k,v]) => {
						if(v != undefined && v != ''){
							total[k] = v;
						}
						return total;
					},{});
					return axios.post(`${__serverApi}/api/room/create-room`, JSON.stringify(param), {
						headers:{
							'Content-Type': 'application/json'
						}
					}).then(response => {
						let status = response.status;
						let {code, data} = response.data;
						if((status == '200' || status == '201') && code == '00'){
						
						}
						return response.data
					}).catch(err=>{
						console.error('IPC createRoom error : ', JSON.stringify(err));
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
				console.error('error ::: ', error.message)
				console.error('error stack :::', error.stack)
				return undefined;
			})
		})
		
		ipcMain.on('createRoomInAccount', async (event, param = []) => {
			return windowUtil.isLogin( result => {
				if(result.isLogin){
					return axios.post(`${__serverApi}/api/room/create-room-in-account`, JSON.stringify(param), {
						headers:{
							'Content-Type': 'application/json',
							'Accept': 'text/event-stream',
						},
						responseType: 'stream'
					}).then(response => {
						let status = response.status;
						if((status == '200' || status == '201')){
						
						}
						return response.data
					}).catch(err=>{
						console.error('IPC createRoomFavorites error : ', JSON.stringify(err));
						//axios.defaults.headers.common['Authorization'] = '';
						if(err.response){
							return err.response.data;
						}else{
							return err.message
						}
					}).then(stream => {
						stream.on('data', bufferArr => {
							let obj = JSON.stringify(String(bufferArr));
							console.log('bufferArr', bufferArr);
							console.log('obj', obj)
							mainWindow.webContents.send('roomInAccountCallBack', obj);
						})
						stream.on('end', () => {
							console.log('end stream ::: ')
						})
					})
				}else{
					return {'isLogin': false};
				}
			}).catch(error=>{
				console.error('error ::: ', error.message)
				console.error('error stack :::', error.stack)
				return undefined;
			})
		})

		ipcMain.handle('createRoomFavorites', async (event, param = {}) => {
			return windowUtil.isLogin( result => {
				if(result.isLogin){
					param = Object.entries(param).reduce((total, [k,v]) => {
						if(v != undefined && v != ''){
							total[k] = v;
						}
						return total;
					},{});
					return axios.post(`${__serverApi}/api/room/create-room-favorites`, JSON.stringify(param), {
						headers:{
							'Content-Type': 'application/json'
						}
					}).then(response => {
						let status = response.status;
						let {code, data} = response.data;
						if((status == '200' || status == '201') && code == '00'){
						
						}
						return response.data
					}).catch(err=>{
						console.error('IPC createRoomFavorites error : ', JSON.stringify(err));
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
				console.error('error ::: ', error.message)
				console.error('error stack :::', error.stack)
				return undefined;
			})
		})
		ipcMain.handle('updateRoomInAccout', async (event, param = {}) => {
			return windowUtil.isLogin( result => {
				if(result.isLogin){
					param = Object.entries(param).reduce((total, [k,v]) => {
						if(v != undefined && v != ''){
							total[k] = v;
						}
						return total;
					},{});
					return axios.post(`${__serverApi}/api/room/update-room-in-account`, JSON.stringify(param), {
						headers:{
							'Content-Type': 'application/json'
						}
					}).then(response => {
						let status = response.status;
						let {code, data} = response.data;
						if((status == '200' || status == '201') && code == '00'){
						
						}
						return response.data
					}).catch(err=>{
						console.error('IPC createRoom error : ', JSON.stringify(err));
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
				console.error('error ::: ', error.message)
				console.error('error stack :::', error.stack)
				return undefined;
			})
		})

		ipcMain.handle('updateRoomFavorites', async (event, param = {}) => {
			return windowUtil.isLogin( result => {
				if(result.isLogin){
					param = Object.entries(param).reduce((total, [k,v]) => {
						if(v != undefined && v != ''){
							total[k] = v;
						}
						return total;
					},{});
					return axios.post(`${__serverApi}/api/room/update-room-favorites`, JSON.stringify(param), {
						headers:{
							'Content-Type': 'application/json'
						}
					}).then(response => {
						let status = response.status;
						let {code, data} = response.data;
						if((status == '200' || status == '201') && code == '00'){
						
						}
						return response.data
					}).catch(err=>{
						console.error('IPC createRoom error : ', JSON.stringify(err));
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
				console.error('error ::: ', error.message)
				console.error('error stack :::', error.stack)
				return undefined;
			})
		})
        ipcMain.handle('searchRoom', async (event, param = {}) => {
			return windowUtil.isLogin( result => {
				if(result.isLogin){
					console.log('param!!! : ' , param);
					let queryString = Object.entries(param)
						.filter(([k,v]) => v != undefined && v != '')
						.map(([k,v]) => `${k}=${v}`).join('&')
					return axios.get(`${__serverApi}/api/room/search-room?${queryString}`, {
						headers:{
							'Content-Type': 'application/json'
						}
					}).then(response => {
						let status = response.status;
						let {code, data} = response.data;
						if((status == '200' || status == '201') && code == '00'){
							return response.data
						}
						return undefined;
					}).catch(err=>{
						console.error('IPC searchRoom error : ', JSON.stringify(err));
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
				console.error('error ::: ', error.message)
				console.error('error stack :::', error.stack)
				return undefined;
			})
		})
		ipcMain.handle('searchRoomMyJoined', async (event, param = {}) => {
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
						
					return axios.get(`${__serverApi}/api/room/search-room-my-joined?${queryString}`, {
						headers:{
							'Content-Type': 'application/json'
						}
					}).then(response => {
						let status = response.status;
						let {code, data} = response.data;
						if((status == '200' || status == '201') && code == '00'){
							return response.data
						}
						return undefined;
					}).catch(err=>{
						console.error('IPC searchRoomMyJoined error : ', JSON.stringify(err));
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
				console.error('error ::: ', error.message)
				console.error('error stack :::', error.stack)
				return undefined;
			})
		})
		ipcMain.handle('searchRoomMyJoinedName', async (event, param = {}) => {
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
					return axios.get(`${__serverApi}/api/room/search-room-my-joined-name?${queryString}`, {
						headers:{
							'Content-Type': 'application/json'
						}
					}).then(response => {
						let status = response.status;
						let {code, data} = response.data;
						if((status == '200' || status == '201') && code == '00'){
							return response.data
						}
						return undefined;
					}).catch(err=>{
						console.error('IPC searchRoomMyJoinedName error : ', JSON.stringify(err));
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
				console.error('error ::: ', error.message)
				console.error('error stack :::', error.stack)
				return undefined;
			})
		})

		ipcMain.handle('searchRoomFavoritesMyJoined', async (event, param = {}) => {
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
						
					return axios.get(`${__serverApi}/api/room/search-room-favorites-my-joined?${queryString}`, {
						headers:{
							'Content-Type': 'application/json'
						}
					}).then(response => {
						let status = response.status;
						let {code, data} = response.data;
						if((status == '200' || status == '201') && code == '00'){
							return response.data
						}
						return undefined;
					}).catch(err=>{
						console.error('IPC searchRoomMyJoined error : ', JSON.stringify(err));
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
				console.error('error ::: ', error.message)
				console.error('error stack :::', error.stack)
				return undefined;
			})
		})

		ipcMain.handle('searchRoomFavoritesMyJoinedName', async (event, param = {}) => {
			return windowUtil.isLogin( result => {
				if(result.isLogin){
					let queryString = Object.entries(param)
						.filter(([k,v]) => v != undefined && v != '')
						.map(([k,v]) => `${k}=${v}`).join('&')
					return axios.get(`${__serverApi}/api/room/search-room-favorites-my-joined-name?${queryString}`, {
						headers:{
							'Content-Type': 'application/json'
						}
					}).then(response => {
						let status = response.status;
						let {code, data} = response.data;
						if((status == '200' || status == '201') && code == '00'){
							return response.data
						}
						return undefined;
					}).catch(err=>{
						console.error('IPC searchRoomMyJoinedName error : ', JSON.stringify(err));
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
				console.error('error ::: ', error.message)
				console.error('error stack :::', error.stack)
				return undefined;
			})
		})
    }

}
const roomIpcController = new RoomIpcController();
module.exports = roomIpcController