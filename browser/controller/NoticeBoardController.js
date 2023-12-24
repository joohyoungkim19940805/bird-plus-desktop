const path = require('path');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');
class NoticeBoardController {
	constructor() {

    }

    createNoticeBoardGroup(param = {}){
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

    createNoticeBoard(param = {}){
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

    createNoticeBoardDetail(param = {}){
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
    searchNoticeBoardList(param = {}, EventSource, eventSendObj){
        if( ! EventSource) EventSource = top?.EventSource;
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
                        withCredentials : ! top.__isLocal
                    });
                    source.onmessage = (event) => {
                        //console.log('test message :::: ',event);
                        let {data, lastEventId, origin, type} = event;
                        data = JSON.parse(data);
                        if(eventSendObj.webEventSend){
							eventSendObj.webEventSend('noticeBoardAccept', data);
						}else{
							eventSendObj.send('noticeBoardAccept', data);
						}
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
    }

    searchNoticeBoardDetailList(param = {}, EventSource, eventSendObj){
        if( ! EventSource) EventSource = top?.EventSource;
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
                        withCredentials : ! top.__isLocal
                    });
                    source.onmessage = (event) => {
                        //console.log('test message :::: ',event);
                        let {data, lastEventId, origin, type} = event;
                        data = JSON.parse(data);
                        if(eventSendObj.webEventSend){
							eventSendObj.webEventSend('noticeBoardDetailAccept', data);
						}else{
							eventSendObj.send('noticeBoardDetailAccept', data);
						}
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
    }

    deleteNoticeBoard(param = {}){
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
    deleteNoticeBoardGroup(param = {}){
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
    updateNoticeBoardOrder(param = []){
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
                    log.error('IPC updateNoticeBoardOrder error : ', JSON.stringify(err));
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
    updateNoticeBoardDetailOrder(param = []){
        return windowUtil.isLogin( result => {
            if(result.isLogin){
                return axios.post(`${__serverApi}/api/notice-board/update/detail-order`, JSON.stringify(param), {
                    headers:{
                        'Content-Type': 'application/json'
                    }
                })
                .then(windowUtil.responseCheck)
                .then(response => response.data)
                .catch(err=>{
                    log.error('IPC updateNoticeBoardDetailOrder error : ', JSON.stringify(err));
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
const noticeBoardController = new NoticeBoardController();
module.exports = noticeBoardController