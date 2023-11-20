export default class ImageController{

    #applyCallback = () => {};

    #originImage;

    #canvas = Object.assign(document.createElement('canvas'),{

    });

    #editorBox = Object.assign(document.createElement('div'),{
        className: 'image-editor-box',
        innerHTML: `
        <div class="image-editor-container" data-bind_name="imageEditorContainer">
            <div class="top-menu-wrapper" data-bind_name="top-menu-wrapper">
                <div class="title-array" data-bind_name="titleArray">
                    <span class="title" data-bind_name="title"></span>
                </div>
                <div class="top-menu-array" data-bind_name="topMenuArray">
                    <button type="button" class="top-menu-download" data-bind_name="download">DOWNLOAD</button>
                    <button type="button" class="top-menu-apply" data-bind_name>APPLY</button>
                    <button type="button" class="top-menu-close">CLOSE</button>
                </div>
            </div>
            <div class="body-content-array" data-bind_name="bodyContentArray">
                <div class="lnb-mode-menu-array" data-bind_name="lnbModeMenuArray"></div>
                <div class="main-content-array" data-bind_name="mainContentArray">
                    
                </div>
                
            </div>
            <div>
            </div>
        </div>
        `
    });

    #bindElementMap = (() => {
        return ;
    })();

    constructor(targetImage){
        this.#originImage = targetImage;
    }

    open(){
        
    }

    set applyCallback(applyCallback){
        this.#applyCallback = applyCallback;
    }

    get applyCallback(){
        return this.#applyCallback;
    }
}