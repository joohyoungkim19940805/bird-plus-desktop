import FreedomInterface from "../module/FreedomInterface"

export default class VideoBox {
    
    #style = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-video-box'
	});

    #videoBox = Object.assign(document.createElement('div'), {
        className: 'video-box-wrap',
        
        innerHTML:`
            <div class="video-resize-container">
                <div>
                    <label class="video-box-resize-label" for="video-box-resize-width">width : </label>
                    <input list="video-box-resize-datalist" class="video-box-resize-input" id="video-box-resize-width" type="number" autocomplete="off"/>
                </div>
                <div>
                    <label class="video-box-resize-label" for="video-box-resize-height">height(auto) : </label>
                    <input list="video-box-resize-datalist" class="video-box-resize-input" id="video-box-resize-height" type="number" autocomplete="off" disabled/>
                </div>
            </div>
            <div class="video-key-description-container" style="display:none;">
                <kbd>Ctrl</kbd>+<kbd>Wheel</kbd>OR<kbd>Shift</kbd>+<kbd>Wheel</kbd>
            </div>
            <div class="video-button-container">
                <a href="javascript:void(0);" download>
                    <i class="download-css-gg-push-down"></i>
                </a>
                <a href="javascript:void(0);">
                    <i class="new-window-css-gg-expand"></i>
                </a>
            </div>
        `
        /* 리사이즈 있는 버전 주석처리 20230821
        innerHTML: `
            <div class="video-resize-container">
                <div>
                    <label class="video-box-resize-label" for="video-box-resize-width">width : </label>
                    <input list="video-box-resize-datalist" class="video-box-resize-input" id="video-box-resize-width" type="number" autocomplete="off"/>
                </div>
                <div>
                    <label class="video-box-resize-label" for="video-box-resize-height">height(auto) : </label>
                    <input list="video-box-resize-datalist" class="video-box-resize-input" id="video-box-resize-height" type="number" autocomplete="off" disabled/>
                </div>
            </div>
            <div class="video-button-container">
                <a href="javascript:void(0);" class="download-css-gg-push-down" download></a>
                <a href="javascript:void(0);" class="new-window-css-gg-path-trim"></a>
            </div>
        `
        */
    });

    #removeEventPromiseResolve;
    #removeEventPromise = new Promise(resolve=>{
		this.#removeEventPromiseResolve = resolve;
	});

    constructor(){
        let style = document.querySelector(`#${this.#style.id}`);
        if(! style){
            document.head.append(this.createStyle());
        }else{
            this.#style = style;
        }
        new IntersectionObserver((entries, observer) => {
            entries.forEach(entry =>{
                if ( ! entry.isIntersecting && this.#videoBox.isConnected && ! this.#videoBox.classList.contains('start')) {
                    //this.#videoBox.remove();
                    this.#removeEventPromiseResolve();
                }
            });
        }, {
            threshold: 0.1,
            root: document
        }).observe(this.#videoBox);
    }

    /**
     * 
     * @param {HTMLVideoElement} video 
     */
    addVideoHoverEvent(video){
        video.parentElement.onmouseover = () => {
            let root = video.getRootNode();
            if(root != document){
                root.append(this.#style);
            }else{
                document.head.append(this.#style);
            }

            if(video.parentElement && (video.parentElement !== this.#videoBox.parentElement || ! this.#videoBox.classList.contains('start'))){
                video.parentElement.append(this.#videoBox);
                //this.#videoBox.ontransitionend = '';
                //this.#videoBox.classList.remove('start');
                /* 리사이즈 있는 버전 주석 처리 20230821
                this.#addRresizeEvent(video),
                */
                this.#addRresizeEvent(video)
                this.#addButtonIconEvent(video)
                let appendAwait = setInterval(()=>{
                    if(this.#videoBox.isConnected && video.parentElement === this.#videoBox.parentElement && ! this.#videoBox.classList.contains('start')){
                        this.#videoBox.classList.add('start');
                        clearInterval(appendAwait);
                    }
                }, 50)
            }

        }
        video.parentElement.onmouseleave = () => {
            this.#videoBox.classList.remove('start');
            if(this.#videoBox.isConnected && video.parentElement === this.#videoBox.parentElement){
                /*
                this.#videoBox.classList.remove('start');
                this.#videoBox.ontransitionend = () => {
                    if(this.#videoBox.isConnected){
                        this.#videoBox.remove();
                    }
                }
                */
            }
        }
    }

    falsh(target){
        return new Promise(resolve => {
            let flash = document.createElement('div');
            Object.assign(flash.style, {
                position: 'absolute',top: '0px',left: '0px',
                width: '100%',height: '100%', background: 'rgba(255, 255, 255, 0.4)',
                transition: 'opacity 0.2s ease 0s', opacity: 0
            })
            target.append(flash);
            let flashAwait = setInterval(()=>{
                if( ! flash.isConnected){
                    return; 
                }
                clearInterval(flashAwait);
                flash.style.opacity = 1;
                flash.ontransitionend = () => {
                    flash.style.opacity = 0;
                    flash.ontransitionend = () => {
                        flash.remove();
                        resolve();
                    }
                }
            }, 50)
        });
    }

    /**
     * 
     * @param {HTMLVideoElement} video 
     */
    //리사이즈 있는 버전 주석 처리 20230821
    #addRresizeEvent(video){
        return new Promise(resolve => {
            let [width, height] = this.#videoBox.querySelectorAll('#video-box-resize-width, #video-box-resize-height');
            width.value = video.width, height.value = video.height;
            
            width.labels[0].textContent = 'width : ';
            width.labels[1].textContent = '';
            
            this.prevValue = undefined;

            width.oninput = (event) => this.oninputEvent(video, event.target, width, height, resizeRememberTarget);
            width.onkeydown = (event) => {
                if(event.ctrlKey){
                    width.dataset.is_ctrl = '';
                }else{
                    width.removeAttribute('data-is_ctrl');
                }
            }
            width.onkeyup = (event) => {
                width.removeAttribute('data-is_ctrl');
            }
            width.onblur = () => {
                width.removeAttribute('data-is_ctrl');
            }
            width.onwheel = (event) => {
                event.preventDefault();
                if(width.hasAttribute('data-is_ctrl')){
                    width.value = Number(width.value) + (event.deltaY * -1)
                }else{
                    width.value = Number(width.value) + (event.deltaY * -1 / 100)
                }
                this.oninputEvent(video, event.target, width, height, resizeRememberTarget);
            }
            //height.oninput = (event) => oninputEvent(event);
            resolve({width, height});
        });
    }
    oninputEvent(image, target, width, height, resizeRememberTarget) {
        if(isNaN(Number(target.value))){
            target.value = target.value.replace(/\D/g, '');
            return;
        }else if(Number(target.value) < 50){
            width.labels[1].textContent = '(min 50)';
            target.value = 50;
        }else{
            width.labels[1].textContent = '';
        }
        let sizeName = target.id.includes('width') ? 'width': 'height';
        image[sizeName] = target.value;

        width.value = image.width, height.value = image.height;
        if(this.prevValue && Number(this.prevValue) == Number(width.value)){
            width.labels[1].textContent = `(max ${this.prevValue}) : `
        }
        this.prevValue = width.value
        resizeRememberTarget.dataset.width = width.value;
    }
    #addButtonIconEvent(video){
        return new Promise(resolve => {
            let [download, newWindow] = this.#videoBox.querySelectorAll('.download-css-gg-push-down, .new-window-css-gg-path-trim')
            download.href = video.src, newWindow.href = video.src;
            download.download = video.dataset.video_name;
            newWindow.target = '_blank';
            resolve({download, newWindow});
        })
    }

    get videoBox(){
        return this.#videoBox;
    }

	get style(){
		return this.#style;
	}

	set style(style){
        this.#style.textContent = style;
    }

	set insertStyle(style){
		this.#style.sheet.insertRule(style);
	}
    
    createStyle(){
        this.#style.textContent = `
            .video-box-wrap{
                position: absolute;
                display: flex;
                justify-content: space-between;
                width: 100%;
                background: linear-gradient(to bottom, #9b878769 -73%, #ffffff29 115%);
                color: white;
                padding-bottom: 1.5%;
                top:-20%;
                opacity: 0;
                transition: all 1s;
            }
            .video-box-wrap.start{
                top: 0;
                opacity: 1;
                transition: all 0.5s;
            }
            .video-box-wrap .video-button-container, 
            .video-box-wrap .video-resize-container,
            .video-box-wrap .video-key-description-container{
                display: flex;
                gap: 1.5vw;
                padding: 1.7%;
            }
            .video-box-wrap .video-resize-container .video-box-resize-label{
                background: linear-gradient(to right, #e50bff, #004eff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .video-box-wrap .video-resize-container .video-box-resize-input{
                outline: none;
                border: none;
                background-image: linear-gradient(#fff1f1d4, #ffffffeb), linear-gradient(to right, #a189890d 0%,  #ed89b275 100%);
                background-origin: border-box;
                background-clip: content-box, border-box;
                background-color: #00000000; 
                width: 3.2em;
                color: #ffb6b6;
                text-align: center;
            }
            .video-box-wrap .video-button-container .download-css-gg-push-down{
                box-sizing: border-box;
                position: relative;
                display: block;
                transform: scale(var(--ggs,1));
                width: 2px;
                height: 16px;
                background: currentColor;
                color: #0000005c;
            }
            .video-box-wrap .video-button-container .download-css-gg-push-down::after,
            .video-box-wrap .video-button-container .download-css-gg-push-down::before{
                content: "";
                display: block;
                box-sizing: border-box;
                position: absolute;
                width: 12px;
                height: 2px;
                border-bottom: 2px solid;
                bottom: -5px;
                left: -5px
            }
            .video-box-wrap .video-button-container .download-css-gg-push-down::after {
                width: 8px;
                height: 8px;
                border-right: 2px solid;
                transform: rotate(45deg);
                left: -3px;
                bottom: 0
            }
            .video-box-wrap .video-button-container .new-window-css-gg-path-trim {
                display: block;
                position: relative;
                box-sizing: border-box;
                transform: scale(var(--ggs,1));
                width: 14px;
                height: 14px;
                color: #0000005c;
            }
            .video-box-wrap .video-button-container .new-window-css-gg-path-trim::after,
            .video-box-wrap .video-button-container .new-window-css-gg-path-trim::before {
                content: "";
                position: absolute;
                display: block;
                box-sizing: border-box;
                width: 10px;
                height: 10px
            }
            .video-box-wrap .video-button-container .new-window-css-gg-path-trim::after {
                border-left: 3px solid;
                border-top: 3px solid
            }
            .video-box-wrap .video-button-container .new-window-css-gg-path-trim::before {
                background: currentColor;
                bottom: 0;
                right: 0
            }
            .video-box-wrap .video-button-container .new-window-css-gg-expand {
                box-sizing: border-box;
                position: relative;
                display: block;
                transform: scale(var(--ggs,1));
                width: 7px;
                height: 7px;
                border-bottom: 2px solid;
                border-left: 2px solid;
                margin-top: 10px;
                margin-right: 5px;
                margin-left: 9px;
                color:#0000005c;
            }
            .video-box-wrap .video-button-container .new-window-css-gg-expand::after,
            .video-box-wrap .video-button-container .new-window-css-gg-expand::before {
                content: "";
                display: block;
                box-sizing: border-box;
                position: absolute;
            }
            .video-box-wrap .video-button-container .new-window-css-gg-expand::after {
                background: currentColor;
                bottom: 4px;
                transform: rotate(-44deg);
                width: 14px;
                height: 2px;
                left: -2px
            }
            .video-box-wrap .video-button-container .new-window-css-gg-expand::before {
                width: 7px;
                height: 7px;
                border-top: 2px solid;
                border-right: 2px solid;
                left: 5px;
                top: -7px
            }
            .video-box-wrap .video-button-container .new-window,
            .video-box-wrap .video-button-container .download{
                height: 100%;
                width: 15px;
                text-align: -webkit-center;
            }

            .video-box-wrap kbd {
                background-color: #eee;
                border-radius: 3px;
                border: 1px solid #b4b4b4;
                box-shadow:
                0 1px 1px rgba(0, 0, 0, 0.2),
                0 2px 0 0 rgba(255, 255, 255, 0.7) inset;
                color: #333;
                display: inline-block;
                font-size: 0.85em;
                font-weight: 700;
                line-height: 1;
                padding: 2px 4px;
                white-space: nowrap;
                height: fit-content;
            }
        `
        return this.#style;
    }

}