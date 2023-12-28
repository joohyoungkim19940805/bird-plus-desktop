
import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import ImageBox from "../component/ImageBox"
export default class Image extends FreedomInterface {

	static toolHandler = new ToolHandler(this);

    static imageBox = new ImageBox();

    static customImageCallback; 

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-image-style'
	});

    static slotName = 'free-will-editor-image-description-slot';

    static #selectedFile = Object.assign(document.createElement('input'), {
        type: 'file',
        accept: 'image/*'
    });

    static get selectedFile(){
        return this.#selectedFile;
    }
    static isDefaultStyle = true;
	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-image';
        //this.toolHandler.isInline = false;

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: '',
            className: `${this.#defaultStyle.id}-button`,
            innerHTML: `
            <svg class="${this.#defaultStyle.id} css-gg-image-icon"
                width="0.9rem"
                height="0.9rem"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M7 7C5.34315 7 4 8.34315 4 10C4 11.6569 5.34315 13 7 13C8.65685 13 10 11.6569 10 10C10 8.34315 8.65685 7 7 7ZM6 10C6 9.44772 6.44772 9 7 9C7.55228 9 8 9.44772 8 10C8 10.5523 7.55228 11 7 11C6.44772 11 6 10.5523 6 10Z"
                    fill="currentColor"
                />
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3 3C1.34315 3 0 4.34315 0 6V18C0 19.6569 1.34315 21 3 21H21C22.6569 21 24 19.6569 24 18V6C24 4.34315 22.6569 3 21 3H3ZM21 5H3C2.44772 5 2 5.44772 2 6V18C2 18.5523 2.44772 19 3 19H7.31374L14.1924 12.1214C15.364 10.9498 17.2635 10.9498 18.435 12.1214L22 15.6863V6C22 5.44772 21.5523 5 21 5ZM21 19H10.1422L15.6066 13.5356C15.9971 13.145 16.6303 13.145 17.0208 13.5356L21.907 18.4217C21.7479 18.7633 21.4016 19 21 19Z"
                    fill="currentColor"
                />
            </svg>
            `,
            title: 'Image'
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else{
                this.#selectedFile.click();
                this.#selectedFile.onchange = ()=> {
                    //let url = URL.createObjectURL(this.#selectedFile.files[0])
                    this.toolHandler.toolButton.dataset.tool_status = 'active';
                }
			}
		}
	}

	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
            .${this.toolHandler.defaultClass} {
                position: relative;
            }
            .${this.#defaultStyle.id}.css-gg-image-icon {
                zoom:120%;
            }
            .${this.#defaultStyle.id}.image-description{            
                cursor: pointer;
                display: inline-flex;
                align-items: center;
            }

            .${this.#defaultStyle.id}.image-description::after{
                margin-left: 0.5em;
                content: ' ['attr(data-file_name)'] 'attr(data-open_status);
                font-size: small;
                color: #bdbdbd;
            }

            .${this.#defaultStyle.id}.image-contanier{
                width: fit-content;
                transition: height 0.5s ease-in-out;
                overflow: hidden;
                position: relative;
            }
            .${this.#defaultStyle.id}.image-contanier img{
                max-width: 100%;
                height: auto;
                aspect-ratio: attr(width) / attr(height);
                image-rendering: crisp-edges;
                image-rendering: -webkit-optimize-contrast;
            }
        ` 
		let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.#defaultStyle);
        }else{
            this.#defaultStyle?.remove();
            this.#defaultStyle = defaultStyle;
            document.head.append(this.#defaultStyle);
        }
		return this.#defaultStyle;
	}

    static get defaultStyle(){
        return this.#defaultStyle;
    }

    static set defaultStyle(style){
        this.#defaultStyle.textContent = style;
    }

	static set insertDefaultStyle(style){
		this.#defaultStyle.sheet.insertRule(style);
	}

    #file;

    imgLoadEndCallback = (event) => {};

    image = document.createElement('img');

	constructor(dataset){
		super(Image, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});
        
        if( ! dataset && Object.keys(this.dataset).length == 0){
            this.#file = Image.selectedFile.cloneNode(true);
            Image.selectedFile.files = new DataTransfer().files;
            
            this.dataset.url = URL.createObjectURL(this.#file.files[0]);
            this.dataset.name = this.#file.files[0].name;
            this.dataset.last_modified = this.#file.files[0].lastModified;
            this.dataset.size = this.#file.files[0].size;
            this.dataset.content_type = this.#file.files[0].type;

            let url = URL.createObjectURL(this.#file.files[0], this.dataset.content_type);
            this.dataset.url = url;
            this.image.type = this.dataset.content_type;
            this.image.src = this.dataset.url;
            /*fetch(this.dataset.url).then(res=>res.blob()).then(blob => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    this.dataset.base64 = reader.result;
                }
            })*/
            
        }else if(( ! this.dataset.url || this.dataset.url.startsWith('blob:file')) && this.dataset.base64){
            fetch(this.dataset.base64)
            .then(async res=>{
                return res.blob().then(blob=>{
                    let imgUrl = URL.createObjectURL(blob, res.headers.get('Content-Type'))
                    this.dataset.url = imgUrl;
                    this.image.src = this.dataset.url;
                })
            })
        }else if(Image.customImageCallback && typeof Image.customImageCallback == 'function'){
            Image.customImageCallback(this);
        }else if(this.dataset.url){
            this.image.src = this.dataset.url;
        }

        if(! this.dataset.name){
            this.remove();
            throw new Error(`this file is undefined ${this.dataset.name}`);
        }
        
        this.attachShadow({ mode : 'open' });
        this.shadowRoot.append(Image.defaultStyle.cloneNode(true));
        
        this.createDefaultContent().then(({wrap, description, slot, aticle})=>{
            this.connectedChildAfterCallback = (addedList) => {
                aticle.append(...addedList);
            }
        });
        
        this.disconnectedAfterCallback = () => {
            if(this.dataset.url.startsWith('blob:file')){
                setTimeout(() => {
                    URL.revokeObjectURL(this.dataset.url);
                }, 1000 * 60 * 2)
            }
        }
	}

    createDefaultContent(){
        return new Promise(resolve=>{
            let wrap = Object.assign(document.createElement('div'),{

            });
            wrap.draggable = false

            this.shadowRoot.append(wrap);

            let imageContanier = Object.assign(document.createElement('div'),{
                className: `${Image.defaultStyle.id} image-contanier`
            });

            /*let image = Object.assign(document.createElement('img'), {
                //src :`https://developer.mozilla.org/pimg/aHR0cHM6Ly9zLnprY2RuLm5ldC9BZHZlcnRpc2Vycy9iMGQ2NDQyZTkyYWM0ZDlhYjkwODFlMDRiYjZiY2YwOS5wbmc%3D.PJLnFds93tY9Ie%2BJ%2BaukmmFGR%2FvKdGU54UJJ27KTYSw%3D`
                //src: this.dataset.url
                //src: imgUrl
            });*/

            //if(this.#selectedFile.files.length != 0){
            this.image.dataset.image_name = this.dataset.name
            //}

            imageContanier.append(this.image);

            this.image.onload = () => {
                if(this.dataset.width){
                    this.image.width = this.dataset.width;
                }
                /*let applyToolAfterSelection = window.getSelection(), range = applyToolAfterSelection.getRangeAt(0);
                let scrollTarget;
                if(range.endContainer.nodeType == Node.TEXT_NODE){
                    scrollTarget = range.endContainer.parentElement
                }else{
                    scrollTarget = range.endContainer;
                }
                scrollTarget.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
                */
            //this.imgLoadEndCallback();
                //imageContanier.style.height = window.getComputedStyle(image).height;
            }
            this.image.onerror = () => {
                //imageContanier.style.height = window.getComputedStyle(image).height;
                this.image.dataset.error = '';
            }

            let {description, slot, aticle} = this.createDescription(this.image, imageContanier);

            this.connectedAfterOnlyOneCallback = () => {
                if(this.childNodes.length != 0 && this.childNodes[0]?.tagName != 'BR'){
                    aticle.append(...[...this.childNodes].filter(e=>e!=aticle));
                }
                wrap.replaceChildren(...[description,imageContanier].filter(e=>e != undefined));
                
                Image.imageBox.addImageHoverEvent(this.image, this);
                if(this.nextSibling?.tagName == 'BR'){
                    this.nextSibling.remove()
                }

                resolve({wrap, description, slot, aticle})
            }
        })
    }

    /**
     * 
     * @param {HTMLImageElement} image 
     * @param {HTMLDivElement} imageContanier 
     * @returns {HTMLDivElement}
     */
    createDescription(image, imageContanier){
        let description = Object.assign(document.createElement('div'),{
            className: `${Image.defaultStyle.id} image-description`
        });

        description.dataset.file_name = this.dataset.name
        description.dataset.open_status = this.dataset.open_status || '▼'; // '▼';
        imageContanier.style.height = this.dataset.height || 'auto'
        
        let {slot, aticle} = this.createSlot();
        
        description.append(slot)

        description.onclick = (event) => {
            if(description.dataset.open_status == '▼'){
                description.dataset.open_status = '▶'
                imageContanier.style.height = window.getComputedStyle(image).height;
                setTimeout(()=>{
                    imageContanier.style.height = '0px';
                    this.dataset.height = '0px';
                },100)

            }else{
                description.dataset.open_status = '▼';
                setTimeout(()=>{
                    imageContanier.style.height = window.getComputedStyle(image).height;
                    this.dataset.height = 'auto'
                },100)
                
                image.style.opacity = '';
                image.style.visibility = '';
            }
            this.dataset.open_status = description.dataset.open_status;
        }

        imageContanier.ontransitionend = () => {
            if(description.dataset.open_status == '▼'){
                imageContanier.style.height = 'auto';
            }else{
                image.style.opacity = 0;
                image.style.visibility = 'hidden';
            }
        }

        return {description, slot, aticle};
    }

    /**
     * 
     * @returns {HTMLSlotElement}
     */
    createSlot(){
        let aticle = document.createElement('div');
        
        aticle.contentEditable = 'false';
        aticle.draggable = 'false'; 

        //if(this.childNodes.length != 0 && this.childNodes[0]?.tagName != 'BR'){
            let randomId = Array.from(
                window.crypto.getRandomValues(new Uint32Array(16)),
                (e)=>e.toString(32).padStart(2, '0')
            ).join('');
            //aticle.append(...[...this.childNodes].map(e=>e.cloneNode(true)));
            aticle.append(...this.childNodes);
            aticle.slot = Image.slotName + '-' + randomId
            this.append(aticle);
            
            let slot = Object.assign(document.createElement('slot'),{
                name: Image.slotName + '-' + randomId
            });
            return {slot, aticle};
        //}else{
        //    return undefined
        //}

    }
    /**
     * @returns {HTMLInputElement}
     */
    get selectedFile(){
        return this.#file
    }
}
