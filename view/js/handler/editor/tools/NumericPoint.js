import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"

export default class NumericPoint extends FreedomInterface {
	//static extendsElement = 'strong';
	//static defaultClass = 'line';
	static toolHandler = new ToolHandler(this);
	
	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-numeric-point-style'
	});

	static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-numeric-point';
		this.toolHandler.isInline = false;

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: '1.',
            className: `${this.#defaultStyle.id}-button`,
			title: 'Numeric Point'
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else{
				this.toolHandler.toolButton.dataset.tool_status = 'active';
			}
		}
	}
    //list-style-type: disc;
	static createDefaultStyle(){
		this.#defaultStyle.textContent = `
			.${this.#defaultStyle.id}-button{
				font-size: 0.8rem;
			}
			.${this.toolHandler.defaultClass} {
				display: block;
				margin-inline: 1.3em;
			}
			.${this.toolHandler.defaultClass} > * {
				margin-inline: 1.3em;
			}
			.${this.toolHandler.defaultClass} > *:before{
				content: attr(data-order)
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

	parentLine;
	
	constructor(dataset){
		super(NumericPoint, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});
		super.connectedChildAfterCallback = (list) => {
			new Promise(r=>{
				[...this.children].forEach((e,i)=>{
					e.dataset.order = (i + 1) + '. ';
				});
				r();
			});
			let lastItem = list.at(-1);
			if(lastItem.nodeType == Node.ELEMENT_NODE){
				let inter = setInterval(()=>{
					if(lastItem.isConnected){
						clearInterval(inter);
						window.getSelection().setPosition(lastItem, lastItem.childNodes.length)
					}
				}, 50);
			}else if(lastItem.nodeType == Node.TEXT_NODE){
				let inter = setInterval(()=>{
					if(lastItem.isConnected){
						clearInterval(inter);
						window.getSelection().setPosition(lastItem, lastItem.length)
					}
				}, 50);
			}
		}

		/*
		super.connectedAfterOnlyOneCallback = () => {
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}else{
				nextLine.line.lookAtMe();
			}
		}
		/*
		super.disconnectedChildAfterCallback = (removedNodes) => {
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}
        }
		*/
	}

}