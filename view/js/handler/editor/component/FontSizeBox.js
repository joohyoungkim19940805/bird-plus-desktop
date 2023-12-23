export default class FontSizeBox {
    
    #style = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-font-size-box'
	});

    #fontSizeBoxVw = 30;

    #min
    
    #max

    #fontSizeBox = Object.assign(document.createElement('div'), {
        className: 'font-size-wrap',
    })
    #fontSizeBoxContainer = Object.assign(document.createElement('ul'), {
        className: 'font-size-container'
    })
    
    #searchInputText = Object.assign(document.createElement('input'), {
        autocomplete: 'off',
        placeholder: 'searching your font size',
        type: 'number',
        name: 'font-size-search',
        className: 'font-size-search',
        oninput: (event) => this.#searchInputTextEvent(event),
        onkeyup: (event) => {
            if(event.key == 'Enter' && this.#searchInputText.value != ''){
                let item = this.#fontSizeBoxContainer.querySelector(`[data-size="${this.#searchInputText.value}"]`);
                this.#apply(item, event);
            }
        },
    })

    #selectedFont;

    #defaultSampleText = '가나 다라 ab cd'
    #sampleText = this.#defaultSampleText;

    #applyCallback = () => {}

    #lastSelectionRange;

    constructor({min, max}){
        if( ! min || ! max){
            throw new Error('font size is undefined');
        }
        this.#min = min;
        this.#max = max;

        let style = document.querySelector(`#${this.#style.id}`);
        if(! style){
            document.head.append(this.createStyle());
        }else{
            this.#style = style;
        }

        
        let searchWrap = Object.assign(document.createElement('div'),{
            className: 'font-size-search-wrap'
        });
        searchWrap.append(this.#searchInputText);
        
        this.#fontSizeBox.append(searchWrap, this.#fontSizeBoxContainer);
        
        this.#fontSizeBox.append(this.#fontSizeBoxContainer);

    }

    #searchInputTextEvent(event){
        let number = Number(this.#searchInputText.value);
        if( ! this.#searchInputText.value || this.#searchInputText.value == '') {     
            this.#createFontElementList(this.#sampleText).then(fontElementList => {
                this.#fontSizeBoxContainer.replaceChildren(...fontElementList);
            });
            return;
        }else if(isNaN(number) || this.#min > number || this.#max < number){
            this.#fontSizeBoxContainer.replaceChildren();
            return;
        }

        let li = Object.assign(document.createElement('li'),{
            className: 'font-size-item',
        });
        if(this.#sampleText.nodeType && this.#sampleText.nodeType == Node.ELEMENT_NODE){
            li.innerHTML = this.#sampleText.innerHTML;
        }else{
            li.textContent = this.#sampleText;
        }
        li.style.fontSize = number + 'px';
        li.dataset.size = number;
        this.#addFontItemEvent(li);
        this.#fontSizeBoxContainer.replaceChildren(li);
        this.#searchInputText.focus();
    }

    #addFontItemEvent(item){
        return new Promise(res=>{
            item.onclick = (event) => this.#apply(item, event);
            res(item);
        });
    }

    #apply(item, event){
        this.#selectedFont = item;
        if(this.#lastSelectionRange){
            let selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.#lastSelectionRange);
        }
        this.applyCallback(event);
    }

    #createFontElementList(sampleText){
        return new Promise(resolve=> {
            let list = [];
            for(let i = this.#min, len = this.#max + 1 ; i < len ; i += 1){
                let li = Object.assign(document.createElement('li'),{
                    className: 'font-size-item',
                });
                if(sampleText.nodeType && sampleText.nodeType == Node.ELEMENT_NODE){
                    li.innerHTML = sampleText.innerHTML;
                }else{
                    li.textContent = sampleText;
                }
                li.style.fontSize = i + 'px';
                this.#addFontItemEvent(li);
                list.push(li);
            }
            resolve(list);
        })
    }

    async open(){
        let selection = window.getSelection();
        if(selection.rangeCount != 0 && selection.isCollapsed == false){
            let range = selection.getRangeAt(0);
            this.#lastSelectionRange = range.cloneRange();
            let aticle = document.createElement('aticle');
            let rangeCloneContent = range.cloneContents();
            aticle.append(rangeCloneContent);
            this.#sampleText = aticle;
        }
        this.#sampleText = this.#sampleText == '' ? this.#defaultSampleText : this.#sampleText;
    
        document.body.append(this.#fontSizeBox);

        return await this.#createFontElementList(this.#sampleText).then(fontElementList => {
            this.#fontSizeBoxContainer.replaceChildren(...fontElementList);
            return this.#fontSizeBoxContainer;
        });
    }

    close(){
        this.#fontSizeBox.remove();
    }

    set applyCallback(applyCallback){
        this.#applyCallback = applyCallback;
    }

    get applyCallback(){
        return this.#applyCallback;
    }

    get fontSizeBox(){
        return this.#fontSizeBox;
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
            .font-size-wrap{
                background: #000000bf;
                position: fixed;
				padding: 0.9%;
				width: ${this.#fontSizeBoxVw}vw;
				height: 25vh;
				color: white;
                min-width: 200px;
                overflow-y: auto;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                overflow-x: hidden;
                z-index: 999;
            }

            .font-size-wrap .font-size-search-wrap{
                margin-bottom: 2%;
                overflow-x: hidden;
            }
            .font-size-wrap .font-size-search-wrap [name="font-size-search"]{
                outline: none;
                -moz-appearance: textfield;
            }
            .font-size-wrap .font-size-search-wrap [name="font-size-search"]::-webkit-outer-spin-button,
            .font-size-wrap .font-size-search-wrap [name="font-size-search"]::-webkit-inner-spin-button{
                -webkit-appearance: none;
                margin: 0;
            }

            .font-size-wrap .font-size-container{
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
            .font-size-wrap .font-size-container .font-size-item{
                margin-bottom: 1%;
                transition: all 0.5s;
                overflow-x: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            .font-size-wrap .font-size-container .font-size-item:hover{
                background-color: #666666;
                cursor: pointer;
                background-color: #666666;
                padding: 2px 0 3px 0;
            }

        `
        return this.#style;
    }
}