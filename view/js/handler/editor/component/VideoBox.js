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
                <kbd>Ctrl</kbd><kbd>Wheel</kbd>OR<kbd>Shift</kbd><kbd>Wheel</kbd>
            </div>
            <div class="video-button-container">
                <a href="javascript:void(0);" class="download" download>
                    <svg style="zoom:140%;" class="download-css-gg-push-down"
                        width="1rem"
                        height="1rem"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                        d="M11.0001 1H13.0001V15.4853L16.2428 12.2427L17.657 13.6569L12.0001 19.3137L6.34326 13.6569L7.75748 12.2427L11.0001 15.4853V1Z"
                        fill="#00000073"
                        />
                        <path d="M18 20.2877H6V22.2877H18V20.2877Z" fill="#00000073" />
                    </svg>
                </a>
                <a href="javascript:void(0);" class="new-window">
                    <svg style="zoom: 150%;" class="new-window-css-gg-expand"
                        width="1rem"
                        height="1rem"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                        d="M12.3062 16.5933L12.2713 18.593L5.2724 18.4708L5.39457 11.4719L7.39426 11.5068L7.33168 15.092L15.2262 7.46833L11.6938 7.40668L11.7287 5.40698L18.7277 5.52915L18.6055 12.5281L16.6058 12.4932L16.6693 8.85507L8.72095 16.5307L12.3062 16.5933Z"
                        fill="#00000073"
                        />
                    </svg>
                </a>
            </div>
        `
        /* 리사이즈 있는 버전 주석처리 20230821 <i class="download-css-gg-push-down"></i>
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
    /*
    #removeEventPromiseResolve;
    #removeEventPromise = new Promise(resolve=>{
		this.#removeEventPromiseResolve = resolve;
	});
    */
    #video;
    #resizeRememberTarget;

    constructor(){
        let style = document.querySelector(`#${this.#style.id}`);
        if(! style){
            document.head.append(this.createStyle());
        }else{
            this.#style = style;
        }
        document.addEventListener('keydown',(event)=>{
            if(this.#videoBox.hasAttribute('data-is_shft')){
                return;
            }
            let {key} = event;
            if(key === 'Shift'){
                this.#videoBox.dataset.is_shft = '';
            }
        })

        document.addEventListener('keyup', (event)=>{
            if( ! this.#videoBox.hasAttribute('data-is_shft')){
                return;
            }    
            let {key} = event;
            if(key === 'Shift'){
                this.#videoBox.removeAttribute('data-is_shft');
            }
        })
        
        this.#videoBox.addEventListener('wheel', (event) => {
            if(this.#videoBox.hasAttribute('data-is_shft')){
                return;
            }
            //event.preventDefault();
            let {deltaY} = event;
            
            this.#videoBox.scrollTo(
                this.#videoBox.scrollLeft + deltaY, undefined
            );
        }, {passive: true});
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
                width.value = Number(width.value) + ((event.deltaY * -1) / 100)
            }
            this.oninputEvent(this.video, width, height, this.resizeRememberTarget);
            
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
                    if(this.#videoBox.isConnected && video.readyState == 4 && video.parentElement === this.#videoBox.parentElement && ! this.#videoBox.classList.contains('start')){
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

            this.prevValue = undefined;

            width.oninput = (event) => this.oninputEvent(video, width, height, resizeRememberTarget);
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
                    width.value = Number(width.value) + ((event.deltaY * -1) / 100)
                }

                this.oninputEvent(video, width, height, resizeRememberTarget);
            }
            //height.oninput = (event) => oninputEvent(event);
            resolve({width, height});
        });
    }
    oninputEvent(video, width, height, resizeRememberTarget) {
        if(isNaN(Number(width.value))){
            width.value = width.value.replace(/\D/g, '');
            return;
        }else if(Number(width.value) < 50){
            width.labels[1].textContent = '(min 50)';
            width.value = 50;
        }else{
            width.labels[1].textContent = '';
        }
        let sizeName = width.id.includes('width') ? 'width': 'height';
        video[sizeName] = width.value;

        let videoRect = video.getBoundingClientRect();

        if(this.prevValue && parseInt(this.prevValue) == parseInt(videoRect.width)){
            width.value = parseInt(this.prevValue);
            width.labels[1].textContent = `(max ${parseInt(this.prevValue)}) : `
        }
        this.prevValue = videoRect.width

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
                white-space: nowrap;
                overflow-y: clip;
                overflow-x: auto;
            }
            .video-box-wrap::-webkit-scrollbar{
                display: none;
            }
            .video-box-wrap:hover::-webkit-scrollbar{
                display: initial;
                width: 7px;
                height: 7px;
            }
            .video-box-wrap:hover::-webkit-scrollbar-track{
                background: #00000040;
                border-radius: 100px;
                box-shadow: inset 0 0 5px #000000fc;
            }
            .video-box-wrap:hover::-webkit-scrollbar-thumb {
                background: #0c0c0c38;
                border-radius: 100px;
                box-shadow: inset 0 0 5px #000000;
            }
            .video-box-wrap:hover::-webkit-scrollbar-thumb:hover {
                /*background: #44070757;*/
                background: #34000075; 
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
                align-items: center;
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
                width: 3.2rem;
                height: 100%;
                color: #ffb6b6;
                font-size: 0.9rem;
                text-align: center;
            }
            .video-box-wrap .video-button-container .new-window,
            .video-box-wrap .video-button-container .download{
                display: flex;
                align-items: center;
                border: none;
                background:none;
                position:relative;
                cursor: pointer;
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