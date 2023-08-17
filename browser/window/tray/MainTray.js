
const path = require('path');


const { app, Menu, Tray } = require('electron');
// 자동 업데이트 모듈 호출
const {autoUpdater} = require('electron-updater')

/**
 * 메인 tray를 정의한다.
 * @author mozu123
 * @constructor
 * @extends Tray
 */
class MainTray extends Tray{
	mainWindow =  require(path.join(__project_path, 'browser/window/main/MainWindow.js'))
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
					autoUpdater.quitAndInstall();
				} 
			},
		]);
  		this.setContextMenu(menu);
		//console.log(menu.getMenuItemById('close_btn') );
	}
}

const mainTray = new MainTray();
module.exports = mainTray