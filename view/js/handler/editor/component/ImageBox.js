
export default class ImageBox {
    
    #style = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-image-box'
	});

    #imageBox = Object.assign(document.createElement('div'), {
        className: 'image-box-wrap',
        
        innerHTML:`
            <div class="image-resize-container">
                <div>
                    <label class="image-box-resize-label" for="image-box-resize-width">width </label>
                    <input list="image-box-resize-datalist" class="image-box-resize-input" id="image-box-resize-width" type="number" autocomplete="off"/>
                    <div>
                        <label class="image-box-resize-label-error-message" for="image-box-resize-width"></label>
                    </div>
                </div>
                <div>
                    <label class="image-box-resize-label" for="image-box-resize-height">height(auto) </label>
                    <input list="image-box-resize-datalist" class="image-box-resize-input" id="image-box-resize-height" type="number" autocomplete="off" disabled/>
                </div>
            </div>
            <div class="image-key-description-container" style="display:none;">
                <kbd>Ctrl</kbd>+<kbd>Wheel</kbd>OR<kbd>Shift</kbd>+<kbd>Wheel</kbd>
            </div>
            <div class="image-button-container">
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
            <div class="image-resize-container">
                <div>
                    <label class="image-box-resize-label" for="image-box-resize-width">width : </label>
                    <input list="image-box-resize-datalist" class="image-box-resize-input" id="image-box-resize-width" type="number" autocomplete="off"/>
                </div>
                <div>
                    <label class="image-box-resize-label" for="image-box-resize-height">height(auto) : </label>
                    <input list="image-box-resize-datalist" class="image-box-resize-input" id="image-box-resize-height" type="number" autocomplete="off" disabled/>
                </div>
            </div>
            <div class="image-button-container">
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
    
    #image;
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
                if ( ! entry.isIntersecting && this.#imageBox.isConnected && ! this.#imageBox.classList.contains('start')) {
                    //this.#imageBox.remove();
                    this.#removeEventPromiseResolve();
                }
            });
        }, {
            threshold: 0.1,
            root: document
        }).observe(this.#imageBox);
        
        let [width, height] = this.#imageBox.querySelectorAll('#image-box-resize-width, #image-box-resize-height');
        
        window.addEventListener('keyup', (event) => {
            if( ! this.image || ! this.resizeRememberTarget || ! width.hasAttribute('data-is_ctrl') || ! this.image.parentElement.matches(':hover')){//|| this.image.getRootNode()?.activeElement != width){
                return;
            }
            width.removeAttribute('data-is_ctrl');
        })

        window.addEventListener('keydown', (event) => {
            
            let eventPath = event.composedPath()

            if( ! this.image || ! this.resizeRememberTarget || eventPath[0] == width || ! this.image.parentElement.matches(':hover')){//|| this.image.getRootNode()?.activeElement != width){
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
            
            if( ! this.image || ! this.resizeRememberTarget || ! this.image.parentElement.hasAttribute('data-is_resize_click') || event.composedPath()[0] == width || ! this.image.parentElement.matches(':hover')){// || this.image.getRootNode()?.activeElement != width){
                return;
            }

            if(width.hasAttribute('data-is_ctrl')){
                width.value = Number(width.value) + (event.deltaY * -1)
            }else{
                width.value = Number(width.value) + (event.deltaY * -1 / 100)
            }
            this.oninputEvent(this.image, width, width, height, this.resizeRememberTarget);
        })
    }

    /**
     * 
     * @param {HTMLImageElement} image 
     */
    addImageHoverEvent(image, resizeRememberTarget){
        //image.parentElement.onmouseover = () => {
        let keyDescription = this.#imageBox.querySelector('.image-key-description-container')   
        image.parentElement.onmouseenter = () => {
            if(! image.src || image.src == '' || image.hasAttribute('data-error')){
                return;
            }
             let root = image.getRootNode();
            if(root != document){
                root.append(this.#style);
            }else{
                document.head.append(this.#style);
            }

            if(image.parentElement && (image.parentElement !== this.#imageBox.parentElement || ! this.#imageBox.classList.contains('start'))){
                image.parentElement.append(this.#imageBox);

                this.#addRresizeEvent(image, resizeRememberTarget)
                this.#addButtonIconEvent(image)
                let appendAwait = setInterval(()=>{
                    if(this.#imageBox.isConnected && image.parentElement === this.#imageBox.parentElement && ! this.#imageBox.classList.contains('start')){
                        this.#imageBox.classList.add('start');
                        this.image = image;
                        this.resizeRememberTarget = resizeRememberTarget;
                        image.parentElement.onclick = (event) => {
                            if(! image.src || image.src == '' || event.composedPath()[0] != image || image.hasAttribute('data-error')){
                                return;
                            }
                            image.parentElement.toggleAttribute('data-is_resize_click');
                            this.falsh(image.parentElement);
                            if(image.parentElement.hasAttribute('data-is_resize_click')){
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
        image.parentElement.onmouseleave = () => {
            this.#imageBox.classList.remove('start');
            //this.image = undefined;
            //this.resizeRememberTarget = undefined;
            if(image.parentElement.hasAttribute('data-is_resize_click')){
                keyDescription.style.display = 'none';
                this.falsh(image.parentElement);
            }
            image.parentElement.removeAttribute('data-is_resize_click');
            if(this.#imageBox.isConnected && image.parentElement === this.#imageBox.parentElement){
                /*
                this.#imageBox.classList.remove('start');
                this.#imageBox.ontransitionend = () => {
                    if(this.#imageBox.isConnected){
                        this.#imageBox.remove();
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
     * @param {HTMLImageElement} image 
     */
    //리사이즈 있는 버전 주석 처리 20230821
    #addRresizeEvent(image, resizeRememberTarget){
        return new Promise(resolve => {
            let [width, height] = this.#imageBox.querySelectorAll('#image-box-resize-width, #image-box-resize-height');
            width.value = image.width, height.value = image.height;
            
            width.labels[0].textContent = 'width : ';
            width.labels[1].textContent = '';
            
            this.prevValue = undefined;

            width.oninput = (event) => this.oninputEvent(image, event.target, width, height, resizeRememberTarget);
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
                this.oninputEvent(image, event.target, width, height, resizeRememberTarget);
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
    #addButtonIconEvent(image){
        return new Promise(resolve => {
            let [download, newWindow] = [...this.#imageBox.querySelectorAll('.download-css-gg-push-down, .new-window-css-gg-expand')]
                .map(e=>e.parentElement)
            download.href = image.src, newWindow.href = image.src
            download.download = image.dataset.image_name;
            newWindow.target = '_blank';
            resolve({download, newWindow});
        })
    }

    get imageBox(){
        return this.#imageBox;
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
            .image-box-wrap{
                position: absolute;
                display: flex;
                justify-content: space-between;
                width: 100%;
                background: linear-gradient(to bottom, #ff8787 -73%, #ffffffcf 115%);
                color: white;
                padding-bottom: 1.5%;
                top:-20%;
                opacity: 0;
                transition: all 1s;
            }
            .image-box-wrap.start{
                top: 0;
                opacity: 1;
                transition: all 0.5s;
            }
            .image-box-wrap .image-button-container,
            .image-box-wrap .image-resize-container, 
            .image-box-wrap .image-key-description-container{
                display: flex;
                gap: 1.5vw;
                padding: 1.7%;
                align-items: baseline;
            }
            .image-box-wrap .image-resize-container .image-box-resize-label{
                background: linear-gradient(to right, #e50bff, #004eff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .image-box-wrap .image-resize-container .image-box-resize-input{
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
            .image-box-wrap .image-button-container .download-css-gg-push-down{
                box-sizing: border-box;
                position: relative;
                display: block;
                transform: scale(var(--ggs,1));
                width: 2px;
                height: 16px;
                background: currentColor;
                color: #0000005c;
            }
            .image-box-wrap .image-button-container .download-css-gg-push-down::after, .image-box-wrap .image-button-container .download-css-gg-push-down::before{
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
            .image-box-wrap .image-button-container .download-css-gg-push-down::after {
                width: 8px;
                height: 8px;
                border-right: 2px solid;
                transform: rotate(45deg);
                left: -3px;
                bottom: 0
            }
            .image-box-wrap .image-button-container .new-window-css-gg-path-trim {
                display: block;
                position: relative;
                box-sizing: border-box;
                transform: scale(var(--ggs,1));
                width: 14px;
                height: 14px;
                color: #0000005c;
            }
            .image-box-wrap .image-button-container .new-window-css-gg-path-trim::after,
            .image-box-wrap .image-button-container .new-window-css-gg-path-trim::before {
                content: "";
                position: absolute;
                display: block;
                box-sizing: border-box;
                width: 10px;
                height: 10px
            }
            .image-box-wrap .image-button-container .new-window-css-gg-path-trim::after {
                border-left: 3px solid;
                border-top: 3px solid
            }
            .image-box-wrap .image-button-container .new-window-css-gg-path-trim::before {
                background: currentColor;
                bottom: 0;
                right: 0
            }
            .image-box-wrap .image-button-container .new-window-css-gg-expand {
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
            .image-box-wrap .image-button-container .new-window-css-gg-expand::after,
            .image-box-wrap .image-button-container .new-window-css-gg-expand::before {
                content: "";
                display: block;
                box-sizing: border-box;
                position: absolute;
            }
            .image-box-wrap .image-button-container .new-window-css-gg-expand::after {
                background: currentColor;
                bottom: 4px;
                transform: rotate(-44deg);
                width: 14px;
                height: 2px;
                left: -2px
            }
            .image-box-wrap .image-button-container .new-window-css-gg-expand::before {
                width: 7px;
                height: 7px;
                border-top: 2px solid;
                border-right: 2px solid;
                left: 5px;
                top: -7px
            }
            .image-box-wrap .image-button-container .new-window,
            .image-box-wrap .image-button-container .download{
                height: 100%;
                width: 15px;
                text-align: -webkit-center;
            }

            .image-box-wrap kbd {
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

    set image(image){
        this.#image = image; 
    }

    get image(){
        return this.#image;
    }
    set resizeRememberTarget(resizeRememberTarget){
        this.#resizeRememberTarget = resizeRememberTarget;
    }
    get resizeRememberTarget(){
        return this.#resizeRememberTarget;
    }
}