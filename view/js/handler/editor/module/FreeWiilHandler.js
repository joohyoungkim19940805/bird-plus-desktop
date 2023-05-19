import Line from '../component/Line'

export default class FreeWiilHandler extends HTMLDivElement{
    constructor(){
        super()
        this.addEventListener('keydown', (event) => {
            let key = event.key;
            if(key === 'Backspace'){
                /*
                this.getLineRange().then( ({startLine, endLine}) => {
                    if(startLine == endLine && this.isLineEmpty(startLine)){
                        console.log(222);
                        this.createLine();
                    }
                })
                */
            }else if (event.altKey && event.key == "Enter") {

            }
            
        });

    }

    blockBackspaceEvent(event){
        this.createLine();
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
                selection.removeAllRanges();
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

    getNextLine(element){
        let line = Line.getLine(element);

        let nextLine = line.nextElementSibling;
        if(nextLine && Line.prototype.isPrototypeOf(nextLine)){
            return nextLine;
        }
        return undefined;
    }
}