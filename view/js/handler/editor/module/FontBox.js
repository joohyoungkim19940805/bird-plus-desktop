export default class FontBox {
    
    #style = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-palette'
	});

    #paletteVw = 20;

    #fontList = [];
    #fontBox = Object.assign(document.createElement('div'), {
        className: 'font-box-wrap',
    })
    #fontBoxContainer = Object.assign(document.createElement('div'), {
        className: 'font-box-container'
    })
    /*
    #searchInputText = Object.assign(document.createElement('input'), {
        autocomplete: 'off',
        placeholder: 'search font',
        type: 'text',
        name: 'font-box-search',
        className: 'font-box-search'
    })
    */
    #fontElementList = [];
    #lastSelectedItem;

    #defaultSampleText = '가나 다라 ab cd'
    #sampleText = this.#defaultSampleText;

    #applyCallback = () => {}

    constructor(fontList){
        if( ! fontList){
            throw new Error('fontList is undefined');
        }
        this.#fontList = fontList;

        let style = document.querySelector(`#${this.#style.id}`);
        if(! style){
            document.head.append(this.createStyle());
        }else{
            this.#style = style;
        }

        /*
        let searchWrap = Object.assign(document.createElement('div'),{
            className: 'font-box-search-wrap'
        });
        searchWrap.append(this.#searchInputText);
        
        this.#fontBox.append(searchWrap, this.#fontBoxContainer);
        */
        this.#fontBox.append(this.#fontBoxContainer);

    }

    searchInputTextEvent(event){
        
    }

    addFontItemEvent(item){
        return new Promise(resolve => {
            item.onclick = (event) => {
                this.applyCallback(event);
            }
            resolve();
        })
    }

    #createFontElementList(sampleText){
        return new Promise(resolve=> {
        this.#fontElementList = this.#fontList.map(fontFamily=>{
            let div = Object.assign(document.createElement('div'),{
                className: 'font-item',
            });
            if(sampleText.nodeType && sampleText.nodeType == Node.ELEMENT_NODE){
                div.innerHTML = sampleText.innerHTML;
            }else{
                div.textContent = sampleText;
            }
            div.style.fontFamily = fontFamily;
            return div;
        });
            resolve(this.#fontElementList);
        })
    }

    open(){
        let selection = window.getSelection();
        if(selection.rangeCount != 0 && selection.isCollapsed == false){
            let range = selection.getRangeAt(0)
            let aticle = document.createElement('aticle');
            let rangeClone = range.cloneContents();
            aticle.append(rangeClone);
            this.#sampleText = aticle;
        }
        this.#sampleText = this.#sampleText == '' ? this.#defaultSampleText : this.#sampleText;
    
        this.#createFontElementList(this.#sampleText).then(fontElementList => {
            this.#fontBoxContainer.replaceChildren(fontElementList);
        });

        document.body.append(this.#fontBox);
    }
    close(){
        this.#fontBox.remove();
    }

    set applyCallback(applyCallback){
        this.#applyCallback = applyCallback;
    }

    get applyCallback(){
        return this.#applyCallback;
    }

    get fontBox(){
        return this.#fontBox;
    }

    createStyle(){
        this.#style.textContent = `
            .font-box-wrap{
                background: #000000bf;
                position: fixed;
				padding: 0.9%;
				width: ${this.#paletteVw}vw;
				height: fit-content;
				color: white;
				font-size: 13px;
				min-width: 300px;
				-webkit-user-select:none;
				-moz-user-select:none;
				-ms-user-select:none;
				user-select:none
            }
        `
    }
}