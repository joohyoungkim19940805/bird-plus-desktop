import chattingHead from './chatting_item/ChattingHead'
import chattingInfo from './chatting_item/ChattingInfo';
import chattingRegist from './chatting_item/ChattingRegist';
export default new class ChattingContainer{
    
    #contentList;
    #wrap = (() => {
        let wrap = Object.assign(document.createElement('div'), {
            id:'chatting_wrapper',
            innerHTML: '<div class="content"></div>'
        });
        wrap.dataset.is_resize = true;
        return wrap;
    })();
    #container = (()=>{
        let chattingContainer = Object.assign(document.createElement('flex-layout'), {
            
        });
        chattingContainer.dataset.direction = 'column';
        return chattingContainer;
    })();
    constructor(){
        chattingHead.element.dataset.is_resize = true;
        chattingHead.element.dataset.grow = 0.32;

        chattingInfo.element.dataset.is_resize = true;

        chattingRegist.element.dataset.is_resize = true;
        chattingRegist.element.dataset.grow = 0.9;
        chattingRegist.element.style.minHeight = '30px';

        this.#contentList = [chattingHead.element, chattingInfo.element, chattingRegist.element];

        this.#container.replaceChildren(...this.#contentList);
        this.#wrap.querySelector('.content').append(this.#container);
    }
    
    get container(){
        return this.#container;
    }

    get wrap(){
        return this.#wrap;
    }

}()