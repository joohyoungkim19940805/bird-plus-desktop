/**
 * path 모듈 불러오기
 */
const path = require('path');

/**
 * 메인 윈도우를 만들기 위해 일렉트론 모듈에서 브라우저 윈도우를 가져온다. 
 */
const {BrowserWindow} = require('electron');

const EasyObserver = require(path.join(__project_path, 'browser/service/EasyObserver.js'))

const birdPlusOptions = require(path.join(__project_path, 'BirdPlusOptions.js'))

/**
 * 메인 윈도우를 정의한다.
 * @author mozu123
 * @constructor
 * @extends BrowserWindow
 */
class MainWindow extends BrowserWindow{
	
	#workspaceId
	
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
				preload : path.join(__project_path, 'browser/preload/preload.js'),
				protocol: "file",
      			slashes: true
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

		//super.setTitleBarOverlay
		
		super.loadFile(path.join(__project_path, 'view/html/opening.html')).then(e=>{
			//console.log(e)
			super.webContents.openDevTools();
		});

		super.on('close', event => {
			event.sender.hide();
			event.preventDefault(); // prevent quit process
		})

		super.on('resize', (event) => {
			mainWindow.webContents.send("resized", super.getSize());
			birdPlusOptions.size = super.getSize();
		});

		super.on('move' , (event) => {
			birdPlusOptions.position = super.getPosition();
		})

		//새창 팝업 열릴시 트리거(파일인 경우만)
		super.webContents.setWindowOpenHandler(({url}) => {
			console.log(url);
			if(url.includes('blob:file:///')){
				return {
					action: 'allow',
					outlivesOpener: false,
					overrideBrowserWindowOptions: {
						frame: true,
						fullscreenable: true,
						backgroundColor: 'black',
						autoHideMenuBar : true,
						//autoHideMenuBar : false,
						movable : true,
						resizable : true,
						titleBarStyle: 'visible',
						titleBarOverlay: true,
						webPreferences: {
							preload : path.join(__project_path, 'browser/preload/imageAndVideoDetailPreload.js')
						}
					}
				}
			}

			return { action: 'deny' }
		});

	}
	set workspaceId(workspaceId){
		if(this.#workspaceId === workspaceId){
            return;
        }
		this.#workspaceId = workspaceId;
		mainWindow.webContents.send("workspaceChange", {workspaceId: this.#workspaceId});
	}
	get workspaceId(){
		return this.#workspaceId;
	}
}

const mainWindow = new MainWindow();
module.exports = mainWindow