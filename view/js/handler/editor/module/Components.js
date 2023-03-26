import ProcessModule from "./ProcessModule";
import Line from "../component/Line"
export default class Components {
	static #Line = Line;

	/**
	 * @param {Line} newLine
	 */
	static set Line(newLine){
		ProcessModule.checkSuperClass(this.#Line, newLine);
		this.#Line = newLine; 
	}
	/**
	 * @param {Line} newLine
	 */
	static get Line(){
		return this.#Line; 
	}
	
	
}