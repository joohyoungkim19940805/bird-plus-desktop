const path = require('path');
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/windowUtil.js'))
const log = require('electron-log');

class WorkspaceController {
	constructor() {
	}

	searchWorkspaceMyJoined(param = {}){
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
	searchNameSpecificList(param = {}){
		return windowUtil.isLogin((result) => {
			if(result.isLogin){
				return axios.get(`${__serverApi}/api/workspace/search/name-specific-list?page=${param.page}&size=${param.size}&workspaceName=${param.workspaceName}`, {
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
	searchWorkspaceInAccount(param = {}){
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
	getWorkspaceDetail(param = {}){
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
	getWorkspaceInAccountCount(param = {}){
		if( ! param.workspaceId || isNaN(parseInt(param.workspaceId))){
			log.error(`workspaceId is ::: ${param.workspaceId}`);
			return undefined;
		}
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.get(`${__serverApi}/api/workspace/search/count/${param.workspaceId}`, {
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
	createPermitWokrspaceInAccount(param = {}){
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
	createGiveAdmin(param={}){
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
	searchPermitRequestList(param = {}, EventSource, eventSendObj){
		if( ! param.workspaceId || isNaN(parseInt(param.workspaceId))){
			log.error(`searchPermitRequestList workspaceId is ::: ${param.workspaceId}`);
			return undefined;
		}
		if( ! EventSource) EventSource = top?.EventSource;
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				//return axios.get(`${__serverApi}/api/workspace/search/permit-request-list/${param.workspaceId}`, {
				return new Promise(resolve=>{
					let source = new EventSource(`${__serverApi}/api/workspace/search/permit-request-list/${param.workspaceId}`, {
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
							eventSendObj.webEventSend('workspacePermitRequestAccept', data);
						}else{
							eventSendObj.send('workspacePermitRequestAccept', data);
						}
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
	}
	getIsAdmin(param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '' && k != 'workspaceId')
					.map(([k,v]) => `${k}=${v}`).join('&')
				return axios.get(`${__serverApi}/api/workspace/search/is-admin/${param.workspaceId}?${queryString}`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => {
					return response.data
				}).catch(err=>{
					log.error('IPC getIsAdmin error : ', JSON.stringify(err));
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
	createWorkspaceJoined(param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
					if(v != undefined && v != ''){
						total[k] = v;
					}
					return total;
				},{});
				return axios.post(`${__serverApi}/api/workspace/create/joined`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => {
					return response.data
				})
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

	createWorkspace(param={}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
					if(v != undefined && v != ''){
						total[k] = v;
					}
					return total;
				},{});
				return axios.post(`${__serverApi}/api/workspace/create/`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => response.data)
				.catch(err=>{
					log.error('IPC createWorkspace error : ', JSON.stringify(err));
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
const workspaceController = new WorkspaceController();
module.exports = workspaceController