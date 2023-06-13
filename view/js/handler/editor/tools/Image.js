import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import ImageBox from "../module/ImageBox"
export default class Image extends FreedomInterface {

	static toolHandler = new ToolHandler(this);

    static imageBox;// = new ImageBox();

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-image'
	});

    static descriptionName = 'free-will-editor-image-description-slot';

    static #selectedFile = Object.assign(document.createElement('input'), {
        type: 'file',
        accept: 'image/*',
        capture: 'camera',
    });

    static get selectedFile(){
        return this.#selectedFile;
    }

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-image';

		let button = document.createElement('button');
		this.toolHandler.toolButton = button;
		button.append(Object.assign(document.createElement('i'),{
            className: `${this.#defaultStyle.id} css-gg-image-icon`
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
            .${this.#defaultStyle.id}.css-gg-image-icon {
                box-sizing: border-box;
                position: relative;
                display: block;
                width: 14px;
                height: 15px;
                overflow: hidden;
                box-shadow: 0 0 0 2px;
                border-radius: 2px
            }
            .${this.#defaultStyle.id}.css-gg-image-icon::after, .${this.#defaultStyle.id}.css-gg-image-icon::before {
                content: "";
                display: block;
                box-sizing: border-box;
                position: absolute;
                border: 2px solid;
            }
            .${this.#defaultStyle.id}.css-gg-image-icon::after {
                transform: rotate(45deg);
                border-radius: 3px;
                width: 16px;
                height: 16px;
                top: 9px;
                left: 2px;
            }
            .${this.#defaultStyle.id}.css-gg-image-icon::before {
                border-radius: 100%;
                top: 1px;
                left: 1px;
            }
            .${this.#defaultStyle.id}.image-description{            
                cursor: pointer;
                display: inline-flex;
                align-items: center;
            }

            .${this.#defaultStyle.id}.image-description::after{
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

    file = new DataTransfer().files;

	constructor(dataset){
		super(Image, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});
		if(Image.defaultStyle.textContent != '' && Image.defaultStyle.textContent && Image.defaultStyle.hasAttribute('data-is_update') == false){
			Image.createDefaultStyle();
			Image.defaultStyle.toggleAttribute('data-is_update');
		}

        if( ! dataset ){
            this.dataset.url = URL.createObjectURL(Image.selectedFile.files[0]);
            this.dataset.name = Image.selectedFile.files[0].name;
            this.dataset.lastModified = Image.selectedFile.files[0].lastModified;
            this.dataset.size = Image.selectedFile.files[0].size;
            this.file.files = Image.selectedFile.files;
        }
        
        Image.selectedFile.files = new DataTransfer().files




        this.attachShadow({ mode : 'open' });
        this.shadowRoot.append(Image.defaultStyle.cloneNode(true));
        
        this.createDefaultContent();
	}

    createDefaultContent(){
        let wrap = Object.assign(document.createElement('div'),{

        });
        wrap.draggable = 'false'

        this.shadowRoot.append(wrap);

        let imageContanier = Object.assign(document.createElement('div'),{

        });

        let image = Object.assign(document.createElement('img'), {
            //src :`https://developer.mozilla.org/pimg/aHR0cHM6Ly9zLnprY2RuLm5ldC9BZHZlcnRpc2Vycy9iMGQ2NDQyZTkyYWM0ZDlhYjkwODFlMDRiYjZiY2YwOS5wbmc%3D.PJLnFds93tY9Ie%2BJ%2BaukmmFGR%2FvKdGU54UJJ27KTYSw%3D`
            src: this.dataset.url
        });

        imageContanier.append(image);
        imageContanier.style.transition = 'all 0.5s'
        imageContanier.style.overflow = 'hidden';

        image.onload = () => {
            imageContanier.style.height = window.getComputedStyle(image).height;
        }
        image.onerror = () => {
            imageContanier.style.height = window.getComputedStyle(image).height;
        }
        
        let description = document.createElement('div');

        description.dataset.file_name = this.dataset.name

        let aticle = document.createElement('div');
        
        aticle.contentEditable = 'false';
        aticle.draggable = 'false';


        super.connectedAfterOnlyOneCallback = () => {

            if(this.childNodes.length != 0 && this.childNodes[0]?.tagName != 'BR'){
                aticle.append(...[...this.childNodes].map(e=>e.cloneNode(true)));
                aticle.slot = Image.descriptionName;
                this.append(aticle);
                
                let slot = Object.assign(document.createElement('slot'),{
                    name: Image.descriptionName
                });
                description.append(slot);
                
            }

            description.className = `${Image.defaultStyle.id} image-description`;
            description.dataset.open_status = '▼';

            description.onclick = (event) => {

                if(description.dataset.open_status == '▼'){
                    description.dataset.open_status = '▶'
                    imageContanier.style.height = '0px';
                    imageContanier.ontransitionstart = ()=>{}
                    imageContanier.ontransitionend = () => {
                        image.style.opacity = 0;
                        image.style.visibility = 'hidden';
                    }
                    
                }else{
                    description.dataset.open_status = '▼';
                    imageContanier.style.height = window.getComputedStyle(image).height;
                    imageContanier.ontransitionend = () => {}
                    imageContanier.ontransitionstart = () => {
                        image.style.opacity = '';
                        image.style.visibility = '';
                    }

                }
            }

            wrap.append(...[description,imageContanier].filter(e=>e != undefined));
        
        }

        super.disconnectedAfterCallback = () => {
            aticle.remove();
        }
    }

}
