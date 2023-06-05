import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import ImageBox from "../module/ImageBox"
export default class Image extends FreedomInterface {

	static toolHandler = new ToolHandler(this);

    static imageBox;// = new ImageBox();

	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-image'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-editor-image';

		let button = document.createElement('button');
		this.toolHandler.toolButton = button;
		button.append(Object.assign(document.createElement('i'),{
            className: 'css-gg-image-icon'
        }));
		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else{
				this.toolHandler.toolButton.dataset.tool_status = 'active';
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
            .css-gg-image-icon {
                box-sizing: border-box;
                position: relative;
                display: block;
                width: 14px;
                height: 15px;
                overflow: hidden;
                box-shadow: 0 0 0 2px;
                border-radius: 2px
            }
            .css-gg-image-icon::after, .gg-image-icon::before {
                content: "";
                display: block;
                box-sizing: border-box;
                position: absolute;
                border: 2px solid;
            }
            .css-gg-image-icon::after {
                transform: rotate(45deg);
                border-radius: 3px;
                width: 16px;
                height: 16px;
                top: 9px;
                left: 2px;
            }
            .css-gg-image-icon::before {
                width: 6px;
                height: 6px;
                border-radius: 100%;
                top: 1px;
                left: 1px;
            }
            .${this.toolHandler.defaultClass} {
				display: block;
			}
            .image-description{
                
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
    

	constructor(dataset){
		super(Image, dataset, FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE);
		if(Image.defaultStyle.textContent != '' && Image.defaultStyle.textContent && Image.defaultStyle.hasAttribute('data-is_update') == false){
			Image.createDefaultStyle();
			Image.defaultStyle.toggleAttribute('data-is_update');
		}

        this.contentEditable = false;

        let wrap = Object.assign(document.createElement('div'),{

        });

        let image = Object.assign(document.createElement('img'), {
            src :`https://developer.mozilla.org/pimg/aHR0cHM6Ly9zLnprY2RuLm5ldC9BZHZlcnRpc2Vycy9iMGQ2NDQyZTkyYWM0ZDlhYjkwODFlMDRiYjZiY2YwOS5wbmc%3D.PJLnFds93tY9Ie%2BJ%2BaukmmFGR%2FvKdGU54UJJ27KTYSw%3D`
        });

        this.open();
        this.shadowRoot.append(wrap);
        this.shadowRoot.append(Image.defaultStyle.cloneNode(true));
        super.connectedAfterOnlyOneCallback = () => {
            let nextLine = Image.toolHandler.parentEditor.getNextLine(this);
            if( ! nextLine){
                let nextLine = Image.toolHandler.parentEditor.createLine();
                nextLine.lookAtMe();
                nextLine.innerText = '&nbsp';
            }

            let description = undefined;
            if(this.textContent != ''){
                description = Object.assign(document.createElement('div'),{
                    className: 'image-description',
                    textContent: this.textContent
                })
            }

            wrap.append(...[description,image].filter(e=>e != undefined));

        }
	}
    /*
    cloneDescription(target){
        return new Promise(resolve => {
            let result = [...target.childNodes].map(e=>{
                let clone = e.cloneNode(true);
                this.cloneDescription(clone).then(cloneList => {
                    console.log(clone);
                    if(clone.nodeType == Node.ELEMENT_NODE){
                        clone.append(...cloneList);
                    }
                })
                return clone
            });
            resolve(result);
        })
    }
    */
    createImage(){

    }
	
    open(){
        this.attachShadow({ mode : 'open' });
    }
    close(){
        this.attachShadow({ mode: 'closed' });
    }
}
