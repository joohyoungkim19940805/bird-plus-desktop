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
	underbarNameToCamelName(obj){
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
			return data;
		}).catch(error=>{
			console.error(error);
			return '';
		})
	}

	processingElementPosition(element, target){
		let {x, y, height} = target.getBoundingClientRect();
		
		let elementHeightPx = element.clientHeight;
		let elementTop = (y - elementHeightPx)
		if(elementTop > 0){
			element.style.top = elementTop + 'px';
		}else{
			element.style.top = y + height + 'px';
		}
		element.style.left = x + 'px';
	}
}