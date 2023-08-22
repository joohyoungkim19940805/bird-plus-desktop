
module.exports = class EasyObserver{
    #value;
    #listener = [];
    #simpleObserver = () => {

    }
    constructor(value){
        this.#value = value;
    }

    observer(callBack){
        this.#listener.push(callBack);
    }

    disconnect(){
        this.#listener = [];
    }
    
    set value(value){
        if(this.#value === value){
            return;
        }
        this.#value = value;
        new Promise(resolve => {
            this.#listener.forEach(async callBack => {
                callBack(this.#value);
            })
            resolve();
        })
    }
    
    get value(){
        return this.#value;
    }
}