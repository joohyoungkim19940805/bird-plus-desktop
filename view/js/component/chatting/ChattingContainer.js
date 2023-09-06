import chattingHead from './chatting_item/ChattingHead'

export default class ChattingContainer{
    
    #contentWrapperList

    constructor(contentWrapper){
        if( ! contentWrapper){
            throw new Error('contentWrapper');
        }

        chattingHead.element.dataset.is_resize = true;
        chattingHead.element.dataset.grow = 0.31;

        this.#contentWrapperList = [chattingHead.element];
        console.log( this.#contentWrapperList );
        contentWrapper.prepend(...this.#contentWrapperList);
    }
    
}