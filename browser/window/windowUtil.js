const path = require('path');
const axios = require('axios');
const log = require('electron-log');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))

class WindowUtil{
    constructor(){

    }
    async isLogin(callBack = () => {}){
        return axios.get(__serverApi + '/api/account/search/is-login', {
            headers:{
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if( ! this.responseIsOk(response)){
                return callBack({
                    isLogin: false,
                    status: response.status,
                    statusText: response.statusText
                });
            }else{
                if(response.data.code == 0){
                    response.isLogin = true;	
                }else if(response.data.code == 100 || response.data.code == 105 || response.data.code == 106 || response.data.code == 107){
                    response.isLogin = false;
                }else{
                    response.isLogin = false;
                }

                if(! response.isLogin){
                    mainWindow.loadFile(path.join(__project_path, 'view/html/loginPage.html')).then(e=>{
                        mainWindow.titleBarStyle = 'visibble'
                        mainWindow.show();
                        mainWindow.isOpening = false;
                        return 'done';
                    })
                }
                return callBack(response);
            }
        }).catch(error=>{
            log.error(error);
            log.error('isLogin error callBack ::: ', callBack.toString());
            log.error(error.data);
            axios.defaults.headers.common['Authorization'] = '';
            error.isLogin=false;
            mainWindow.loadFile(path.join(__project_path, 'view/html/loginPage.html')).then(e=>{
                mainWindow.titleBarStyle = 'visibble'
                mainWindow.show();
                mainWindow.isOpening = false;
                return 'done';
            })
            return callBack(error);
            //throw error;
        })
    }

    responseIsOk({status}){
        return (status == '200' || status == '201') ;
    }

    responseCheck(response){
		let status = response.status;
		let {code, data} = response.data;
        if(status == '200' || status == '201'){
			if( ! code || (code && code == 0)){
				return response
			}else{
				throw new Error(JSON.stringify(response));
			}
		}else{
			throw new Error(JSON.stringify(response));
		}
	}

}
const windowUtil = new WindowUtil();
module.exports = windowUtil;