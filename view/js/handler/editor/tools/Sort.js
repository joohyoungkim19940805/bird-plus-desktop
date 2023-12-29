import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import SortBox from "../component/SortBox";

export default class Sort extends FreedomInterface {
    static toolHandler = new ToolHandler(this);
	
	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-index-style'
	});

    static sortBox; 
	static isDefaultStyle = true;
    static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-index';
		this.toolHandler.isInline = false;

        this.sortBox = new SortBox();

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: 'Ξ',
            className: `${this.#defaultStyle.id}-button`,
			title: 'align'
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else if(this.sortBox.sortBox.isConnected){
				this.sortBox.close();
			}else{
				this.sortBox.open();
                super.processingElementPosition(this.sortBox.sortBox, this.toolHandler.toolButton);
			}
		}

        this.sortBox.applyCallback = (event) => {
			this.toolHandler.toolButton.dataset.tool_status = 'active'
			this.sortBox.close();
		}

        document.addEventListener("scroll", () => {
			if(this.sortBox.sortBox.isConnected){
				this.toolHandler.processingPalettePosition(this.sortBox.sortBox);
			}
		});
        window.addEventListener('resize', (event) => {
            if(this.sortBox.sortBox.isConnected){
                this.sortBox.open();
                super.processingElementPosition(this.sortBox.sortBox, this.toolHandler.toolButton);
            }
		})

		super.outClickElementListener(this.sortBox.sortBox, ({oldEvent, newEvent, isMouseOut})=>{
			if(isMouseOut && this.sortBox.sortBox.isConnected && ! super.isMouseInnerElement(this.toolHandler.toolButton)){
				this.sortBox.close();
			}
		})
	}
    static createDefaultStyle(){
		this.#defaultStyle.textContent = `
			.${this.#defaultStyle.id}-button{
				font-size: 0.8rem;
			}

            .${this.toolHandler.defaultClass} {
                display: block;
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

	constructor(dataset){
		super(Sort, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});

		if( ! dataset && Object.entries(this.dataset).length == 0){
            this.dataset.text_align = Sort.sortBox.selectedSort?.textContent;
        }
        this.style.textAlign = this.dataset.text_align;

		/*
		super.connectedAfterOnlyOneCallback = () => {
			this.dataset.index = Sort.toolHandler.connectedFriends.length;
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}else{
				nextLine.line.lookAtMe();
			}
		}

		super.disconnectedChildAfterCallback = (removedNodes) => {
			let nextLine = this.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				this.parentEditor.createLine();
			}
        }
		*/
	}

}