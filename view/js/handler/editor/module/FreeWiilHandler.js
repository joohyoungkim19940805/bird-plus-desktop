import Line from '../component/Line'

export default class FreeWiilHandler extends HTMLElement{
    static #defaultStyle = Object.assign(document.createElement('style'), {
		id: 'free-will-editor'
	});

    static #defaultClass = 'free-will-editor';

    static createDefaultStyle(){
        let defaultStyle = document.querySelector(`#${this.#defaultStyle.id}`);
        if(! defaultStyle){
            document.head.append(this.#defaultStyle);
        }else{
            this.#defaultStyle = defaultStyle;
        }
		this.#defaultStyle.textContent = `
            .${this.defaultClass}{
                height: inherit;
                overflow: auto;
                overflow-wrap: anywhere;
                outline: none;
                background-color: inherit;
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

    constructor({isDefaultStyle = true} = {}){
        super()
        this.classList.add('free-will-editor');

    }

    blockBackspaceEvent(event){
    }

    /**
     * 
     * @returns {HTMLDivElement}
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
                //console.log(111)
                let allLine = [...this.children].filter(e=>e.classList.contains(`${Line.toolHandler.defaultClass}`))
                startAndEndLineObject = {
                    startLine : allLine[0],
                    endLine : allLine.at(-1)
                }
                let range = selection.getRangeAt(0);
                //selection.removeAllRanges();
                let endLineChildNodes = [...startAndEndLineObject.endLine.childNodes].at(-1);
                range.setStart(startAndEndLineObject.startLine.childNodes[0], 1);
                range.setEnd(endLineChildNodes, endLineChildNodes.nodeType == Node.TEXT_NODE ? endLineChildNodes.textContent.length : startAndEndLineObject.endLine.childNodes.length);
                selection.addRange(range);
            }else{
                //console.log(222)
                let anchorNodeLine = Line.getLine(anchorNode);
                let focusNodeLine = Line.getLine(focusNode);
                if(anchorNodeLine == focusNodeLine){
                    //console.log(333)
                    resolve({
                        startLine: anchorNodeLine,
                        endLine: focusNodeLine
                    })
                    return;
                }
                //console.log(4444, anchorNodeLine , focusNodeLine);
                startAndEndLineObject = {startLine : anchorNodeLine, endLine : focusNodeLine};
                /*startAndEndLineObject = [...this.querySelectorAll(`.${Line.toolHandler.defaultClass}`)].reduce((obj,item,index)=>{
                    if(item == anchorNodeLine || item == focusNodeLine){
                        let key = 'startLine';
                        if(obj.hasOwnProperty(key)){
                            obj['endLine'] = item
                        }else{
                            obj[key] = item
                        }
                    }
                    return obj;
                },{})*/
            }
            resolve(startAndEndLineObject);
        })
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