import chattingHead from './chatting_item/ChattingHead'
import chattingInfo from './chatting_item/ChattingInfo';
export default class ChattingContainer{
    
    #contentWrapperList

    constructor(contentWrapper){
        if( ! contentWrapper){
            throw new Error('contentWrapper');
        }

        chattingHead.element.dataset.is_resize = true;
        chattingHead.element.dataset.grow = 0.378;

        chattingInfo.element.dataset.is_resize = true;

        this.#contentWrapperList = [chattingHead.element, chattingInfo.element];
        
        console.log( this.#contentWrapperList );
        
        contentWrapper.prepend(...this.#contentWrapperList);
    }
    
}