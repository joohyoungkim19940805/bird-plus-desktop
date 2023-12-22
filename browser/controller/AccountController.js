const path = require('path');

const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const axios = require('axios');
const log = require('electron-log');

class AccountController {
	constructor() {

	}

	loginProcessing(param){
		param = Object.entries(param).reduce((total, [k,v]) => {
			if(v != undefined && v != ''){
				total[k] = v;
			}
			return total;
		},{});
		return axios.post(__serverApi + '/login-processing', JSON.stringify(param), {
			headers:{
				'Content-Type': 'application/json'
			}
		})
		.then(response=>{
			return response;	
		}).catch(err=>{
			log.error('loginProcessing error : ', err.message);
			axios.defaults.headers.common['Authorization'] = '';
			console.log(err);
			if(err.response){
				return err.response.data;
			}else{
				return err.message
			}
			
		})
	}
	getAccountInfo(){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				return axios.get(`${__serverApi}/api/account/search/get-account-info`, {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response=>response.data)
				.catch(err=>{
					log.error('IPC getAccountInfo error : ', JSON.stringify(err));
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
		});
	}
	updateSimpleAccountInfo(param = {}){
		return windowUtil.isLogin( result => {
			if(result.isLogin){
				param = Object.entries(param).reduce((total, [k,v]) => {
					if(v != undefined && v != ''){
						total[k] = v;
					}
					return total;
				},{});
				return axios.post(`${__serverApi}/api/account/update/simple-account-info`, JSON.stringify(param), {
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
}
const accountController = new AccountController();
module.exports = accountController