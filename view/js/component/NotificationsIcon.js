export default class NotificationsIcon{
    static PositionOption = class PositionOption{
        static #PositionOptionEnum = class PositionOptionEnum{
            value;
            constructor(value){
                this.value = value;
                Object.freeze(this);
            }
        }
        static RIGHT_CENTER = new this.#PositionOptionEnum(1);
        static RIGHT_UP = new this.#PositionOptionEnum(2);
        static RIGHT_BOTTOM = new this.#PositionOptionEnum(3);
        
        static LEFT_CENTER = new this.#PositionOptionEnum(4);
        static LEFT_UP = new this.#PositionOptionEnum(5);
        static LEFT_BOTTOM = new this.#PositionOptionEnum(6);
    }
    
    #positionOption;

    #keyMapper = {};

    #element

    #counterSpan

    #target;

    #zeroCountCallback = (element, target) => {};
    constructor({
        target,
        positionOption = NotificationsIcon.PositionOption.RIGHT_UP, 
    }){
        if( ! target){
            throw new Error('target is undefined');
        }
        this.#target = target;
        this.#positionOption = positionOption;

        this.#element = Object.assign(document.createElement('div'),{

        })
        Object.assign(this.#element.style, {
            position: 'fixed'
        })
        
        this.#counterSpan = Object.assign(document.createElement('span'), {
        
        })
        Object.assign(this.#counterSpan.style, {

        })

        this.#element.append(this.#counterSpan);

        window.addEventListener('resize', (event) => {
            if( ! this.#element.isConnected || ! this.#target.isConnected){
                return;
            }
			this.#processingElementPosition()
		})
        window.addEventListener('wheel', (event) => {
            if( ! this.#element.isConnected || ! this.#target.isConnected){
                return;
            }
            this.#processingElementPosition();
        })
    }

    addCount(data, key){
        this.#keyMapper[key] = data;
        let len = Object.values(this.#keyMapper).length;
        if(len > 0){
            //document.body.append(this.#element);
            this.#processingElementPosition();
        }
        this.#counterSpan.textContent = len;
    }

    deleteCount(key){
        delete this.#keyMapper[key];
        let len = Object.values(this.#keyMapper).length;
        if(len == 0){
            this.#element.remove();
            this.#zeroCountCallback(this.#element, this.#target);
        }
        this.#counterSpan.textContent = len;
    }

    #processingElementPosition(){

        document.body.append(this.#element);
        this.#element.fontSize = parseFloat(window.getComputedStyle(this.#target).fontSize);
        let appendAwait = setInterval(()=>{
            if( ! this.#element.isConnected || ! this.#target.isConnected){
                return;
            }
            clearInterval(appendAwait);
            let targetRect = this.#target.getBoundingClientRect();
            let elementRect = this.#element.getBoundingClientRect();

            let positionObj = this.#getPosition(targetRect, elementRect)

            Object.assign(this.#element.style, positionObj)

        }, Math.floor(Math.random() * (500 - 100) + 100) );
    }

    /**
     * 
     * @param {DOMRect} targetRect 
     * @param {DOMRect} elementRect 
     * @param {Number} targetFontSize 
     */
    #getPosition(targetRect, elementRect){
        let obj = {left: 0, right: 0, top: 0, bottom: 0};
        if(this.#positionOption == NotificationsIcon.PositionOption.RIGHT_CENTER ||
            this.#positionOption == NotificationsIcon.PositionOption.RIGHT_UP ||
            this.#positionOption == NotificationsIcon.PositionOption.RIGHT_BOTTOM
        ){
            obj.right = targetRect.x + targetRect.width + (elementRect.width / 2);
            if(obj.right > window.outerWidth){
                obj.right = 0;
                obj.left = targetRect.x - (elementRect.width / 2);
            }
        }else{
            obj.left = targetRect.x - (elementRect.width / 2);
            if(obj.left > targetRect.x - (elementRect.width / 2) < 0){
                obj.left = 0;
                obj.right = targetRect.x + targetRect.width + (elementRect.width / 2);
            }
        }

        if(
            this.#positionOption == NotificationsIcon.PositionOption.RIGHT_CENTER ||
            this.#positionOption == NotificationsIcon.PositionOption.LEFT_CENTER
        ){
            obj.top = targetRect.y + (targetRect.height / 2) + (elementRect.height / 2);
        }else if(
            this.#positionOption == NotificationsIcon.PositionOption.RIGHT_UP ||
            this.#positionOption == NotificationsIcon.PositionOption.LEFT_UP
        ){
            obj.top = targetRect.y - (elementRect.height / 2);
            if(obj.top < 0){
                obj.top = targetRect.bottom + (elementRect.height / 2);
            }
        }else if(
            this.#positionOption == NotificationsIcon.PositionOption.RIGHT_BOTTOM ||
            this.#positionOption == NotificationsIcon.PositionOption.LEFT_BOTTOM
        ){
            obj.top = targetRect.bottom + (elementRect.height / 2); 
            if(obj.top > window.outerHeight){
                obj.top = targetRect.y - (elementRect.height / 2);
            }
        }

        return Object.entries(obj).reduce(( t, [k,v] )=>{
            if(v != 0){
                t[k] = v + 'px';
            }else{
                t[k] = v;
            }
            return t;
        },{});
    }

    set zeroCountCallback(callback){
        this.#zeroCountCallback = callback;
    }

    get zeroCountCallback(){
        return this.#zeroCountCallback;
    }

}