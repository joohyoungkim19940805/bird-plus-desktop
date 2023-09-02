export default class LayerPopupTemplate{

	#dim = Object.assign(document.createElement('div'),{
		className: 'layer_dim'
	})
	#containerBox;
	#container = (() => {
		let container = Object.assign(document.createElement('div'), {
			className: 'layer_container'
		});
		let containerBox = Object.assign(document.createElement('div'), {
			className: 'layer_container_box'
		});
		this.#containerBox = containerBox;
		this.#dim.append(containerBox);
		containerBox.append(container);
		return container;
	})();
	#onOpenCloseCallBack = () => {}
	constructor(){
		new MutationObserver( (mutationList)=> {
			mutationList.forEach( (mutation) => {
				if( ! mutation.target.hasAttribute('open')){
					this.#dim.remove();
					if(this.onOpenCloseCallBack instanceof Function){
						this.onOpenCloseCallBack('close');
					}
				}else{
					document.body.append(this.#dim);
					console.log(this.#dim);
					let openWait = setInterval(() => {
						if(this.#dim.isConnected){
							this.#dim.style.opacity = 1;
							this.#containerBox.style.opacity = 1;
							clearInterval(openWait);

						}
					}, 50);
					if(this.onOpenCloseCallBack instanceof Function){
						this.onOpenCloseCallBack('open');
					}
				}
			});
		}).observe(this.#dim, {
			attributeFilter:['open'],
			attributeOldValue:true
		});
		
		this.#containerBox.onkeyup = (event) => {
			if(event.key == 'Escape'){
				this.close();
			}
		}

		this.#dim.onclick = (event) => {
			if(event.composedPath().some(e=>e==this.#containerBox)){
				return;
			}
			this.close();
		}

	}

	set onOpenCloseCallBack(onOpenCloseCallBack){
		this.#onOpenCloseCallBack = onOpenCloseCallBack;
	}
	get onOpenCloseCallBack(){
		return this.#onOpenCloseCallBack;
	}

	get dim(){
		return this.#dim;
	}

	get container(){
		return this.#container;
	}

	/**
	 * 이 레이어를 닫는 함수
	 * @param {Function} onOpenCloseCallBack : 이 레이어를 닫은 후 실행 할 콜백 함수 
	 * @returns {Function} callBakcFunction
	 */
	close(onOpenCloseCallBack){
		this.#dim.removeAttribute('open');
		this.#containerBox.style.opacity = '';
		this.#dim.style.opacity = '';
	}
	/**
	 * 이 레이어를 여는 함수
	 * @param {Function} onOpenCloseCallBack : 이 레이어를 연 후 실행 할 콜백 함수
	 * @returns {Function} onOpenCloseCallBack
	 */
	open(onOpenCloseCallBack){
		this.#dim.setAttribute('open', '')
	}
	

}