export default class ProcessModule{
	static checkSuperClass(originClazz, newClazz){
		let check = Object.getPrototypeOf(newClazz);
		while(check != undefined){
			if(originClazz == undefined){
				throw new Error(`${newClazz.prototype.constructor.name} is not extends in${originClazz.prototype.constructor.name}`)
			}else if(check == originClazz){
				break;
			}else{
				check = Object.getPrototypeOf(originClazz);
			}
		}
	}
}