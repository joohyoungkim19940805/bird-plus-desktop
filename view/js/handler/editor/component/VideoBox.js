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
            <div class="video-button-container">
                <a href="javascript:void(0);" class="download-css-gg-push-down" download></a>
                <a href="javascript:void(0);" class="new-window-css-gg-path-trim"></a>
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

    /**
     * 
     * @param {HTMLVideoElement} video 
     */
    //리사이즈 있는 버전 주석 처리 20230821
    #addRresizeEvent(video){
        return new Promise(resolve => {
            let [width, height] = this.#videoBox.querySelectorAll('#video-box-resize-width, #video-box-resize-height');
            width.value = video.width, height.value = video.height;
            
            const oninputEvent = (event) => {
                if(isNaN(Number(event.target.value))){
                    event.target.value = event.target.value.replace(/\D/g, '');
                    return;
                }else if(Number(event.target.value) < 50){
                    width.labels[0].textContent = 'width(min 50) : ';
                    return;
                }else{
                    width.labels[0].textContent = 'width : ';
                }
                let sizeName = event.target.id.includes('width') ? 'width': 'height';
                video[sizeName] = event.target.value;

                width.value = video.width, height.value = video.height;
            }
            width.oninput = oninputEvent, height.oninput = oninputEvent;
            resolve({width, height});
        });
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
            .video-box-wrap .video-button-container, .video-box-wrap .video-resize-container{
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
            .video-box-wrap .video-button-container .download-css-gg-push-down::after, .video-box-wrap .video-button-container .download-css-gg-push-down::before{
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
        `
        return this.#style;
    }

}