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
            console.log('response.statusText ::: ', response.statusText);
            if( ! this.responseIsOk(response)){
                return callBack({
                    isLogin: false,
                    status: response.status,
                    statusText: response.statusText
                });
            }else{
                if(response.data.code == 0){
                    response.data.isLogin = true;	
                }else{
                    response.data.isLogin = false;
                }
                return callBack(response.data);
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