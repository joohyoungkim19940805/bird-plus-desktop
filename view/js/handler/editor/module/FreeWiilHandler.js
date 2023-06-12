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
                disply: block;
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

    createLine(){
        let line = new Line();
        this.append(line);
        return line;
    }

    getLineRange(selection = window.getSelection()){
        return new Promise(resolve => {
            let {anchorNode, focusNode} = selection; 
            let startAndEndLineObject;
            if(anchorNode == this){
                let allLine = this.querySelectorAll(`.${Line.toolHandler.defaultClass}`)
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
                console.log(startAndEndLineObject)
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
            console.log(startAndEndLineObject)
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
        return Line.prototype.isPrototypeOf(nextLine);
    }

    getNextLine(element, {focus = true} = {}){
        let line = Line.getLine(element);
        if( ! line){
            return undefined;
        }
        
        let nextLine = line.nextElementSibling;
        if(nextLine && Line.prototype.isPrototypeOf(nextLine)){
            if(focus){
                nextLine.lookAtMe();
            }
            return nextLine;
        }
        return undefined;
    }

    getLine(element){
        return Line.getLine(element);
    }

}