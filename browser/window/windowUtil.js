const axios = require('axios');
const log = require('electron-log');

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
                    response.data.isLogin = true;	
                }else if(response.data.code == 100 || response.data.code == 105 || response.data.code == 106 || response.data.code == 107){
                    response.data.isLogin = false;
                }else{
                    response.data.isLogin = false;
                }
                return callBack(response.data);
            }
        }).catch(error=>{
            log.error(error);
            log.error('isLogin error callBack ::: ', callBack.toString());
            throw error;
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
				throw new Error(JSON.stringify(data));
			}
		}else{
			throw new Error(JSON.stringify({status}));
		}
	}

}
const windowUtil = new WindowUtil();
module.exports = windowUtil;