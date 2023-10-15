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
				if(! v){
					return total;
				}
				let key = k.match(this.#keyRegx).map(e=> e.toLowerCase()).join('_');
				total[key] = v;
				return total;
			}, {});
			Object.assign(element.dataset, underbarKeyNameObject);
			resolve();
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
}