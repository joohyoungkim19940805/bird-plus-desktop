const axios = require('axios');

class WindowUtil{
    constructor(){

    }
    async isLogin(callBack = () => {}){
        return axios.get(__serverApi + '/api/account/is-login', {
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
                return response.json().then(json=>{
                    if(json.code == 0){
                        json.isLogin = true;	
                    }else{
                        json.isLogin = false;
                    }
                    if(json.isLogin){
                        this.loginSuccessResolve();
                    }
                    return callBack(json);
                });
            }
        }).catch(error=>{
            return callBack({
                isLogin: false,
                message: error.message,
                stack: error.stack
            });
        });
    }

    responseIsOk({status}){
        return (status == '200' || status == '201') ;
    }
}
const windowUtil = new WindowUtil();
module.exports = windowUtil;