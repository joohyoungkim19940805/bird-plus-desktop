import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class BulletPoint extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);
	
	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-bullet-point-style'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-bullet-point';
		this.toolHandler.isInline = false;
		
		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: '●',
            className: `${this.#defaultStyle.id}-button`,
			title: 'Bullet Point'
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else{
				this.toolHandler.toolButton.dataset.tool_status = 'active';
			}
		}

		let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.#defaultStyle);
        }else{
            this.#defaultStyle = defaultStyle;
        }
	}

	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
			.${this.#defaultStyle.id}-button{
				font-size: 14px;
			}

			.${this.toolHandler.defaultClass} {
				display: block;
				padding-left: 1em;
				margin-inline: 2.5em;
				list-style-type: disc;
			}
			.${this.toolHandler.defaultClass} > *{
				display: list-item;
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

	parentLine;

	constructor(dataset, {isDefaultStyle = true} = {}){
		super(BulletPoint, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});
		if(BulletPoint.defaultStyle.textContent == '' && BulletPoint.defaultStyle.hasAttribute('data-is_update') == false && isDefaultStyle){
			BulletPoint.createDefaultStyle();
			BulletPoint.defaultStyle.setAttribute('data-is_update', true);
		}
		
		super.connectedAfterOnlyOneCallback = () => {
			this.dataset.index = BulletPoint.toolHandler.connectedFriends.length;
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}else{
				nextLine.line.lookAtMe();
			}
		}

		super.disconnectedChildAfterCallBack = (removedNodes) => {
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}
        }
	}

}