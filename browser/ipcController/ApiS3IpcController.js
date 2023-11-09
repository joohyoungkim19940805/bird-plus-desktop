const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const axios = require('axios');
const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))
const windowUtil = require(path.join(__project_path,'browser/window/WindowUtil.js'))
const log = require('electron-log');
class ApiS3IpcController {
	constructor() {
		this.#initHandler();
	}
	#initHandler(){
		ipcMain.handle('testImage', async (event, param) => {
			return this.testImage(event, param);
		})
	}
	#send(eventName, data){
		mainWindow.webContents.send(eventName, data);
	}
	testImage(event, param){
		let {name, base_64, size, lastModified, content_type} = param;
		return windowUtil.isLogin( result => {
			console.log(typeof result);
			if(result.isLogin){
				return axios.post(`${__serverApi}/api/generate-presigned-url/test/`, JSON.stringify(param), {
					headers:{
						'Content-Type': 'application/json'
					}
				})
				.then(windowUtil.responseCheck)
				.then(response => {
					return response.data;
					console.log('response ::: ', response);
					let {code, data} = response.data;
					let base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
					//let blob = new File(new Blob([Buffer.from(base_64,"base64").buffer], {type: content_type}), 'test.png', {type:content_type});
					axios.put(data, {
						data: base64Data
					}, {
						headers: {
							'Content-Encoding' : 'base64',
							'Content-Type': content_type
						}
					}).then(res=>{
						console.log('aws response ::: ', res);
					}).catch(er=>log.error(er));
				}).catch(err=>{
					log.error('IPC sendChatting error', err);
					return err.response.data;
				})
			}else{
				return {'isLogin': false};
			}
		}).catch(error=>{
			log.error('sendChatting login error ::: ', error.message);
			log.error('sendChatting login error stack ::: ', error.stack);
			return undefined;
		});
	}
	
}
const apiS3IpcController = new ApiS3IpcController();
module.exports = apiS3IpcController