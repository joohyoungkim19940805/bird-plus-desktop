import common from "../../common";
import IndexedDBHandler from "../../handler/IndexedDBHandler";

export const simpleOption = new class SimpleOption{
    
    #wrap = Object.assign(document.createElement('div'), {
        className: 'simple_option'
    })
    #container = Object.assign(document.createElement('ul'), {
        className: 'simple_option_container'
    })

    #componentOption;

    #dbOpenPromise

    #indexedDBHandler

    constructor(){

        this.#indexedDBHandler = new IndexedDBHandler({
            dbName: 'simpleOptionDB',
            storeName: 'simpleOption',
            columnInfo: {
                optionName: ['optionName', 'optionName', {unique: true}],
                value: ['value', 'value'],
                lastModified: ['lastModified','lastModified'],
            },
            keyPathNameList: ['optionName'],
            pkAutoIncrement: false
        })

        this.#dbOpenPromise = this.#indexedDBHandler.open();

        this.#dbOpenPromise.then(() => {
            this.#indexedDBHandler.getItem('componentOption').then(dbRequest=>{
                if( ! dbRequest.result){
                    this.#componentOption = 'responsive'
                    return;
                }
                this.#componentOption = dbRequest.result.value;
                if(this.#componentOption == 'nomal'){
                    document.body.parentElement.style.fontSize = '100%';
                }else{
                    document.body.parentElement.style.fontSize = '';
                }
            })
        })
    }

    #createComponentOption(){
        let li = Object.assign(document.createElement('li'), {

        });
        
        let title = Object.assign(document.createElement('span'), {
            textContent: 'Component Option'
        })

        let optionContainer = Object.assign(document.createElement('div'), {
            className: 'component_option_container',
            innerHTML: `
                <div>
                    <label for="component_option_responsive">Responsive</label>
                    <input type="radio" name="component_option" id="component_option_responsive" value="responsive" ${this.#componentOption == "responsive" ? 'checked' : ''}/>
                        
                </div>
                <div>
                    <label for="component_option_nomal">Nomal</label>
                    <input type="radio" name="component_option" id="component_option_nomal" value="nomal" ${this.#componentOption == "nomal" ? 'checked' : ''}/>
                </div>
            `
        })

        optionContainer.onchange = (event) => {
            if(event.target.type != 'radio'){
                return;
            }
            this.#componentOption = event.target.value;
            if(event.target.value == 'nomal'){
                document.body.parentElement.style.fontSize = '100%';
            }else{
                document.body.parentElement.style.fontSize = '';
            }
            
            this.#indexedDBHandler.addItem({
                optionName: 'componentOption',
                value: event.target.value,
                lastModified: new Date().getTime()
            })
        }

        li.onmouseenter = () => {
            li.append(optionContainer)
        }

        li.onmouseleave = () => {
            optionContainer.remove();
        }

        li.append(title);

        return li;
    }

    open(){
        document.body.append(this.#wrap);
        this.#wrap.append(this.#container)
        this.#container.replaceChildren(this.#createComponentOption());
    }

    close(){
        this.#wrap.remove();
    }

    get wrap(){
        return this.#wrap;
    }
}
