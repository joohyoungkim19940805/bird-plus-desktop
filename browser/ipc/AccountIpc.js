const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
const windowUtil = require(path.join(__project_path,'browser/window/windowUtil.js'))
const DBConfig = require(path.join(__project_path, 'DB/DBConfig.js'))
const axios = require('axios');
const log = require('electron-log');
const accountController = require(path.join(__project_path, 'browser/controller/AccountController.js'));

class AccountIpc {
	constructor() {

		ipcMain.handle('loginProcessing', async (event, param) => {
			return accountController.loginProcessing(param).then(response => {
				let status = response.status;
				let {data} = response;
				if((status == '200' || status == '201') && data.code == 0){
					let db = DBConfig.getDB();
					db.serialize( () => {
						let {token, issuedAt, expiresAt} = data.data;
						//global.__apiToken = token; 
						db.run(`
							INSERT INTO ACCOUNT_LOG (
								TOKEN,
								ISSUED_AT,
								EXPIRES_AT
							)
							VALUES (?,?,?)
						`,[token, issuedAt, expiresAt], (err) => {
							if(err){
								log.error('login account log insert error', err);
							}
						});
						axios.defaults.headers.common['Authorization'] = token;
						windowUtil.isLogin();
					})
				}
				return data;
			});
		});

		ipcMain.handle('getAccountInfo', async (event) => {
			return accountController.getAccountInfo();
		})
		ipcMain.handle('updateSimpleAccountInfo', async (event, param) => {
			return accountController.updateSimpleAccountInfo(param);
		})
	}
	
}
const accountIpc = new AccountIpc();
module.exports = accountIpc