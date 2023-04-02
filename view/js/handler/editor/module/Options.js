export default class Options{
	#extendsElement;
	#defaultClass;
	#showTools;
	/**
	 * @param {String}
	 */
	set extendsElement(extendsElement){
		this.#extendsElement = extendsElement;
	}
	
	get extendsElement(){
		return this.extendsElement;
	}
	
	set defaultClass(defaultClass){
		this.#defaultClass = defaultClass;
	}

	get defaultClass(){
		this.#defaultClass;
	}

	set showTools(showTools){
		this.#showTools = showTools;
	}
	
	get showTools(){
		this.#showTools;
	}
}