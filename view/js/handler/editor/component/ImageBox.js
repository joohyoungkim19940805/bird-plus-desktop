
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
                <kbd>Ctrl</kbd><kbd>Wheel</kbd>OR<kbd>Shift</kbd><kbd>Wheel</kbd>
            </div>
            <div class="image-button-container">
                <a href="javascript:void(0);" class="download" download>
                    <svg style="zoom:125%;" class="download-css-gg-push-down" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.0001 1H13.0001V15.4853L16.2428 12.2427L17.657 13.6569L12.0001 19.3137L6.34326 13.6569L7.75748 12.2427L11.0001 15.4853V1Z" fill="#00000073" />
                        <path d="M18 20.2877H6V22.2877H18V20.2877Z" fill="#00000073" />
                    </svg>
                </a>
                <a href="javascript:void(0);" class="new-window">
                    <svg style="zoom: 150%;" class="new-window-css-gg-expand" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.3062 16.5933L12.2713 18.593L5.2724 18.4708L5.39457 11.4719L7.39426 11.5068L7.33168 15.092L15.2262 7.46833L11.6938 7.40668L11.7287 5.40698L18.7277 5.52915L18.6055 12.5281L16.6058 12.4932L16.6693 8.85507L8.72095 16.5307L12.3062 16.5933Z" fill="#00000073" />
                    </svg>
                </a>
                <span class="image-editor">
                    <svg class="image-editor-css-gg-pen" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M21.2635 2.29289C20.873 1.90237 20.2398 1.90237 19.8493 2.29289L18.9769 3.16525C17.8618 2.63254 16.4857 2.82801 15.5621 3.75165L4.95549 14.3582L10.6123 20.0151L21.2189 9.4085C22.1426 8.48486 22.338 7.1088 21.8053 5.99367L22.6777 5.12132C23.0682 4.7308 23.0682 4.09763 22.6777 3.70711L21.2635 2.29289ZM16.9955 10.8035L10.6123 17.1867L7.78392 14.3582L14.1671 7.9751L16.9955 10.8035ZM18.8138 8.98525L19.8047 7.99429C20.1953 7.60376 20.1953 6.9706 19.8047 6.58007L18.3905 5.16586C18 4.77534 17.3668 4.77534 16.9763 5.16586L15.9853 6.15683L18.8138 8.98525Z" fill="#00000073" />
                        <path d="M2 22.9502L4.12171 15.1717L9.77817 20.8289L2 22.9502Z" fill="#00000073" />
                    </svg>
                </span>
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

    /*
    #removeEventPromiseResolve;
    #removeEventPromise = new Promise(resolve=>{
		this.#removeEventPromiseResolve = resolve;
	});
    */
    #image;
    #resizeRememberTarget;

    constructor(){
        let style = document.querySelector(`#${this.#style.id}`);
        if(! style){
            document.head.append(this.createStyle());
        }else{
            this.#style = style;
        }

        document.addEventListener('keydown',(event)=>{
            if(this.#imageBox.hasAttribute('data-is_shft')){
                return;
            }
            let {key} = event;
            if(key === 'Shift'){
                this.#imageBox.dataset.is_shft = '';
            }
        })

        document.addEventListener('keyup', (event)=>{
            if( ! this.#imageBox.hasAttribute('data-is_shft')){
                return;
            }    
            let {key} = event;
            if(key === 'Shift'){
                this.#imageBox.removeAttribute('data-is_shft');
            }
        })
        
        this.#imageBox.addEventListener('wheel', (event) => {
            if(this.#imageBox.hasAttribute('data-is_shft')){
                return;
            }
            //event.preventDefault();
            let {deltaY} = event;
            
            this.#imageBox.scrollTo(
                this.#imageBox.scrollLeft + deltaY, undefined
            );
        }, {passive: true})
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
                width.value = Number(width.value) + ((event.deltaY * -1) / 100)
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
                    if(this.#imageBox.isConnected && image.complete && image.parentElement === this.#imageBox.parentElement && ! this.#imageBox.classList.contains('start')){
                        this.#imageBox.classList.add('start');
                        this.image = image;
                        this.resizeRememberTarget = resizeRememberTarget;
                        image.parentElement.onclick = (event) => {
                            if(! image.src || image.src == '' || event.composedPath()[0] != image || image.hasAttribute('data-error')){
                                return;
                            }
                            this.#imageBox.classList.add('start');
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
            if(image.parentElement.hasAttribute('data-is_resize_click')){
                keyDescription.style.display = 'none';
                this.falsh(image.parentElement);
            }
            image.parentElement.removeAttribute('data-is_resize_click');
            /*if(this.#imageBox.isConnected && image.parentElement === this.#imageBox.parentElement){
                
                this.#imageBox.classList.remove('start');
                this.#imageBox.ontransitionend = () => {
                    if(this.#imageBox.isConnected){
                        this.#imageBox.remove();
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
                    width.value = Number(width.value) + ((event.deltaY * -1) / 100)
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

        let imageRect = image.getBoundingClientRect();

        //width.value = image.width, height.value = image.height;
        if(this.prevValue && parseInt(this.prevValue) == parseInt(imageRect.width)){
            width.value = parseInt(this.prevValue);
            width.labels[1].textContent = `(max ${parseInt(this.prevValue)}) : `
        }
        this.prevValue = imageRect.width;
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

    createStyle(){
        this.#style.textContent = `
            .image-box-wrap{
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
            .image-box-wrap::-webkit-scrollbar{
                display: none;
            }
            .image-box-wrap:hover::-webkit-scrollbar{
                display: initial;
                width: 7px;
                height: 7px;
            }
            .image-box-wrap:hover::-webkit-scrollbar-track{
                background: #00000040;
                border-radius: 100px;
                box-shadow: inset 0 0 5px #000000fc;
            }
            .image-box-wrap:hover::-webkit-scrollbar-thumb {
                background: #0c0c0c38;
                border-radius: 100px;
                box-shadow: inset 0 0 5px #000000;
            }
            .image-box-wrap:hover::-webkit-scrollbar-thumb:hover {
                /*background: #44070757;*/
                background: #34000075; 
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
                align-items: center;
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
                width: 3.2rem;
                height: 100%;
                color: #ffb6b6;
                font-size: 0.9rem;
                text-align: center;
            }
            .image-box-wrap .image-button-container .new-window,
            .image-box-wrap .image-button-container .download,
            .image-box-wrap .image-button-container .image-editor{
                display: flex;
                align-items: center;
                border: none;
                background:none;
                position:relative;
                cursor: pointer;
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
}