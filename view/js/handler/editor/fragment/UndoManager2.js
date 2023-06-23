import FreeWillEditor from "../FreeWillEditor";
import Line from '../component/Line'

//각 라인을 클로저로 이 클래스에서 옵저버 사용할 것
export default class UndoManager{
    #editor;
    #history = [];
    #historyIndex = 0;
    #UndoRedo = class UndoRedo{
        #html
        #time
        constructor(html){
            this.#html = html;
            this.#time = new Date().getTime();
        }
        get html(){
            return this.#html;
        }
        get time(){
            return this.#time;
        }
    }

    #isLastObserverType;
    #characterData = 'characterData';
    #childList = 'childList';
    #cursor = Object.assign(document.createElement('span'),{
        id:'free-will-editor-cursor'
    });
    #lastCursorPositionRect;
    /**
     * 
     * @param {FreeWillEditor} targetEditor 
     */
    //레인지를 저장해뒀다가 쓰기
    constructor(targetEditor){
        this.#editor = targetEditor;    

        let isFirst = true;
        let isWait = false;
        document.addEventListener("selectionchange", (event) => {
            if(document.activeElement !== this.#editor){
				return;
			}
            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            let newRect = range.getBoundingClientRect();
            if(this.#lastCursorPositionRect && (this.#lastCursorPositionRect.x != newRect.x || this.#lastCursorPositionRect.y != newRect.y)){
                range.insertNode(this.#cursor);
            }else if(isFirst){
                range.insertNode(this.#cursor);
                isFirst = false;
            }
            this.#lastCursorPositionRect = newRect;
           
        });

        let observer = new MutationObserver( (mutationList, observer) => {
            mutationList.forEach((mutation) => {
                console.log(this.#editor.getAttribute('is_key_down'));
                if(this.#editor.hasAttribute('is_key_down')){
                    this.#editor.removeAttribute('is-key_down');
                    return;
                }
                new Promise(resolve=>{
                    if(isWait){
                        resolve();
                        return;
                    }
                    let {addedNodes, removedNodes} = mutation;
                    if(document.activeElement !== this.#editor || isWait){
                        resolve()
                        return;
                    }else if(addedNodes.length == 1 && addedNodes[0] == this.#cursor){
                        resolve();
                        return;
                    }else if(addedNodes.length == 1 && addedNodes[0].id == this.#cursor.id && addedNodes[0] != this.#cursor){
                        this.#cursor.remove();
                        this.#cursor = addedNodes[0];
                    }
                    isWait = true;
                    let time = mutation.type == this.#childList ? 0 : 300
                    setTimeout(()=>{
                        let selection = window.getSelection();
                        let range = selection.getRangeAt(0);
                        let newRect = range.getBoundingClientRect();

                        this.#lastCursorPositionRect = newRect;
                        if(this.#history.length != 0){
                        //    console.log(this.#history[this.#history.length - 1].html.trim())
                        }
                        //console.log(this.#editor.innerHTML.trim())
                        
                        if(this.#history.length != 0 && this.#history[0].html.trim() == this.#editor.innerHTML.trim()){
                            console.log(111);
                            isWait = false;
                            resolve();
                            return;
                        }
                        let undoRedo = new this.#UndoRedo(this.#editor.innerHTML.trim());
                        this.#history.unshift(undoRedo);

                        isWait = false;
                    }, time);

                    resolve();
                });
            })
        })
		observer.observe(targetEditor, {
			characterData: true,
			characterDataOldValue: true,
			childList:true,
			subtree: true
		})

        this.#editor.onkeydown = (event) => {
            let {ctrlKey, key} = event;
            if( ! ctrlKey || (key != 'z' && key != 'y')){
                this.#editor.removeAttribute('is_key_down','')
                return;
            }
            isWait = true;
            event.preventDefault();
            //console.log(this.#history.map(e=>e.html));
            //console.log(this.#historyIndex);
            this.#editor.setAttribute('is_key_down','')
            if(key == 'z'){
                this.undoKeyEvent();
            }else{
                this.redoKeyEvent();
            }
            isWait = false;
        };

    }
    undoKeyEvent(){
        if(this.#history.length == 0){
            return;
        }
        this.#historyIndex += 1;
        if(this.#historyIndex > this.#history.length - 1){
            this.#historyIndex = this.#history.length - 1
        }
        let undoRedo = this.#history[this.#historyIndex];

        this.#editor.innerHTML = undoRedo.html;
    }
    redoKeyEvent(){
        if(this.#history.length == 0){
            return;
        }
        this.#historyIndex -= 1;
        if(this.#historyIndex < 0){
            this.#historyIndex = 0
        }
        let undoRedo = this.#history[this.#historyIndex];

        this.#editor.innerHTML = undoRedo.html;
    }
}