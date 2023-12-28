
import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class Resources extends FreedomInterface {

	static toolHandler = new ToolHandler(this);

    static customResourcesCallback = () => {}; 

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-resources-style'
	});

    static slotName = 'free-will-editor-resources-description-slot';

    static #selectedFile = Object.assign(document.createElement('input'), {
        type: 'file'
    });

    static get selectedFile(){
        return this.#selectedFile;
    }

    static #resourcesCallback = () => {};

    static #sizeLimitOverCallback = () => {};
    static isDefaultStyle = true;
	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-resources';
        //this.toolHandler.isInline = false;

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: '',
            className: `${this.#defaultStyle.id}-button`,
            innerHTML: `
            <svg class="${this.#defaultStyle.id} css-gg-file-add-icon" width="0.9rem" height="0.9rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18V16H8V14H10V12H12V14H14V16H12V18H10Z" fill="currentColor" />
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z"
                    fill="currentColor"
                />
            </svg>
            `,
            title: 'Resources'
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
            .${this.#defaultStyle.id}.css-gg-file-add-icon {
                zoom:120%;
            }
            .${this.#defaultStyle.id}.resources-description{            
                cursor: pointer;
                display: inline-flex;
                align-items: center;
            }

            .${this.#defaultStyle.id}.resources-description::after{
                margin-left: 0.5em;
                content: ' ['attr(data-file_name)'] 'attr(data-open_status);
                font-size: small;
                color: #bdbdbd;
            }
            .${this.#defaultStyle.id}.resources-download-button, .${this.#defaultStyle.id}.resources-preview-button{
                margin-left: 1vw;
                border: solid 2px #e5e5e5;
                cursor: pointer;
                background: none;
            }
            .${this.#defaultStyle.id}.resources-contanier{
                width: auto;
                transition: height 0.5s ease-in-out;
                overflow: hidden;
                position: relative;
                margin-top: 0.7vh;
            }
            .${this.#defaultStyle.id}.resources-contanier object{
                width: 99%;
                height: auto;
                aspect-ratio: attr(width) / attr(height);
                border: solid 2px #efefef;
            }
            .${this.#defaultStyle.id}.resources-contanier object.unload{
                width: auto;
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

    static set resourcesCallback(callback){
        this.#resourcesCallback = callback;
    }
    static get resourcesCallback(){
        return this.#resourcesCallback;
    }

    static set sizeLimitOverCallback(callback){
        this.#sizeLimitOverCallback = callback;
    }
    static get sizeLimitOverCallback(){
        return this.#sizeLimitOverCallback;
    }

    #file;
    
    imgLoadEndCallback = (event) => {};

    resources = Object.assign(document.createElement('object'), {

    });

	constructor(dataset){
		super(Resources, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});
        
        if( ! dataset && Object.keys(this.dataset).length == 0){
            this.#file = Resources.selectedFile.cloneNode(true);
            Resources.selectedFile.files = new DataTransfer().files;

            this.dataset.url = URL.createObjectURL(this.#file.files[0]);
            this.dataset.name = this.#file.files[0].name;
            this.dataset.last_modified = this.#file.files[0].lastModified;
            this.dataset.size = this.#file.files[0].size;
            this.dataset.content_type = this.#file.files[0].type;

            let url = URL.createObjectURL(this.#file.files[0], this.dataset.content_type);
            this.dataset.url = url;
            /*fetch(this.dataset.url).then(res=>res.blob()).then(blob => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    this.dataset.base64 = reader.result;
                }
            })*/
           
        }else if(Resources.customResourcesCallback && typeof Resources.customResourcesCallback == 'function'){
            Resources.customResourcesCallback(this);
        }else if(this.dataset.url){
        }
        this.resources.type = this.dataset.content_type;
        this.resources.data = this.dataset.url;
        this.resources.dataset.resources_name = this.dataset.name

        if(! this.dataset.name){
            this.remove();
            throw new Error(`this file is undefined ${this.dataset.name}`);
        }
        
        this.attachShadow({ mode : 'open' });
        this.shadowRoot.append(Resources.defaultStyle.cloneNode(true));
        
        this.createDefaultContent().then(({wrap, description, slot, aticle})=>{
            this.connectedChildAfterCallback = (addedList) => {
                aticle.append(...addedList);
            }
        });
        
        this.disconnectedAfterCallback = () => {
            this.resources.remove();
            if(this.dataset.url.startsWith('blob:file')){
                //setTimeout(() => {
                    //URL.revokeObjectURL(this.dataset.url);
                //}, 1000 * 60 * 2)
            }
        }

	}

    createDefaultContent(){
        return new Promise(resolve => {
            let wrap = Object.assign(document.createElement('div'),{

            });
            wrap.draggable = false

            this.shadowRoot.append(wrap);

            let resourcesContanier = Object.assign(document.createElement('div'),{
                className: `${Resources.defaultStyle.id} resources-contanier`
            });

            /*let resources = Object.assign(document.createElement('img'), {
                //src :`https://developer.mozilla.org/pimg/aHR0cHM6Ly9zLnprY2RuLm5ldC9BZHZlcnRpc2Vycy9iMGQ2NDQyZTkyYWM0ZDlhYjkwODFlMDRiYjZiY2YwOS5wbmc%3D.PJLnFds93tY9Ie%2BJ%2BaukmmFGR%2FvKdGU54UJJ27KTYSw%3D`
                //src: this.dataset.url
                //src: imgUrl
            });*/

            //if(this.file.files.length != 0){

            //}

            //resourcesContanier.append(this.resources);

            this.resources.onload = (event) => {
                if(this.dataset.width){
                    this.resources.width = this.dataset.width;
                }
                //console.log(this.resources.contentWindow);
                if( ! this.resources.contentWindow){
                    this.resources.classList.add('unload')
                }else{
                    this.resources.contentWindow.document.body.style.contentVisibility = 'auto'
                    this.resources.contentWindow.document.body.style.containIntrinsicSize = '1px 5000px'
                }

                Resources.resourcesCallback({status : 'load', resources : this.resources});
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
                //resourcesContanier.style.height = window.getComputedStyle(resources).height;
            }
            this.resources.onerror = (event) => {
                //console.log(event);
                //resourcesContanier.style.height = window.getComputedStyle(resources).height;
                this.resources.dataset.error = '';
                if( ! this.resources.contentWindow){
                    this.resources.classList.add('unload')
                }
                Resources.resourcesCallback({status : 'error', resources : this.resources});
                
            }

            let {description, slot, aticle} = this.createDescription(this.resources, resourcesContanier);
            let downloadButton = Object.assign(document.createElement('button'), {
                className: `${Resources.defaultStyle.id} resources-download-button`,
                innerHTML : `<b>Download</b>`,
                onclick : () => {
                    fetch(this.resources.data).then(res=>res.blob()).then(blob => {
                        let url = URL.createObjectURL(blob, this.dataset.content_type);
                        let a = document.createElement('a');
                        a.href = url;
                        a.download = this.dataset.name;
                        a.click();
                        a.remove();
                        setTimeout(() => {
                            URL.revokeObjectURL(url);
                        }, 1000 * 60 * 5)
                    })
                }
            });
            let previewButton = Object.assign(document.createElement('button'), {
                className: `${Resources.defaultStyle.id} resources-preview-button`,
                innerHTML : `<b>Preview</b>`,
                onclick : () => {
                    resourcesContanier.append(this.resources);
                }
            });

            this.connectedAfterOnlyOneCallback = () => {
                if(this.childNodes.length != 0 && this.childNodes[0]?.tagName != 'BR'){
                    aticle.append(...[...this.childNodes].filter(e=>e!=aticle));
                }
                wrap.replaceChildren(...[description,downloadButton,previewButton,resourcesContanier].filter(e=>e != undefined));
                
                if(this.nextSibling?.tagName == 'BR'){
                    this.nextSibling.remove()
                }

                resolve({wrap, description, slot, aticle})
            }
        })
    }

    /**
     * 
     * @param {HTMLObjectElement} resources 
     * @param {HTMLDivElement} resourcesContanier 
     * @returns 
     */
    createDescription(resources, resourcesContanier){
        let description = Object.assign(document.createElement('div'),{
            className: `${Resources.defaultStyle.id} resources-description`
        });

        description.dataset.file_name = this.dataset.name
        description.dataset.open_status = this.dataset.open_status || '▼'
        resourcesContanier.style.height = this.dataset.height || 'auto'
        
        description.dataset.open_status = '▼';
        
        let {slot, aticle} = this.createSlot();
        
        description.append(slot)

        description.onclick = (event) => {
            /*if(event.composedPath().some(e=> e== downloadButton)){
                return;
            }*/
            if(description.dataset.open_status == '▼'){
                description.dataset.open_status = '▶'
                resourcesContanier.style.height = window.getComputedStyle(resources).height;
                setTimeout(()=>{
                    resourcesContanier.style.height = '0px';
                    this.dataset.height = '0px';
                },100)

            }else{
                description.dataset.open_status = '▼';
                setTimeout(()=>{
                    resourcesContanier.style.height = window.getComputedStyle(resources).height;
                    this.dataset.height = 'auto';
                },100)
                
                resources.style.opacity = '';
                resources.style.visibility = '';

            }
            this.dataset.open_status = description.dataset.open_status;
        }

        resourcesContanier.ontransitionend = () => {
            if(description.dataset.open_status == '▼'){
                resourcesContanier.style.height = 'auto';
            }else{
                resources.style.opacity = 0;
                resources.style.visibility = 'hidden';
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
            aticle.slot = Resources.slotName + '-' + randomId
            this.append(aticle);
            
            let slot = Object.assign(document.createElement('slot'),{
                name: Resources.slotName + '-' + randomId
            });
            return {slot, aticle};
        //}else{
        //   return undefined
        //}

    }
    /**
     * @returns {HTMLInputElement}
     */
    get selectedFile(){
        return this.#file
    }
    
    set resourcesUrl(url){
        let clone = this.resources.cloneNode(true);
        clone.data = url;
        this.resources.after(clone);
        this.resources.remove();
        this.resources = clone;
        clone.onload = () => {
            if(this.resources == clone) return;
            if(this.dataset.width){
                clone.width = this.dataset.width;
            }
            if( ! clone.contentWindow){
                clone.classList.add('unload')
            }
        }
        clone.onerror = () => {
            clone.dataset.error = '';
            if( ! clone.contentWindow){
                clone.classList.add('unload')
            }
        }
    }
    get resourcesUrl(){
        this.resources.data;
    }
}
