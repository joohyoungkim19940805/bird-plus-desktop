import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import VideoBox from "../component/VideoBox"
export default class Video extends FreedomInterface {

	static toolHandler = new ToolHandler(this);

    static videoBox = new VideoBox();

    static customVideoCallback;

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-video-style'
	});

    static descriptionName = 'free-will-editor-video-description-slot';

    static #selectedFile = Object.assign(document.createElement('input'), {
        type: 'file',
        accept: 'video/*',
        capture: 'camera',
    });

    static get selectedFile(){
        return this.#selectedFile;
    }

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-video';

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: '',
            className: `${this.#defaultStyle.id}-button`,
            innerHTML: `
                <i class="${this.#defaultStyle.id} css-gg-video-icon"></i>
            `,
            title: 'Video'
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else{
                this.#selectedFile.onchange = ()=> {
                    //let url = URL.createObjectURL(this.#selectedFile.files[0])
                    this.toolHandler.toolButton.dataset.tool_status = 'active';
                }
                this.#selectedFile.click();
			}
		}
	}

	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
            .${this.#defaultStyle.id}.css-gg-video-icon {
                box-sizing: border-box;
                position: relative;
                display: block;
                border: 2px solid;
                border-radius: 3px;
                width: 16px;
                height: 12px;
                perspective: 24px;
                top: 1.6px;
            }
            .${this.#defaultStyle.id}.css-gg-video-icon::after, .${this.#defaultStyle.id}.css-gg-video-icon::before {
                content: "";
                display: block;
                box-sizing: border-box;
                position: absolute
            }
            .${this.#defaultStyle.id}.css-gg-video-icon::after {
                width: 10px;
                height: 5px;
                border-top: 2px solid;
                border-right: 2px solid;
                top: -5px;
                right: 2px;
                border-top-right-radius: 2px
            }
            .${this.#defaultStyle.id}.css-gg-video-icon::before {
                border: 2px solid;
                border-left-color: transparent;
                transform: rotateY(-70deg);
                width: 8px;
                height: 8px;
                right: -7px;
                top: 0
            }
            .${this.#defaultStyle.id}.video-description{            
                cursor: pointer;
                display: inline-flex;
                align-items: center;
            }
            .${this.#defaultStyle.id}.video-description::after{
                margin-left: 0.5em;
                content: ' ['attr(data-file_name)'] 'attr(data-open_status);
                font-size: small;
                color: #bdbdbd;
            }

            .${this.#defaultStyle.id}.video-contanier{
                width: auto;
                transition: height 0.5s ease-in-out;
                overflow: hidden;
                position: relative;
            }
            .${this.#defaultStyle.id}.video-contanier video{
                max-width: 100%;
                height: auto;
                aspect-ratio: attr(width) / attr(height);
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
    
    /**
     * @returns{FileList}
     */
    file = new DataTransfer().files;

    videoLoadEndCallback = (event) => {};

    video = Object.assign(document.createElement('video'), {
        loop: true,
        controls: true
    });

	constructor(dataset){
		super(Video, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});

		if( ! dataset && Object.entries(this.dataset).length == 0){
            this.dataset.url = URL.createObjectURL(Video.selectedFile.files[0]);
            this.dataset.name = Video.selectedFile.files[0].name;
            this.dataset.lastModified = Video.selectedFile.files[0].lastModified;
            this.dataset.size = Video.selectedFile.files[0].size;
            this.dataset.content_type = Video.selectedFile.files[0].type;
            this.file.files = Video.selectedFile.files;
            const reader = new FileReader();  
            reader.readAsDataURL(Video.selectedFile.files[0]);
            reader.onloadend = () => {
                this.dataset.base64 = reader.result;
                fetch(this.dataset.base64)
                .then(async res=>{
                    return res.blob().then(blob=>{
                        let videoUrl = URL.createObjectURL(blob, res.headers.get('Content-Type'))
                        this.dataset.url = videoUrl;
                        this.video.src = this.dataset.url;
                    })
                })
            }
        }else if(( ! this.dataset.url || this.dataset.url.startsWith('blob:file')) && this.dataset.base64){
            fetch(this.dataset.base64)
            .then(async res=>{
                return res.blob().then(blob=>{
                    let videoUrl = URL.createObjectURL(blob, res.headers.get('Content-Type'))
                    this.dataset.url = videoUrl;
                    this.video.src = this.dataset.url;
                })
            })
        }else if(Video.customVideoCallback && typeof Video.customVideoCallback == 'function'){
            Video.customVideoCallback(this);
        }else if(this.dataset.url){
            this.video.src = this.dataset.url;
        }

        if( ! this.file.files && ! this.dataset.name){
            this.remove();
            throw new Error(`this file is undefined ${this.file.files}`);
        }

        Video.selectedFile.files = new DataTransfer().files
        this.attachShadow({ mode : 'open' });
        this.shadowRoot.append(Video.defaultStyle.cloneNode(true));
        this.createDefaultContent();


        this.disconnectedAfterCallback = () => {
            if(this.dataset.url.startsWith('blob:file')){
                setTimeout(() => {
                    URL.revokeObjectURL(this.dataset.url);
                }, 1000 * 60 * 2)
            }
        }
	}

    createDefaultContent(){
        let wrap = Object.assign(document.createElement('div'),{

        });
        wrap.draggable = false

        this.shadowRoot.append(wrap);

        let videoContanier = Object.assign(document.createElement('div'),{
            className: `${Video.defaultStyle.id} video-contanier`
        });

        videoContanier.append(this.video);
        this.video.onload = () => {
            if(
                (this.file.length != 0 && video.canPlayType(this.file.files[0].type) == '') ||
                (
                    this.dataset.name && 
                    this.video.canPlayType(
                        `video/${this.dataset.name.substring(this.dataset.name.lastIndexOf('.') + 1)}`
                    ) == ''
                )
            ){
                this.videoIsNotWorking();
            }
        }
        this.video.onloadeddata = () => {
            //videoContanier.style.height = window.getComputedStyle(video).height;
            /*let applyToolAfterSelection = window.getSelection(), range = applyToolAfterSelection.getRangeAt(0);
			let scrollTarget;
			if(range.endContainer.nodeType == Node.TEXT_NODE){
				scrollTarget = range.endContainer.parentElement
			}else{
				scrollTarget = range.endContainer;
			}
			scrollTarget.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
			*/
            this.video.play();
        }
        this.video.onerror = () => {
            //videoContanier.style.height = window.getComputedStyle(video).height;
        }
        
        this.connectedAfterOnlyOneCallback = () => {
            let description = this.createDescription(this.video, videoContanier);

            wrap.replaceChildren(...[description,videoContanier].filter(e=>e != undefined));
            
            Video.videoBox.addVideoHoverEvent(this.video, this);
            if(this.nextSibling?.tagName == 'BR'){
                this.nextSibling.remove()
            }
        }

    }

    createDescription(video, videoContanier){
        let description = document.createElement('div');

        description.dataset.file_name = this.dataset.name
        description.className = `${Video.defaultStyle.id} video-description`;
        description.dataset.open_status = '▼';

        let slot = this.createSlot()
        
        if(slot){
            description.append(slot);
        }

        description.onclick = (event) => {

            if(description.dataset.open_status == '▼'){
                description.dataset.open_status = '▶'
                videoContanier.style.height = window.getComputedStyle(video).height;
                setTimeout(()=>{
                    videoContanier.style.height = '0px';
                },100)

            }else{
                description.dataset.open_status = '▼';
                setTimeout(()=>{
                    videoContanier.style.height = window.getComputedStyle(video).height;
                },100)
                
                video.style.opacity = '';
                video.style.visibility = '';
            }
        }

        videoContanier.ontransitionend = () => {
            if(description.dataset.open_status == '▼'){
                videoContanier.style.height = 'auto';
            }else{
                video.style.opacity = 0;
                video.style.visibility = 'hidden';
            }
        }

        return description
    }

    createSlot(){
        let aticle = document.createElement('div');
        
        aticle.contentEditable = 'false';
        aticle.draggable = 'false';

        if(this.childNodes.length != 0 && this.childNodes[0]?.tagName != 'BR'){
            let randomId = Array.from(
                window.crypto.getRandomValues(new Uint32Array(16)),
                (e)=>e.toString(32).padStart(2, '0')
            ).join('');
            //aticle.append(...[...this.childNodes].map(e=>e.cloneNode(true)));
            aticle.append(...this.childNodes);
            aticle.slot = Video.descriptionName + '-' + randomId;
            this.append(aticle);
            
            let slot = Object.assign(document.createElement('slot'),{
                name: Video.descriptionName + '-' + randomId
            });

            return slot;
        }else{
            return undefined;
        }
    }

    videoIsNotWorking(){
        alert(`${this.dataset.name}은 호환되지 않는 영상입니다.`);
        this.remove();
    }
}
