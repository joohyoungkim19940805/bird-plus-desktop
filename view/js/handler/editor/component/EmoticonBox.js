import { emoticon, groupKind, subgroupKind, defaultEmoticon } from "../module/emoticon";

export default class EmoticonBox{

    #style = Object.assign(document.createElement('style'), {
        id: 'free-will-editor-emoticon-box'
    })

    #emoticonBox = Object.assign(document.createElement('div'), {
        className: 'emoticon-box-wrap',
        innerHTML: `
            <div class="emoticon-box-search-container">
                <input type="search" list="emoticon-box-search-list" id="emoticon-box-search" data-bind_name="emoticonSearch" placeholder="search emoticon"/>
                <datalist id="emoticon-box-search-list" data-bind_name="emoticonSearchList"></datalist>
            </div>
            <div class="emoticon-box-content-wrapper">
                <div class="emoticon-box-group-container">
                    <ul class="emoticon-box-group-list" data-bind_name="emoticonGroupList">
                    </ul>
                </div>
                <div class="emoticon-box-subgroup-container">
                    <ul class="emoticon-box-subgroup-list" data-bind_name="emoticonSubgroupList">
                    </ul>
                </div>
            </div>
            <div class="emoticon-box-emoticon-container">
                <ul class="emoticon-box-emoticon-list" data-bind_name="emoticonList">
                </ul>
            </div>
        `
    })
    
    #elementMap = (()=>{
		return 	[...this.#emoticonBox.querySelectorAll('[data-bind_name]')].reduce((total, element) => {
            total[element.dataset.bind_name] = element;
			return total;
		}, {})
	})();

    #applyCallback = () => {}

    constructor(){
        let style = document.querySelector(`#${this.#style.id}`);
        if(! style){
            document.head.append(this.createStyle());
        }else{
            this.#style = style;
        }
        new Promise(resolve => {

            resolve();
        })
    }

    createGroupList(){
        return new Promise(resolve => {
            let liList = ['All',...groupKind].map((e, i)=>{
                let li = Object.assign(document.createElement('li'),{
                    className: 'emoticon-group-item'
                });
                let isAll = e == 'All';
                let input = Object.assign(document.createElement('input'), {
                    className: 'emoticon-group-input',
                    name : 'emoticon-group-input',
                    id: `emoticon-group-${i}`,
                    type: 'radio',
                    checked: isAll,
                    onchange : (event) => {
                        let isPrevChecked = this.#elementMap.emoticonSubgroupList.querySelector(`[data-subgroup_name]:not([data-subgroup_name="All"]) .emoticon-subgroup-input:checked`)
                        let subgroupTitle = isPrevChecked?.closest('[data-subgroup_name]').dataset.subgroup_name;
                        this.createSubGroupList(isAll ? undefined : e);
                        if( ! subgroupTitle){
                            this.createEmoticonList(isAll ? undefined : e, undefined);
                        }else{
                            let [groupTitle] = Object.entries(subgroupKind).find(( [k,v] ) => v.some(e=>e==subgroupTitle))
                            this.createEmoticonList(groupTitle, subgroupTitle);
                        }
                        
                    }
                });
                let label = Object.assign(document.createElement('label'), {
                    for: `emoticon-group-${i}`,
                    textContent: e
                })
                label.prepend(input)
                li.append(label);
                return li;
            });
            this.#elementMap.emoticonGroupList.replaceChildren(...liList);
            resolve(liList);
        })
    }

    createSubGroupList(groupTitle){
        return new Promise(resolve=>{
            let targetGroup = subgroupKind[groupTitle] || Object.values(subgroupKind).flatMap(e=>e)
            let liList = ['All', ...targetGroup].map((e, i)=>{
                let isAll = e == 'All';
                let isPrevChecked = this.#elementMap.emoticonSubgroupList.querySelector(`[data-subgroup_name="${e}"] .emoticon-subgroup-input:checked`) != undefined;
                
                let li = Object.assign(document.createElement('li'),{
                    className: 'emoticon-subgroup-item'
                });
                let input = Object.assign(document.createElement('input'), {
                    className: 'emoticon-subgroup-input',
                    name : 'emoticon-subgroup-input',
                    id: `emoticon-subgroup-${i}`,
                    type: 'radio',
                    checked: isAll || isPrevChecked,
                    onchange : (event) => this.createEmoticonList(groupTitle, isAll ? undefined : e)
                });
                let label = Object.assign(document.createElement('label'), {
                    for: `emoticon-subgroup-${i}`,
                    textContent: e
                })
                label.prepend(input);
                li.append(label);
                li.dataset.subgroup_name = e;
                if(isAll || isPrevChecked){
                    let appendAwait = setInterval(()=>{
                        if( ! li.isConnected){
                            return;
                        }
                        clearInterval(appendAwait);
                        li.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" });
                        this.createEmoticonList(groupTitle, isAll ? undefined : e)
                    },50)
                    
                }
                return li;
            });
            this.#elementMap.emoticonSubgroupList.replaceChildren(...liList);
            resolve(liList);
        })
    }

    createEmoticonList(groupTitle, subgroupTitle, toneType){
        return new Promise(resolve => {
            let targetGroup;
            console.log(groupTitle, subgroupTitle)
            if( ! groupTitle && subgroupTitle){
                targetGroup = Object.values(emoticon).find(e=> e[subgroupTitle])?.[subgroupTitle] || [];
            }else if( groupTitle && ! subgroupTitle){
                targetGroup = Object.values(emoticon[groupTitle]).flatMap(e=>e)
            }else if( ! groupTitle && ! subgroupTitle){
                targetGroup = Object.values(emoticon).flatMap(e=> Object.values(e).flatMap(ee=>ee));
            }else{
                targetGroup = emoticon[groupTitle][subgroupTitle];
            }
            let datalistOptions = [];
            let liList = targetGroup.map(e=>{
                if( ! toneType && e.toneType.length != 0){
                    return;
                }
                let li = Object.assign(document.createElement('li'),{
                    className: 'emoticon-item'
                });
                let button = Object.assign(document.createElement('li'), {
                    textContent: e.emoticon,
                    onclick: (event) => {
                        this.#applyCallback(e);
                    },
                    title: e.description
                })
                li.append(button);
                let option = Object.assign(document.createElement('option'),{
                    value: e.emoticon,
                    textContent: e.description
                })
                datalistOptions.push(option);
                return li;
            }).filter(e=>e);
            this.#elementMap.emoticonList.replaceChildren(...liList);
            this.#elementMap.emoticonSearchList.replaceChildren(...datalistOptions);
            resolve(liList);
        });
    }

    open(openTarget){
		if(openTarget){
            openTarget.append(this.#emoticonBox);
        }else{
            document.body.append(this.#emoticonBox);
        }
        this.#elementMap.emoticonGroupList.replaceChildren();
        this.#elementMap.emoticonSubgroupList.replaceChildren();
        this.createGroupList();
        this.createSubGroupList();
        this.createEmoticonList();
        this.#elementMap.emoticonSearch.value = '';
    }

    close(){
        this.#emoticonBox.remove();
    }

    set applyCallback(applyCallback){
        this.#applyCallback = applyCallback;
    }

    get applyCallback(){
        return this.#applyCallback;
    }

    get emoticonBox(){
        return this.#emoticonBox;
    }

    createStyle(){
        this.#style.textContent = `
            .emoticon-box-wrap{
                position: fixed;
                width: 47vw;
                height: 39vh;
                color: white;
                min-width: 100px;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                display: flex;
                align-content: center;
                justify-content: space-around;
                align-items: center;
                justify-items: center;
                z-index: 999;
                flex-direction: column;
            }
            .emoticon-box-wrap .emoticon-box-search-container{
                padding : 0.9% 0.9% 0 0.9%;
            }
            .emoticon-box-wrap .emoticon-box-content-wrapper{
                padding : 0 0.9% 0 0.9%;
            }
            .emoticon-box-wrap .emoticon-box-emoticon-container{
                padding : 0 0.9% 0.9% 0.9%;
            }
            .emoticon-box-wrap .emoticon-box-search-container,
            .emoticon-box-wrap .emoticon-box-content-wrapper,
            .emoticon-box-wrap .emoticon-box-emoticon-container
            {
                background: #343434
            }
            .emoticon-box-wrap label{
                color: white;
                font-size: 0.9rem;
            }
            .emoticon-box-wrap .emoticon-box-search-container{
                width: 100%;
                height: auto;
                align-self: center;
                text-align: center;
            }
            .emoticon-box-wrap .emoticon-box-search-container #emoticon-box-search{
                font-size: 0.8rem;
                height: 100%;
                width: 100%;
            }
            .emoticon-box-wrap .emoticon-box-content-wrapper{
                display: flex;
                height: 50%;
                width: 100%;
            }
            .emoticon-box-wrap .emoticon-box-content-wrapper .emoticon-box-group-container,
            .emoticon-box-wrap .emoticon-box-content-wrapper .emoticon-box-subgroup-container,
            .emoticon-box-wrap .emoticon-box-emoticon-container{
                overflow-y: auto;
                width: 100%;
            }
            .emoticon-box-wrap .emoticon-box-content-wrapper .emoticon-box-group-container::-webkit-scrollbar,
            .emoticon-box-wrap .emoticon-box-content-wrapper .emoticon-box-subgroup-container::-webkit-scrollbar,
            .emoticon-box-wrap .emoticon-box-emoticon-container::-webkit-scrollbar{
                display: none;
            }
            .emoticon-box-wrap .emoticon-box-content-wrapper .emoticon-box-group-container:hover::-webkit-scrollbar,
            .emoticon-box-wrap .emoticon-box-content-wrapper .emoticon-box-subgroup-container:hover::-webkit-scrollbar,
            .emoticon-box-wrap .emoticon-box-emoticon-container:hover::-webkit-scrollbar{
            	display: initial;
                width: 7px;
                height: 7px;
            }
            .emoticon-box-wrap .emoticon-box-content-wrapper .emoticon-box-group-container::-webkit-scrollbar-thumb,
            .emoticon-box-wrap .emoticon-box-content-wrapper .emoticon-box-subgroup-container::-webkit-scrollbar-thumb,
            .emoticon-box-wrap .emoticon-box-emoticon-container::-webkit-scrollbar-thumb{
                background: #0c0c0c38;
                border-radius: 100px;
                box-shadow: inset 0 0 5px #000000;
            }
            .emoticon-box-wrap .emoticon-box-content-wrapper .emoticon-box-group-container:hover::-webkit-scrollbar-thumb,
            .emoticon-box-wrap .emoticon-box-content-wrapper .emoticon-box-subgroup-container:hover::-webkit-scrollbar-thumb,
            .emoticon-box-wrap .emoticon-box-emoticon-container:hover::-webkit-scrollbar-thumb{
                background: #34000075; 
            }
            
            .emoticon-box-wrap .emoticon-box-group-list li,
            .emoticon-box-wrap .emoticon-box-subgroup-list li{
                margin-bottom: 0.2vh;
            }
            .emoticon-box-wrap .emoticon-box-group-list li input.emoticon-group-input,
            .emoticon-box-wrap .emoticon-box-subgroup-list li input.emoticon-subgroup-input{
                width: 0.6rem;
                height: 0.6rem;
                margin-top: 0;
            }
            .emoticon-box-wrap .emoticon-box-emoticon-container{
                height: inherit;
                width: 100%;
                overflow-y: auto;
            }
            .emoticon-box-wrap .emoticon-box-emoticon-container .emoticon-box-emoticon-list{
                overflow-wrap: anywhere;
                display: flex;
                flex-wrap: wrap;
            }
            .emoticon-box-wrap .emoticon-box-emoticon-container .emoticon-box-emoticon-list .emoticon-item{
                padding: 0.2rem;
                transition: background-color 0.7s;
            }
            .emoticon-box-wrap .emoticon-box-emoticon-container .emoticon-box-emoticon-list .emoticon-item:hover{
                background-color: #6a6a6a;
            }
        `
        return this.#style;
    }
}