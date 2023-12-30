export default new class Common{
	#keyRegx = /[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g;

	constructor(){

	}

	jsonToSaveElementDataset(data, element){
		if( ! element){
			throw new Error('element is undefined')
		} else if(element.nodeType != Node.ELEMENT_NODE){
			throw new Error(`element is not element node type ::: ${element.nodeType}`);
		}
		return new Promise(resolve=>{
			let underbarKeyNameObject = Object.entries(data).reduce((total, [k,v]) => {
				let key = k.match(this.#keyRegx).map(e=> e.toLowerCase()).join('_');
				total[key] = v;
				return total;
			}, {});
			Object.assign(element.dataset, underbarKeyNameObject);
			resolve(element);
		})
	}
	async underbarNameToCamelName(obj){
		return new Promise(resolve => {
			resolve(Object.entries(obj).reduce((total, [k,v]) => {
				let key = k.split('_').map((e,i)=>{
					if(i == 0){
						return e.charAt(0).toLowerCase() + e.substring(1);
					}
					return e.charAt(0).toUpperCase() + e.substring(1)
				}).join('');
				total[key] = v;
				return total;
			}, {}))
		})
	}
	/**
	 * @returns {Promise<String>}
	 */
	async getProjectPathPromise(){
		return await window.myAPI.getProjectPath().then((data) => {
			return data
		}).catch(error=>{
			console.error(error);
			return '';
		})
	}

	processingElementPosition(element, target){
		let rect;
		if(this.isElement(target, HTMLElement)){
			rect = target.getBoundingClientRect();
		}else{
			rect = target;
		}

		let {x, y, height, width} = rect;
		let elementTop = (y - element.clientHeight)
		let elementLeft = (x - element.clientWidth)
		if(elementTop > 0){
			element.style.top = elementTop + 'px';
		}else{
			element.style.top = y + height + 'px';
		}
		if(elementLeft > 0){
			element.style.left = elementLeft + 'px'
		}else{
			element.style.left = x + width + 'px';
		}
		
	}
    isElement(targetObject, checkClazz){
        let check = Object.getPrototypeOf(targetObject)
        let isElement = false;
        while(check != undefined){

            if(check?.constructor  == checkClazz){
                isElement = true;
                break;
            }else{
                check = Object.getPrototypeOf(check);
            }
        }
        return isElement;
    }

	shortenBytes(byte) {
		const rank = byte > 0 ? Math.floor((Math.log2(byte)/10)) : 0;
		const rankText = ( (rank > 0 ? 'KMGTPEZY'[rank - 1] : '') || (rank >= 9 ? 'Y' : '') ) + 'B';
		const size = Math.floor(byte / Math.pow(1024, (rank >= 9 ? 8 : rank) ));
		return {size, rank, rankText};
	}

	/**
	 * 
	 * @param {Array<string>} text 
	 */
	showToastMessage(textList){
		let div = Object.assign(document.createElement('div'), {
			className: 'toast_message'
		});
		div.append(...textList.map(e=>Object.assign(document.createElement('div'), {
			textContent : e
		})));
		document.body.append(div);
		let appendAwait = setInterval(()=>{
			if( ! div.isConnected) return;
			clearInterval(appendAwait);
			setTimeout(() => {
				div.style.opacity = 0;
				div.ontransitionend = () => {
					div.remove();
				}
			},1000)
		}, 50)

	}

}