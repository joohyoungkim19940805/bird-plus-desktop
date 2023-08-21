import FreedomInterface from "../module/FreedomInterface"

export default class ImageBox {
    
    #style = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-image-box'
	});

    #imageBox = Object.assign(document.createElement('div'), {
        className: 'image-box-wrap',
        
        innerHTML:`
            <div class="image-resize-container">
            </div>
            <div class="image-button-container">
                <a href="javascript:void(0);" class="download-css-gg-push-down" download></a>
                <a href="javascript:void(0);" class="new-window-css-gg-path-trim"></a>
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
    }

    /**
     * 
     * @param {HTMLImageElement} image 
     */
    addImageHoverEvent(image){
        image.parentElement.onmouseover = () => {
            let root = image.getRootNode();
            if(root != document){
                root.append(this.#style);
            }else{
                document.head.append(this.#style);
            }

            if(image.parentElement && (image.parentElement !== this.#imageBox.parentElement || ! this.#imageBox.classList.contains('start'))){
                image.parentElement.append(this.#imageBox);
                //this.#imageBox.ontransitionend = '';
                //this.#imageBox.classList.remove('start');
                /* 리사이즈 있는 버전 주석 처리 20230821
                this.#addRresizeEvent(image),
                */
                this.#addButtonIconEvent(image)
                let appendAwait = setInterval(()=>{
                    if(this.#imageBox.isConnected && image.parentElement === this.#imageBox.parentElement && ! this.#imageBox.classList.contains('start')){
                        this.#imageBox.classList.add('start');
                        clearInterval(appendAwait);
                    }
                }, 50)
            }

        }
        image.parentElement.onmouseleave = () => {
            this.#imageBox.classList.remove('start');
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

    /**
     * 
     * @param {HTMLImageElement} image 
     */
    /* 리사이즈 있는 버전 주석 처리 20230821
    #addRresizeEvent(image){
        return new Promise(resolve => {
            let [width, height] = this.#imageBox.querySelectorAll('#image-box-resize-width, #image-box-resize-height');
            width.value = image.width, height.value = image.height;
            
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
                image[sizeName] = event.target.value;

                width.value = image.width, height.value = image.height;
            }
            width.oninput = oninputEvent, height.oninput = oninputEvent;
            resolve({width, height});
        });
    }
    */
    #addButtonIconEvent(image){
        return new Promise(resolve => {
            let [download, newWindow] = this.#imageBox.querySelectorAll('.download-css-gg-push-down, .new-window-css-gg-path-trim')
            download.href = image.src, newWindow.href = image.src;
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
                background: linear-gradient(to bottom, #9b878769 -73%, #ffffff29 115%);
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
            .image-box-wrap .image-button-container, .image-box-wrap .image-resize-container{
                display: flex;
                gap: 1.5vw;
                padding: 1.7%;
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
        `
        return this.#style;
    }

}