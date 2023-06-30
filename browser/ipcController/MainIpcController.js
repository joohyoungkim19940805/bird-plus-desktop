const { app, BrowserWindow, ipcMain, shell } = require('electron');
const axios = require('axios');
class MainIpcController {
	constructor() {
		ipcMain.handle('sendChatting', async (event, param) => {
			console.log(param);

			return axios.post(__serverApi + 'api/test', JSON.stringify(param), {
				headers:{
					'Content-Type': 'application/json'
				}
			}).then(response => {
				let status = response.status;
				let {code, data} = response.data;
				if((status == '200' || status == '201') && code == '00'){
					console.log(data);
				}
				return data;
			}).catch(err=>{
				console.error(err);
				return err.response.data;
			})
		})
	}

}
const mainIpcController = new MainIpcController();
module.exports = mainIpcController