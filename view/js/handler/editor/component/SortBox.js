export default class SortBox {
    
    #style = Object.assign(document.createElement('style'), {
		id: 'free-will-editor-sort-box'
	});

    #sortBox = Object.assign(document.createElement('div'), {
        className: 'sort-box-wrap',
    })

    #sortBoxContainer = Object.assign(document.createElement('ul'),{
        className: 'sort-box-container',
    })

    #sortBoxItems = [/*'left',*/ 'center', 'right'].map(e=>Object.assign(document.createElement('li'),{
        textContent: e,
    }));

    #selectedSort;

    #applyCallback = () => {}
    
    constructor(){
        let style = document.querySelector(`#${this.#style.id}`);
        
        if(! style){
            document.head.append(this.createStyle());
        }else{
            this.#style = style;
        }

        this.#sortBox.append(this.#sortBoxContainer);
        this.#sortBoxContainer.replaceChildren(...this.#sortBoxItems);
        this.#sortBoxItems.forEach(e=>{
            e.onclick = (event) => {
                this.#selectedSort = e; 
                this.applyCallback(event);
            }
        });
    }

    open(){
        document.body.append(this.#sortBox);
    }

    close(){
        this.#sortBox.remove();
    }

    set applyCallback(applyCallback){
        this.#applyCallback = applyCallback;
    }

    get applyCallback(){
        return this.#applyCallback;
    }

    get sortBox(){
        return this.#sortBox;
    }

    get selectedSort(){
        return this.#selectedSort;
    }

	get style(){
		return this.#style;
	}

	set style(style){
        this.#style.textContent = style;
    }

	set insertStyle(style){
		this.#style.sheet.insertRule(style);
	}
    
    
    createStyle(){
        this.#style.textContent = `
            .sort-box-wrap {
                background: #000000bf;
                position: fixed;
                padding: 0.9%;
                height: fit-content;
                color: white;
                font-size: 13px;
                min-width: 85px;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                z-index: 999;
            }
            .sort-box-wrap .sort-box-container {
                list-style-type: none;
                padding: 0;
                margin: 0;
                display: flex;
                gap: 1vw;
            }
            
            .sort-box-wrap .sort-box-container li{
                transition: all 0.5s;
                padding: 1% 2% 1% 2%;
                margin-right: 1vw;
            }
            .sort-box-wrap .sort-box-container li:hover{
                background-color: #95959591;
                cursor: pointer;
            }

        `
        return this.#style;
    }

}