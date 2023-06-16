import FreedomInterface from "../module/FreedomInterface"
import ToolHandler from "../module/ToolHandler"
import SortBox from "../module/SortBox";

export default class Sort extends FreedomInterface {
    static toolHandler = new ToolHandler(this);
	
	static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-index-style'
	});

    static sortBox; 

    static{
		this.toolHandler.extendsElement = '';
		this.toolHandler.defaultClass = 'free-will-index';
		this.toolHandler.isInline = false;

        this.sortBox = new SortBox();

		this.toolHandler.toolButton = Object.assign(document.createElement('button'), {
            textContent: 'Ξ',
            className: `${this.#defaultStyle.id}-button`
        });

		this.toolHandler.toolButton.onclick = ()=>{
			if(this.toolHandler.toolButton.dataset.tool_status == 'active' || this.toolHandler.toolButton.dataset.tool_status == 'connected'){
				this.toolHandler.toolButton.dataset.tool_status = 'cancel';
			}else if(this.sortBox.sortBox.isConnected){
				this.sortBox.close();
			}else{
				this.sortBox.open();
                this.toolHandler.processingElementPosition(this.sortBox.sortBox);
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
                this.toolHandler.processingElementPosition(this.sortBox.sortBox);
            }
		})

		super.outClickElementListener(this.sortBox.sortBox, ({oldEvent, newEvent, isMouseOut})=>{
			if(isMouseOut && this.sortBox.sortBox.isConnected && ! super.isMouseInnerElement(this.toolHandler.toolButton)){
				this.sortBox.close();
			}
		})

		let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.createDefaultStyle());
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
		super(Sort, dataset, {deleteOption : FreedomInterface.DeleteOption.EMPTY_CONTENT_IS_NOT_DELETE});
		if(Sort.defaultStyle.textContent != '' && Sort.defaultStyle.textContent && Sort.defaultStyle.hasAttribute('data-is_update') == false){
			Sort.createDefaultStyle();
			Sort.defaultStyle.toggleAttribute('data-is_update');
		}
        if( ! dataset){
            this.dataset.text_align = Sort.sortBox.selectedSort?.textContent;
        }
        this.style.textAlign = this.dataset.text_align;

		super.connectedAfterOnlyOneCallback = () => {
			this.dataset.index = Sort.toolHandler.connectedFriends.length;
			let nextLine = Sort.toolHandler.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				Sort.toolHandler.parentEditor.createLine();
			}else{
				nextLine.lookAtMe();
			}
		}
		
		super.connectedChildAfterCallBack = (addedNodes, onlyLineNodes) => {
			let lastItemIndex = undefined;
			addedNodes.forEach((e, i)=>{
				if(e != onlyLineNodes[i]){
					let line = Sort.toolHandler.parentEditor.createLine();
					line.replaceChildren(e);
					this.append(line);
					line.lookAtMe();
					if(i == addedNodes.length - 1){
						lastItemIndex = i;
					}
				}
			});
			if( ! lastItemIndex && addedNodes[addedNodes.length - 1] == onlyLineNodes[onlyLineNodes.length - 1] && onlyLineNodes[onlyLineNodes.length - 1].lookAtMe){
				onlyLineNodes[onlyLineNodes.length - 1].lookAtMe();
			}else if(lastItemIndex && addedNodes[i].lookAtMe){
				addedNodes[i].lookAtMe();
			}
		}

		super.disconnectedChildAfterCallBack = (removedNodes) => {
			let nextLine = Sort.toolHandler.parentEditor.getNextLine(this.parentLine);
			if( ! nextLine){
				Sort.toolHandler.parentEditor.createLine();
			}
        }

	}

}