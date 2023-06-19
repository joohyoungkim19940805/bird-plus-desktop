import FreeWillEditor from "../FreeWillEditor";
import Line from '../component/Line'

//각 라인을 클로저로 이 클래스에서 옵저버 사용할 것
export default class UndoManager{
    #editor;
    #lines = [];
    #linsMapper = {};
    #cursor = this.#lines.length;

    /**
     * 
     * @param {FreeWillEditor} targetEditor 
     */
    constructor(targetEditor){
        this.#editor = targetEditor;

        let observer = new MutationObserver( (mutationList, observer) => {
            mutationList.forEach((mutation) => {
                new Promise(resolve=>{
                    let {addedNodes, removedNodes} = mutation;
                    let selection = window.getSelection();
                    let list = [...addedNodes].map((e,i)=>{
                        if( ! Line.prototype.isPrototypeOf(e)){
                            let line = targetEditor.createLine();
                            line.replaceChildren(e);
                            this.append(line);
                            if( i == addedNodes.length - 1){
                                lastItemIndex = i;
                            }
                            return line;
                        }
                        return e;
                    });
                    // 2023 06 19
                    // quque같은 서식은 기존에 위치한 line이 서식의 자식요소로 빠지므로 lines객체에서 뺴야 함 
                    this.#lines.push(...list);
                    console.log(this.#lines);
                });
            })
        })
        observer.observe(targetEditor, {childList:true});
        
        document.addEventListener("selectionchange", (event) => {
            if(document.activeElement !== targetEditor){
				return;
			}
            let selection = window.getSelection();
        });

    }

    #getFoucsLine
}