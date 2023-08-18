import FreedomInterface from "../module/FreedomInterface"

export default class ImageBox {
    
    #style = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-image-box'
	});

    #imageBox = Object.assign(document.createElement('div'), {
        className: 'image-box-wrap',
        innerHTML: `
            <div class="image-resize-container">
                <div>
                    <label class="image-box-resize-label" for="image-box-resize-width">width : </label>
                    <input class="image-box-resize-input" id="image-box-resize-width" type="text"/>
                </div>
                <div>
                    <label class="image-box-resize-label" for="image-box-resize-height">height : </label>
                    <input class="image-box-resize-input" id="image-box-resize-height" type="text"/>
                </div>
            </div>
            <div class="image-button-container" style="display: flex;gap: 1vw;padding: 0.7%;">
                <a href="javascript:void(0);">다운로드</a>
            </div>
        `
    });
    
    #selectedSort;

    #applyCallback = () => {}

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
                    this.#imageBox.remove();
                }
            });
        }, {
            threshold: 0.1,
            root: document
        }).observe(this.#imageBox);
    }

    addImageHoverEvent(image){
        image.onmouseover = () => {
            let root = image.getRootNode();
            if(root != this.#style.getRootNode() && root instanceof ShadowRoot){
                root.append(this.#style);
            }

            if(image.parentElement && image.parentElement !== this.#imageBox.parentElement){
                image.parentElement.append(this.#imageBox);
                this.#imageBox.classList.add('start');
            }

        }
        image.onmouseout = () => {
            setTimeout(()=>{
                console.log(FreedomInterface.isMouseInnerElement(image));
                if(FreedomInterface.isMouseInnerElement(image)){
                    return;
                }
                if(this.#imageBox.isConnected && image.parentElement === this.#imageBox.parentElement){
                    this.#imageBox.classList.remove('start');
                    this.#imageBox.ontransitionend = () => {
                        if(this.#imageBox.isConnected){
                            this.#imageBox.remove();
                        }
                    }
                }
            }, 50);
        }
        image.onmousemove = () => {
            console.log(this.#imageBox.isConnected);
            if( ! this.#imageBox.isConnected){
                image.parentElement.append(this.#imageBox);
            }
        }
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
                background: linear-gradient(to bottom, #9b8787 -73%, #ffffffa6 115%);
                color: white;
                padding-bottom: 1.5%;
                top:-30%;
                transition: all 1s;
            }
            .image-box-wrap.start{
                top: 0;
            }
            .image-box-wrap .image-button-container{
                display: flex;
                gap: 1vw;
                padding: 0.7%;
            }
            .image-box-wrap .image-resize-container{
                display: flex;
                padding: 0.7%;
                gap: 1vw;
            }
            .image-box-wrap .image-resize-container .image-box-resize-label{
                background: linear-gradient(to right, #e50bff, #004eff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .image-box-wrap .image-resize-container .image-box-resize-input{
                outline: none;
                border: none;
                background-image: linear-gradient(#fff1f1d9, #ffffff), linear-gradient(to right, #a18989 0%,  #ed89b2 100%);
                background-origin: border-box;
                background-clip: content-box, border-box;
                background-color: black; 
                width:3em;
            }
            
        `
        return this.#style;
    }

}