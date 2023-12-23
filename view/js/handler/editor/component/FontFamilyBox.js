export default class FontFamilyBox {
    
    #style = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-font-family-box'
	});

    #fontFamilyBoxVw = 20;

    #fontList = [];
    #fontFamilyBox = Object.assign(document.createElement('div'), {
        className: 'font-box-wrap',
    })
    #fontFamilyBoxContainer = Object.assign(document.createElement('ul'), {
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
    #selectedFont;

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
        
        this.#fontFamilyBox.append(searchWrap, this.#fontFamilyBoxContainer);
        */
        this.#fontFamilyBox.append(this.#fontFamilyBoxContainer);

    }

    searchInputTextEvent(event){
        
    }

    #addFontItemEvent(item){
        return new Promise(res=>{
            item.onclick = (event) => {
                this.#selectedFont = item;
                this.applyCallback(event);
            }
            res(item);
        })
    }

    #createFontElementList(sampleText){
        return new Promise(resolve=> {
            const createFontItem = () => {
                let li = Object.assign(document.createElement('li'),{
                    className: 'font-family-item',
                });
                if(sampleText.nodeType && sampleText.nodeType == Node.ELEMENT_NODE){
                    li.innerHTML = sampleText.innerHTML;
                }else{
                    li.textContent = sampleText;
                }
                this.#addFontItemEvent(li)
                return li;
            }
            this.#fontElementList = this.#fontList.map(fontFamily=>{
                let li = createFontItem();
                li.style.fontFamily = fontFamily;
                return li;
            });

            let defaultFont = createFontItem();
            this.#fontElementList.push(defaultFont)

            resolve(this.#fontElementList);
        })
    }

    async open(){
        let selection = window.getSelection();
        if(selection.rangeCount != 0 && selection.isCollapsed == false){
            let range = selection.getRangeAt(0)
            let aticle = document.createElement('aticle');
            let rangeClone = range.cloneContents();
            aticle.append(rangeClone);
            this.#sampleText = aticle;
        }
        this.#sampleText = this.#sampleText == '' ? this.#defaultSampleText : this.#sampleText;
    
        document.body.append(this.#fontFamilyBox);

        return await this.#createFontElementList(this.#sampleText).then(fontElementList => {
            this.#fontFamilyBoxContainer.replaceChildren(...fontElementList);
            return this.#fontFamilyBoxContainer;
        });
        
    }
    close(){
        this.#fontFamilyBox.remove();
    }

    set applyCallback(applyCallback){
        this.#applyCallback = applyCallback;
    }

    get applyCallback(){
        return this.#applyCallback;
    }

    get fontFamilyBox(){
        return this.#fontFamilyBox;
    }

    get selectedFont(){
        return this.#selectedFont;
    }

	get style(){
		return this.#style;
	}

	set style(style){
        this.#style.textContent = style;
    }

	set insertStyle(style){
		this.#style.sheet.insertRule(style);
	}


    createStyle(){
        this.#style.textContent = `
            .font-box-wrap{
                background: #000000bf;
                position: fixed;
				padding: 0.9%;
				width: ${this.#fontFamilyBoxVw}vw;
                height: 25vh;
				color: white;
				font-size: 13px;
				min-width: 300px;
                overflow-y: auto;
				-webkit-user-select:none;
				-moz-user-select:none;
				-ms-user-select:none;
				user-select:none;
                z-index: 999;
            }
            .font-box-wrap .font-box-container{
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
            .font-box-wrap .font-family-item{
                margin-bottom: 1%;
            }
            .font-box-wrap .font-family-item:hover{
                background-color: #747474;
                cursor: pointer;
            }

        `
        return this.#style;
    }
}