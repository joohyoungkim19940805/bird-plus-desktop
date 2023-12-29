import {chattingHead} from './chatting_item/ChattingHead'
import {chattingInfo} from './chatting_item/ChattingInfo';
import {chattingRegist} from './chatting_item/ChattingRegist';
import {roomHandler} from "@handler/room/RoomHandler";

import SimpleSvgPipMode from '@component/SimpleSvgPipMode';

export const chattingContainer = new class ChattingContainer{
    
    #contentList;
    #wrap = (() => {
        let wrap = Object.assign(document.createElement('div'), {
            id:'chatting_wrapper',
            innerHTML: '<div class="content"></div>'
        });
        wrap.dataset.is_resize = true;

        let simpleSvgPipMode = new SimpleSvgPipMode({target : wrap, zoom: 15});

        wrap._visibilityChangeCallback = (visibilityStatus) => {
            if(visibilityStatus == 'h'){
                let cloneWrap = simpleSvgPipMode.open();
                cloneWrap.dataset.grow = 1;
                cloneWrap.style.flex = '1 1 0%'
            }else {
                simpleSvgPipMode.close();
            }
        }
        simpleSvgPipMode.onSvgClickCallback = (event) => {
            wrap.dataset.prev_grow = 2.3;
            wrap.closest('flex-layout').openFlex(wrap,{isPrevSizeOpen: true})
        }
        roomHandler.addRoomIdChangeListener = {
            name : 'chattingContainer',
            callBack : () => {
                if( ! simpleSvgPipMode.svg?.isConnected){
                    return;
                }
                roomHandler.roomChangeAwait.then(()=>{
                    setTimeout(()=>{
                        let cloneWrap = simpleSvgPipMode.open();
                        cloneWrap.dataset.grow = 1;
                        cloneWrap.style.flex = '1 1 0%'
                    },1500)
                })
  
            },
            runTheFirst: false
        }
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
        chattingHead.element.dataset.grow = 0.4;
        //chattingHead.element.dataset.prev_grow = 0.4;
        chattingHead.element.style.minHeight = '30px';


        chattingInfo.element.dataset.is_resize = true;
        //chattingInfo.element.dataset.prev_grow = 2
        chattingInfo.element.style.minHeight = '30px';

        chattingRegist.element.dataset.is_resize = true;
        chattingRegist.element.dataset.grow = 0.9;
        //chattingRegist.element.dataset.prev_grow = 0.9;        
        chattingRegist.element.style.minHeight = '30px';

        this.#contentList = [chattingHead.element, chattingInfo.element, chattingRegist.element];

        this.#container.replaceChildren(...this.#contentList);
        this.#wrap.querySelector('.content').append(this.#container);

        /*        
        [chattingHead.element].forEach((e,i)=>{
            let simpleSvgPipMode = new SimpleSvgPipMode({target : e, zoom : 30});
            e._visibilityChangeCallback = (visibilityStatus) => {
                if(visibilityStatus == 'h'){
                    let cloneWrap = simpleSvgPipMode.open();
                    cloneWrap.dataset.grow = 1;
                    cloneWrap.style.flex = '1 1 0%'
                }else{
                    simpleSvgPipMode.close();
                }
                simpleSvgPipMode.onSvgClickCallback = (event) => {
                    e.dataset.grow = e.dataset.prev_grow;
                    //this.#container.openFlex(e, {isPrevSizeOpen}).then(()=>{
                       
                    //})
                }
            }
        })
        */
    }
    
    get container(){
        return this.#container;
    }

    get wrap(){
        return this.#wrap;
    }

}()