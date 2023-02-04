/**
 * path 모듈 불러오기
 */
const path = require('path');

/**
 * 메인 윈도우를 만들기 위해 일렉트론 모듈에서 브라우저 윈도우를 가져온다. 
 */
const {BrowserWindow} = require('electron');

/**
 * 메인화면에서 사용 할 윈도우를 정의한다.
 * @author mozu123
 * @constructor
 * @extends BrowserWindow
 */
class MainWindow extends BrowserWindow{
	/**
	 * 메인 윈도우의 생성자
	 * @author mozu123
	 */
	constructor() {
		//console.log('__project_path in MainWindow :::', __project_path);
		super({
			width : 800,
			height : 300,
			webPreferences : {
				preload : path.join(__project_path, 'preload.js')
			},
			center : true,
			autoHideMenuBar : true,
			titleBarStyle: 'hidden',
			movable : false,
			resizable : false,
			trafficLightPosition: {
				x: 15,
				y: 13,  // macOS traffic lights seem to be 14px in diameter. If you want them vertically centered, set this to `titlebar_height / 2 - 7`.
			},
		});
		super.setTitleBarOverlay
		super.loadFile(path.join(__project_path, 'view/html/opening.html')).then(e=>{
			//console.log(e)
			super.webContents.openDevTools();
		});

		super.on('close', event => {
			event.sender.hide();
			event.preventDefault(); // prevent quit process
		})

		super.on('resize', () => {	
			mainWindow.webContents.send("resized", super.getSize());
		});
	}
}

const mainWindow = new MainWindow();
module.exports = mainWindow