export default class FontBox {
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
    
        this.#fontElementList = this.#fontList.map(fontFamily=>{
            let div = Object.assign(document.createElement('div'),{
                className: 'font-item',
            });
            if(this.#sampleText.nodeType && this.#sampleText.nodeType == Node.ELEMENT_NODE){
                div.innerHTML = this.#sampleText.innerHTML;
            }else{
                div.textContent = this.#sampleText;
            }
            div.style.fontFamily = fontFamily;
        });

        this.#fontBoxContainer.replaceChildren(this.#fontElementList);
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
}