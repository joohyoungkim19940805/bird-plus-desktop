
export default class SimpleSvgPipMode{
    
    #svg = Object.assign(document.createElement('svg'), {
        className: 'pointer',
        innerHTML : `
            <foreignObject  width="100%" height="100%" stlye="position:relative;">
                <div style="position:absolute; width:100%; height:100%; background-color: rgba(0,0,0,0); z-index:9000"></div>
                <main></main>
            </foreignObject>
        `
    });

    #onSvgClickCallback = () => {}

    #target;
    #zoom;

    /**
     * 
     * @param {target = HTMLElement, zoom = number} param0 
     */
    constructor({
        target,
        zoom = 15
    }){

        if( ! this.#isElement(target)){
            throw new Error('target is not element');
        }
        this.#target = target;
        this.#zoom = parseFloat(zoom);
        if(isNaN(this.#zoom)){
            throw new Error('zoom is not number');
        }
        this.#svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        this.#svg.dataset.is_not_visible_target = '';
        this.#hiddenStyle(this.#svg);

        this.#svg.onclick = (event) => {
            this.onSvgClickCallback(event);
        }
    }

    #hiddenStyle(svg){
        Object.assign(svg.style, {
            backgroundColor: 'rgba(0, 0, 0, 0)', position: 'absolute', visibility: 'hidden', 
            opacity: '0', zIndex : -1, userSelect: 'none'
        })
    }

    open(){
        let clone = this.#target.cloneNode(true);
        new Promise(resolve => {
            document.body.append(this.#svg);
            this.#svg.querySelector('foreignObject > main').replaceChildren(clone);
            let targetRect = this.#target.getBoundingClientRect();
            let appendAwait = setInterval(()=>{
                if( ! this.#svg.isConnected){
                    return;
                }
                clearInterval(appendAwait);
                Object.assign(this.#svg.style, {
                    top: ( targetRect.top * (100 / this.#zoom)) + (this.#svg.clientHeight) + 'px',
                    left: ( targetRect.left * (100 / this.#zoom) ) - this.#svg.clientWidth + 'px',
                    zIndex : 1000,
                    zoom : this.#zoom + '%',
                    visibility: '',
                    opacity: '',
                    backgroundColor: 'white'
                })
                
            }, 50)
            resolve();
        });
        return clone;
    }

    close(){
        this.#hiddenStyle(this.#svg);
        this.#svg.remove();
    }

    #isElement(targetObject){
        let check = Object.getPrototypeOf(targetObject)
        let isElement = false;
        while(check != undefined){
            isElement = check instanceof HTMLElement
            if(isElement){
                break;
            }
            check = Object.getPrototypeOf(check);

        }
        return isElement;
    }

    set onSvgClickCallback(callback){
        this.#onSvgClickCallback = callback;
    }
    get onSvgClickCallback(){
        return this.#onSvgClickCallback;
    }
    get svg(){
        return this.#svg;
    }
} 