const path = require('path');
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');
class RoomController {
	constructor() {
    }

	createRoom(param = {}){
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
	createMySelfRoom(param = {}){
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
	createRoomInAccount(param = []){
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
	updateRoomInAccoutOrder(param = []){
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
	createRoomFavorites(param){
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
	updateRoomFavorites(param = []){
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
	searchRoomList(param = {}){
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
	searchMyJoinedRoomList(param = {}){
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
	searchRoomFavoritesList(param = {}){
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
	searchRoomJoinedAccountList(param = {}, EventSource, eventSendObj){

		if( ! param.roomId || isNaN(parseInt(param.roomId))){
			log.error(`searchRoomJoinedAccountList roomId is ::: ${param.roomId}`);
			return undefined;
		}
		if( ! EventSource) EventSource = top?.EventSource;
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return new Promise(resolve=>{
					let source = new EventSource(`${__serverApi}/api/room/search/in-account-list/${param.roomId}`, {
						headers: {
							'Authorization' : axios.defaults.headers.common['Authorization'],
						},
						withCredentials : ! top.__isLocal
					});
					source.onmessage = (event) => {
						//console.log('test message :::: ',event);
						let {data, lastEventId, origin, type} = event;
						data = JSON.parse(data);
						if(eventSendObj.webEventSend){
							eventSendObj.webEventSend('roomInAccountAccept', data);
						}else{
							eventSendObj.send('roomInAccountAccept', data);
						}
					}
					source.onerror = (event) => {
						//console.log('searchRoomJoinedAccountList error :::: ',event);
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
	}
	
	getRoomDetail(param = {}){
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
	isRoomFavorites(param = {}){
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
const roomController = new RoomController();
module.exports = roomController