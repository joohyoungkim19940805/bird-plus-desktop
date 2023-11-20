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
	#onOpenCloseCallback = () => {}
	#dimIsClick = false;
	constructor(){
		new MutationObserver( (mutationList)=> {
			mutationList.forEach( (mutation) => {
				if( ! mutation.target.hasAttribute('open')){
					this.#dim.remove();
				}else{
					document.body.append(this.#dim);
					let openWait = setInterval(() => {
						if(this.#dim.isConnected){
							this.#dim.style.opacity = 1;
							this.#containerBox.style.opacity = 1;
							clearInterval(openWait);

						}
					}, 50);
					if(this.onOpenCloseCallback instanceof Function){
						this.onOpenCloseCallback('open');
					}
				}
			});
		}).observe(this.#dim, {
			attributeFilter:['open'],
			attributeOldValue:true
		});
		
		window.addEventListener('keyup', (event) => {
			if( ! this.#containerBox.isConnected || event.key != 'Escape'){
				return;
			}

			this.close();
		})
		/*
		this.#containerBox.onkeyup = (event) => {
			if(event.key == 'Escape'){
				this.close();
			}
		}
		*/
		this.#dim.onclick = (event) => {
			if(this.#dimIsClick || event.composedPath().some(e=>e==this.#containerBox)){
				return;
			}
			this.#dimIsClick = true;
			this.close();
		}

	}

	set onOpenCloseCallback(onOpenCloseCallback){
		this.#onOpenCloseCallback = onOpenCloseCallback;
	}
	get onOpenCloseCallback(){
		return this.#onOpenCloseCallback;
	}

	get dim(){
		return this.#dim;
	}

	get container(){
		return this.#container;
	}

	/**
	 * 이 레이어를 닫는 함수
	 * @param {Function} callback : 이 레이어를 닫은 후 실행 할 콜백 함수 
	 */
	close(callback){
		this.#containerBox.style.opacity = '';
		this.#dim.style.opacity = '';
		//this.#containerBox.ontransitionend = '';
		this.#dim.ontransitionend = '';
		new Promise(res=>{
			if(callback instanceof Function){
				callback();
			}
			res();
		});
		new Promise(res=>{
			if(this.onOpenCloseCallback instanceof Function){
				this.onOpenCloseCallback('close');
			}
			res();
		})
		/*
		this.#containerBox.ontransitionend = () => {
			this.#dim.removeAttribute('open');
			this.#dim.ontransitionend = () => {
				this.#containerBox.ontransitionend = '';
				this.#dim.ontransitionend = '';
			}
		}
		*/
		this.#dim.ontransitionend = () => {
			this.#dim.removeAttribute('open');
			this.#containerBox.ontransitionend = '';
			this.#dim.ontransitionend = '';
			this.#dimIsClick = false;
		}
	}
	/**
	 * 이 레이어를 여는 함수
	 * @param {Function} callback : 이 레이어를 연 후 실행 할 콜백 함수
	 */
	open(callback){
		this.#dim.setAttribute('open', '')
		new Promise(res=>{
			if(callback instanceof Function){
				callback();
			}
			res();
		});
	}
	

}