import FreedomInterface from "../module/FreedomInterface"

export default class ImageBox {
    
    #style = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-image-box'
	});

    #imageBox = Object.assign(document.createElement('div'), {
        className: 'image-box-container',//'image-box-wrap',
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

	#isHover;

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
                }
            });
        }, {
            threshold: 0.1,
            root: document
        }).observe(this.#imageBox);
		/*
		this.#imageBox.addEventListener('mouseover', () => {
			this.#isHover = true;
		});
		this.#imageBox.addEventListener('mouseout', () => {
			this.#isHover = false;
		});
		*/
    }

    addImageHoverEvent(image){
		if( ! image.parentElement){
			throw new Error('image parent element is defined')
		}

		let wrap = Object.assign(document.createElement('div'),{
			className: 'image-box-wrap'
		})
		Object.assign(wrap.style,{
			position: 'absolute',
			top: 0,
			width: '100%',
			height: '100%'
		})

		image.parentElement.append(wrap);

        wrap.onmouseover = () => {
			image.parentElement.append(wrap);
            let root = image.getRootNode();
            if(wrap.getRootNode() != document){
                root.append(this.#style);
            }else{
				document.head.append(this.#style);
			}

            if(this.#imageBox.parentElement !== wrap){
				wrap.append(this.#imageBox);
				this.#imageBox.classList.add('start');
            }

        }
        wrap.onmouseout = (event) => {
			/*if(this.#isHover){
				this.#imageBox.classList.add('start');
				return;
			}*/
			console.log(event)
			if(FreedomInterface.isMouseInnerElement(wrap)){
				return;
			}
			if(wrap.isConnected && wrap === this.#imageBox.parentElement){
				this.#imageBox.classList.remove('start');
				this.#imageBox.remove();
				this.#imageBox.ontransitionend = () => {
					this.#imageBox.remove();
				}
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
            .image-box-container{
                display: flex;
                justify-content: space-between;
                width: 100%;
                background: linear-gradient(to bottom, #9b8787 -73%, #ffffffa6 115%);
                color: white;
                padding-bottom: 1.5%;
				
                transition: all 1s;
            }
            .image-box-container.start{
				
            }
            .image-box-container .image-button-container{
                display: flex;
                gap: 1vw;
                padding: 0.7%;
            }
            .image-box-container .image-resize-container{
                display: flex;
                padding: 0.7%;
                gap: 1vw;
            }
            .image-box-container .image-resize-container .image-box-resize-label{
                background: linear-gradient(to right, #e50bff, #004eff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .image-box-container .image-resize-container .image-box-resize-input{
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