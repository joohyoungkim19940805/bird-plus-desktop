const axios = require('axios');

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
            console.error(error);
            throw error;
        })
    }

    responseIsOk({status}){
        return (status == '200' || status == '201') ;
    }
}
const windowUtil = new WindowUtil();
module.exports = windowUtil;