
const path = require('path');


const { app, Menu, Tray, ipcMain, Notification } = require('electron');
// 자동 업데이트 모듈 호출
const {autoUpdater} = require('electron-updater')

/**
 * 메인 tray를 정의한다.
 * @author mozu123
 * @constructor
 * @extends Tray
 */
class MainTray extends Tray{
	mainWindow = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
	constructor() {
		super( path.join(__project_path, 'view/image/icon.ico') );
		this.setToolTip('This is my application.');
		const menu = Menu.buildFromTemplate([
			{ label: 'Item1', type: 'normal' },
			{ label: 'Item3', type: 'radio', checked: true },
			{ label: 'Item4', type: 'submenu', submenu: [
					{label:'Item5', type:'normal'}
				]
			},
			{ label: 'close', id: 'close_btn', click: ()=> {
					this.mainWindow.removeAllListeners("close");
					//autoUpdater.quitAndInstall();
					app.quit();
				} 
			},
		]);
  		this.setContextMenu(menu);

		let isDoubleClick = false;
		super.on('click', (event, rect) =>{
			if(isDoubleClick){
				return;
			}
			//console.log('click >>> ', event, rect);
		})
		super.on('double-click', (event, rect)=>{
			isDoubleClick = true;
			
			//console.log('double click >>> ', event, rect);
			if(this.mainWindow.isVisible()){
				this.mainWindow.focus();
			}else{
				this.mainWindow.show();
			}
			
			isDoubleClick = false;
		})
		
		ipcMain.on('notifications', async (event, param)=>{
			let content = param.content.join('\n');
			let notification = new Notification({
				title: param.fullName,
				body: content.substring(0,200) + (content.length > 200 ? '...' : ''),
				icon: path.join(__project_path, 'view/image/icon.ico')
			});
			notification.show();
			notification.on('click', () => {
				if(this.mainWindow.workspaceId != param.workspaceId){
					this.mainWindow.webContents.send('workspaceChange', {workspaceId: param.workspaceId});
				}
				this.mainWindow.webContents.send('roomChange', {roomId: param.roomId});
			})
		})
	}
	addTrayEvent(){
		
	}
}

const mainTray = new MainTray();
module.exports = mainTray