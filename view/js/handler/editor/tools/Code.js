import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class Video extends FreedomInterface {

	static toolHandler = new ToolHandler(this);

    static videoBox;// = new VideoBox();

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-video'
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

		let button = document.createElement('button');
		this.toolHandler.toolButton = button;
		button.append(Object.assign(document.createElement('i'),{
            className: `${this.#defaultStyle.id} css-gg-video-icon`
        }));
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

		let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.createDefaultStyle());
        }else{
            this.#defaultStyle = defaultStyle;
        }
	}

	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
            .${this.#defaultStyle.id}.css-gg-code-icon {
                display: block;
                position: relative;
                box-sizing: border-box;
                width: 2px;
                height: 16px;
                background: currentColor
            }
            .${this.#defaultStyle.id}.css-gg-code-icon::after, .${this.#defaultStyle.id}.css-gg-code-icon::before {
                content: "";
                display: block;
                box-sizing: border-box;
                position: absolute;
                width: 8px;
                height: 8px;
                transform: rotate(-60deg)
            }
            .${this.#defaultStyle.id}.css-gg-code-icon::after {
                border-right: 2px solid;
                border-bottom: 2px solid;
                right: -8px;
                top: 3px
            }
            .${this.#defaultStyle.id}.css-gg-code-icon::before {
                border-left: 2px solid;
                border-top: 2px solid;
                left: -8px;
                top: 5px
            }
            .${this.#defaultStyle.id}.video-description{            
                cursor: pointer;
                display: inline-flex;
                align-items: center;
            }

            .${this.#defaultStyle.id}.video-description::after{
                content: ' ['attr(data-file_name)'] 'attr(data-open_status);
                font-size: small;
                color: #bdbdbd;
            }            
        `
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
    files = new DataTransfer().files;

	constructor(dataset){
		super(Video, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});
		if(Video.defaultStyle.textContent != '' && Video.defaultStyle.textContent && Video.defaultStyle.hasAttribute('data-is_update') == false){
			Video.createDefaultStyle();
			Video.defaultStyle.toggleAttribute('data-is_update');
		}

        if( ! dataset ){
            this.files = Video.selectedFile.files;
            this.dataset.url = URL.createObjectURL(this.files[0]);
            this.dataset.name = this.files[0].name;
            this.dataset.lastModified = this.files[0].lastModified;
            this.dataset.size = this.files[0].size;
            
        }
        
        Video.selectedFile.files = new DataTransfer().files

        this.attachShadow({ mode : 'open' });
        this.shadowRoot.append(Video.defaultStyle.cloneNode(true));
        
        this.createDefaultContent();
	}

    createDefaultContent(){
        let wrap = Object.assign(document.createElement('div'),{

        });
        wrap.draggable = 'false'

        this.shadowRoot.append(wrap);

        let videoContanier = Object.assign(document.createElement('div'),{

        });

        let video = Object.assign(document.createElement('video'), {
            //src :`https://developer.mozilla.org/pimg/aHR0cHM6Ly9zLnprY2RuLm5ldC9BZHZlcnRpc2Vycy9iMGQ2NDQyZTkyYWM0ZDlhYjkwODFlMDRiYjZiY2YwOS5wbmc%3D.PJLnFds93tY9Ie%2BJ%2BaukmmFGR%2FvKdGU54UJJ27KTYSw%3D`
            src: this.dataset.url,
            loop: true,
        });
        
        console.log(video.canPlayType(this.files[0].type))
        if(video.canPlayType(this.files[0].type) == ''){
            /*
            let file = new File(
                [this.dataset.url],
                this.files[0].name.split('.')[0] + '.mp4',
                { type: 'video/mp4' }
            );
            video.src = URL.createObjectURL(file);
            */
        }
        videoContanier.append(video);
        videoContanier.style.transition = 'all 0.5s'
        videoContanier.style.overflow = 'hidden';

        video.onloadeddata = () => {
            videoContanier.style.height = window.getComputedStyle(video).height;
            video.play();
        }
        video.onerror = () => {
            videoContanier.style.height = window.getComputedStyle(video).height;
        }
        
        let description = document.createElement('div');

        description.dataset.file_name = this.dataset.name

        let aticle = document.createElement('div');
        
        aticle.contentEditable = 'false';
        aticle.draggable = 'false';


        super.connectedAfterOnlyOneCallback = () => {

            if(this.childNodes.length != 0 && this.childNodes[0]?.tagName != 'BR'){
                aticle.append(...[...this.childNodes].map(e=>e.cloneNode(true)));
                aticle.slot = Video.descriptionName;
                this.append(aticle);
                
                let slot = Object.assign(document.createElement('slot'),{
                    name: Video.descriptionName
                });
                description.append(slot);
                
            }

            description.className = `${Video.defaultStyle.id} video-description`;
            description.dataset.open_status = '▼';

            description.onclick = (event) => {

                if(description.dataset.open_status == '▼'){
                    description.dataset.open_status = '▶'
                    videoContanier.style.height = '0px';
                    videoContanier.ontransitionstart = ()=>{}
                    videoContanier.ontransitionend = () => {
                        video.style.opacity = 0;
                        video.style.visibility = 'hidden';
                    }
                    
                }else{
                    description.dataset.open_status = '▼';
                    videoContanier.style.height = window.getComputedStyle(video).height;
                    videoContanier.ontransitionend = () => {}
                    videoContanier.ontransitionstart = () => {
                        video.style.opacity = '';
                        video.style.visibility = '';
                    }

                }
            }

            wrap.append(...[description,videoContanier].filter(e=>e != undefined));
        
        }

        super.disconnectedAfterCallback = () => {
            aticle.remove();
        }
    }

}
