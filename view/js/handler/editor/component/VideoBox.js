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
                    <div>
                        <label class="video-box-resize-label-error-message" for="video-box-resize-width"></label>
                    </div>
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

    #video;
    #resizeRememberTarget;

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

        let [width, height] = this.#videoBox.querySelectorAll('#video-box-resize-width, #video-box-resize-height');
        
        window.addEventListener('keyup', (event) => {
            if( ! this.video || ! this.resizeRememberTarget || ! width.hasAttribute('data-is_ctrl') || ! this.video.parentElement.matches(':hover')){//|| this.video.getRootNode()?.activeElement != width){
                return;
            }
            width.removeAttribute('data-is_ctrl');
        })

        window.addEventListener('keydown', (event) => {
            
            let eventPath = event.composedPath()

            if( ! this.video || ! this.resizeRememberTarget || eventPath[0] == width || ! this.video.parentElement.matches(':hover')){//|| this.video.getRootNode()?.activeElement != width){
                return;
            }
            if(event.ctrlKey){
                width.dataset.is_ctrl = '';
            }else{
                width.removeAttribute('data-is_ctrl');
            }
        })
        
        /**
         * @see https://www.chromestatus.com/feature/6662647093133312
         */
        window.addEventListener('wheel', (event) => {
            
            if( ! this.video || ! this.resizeRememberTarget || ! this.video.parentElement.hasAttribute('data-is_resize_click') || event.composedPath()[0] == width || ! this.video.parentElement.matches(':hover')){// || this.video.getRootNode()?.activeElement != width){
                return;
            }

            if(width.hasAttribute('data-is_ctrl')){
                width.value = Number(width.value) + (event.deltaY * -1)
            }else{
                width.value = Number(width.value) + (event.deltaY * -1 / 100)
            }
            this.oninputEvent(this.video, width, width, height, this.resizeRememberTarget);
        })
    }

    /**
     * 
     * @param {HTMLVideoElement} video 
     */
    addVideoHoverEvent(video, resizeRememberTarget){
        //video.parentElement.onmouseover = () => {
        let keyDescription = this.#videoBox.querySelector('.video-key-description-container')
        video.parentElement.onmouseenter = () => {
            if(! video.src || video.src == '' || video.hasAttribute('data-error')){
                return;
            }
            let root = video.getRootNode();
            if(root != document){
                root.append(this.#style);
            }else{
                document.head.append(this.#style);
            }

            if(video.parentElement && (video.parentElement !== this.#videoBox.parentElement || ! this.#videoBox.classList.contains('start'))){
                video.parentElement.append(this.#videoBox);

                this.#addRresizeEvent(video, resizeRememberTarget)
                this.#addButtonIconEvent(video)
                let appendAwait = setInterval(()=>{
                    if(this.#videoBox.isConnected && video.parentElement === this.#videoBox.parentElement && ! this.#videoBox.classList.contains('start')){
                        this.#videoBox.classList.add('start');
                        this.video = video;
                        this.resizeRememberTarget = resizeRememberTarget;
                        video.parentElement.onclick = (event) => {
                            if(! video.src || video.src == '' || event.composedPath()[0] != video || video.hasAttribute('data-error')){
                                return;
                            }
                            video.parentElement.toggleAttribute('data-is_resize_click');
                            this.falsh(video.parentElement);
                            if(video.parentElement.hasAttribute('data-is_resize_click')){
                                keyDescription.style.display = '';
                            }else {
                                keyDescription.style.display = 'none';
                            }
                        }
                        clearInterval(appendAwait);
                    }
                }, 50)
            }
        }
        video.parentElement.onmouseleave = () => {
            this.#videoBox.classList.remove('start');
            this.#videoBox.classList.remove('start');
            if(video.parentElement.hasAttribute('data-is_resize_click')){
                keyDescription.style.display = 'none';
                this.falsh(video.parentElement);
            }
            video.parentElement.removeAttribute('data-is_resize_click');
            /*if(this.#videoBox.isConnected && video.parentElement === this.#videoBox.parentElement){
                
                this.#videoBox.classList.remove('start');
                this.#videoBox.ontransitionend = () => {
                    if(this.#videoBox.isConnected){
                        this.#videoBox.remove();
                    }
                }
                
            }*/
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
    #addRresizeEvent(video, resizeRememberTarget){
        return new Promise(resolve => {
            let [width, height] = this.#videoBox.querySelectorAll('#video-box-resize-width, #video-box-resize-height');
            let rect = video.getBoundingClientRect();
            width.value = parseInt(rect.width), height.value = parseInt(rect.height);
            
            width.labels[0].textContent = 'width : ';
            width.labels[1].textContent = '';

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
    oninputEvent(video, target, width, height, resizeRememberTarget) {
        let parentRect = video.parentElement.getBoundingClientRect();

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
        video[sizeName] = target.value;

        let videoRect = video.getBoundingClientRect();

        width.value = parseInt(videoRect.width), height.value = parseInt(videoRect.height);
        if(parseInt(parentRect.width) <= Number(target.value)){
            width.labels[1].textContent = `(max ${target.value}) : `
        }
        resizeRememberTarget.dataset.width = width.value;
    }
    #addButtonIconEvent(video){
        return new Promise(resolve => {
            let [download, newWindow] = [...this.#videoBox.querySelectorAll('.download-css-gg-push-down, .new-window-css-gg-expand')]
                .map(e=>e.parentElement)
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
    
    set video(video){
        this.#video = video; 
    }

    get video(){
        return this.#video;
    }
    set resizeRememberTarget(resizeRememberTarget){
        this.#resizeRememberTarget = resizeRememberTarget;
    }
    get resizeRememberTarget(){
        return this.#resizeRememberTarget;
    }

    createStyle(){
        this.#style.textContent = `
            .video-box-wrap{
                position: absolute;
                display: flex;
                justify-content: space-between;
                width: 100%;
                background: linear-gradient(to bottom, #ff8787 -73%, #ffffffcf 115%);
                color: white;
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