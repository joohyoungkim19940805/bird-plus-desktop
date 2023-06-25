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

        this.addCursorMove();
        this.addUndoKey();
        this.addUserInput();

    }

    addCursorMove(){
        /*
        let isFirst = true;
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
        */
    }

    addUndoKey(){
        this.#editor.addEventListener('keydown', (event) => {
            let {ctrlKey, key} = event;
            if( ! ctrlKey || (key != 'z' && key != 'y')){
                return;
            }
            event.preventDefault();

            if(key == 'z'){
                this.undoKeyEvent();
                console.log(this.#history);
                console.log(this.#historyIndex);
            }else{
                this.redoKeyEvent();
                console.log(this.#history);
                console.log(this.#historyIndex);
            }
        })

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

    addUserInput(){
        
        let isWait = false;
        let isUndoSwitch = false;
        this.#editor.addEventListener('keydown', (event) => {
            let {ctrlKey, key} = event;
            if(ctrlKey && (key == 'z' || key == 'y')){
                return;
            }
            if(isWait){
                return;
            }
            isWait = true;
            isUndoSwitch = true;
            let timer = 50;
            
            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            let newRect = range.getBoundingClientRect();
            this.#lastCursorPositionRect = newRect;

            if(this.#history.length != 0 && this.#history[0].html.trim() == this.#editor.innerHTML.trim()){
                isWait = false;
                return;
            }
            
            setTimeout(()=>{


                let undoRedo = new this.#UndoRedo(this.#editor.innerHTML.trim());
                this.#history.unshift(undoRedo);

                isWait = false;
            }, timer);
        });

        let addElementObserver = new MutationObserver( (mutationList, observer) => {
            mutationList.forEach((mutation) => {
                let {addedNodes, removedNodes} = mutation;

                if(isUndoSwitch){
                    isUndoSwitch = false;
                    //return;
                }

                new Promise(resolve=>{
                    addedNodes.forEach(node=>{
                        if(node.nodeType != Node.ELEMENT_NODE){
                            return;
                        }
                        let tagName = node.tagName.toLowerCase();
                        if(this.#editor.tools.hasOwnProperty(tagName) && this.#history.length != 0 && this.#history[0].html.trim() != this.#editor.innerHTML.trim()){
                            let undoRedo = new this.#UndoRedo(this.#editor.innerHTML.trim());
                            this.#history.unshift(undoRedo);
                        }
                    });
                    resolve();
                })
                /*
                new Promise(resolve=>{
                    removedNodes.forEach(node=>{
                        if(node.nodeType != Node.ELEMENT_NODE){
                            return;
                        }
                        let tagName = node.tagName.toLowerCase();
                        if(this.#editor.tools.hasOwnProperty(tagName) && this.#history.length != 0 && this.#history[0].html.trim() != this.#editor.innerHTML.trim()){
                            console.log(777)
                            let undoRedo = new this.#UndoRedo(this.#editor.innerHTML.trim());
                            this.#history.unshift(undoRedo);
                        }
                    });
                    resolve();
                })
                */
            });
        })
        addElementObserver.observe(this.#editor, {
			childList:true,
			subtree: true
		});

        /*
        let cursorRedoObserver = new MutationObserver( (mutationList, observer) => {
            mutationList.forEach((mutation) => {
                let {addedNodes, removedNodes} = mutation;
                if(addedNodes.length == 1 && addedNodes[0].id == this.#cursor.id && addedNodes[0] != this.#cursor){
                    this.#cursor.remove();
                    this.#cursor = addedNodes[0];
                }
            });
        })
        cursorRedoObserver.observe(this.#editor, {
            characterData: true,
			characterDataOldValue: true,
			childList:true,
			subtree: true
		});
        */
    }
}