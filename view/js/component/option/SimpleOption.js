import common from "../../common";

export const simpleOption = new class SimpleOption{
    
    #wrap = Object.assign(document.createElement('div'), {
        className: 'simple_option'
    })
    #container = Object.assign(document.createElement('ul'), {
        className: 'simple_option_container'
    })

    #componentOption;

    constructor(){
        if(localStorage.hasOwnProperty('componentOption')){
            this.#componentOption = localStorage.getItem('componentOption');
        }else{
            this.#componentOption = 'responsive'
        }

        window.addEventListener('load', () => {
            if(this.#componentOption == 'nomal'){
                document.body.parentElement.style.fontSize = '100%';
            }
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
                    <label for="component_option_responsive">
                        Responsive    
                        <input type="radio" name="component_option" id="component_option_responsive" value="responsive" ${this.#componentOption == "responsive" ? 'checked' : ''}/>
                    </label>
                </div>
                <div>
                    <label for=""component_option_nomal>
                        Nomal
                        <input type="radio" name="component_option" id="component_option_nomal" value="nomal" ${this.#componentOption == "nomal" ? 'checked' : ''}/>
                    </label>
                </div>
            `
        })

        optionContainer.onchange = (event) => {
            if(event.target.type != 'radio'){
                return;
            }
            if(event.target.value == 'nomal'){
                document.body.parentElement.style.fontSize = '100%';
            }else{
                document.body.parentElement.style.fontSize = '';
            }
        }

        li.onmouseenter = () => {
            li.append(optionContainer)
        }

        li.onmouseleave = () => {
            //optionContainer.remove();
        }

        li.append(title);

        return li;
    }

    open(){
        document.body.append(this.#wrap);
        this.#wrap.append(this.#container)
        this.#container.replaceChildren(this.#createComponentOption());
        return this.#wrap;
    }

    close(){
        this.#wrap.remove();
    }

    get wrap(){
        return this.#wrap;
    }
}
