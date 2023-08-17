import Line from '../component/Line'

export default class FreeWiilHandler extends HTMLElement{
    static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor'
	});

    static #defaultClass = 'free-will-editor';

    static{
        let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.createDefaultStyle());
        }else{
            this.#defaultStyle = defaultStyle;
        }
    }

    static createDefaultStyle(){
		this.#defaultStyle.textContent = `
            .${this.defaultClass}{
                height: 100%;
                overflow: auto;
                overflow-wrap: anywhere;
                outline: none;
                background-color: white;
                padding-top: 0.6%;
                padding-left: 0.5%;
                padding-right: 0.8%;
                -ms-overflow-style: none;
                scrollbar-width: none;
                display: block;
            }
            .${this.#defaultClass}::-webkit-scrollbar {
                display: none;
            }

            .${this.#defaultClass} > :nth-child(1)::before{
                content: attr(data-placeholder);
                position: absolute;
                color: #d1d1d1;
                font-weight: 600;
                font-family: revert;
                cursor: text;
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

    static get defaultClass(){
        return this.#defaultClass;
    }

    static set defaultClass(defaultClass){
        this.#defaultClass = defaultClass;
    }

    constructor(){
        super()
        if(FreeWiilHandler.#defaultStyle.textContent != '' && FreeWiilHandler.#defaultStyle.textContent && FreeWiilHandler.#defaultStyle.hasAttribute('data-is_update') == false){
			FreeWiilHandler.createDefaultStyle();
			FreeWiilHandler.#defaultStyle.toggleAttribute('data-is_update');
		}
        this.classList.add('free-will-editor');
        this.addEventListener('keydown', (event) => {
            let key = event.key;
            /*
            switch (event.keyCode) {
                case 13: // Enter
                    this.editor.value = this.editor.value + "\n";
                    break;
                case 8: // Backspace
                    this.editor.value = this.editor.value.slice(0, -1);
                    break;
                case 46: // Delete
                    this.editor.value = this.editor.value.slice(0, this.editor.selectionStart) + this.editor.value.slice(this.editor.selectionEnd);
                    break;
                case 67: // Ctrl+C
                    var text = this.editor.value.slice(this.editor.selectionStart, this.editor.selectionEnd);
                    this.editor.value = this.editor.value.slice(0, this.editor.selectionStart) + this.editor.value.slice(this.editor.selectionEnd);
                    document.execCommand("copy");
                    break;
                case 86: // Ctrl+V
                    this.editor.value = this.editor.value.slice(0, this.editor.selectionStart) + document.queryCommandValue("copy") + this.editor.value.slice(this.editor.selectionEnd);
                    break;
                case 90: // Ctrl+Z
                    this.editor.value = this.editor.value.slice(0, this.editor.selectionStart) + this.editor.value.slice(this.editor.selectionEnd);
                    break;
                case 9: // Tab
                    this.editor.value = this.editor.value.slice(0, this.editor.selectionStart) + "    " + this.editor.value.slice(this.editor.selectionEnd);
                    break;
            }
            */
            if(key === 'Backspace'){
                /*
                this.getLineRange().then( ({startLine, endLine}) => {
                    if(startLine == endLine && this.isLineEmpty(startLine)){
                        console.log(222);
                    }
                })
                */
            }else if (event.altKey && event.key == "Enter") {

            }
            
        });

    }

    blockBackspaceEvent(event){
    }

    /**
     * 
     * @returns {Line}
     */
    createLine(){
        let line = new Line();
        this.append(line.lineElement);
        return line.lineElement;
    }

    getLineRange(selection = window.getSelection()){
        return new Promise(resolve => {
            let {anchorNode, focusNode} = selection; 
            let startAndEndLineObject;
            if(anchorNode == this){
                let allLine = [...this.children].filter(e=>e.classList.contains(`${Line.toolHandler.defaultClass}`))
                startAndEndLineObject = {
                    startLine : allLine[0],
                    endLine : allLine[allLine.length - 1]
                }
                let range = selection.getRangeAt(0);
                //selection.removeAllRanges();
                let endLineChildNodes = startAndEndLineObject.endLine.childNodes;
                range.setStart(startAndEndLineObject.startLine.childNodes[0], 0);
                range.setEnd(endLineChildNodes[endLineChildNodes.length - 1], endLineChildNodes[endLineChildNodes.length - 1].textContent.length);
                selection.addRange(range);
            }else{
                let anchorNodeLine = Line.getLine(anchorNode);
                let focusNodeLine = Line.getLine(focusNode);
                startAndEndLineObject = [...this.querySelectorAll(`.${Line.toolHandler.defaultClass}`)].reduce((obj,item,index)=>{
                    if(item == anchorNodeLine || item == focusNodeLine){
                        let key = 'startLine';
                        if(obj.hasOwnProperty(key)){
                            obj['endLine'] = item
                        }else{
                            obj[key] = item
                        }
                    }
                    return obj;
                },{})
            }
            resolve(startAndEndLineObject);
        })
    }

    isLineEmpty(line){
        return line.innerText.length == 0 || (line.innerText.length == 1 && (line.innerText == '\n' || line.innerText == '\u200B'));
    }

    isNextLineExist(element){
        let line = Line.getLine(element);

        let nextLine = line.nextElementSibling;
        if( ! nextLine){
            return false;
        }
        return Line.prototype.isPrototypeOf(nextLine.line);
    }

    /**
     * 
     * @param {HTMLElement} element 
     * @param {Object} param1 
     * @returns {HTMLElement}
     */
    getNextLine(element, {focus = false} = {}){
        let line = Line.getLine(element);
        if( ! line){
            return undefined;
        }
        
        let nextLine = line.nextElementSibling;
        if(nextLine && Line.prototype.isPrototypeOf(nextLine.line)){
            if(focus){
                nextLine.line.lookAtMe();
            }
            return nextLine;
        }
        return undefined;
    }
    
    /**
     * 
     * @param {HTMLElement} element 
     * @param {Object} param1 
     * @returns {HTMLElement}
     */
    getPrevLine(element, {focus = false} = {}){
        let line = Line.getLine(element);
        if( ! line){
            return undefined;
        }
        let nextLine = line.previousElementSibling;
        if(nextLine && Line.prototype.isPrototypeOf(nextLine.line)){
            if(focus){
                nextLine.line.lookAtMe();
            }
            return nextLine;
        }
        return undefined;
    }

    getLine(element){
        return Line.getLine(element);
    }

}