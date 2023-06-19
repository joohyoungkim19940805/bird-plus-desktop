import FreeWillEditor from "../FreeWillEditor";

export default class UndoManager{
    #editor;
    #dqueue = [];
    #cursor = this.#dqueue.length;

    /**
     * 
     * @param {FreeWillEditor} targetEditor 
     */
    constructor(targetEditor){
        this.#editor = targetEditor;
        document.addEventListener("selectionchange", (event) => {
            let selection = window.getSelection();
        });

        
    }
}