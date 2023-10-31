const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
const log = require('electron-log');
class NoticeBoardIpccontroller {
	constructor() {
		this.#initHanlder();
    }

	#initHanlder(){
        ipcMain.handle('createNoticeBoardGroup', async (event, param = {}) => {
			return this.createNoticeBoardGroup(event, param);
		});
		ipcMain.handle('createNoticeBoard', async (event, param = {}) => {
			return this.createNoticeBoard(event, param);
		});
        ipcMain.handle('createNoticeBoardDetail', async (event, param = {}) => {
            return this.createNoticeBoardDetail(event, param)
        })
        ipcMain.handle('searchNoticeBoardList', async (event, param = {}) => {
			return this.searchNoticeBoardList(event, param);
		});
        ipcMain.handle('searchNoticeBoardDetailList', async (event, param = {}) => {
            return this.searchNoticeBoardDetailList(event, param);
        })
        ipcMain.handle('deleteNoticeBoardGroup', async (event, param = {}) => {
			return this.deleteNoticeBoardGroup(event, param);
		});
		ipcMain.handle('deleteNoticeBoard', async (event, param = {}) => {
			return this.deleteNoticeBoard(event, param);
		});
        /*ipcMain.handle('updateNoticeBoardGroup', async (event, param = {}) => {
			return this.updateNoticeBoardGroup(event, param);
		});*/
		ipcMain.handle('updateNoticeBoardOrder', async (event, param = []) => {
			return this.updateNoticeBoardOrder(event, param);
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

    createNoticeBoardGroup(event, param = {}){
        return windowUtil.isLogin( result => {
            if(result.isLogin){
                param = Object.entries(param).reduce((total, [k,v]) => {
                    if(v != undefined && v != ''){
                        total[k] = v;
                    }
                    return total;
                },{});
                return axios.post(`${__serverApi}/api/notice-board/create/group`, JSON.stringify(param), {
                    headers:{
                        'Content-Type': 'application/json'
                    }
                })
                .then(windowUtil.responseCheck)
                .then(response => response.data)
                .catch(err=>{
                    log.error('IPC createNoticeBoardGroup error : ', JSON.stringify(err));
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

    createNoticeBoard(event, param = {}){
        return windowUtil.isLogin( result => {
            if(result.isLogin){
                param = Object.entries(param).reduce((total, [k,v]) => {
                    if(v != undefined && v != ''){
                        total[k] = v;
                    }
                    return total;
                },{});
                return axios.post(`${__serverApi}/api/notice-board/create/`, JSON.stringify(param), {
                    headers:{
                        'Content-Type': 'application/json'
                    }
                })
                .then(windowUtil.responseCheck)
                .then(response => response.data)
                .catch(err=>{
                    log.error('IPC createNoticeBoard error : ', JSON.stringify(err));
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

    createNoticeBoardDetail(event, param = {}){
        return windowUtil.isLogin( result => {
            if(result.isLogin){
                param = Object.entries(param).reduce((total, [k,v]) => {
                    if(v != undefined && v != ''){
                        total[k] = v;
                    }
                    return total;
                },{});
                return axios.post(`${__serverApi}/api/notice-board/create/detail`, JSON.stringify(param), {
                    headers:{
                        'Content-Type': 'application/json'
                    }
                })
                .then(windowUtil.responseCheck)
                .then(response => response.data)
                .catch(err=>{
                    log.error('IPC createNoticeBoardDetail error : ', JSON.stringify(err));
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
    searchNoticeBoardList(event, param = {}){
        return windowUtil.isLogin( result => {
            if(result.isLogin){
                let {workspaceId, roomId} = param;
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '' && k != 'workspaceId' && k != 'roomId')
					.map(([k,v]) => `${k}=${v}`).join('&')
                    //console.log('queryString ::: ', queryString);
                return axios.get(`${__serverApi}/api/notice-board/search/notice-board-list/${workspaceId}/${roomId}?${queryString}`, {
					headers:{
						'Content-Type': 'application/json',
						'Accept': 'text/event-stream',
					},
					responseType: 'stream'
                })
                .then(windowUtil.responseCheck)
                .then(response => response.data)
                .catch(err=>{
                    log.error('IPC searchNoticeBoardList error : ', JSON.stringify(err));
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
                            let first = str.charAt(0);
                            let last = str.charAt(str.length - 1);
                            while(first == '[' || first == ','){
                                str = str.substring(1);
                                first = str.charAt(0);
                            }
                            while(last == '[' || last == ','){
                                str = str.substring(0, str.length - 2);    
                                last = str.charAt(str.length - 1);
                            }
							let obj = JSON.parse(str);
							this.#send('noticeBoardAccept', obj)
						}catch(ignore){}
					})
					stream.on('end', () => {
						log.debug('end noticeBoardSearch stream ::: ')
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
		});
    }

    searchNoticeBoardDetailList(event, param = {}){
        return windowUtil.isLogin( result => {
            if(result.isLogin){
                let {workspaceId, roomId, noticeBoardId} = param;
				let queryString = Object.entries(param)
					.filter(([k,v]) => v != undefined && v != '' && k != 'workspaceId' && k != 'roomId' && k != 'noticeBoardId')
					.map(([k,v]) => `${k}=${v}`).join('&')
                    //console.log('queryString ::: ', queryString);
                return axios.get(`${__serverApi}/api/notice-board/search/notice-board-detail-list/${workspaceId}/${roomId}/${noticeBoardId}?${queryString}`, {
					headers:{
						'Content-Type': 'application/json',
						'Accept': 'text/event-stream',
					},
					responseType: 'stream'
                })
                .then(windowUtil.responseCheck)
                .then(response => response.data)
                .catch(err=>{
                    log.error('IPC searchNoticeBoardDetailList error : ', JSON.stringify(err));
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
                            let first = str.charAt(0);
                            let last = str.charAt(str.length - 1);
                            while(first == '[' || first == ','){
                                str = str.substring(1);
                                first = str.charAt(0);
                            }
                            while(last == '[' || last == ','){
                                str = str.substring(0, str.length - 2);    
                                last = str.charAt(str.length - 1);
                            }
							let obj = JSON.parse(str);
                            this.#send('noticeBoardDetailAccept', obj)
						}catch(ignore){}
					})
					stream.on('end', () => {
						log.debug('end noticeBoardDetailAccept stream ::: ')
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
		});
    }

    deleteNoticeBoard(event, param = {}){
        return windowUtil.isLogin( result => {
            if(result.isLogin){
                param = Object.entries(param).reduce((total, [k,v]) => {
                    if(v != undefined && v != ''){
                        total[k] = v;
                    }
                    return total;
                },{});
                console.log('delete param',param)
                return axios.post(`${__serverApi}/api/notice-board/delete/`, JSON.stringify(param), {
                    headers:{
                        'Content-Type': 'application/json'
                    }
                })
                .then(windowUtil.responseCheck)
                .then(response => response.data)
                .catch(err=>{
                    log.error('IPC deleteNoticeBoard error : ', JSON.stringify(err));
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
    deleteNoticeBoardGroup(event, param = {}){
        return windowUtil.isLogin( result => {
            if(result.isLogin){
                param = Object.entries(param).reduce((total, [k,v]) => {
                    if(v != undefined && v != ''){
                        total[k] = v;
                    }
                    return total;
                },{});

                return axios.post(`${__serverApi}/api/notice-board/delete/group`, JSON.stringify(param), {
                    headers:{
                        'Content-Type': 'application/json'
                    }
                })
                .then(windowUtil.responseCheck)
                .then(response => response.data)
                .catch(err=>{
                    log.error('IPC deleteNoticeBoardGroup error : ', JSON.stringify(err));
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
    updateNoticeBoardOrder(event, param = []){
        return windowUtil.isLogin( result => {
            if(result.isLogin){
                console.log('update param',param)
                return axios.post(`${__serverApi}/api/notice-board/update/order`, JSON.stringify(param), {
                    headers:{
                        'Content-Type': 'application/json'
                    }
                })
                .then(windowUtil.responseCheck)
                .then(response => response.data)
                .catch(err=>{
                    log.error('IPC deleteNoticeBoard error : ', JSON.stringify(err));
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
    /*
    updateNoticeBoardGroup(event, param = {}){
        return windowUtil.isLogin( result => {
            if(result.isLogin){
                param = Object.entries(param).reduce((total, [k,v]) => {
                    if(v != undefined && v != ''){
                        total[k] = v;
                    }
                    return total;
                },{});

                return axios.post(`${__serverApi}/api/notice-board/update/group`, JSON.stringify(param), {
                    headers:{
                        'Content-Type': 'application/json'
                    }
                })
                .then(windowUtil.responseCheck)
                .then(response => response.data)
                .catch(err=>{
                    log.error('IPC deleteNoticeBoardGroup error : ', JSON.stringify(err));
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
    }*/
}
const noticeBoardIpccontroller = new NoticeBoardIpccontroller();
module.exports = noticeBoardIpccontroller