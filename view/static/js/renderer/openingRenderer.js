
/*
document.getElementById('openFileBtn').onclick = async () => {
	const filePath = await window.myAPI.openFile();
	console.log(filePath);
	document.getElementById('showFilePath').textContent = filePath;
}
*/
import UserDirtoryListDBHandler from "../handler/UserDirtoryListDBHandler"
new class OpeningRenderer{
	#container = document.getElementById('container');
	#lodingBarWrapper = this.#container.querySelector('.loding_bar_wrapper');
	
	#statusWrapper = this.#lodingBarWrapper.querySelector('.status_wrapper');
	#statusText = this.#statusWrapper.querySelector('.status_text');
	
	#lodingBar = this.#lodingBarWrapper.querySelector('.loding_bar');
	#lodingProgress = this.#lodingBar.querySelector('.progress');

	#desktopLength = 0;

	constructor(){
		
		window.addEventListener('load', () => {
			new Promise(resolve => {
				// 디벨로퍼보다 빨리 실행되어 디버깅이 안되기 때문에 지연을 넣는다.
				setTimeout(()=>{
					resolve('done');
				}, 1500)
			})
			.then(() => {
				return window.myAPI.setMainPageDesign();
			}).then((e)=>{
				console.log(e)
			});
		});

	}

}();
