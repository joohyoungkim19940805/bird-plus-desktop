import Line from "./component/Line"

export default class FreedomEditorPlus extends HTMLDivElement {
	#isLoaded = false;
	#prevParent;
	static Component = class Component{
		static #Line = Line;

		/**
		 * @param {Line} newLine
		 */
		static set Line(newLine){
			this.#checkSuperClass(this.#Line, newLine);
			this.#Line = newLine; 
		}
		/**
		 * @param {Line} newLine
		 */
		static get Line(){
			return this.#Line; 
		}
		
		static #checkSuperClass(originClazz, newClazz){
			let check = Object.getPrototypeOf(newClazz);
			while(true){
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
	/**
	 * 
	 * @param {Object} component 
	 * @param {*} option 
	 */
	constructor(component={
		'freedom-line' : FreedomEditorPlus.Component.Line
	},option={}){
		super();
		Object.entries(component).forEach( ([k,v]) => {
			window.customElements.define(k, v, {extends:v.extendsElement});
		})

	}
	connectedCallback(){
		if( ! this.#isLoaded){
            this.#isLoaded = true;
			this.contentEditable = true;
			let line = new Line();
			this.append(line);
			// 최초에 첫번째 Line 엘레멘탈의 height 값이 0인 경우 최소 사이즈 지정
			if(parseInt(window.getComputedStyle(line).height) == 0){
				line.style.minHeight = '1rem';
				let isFirstKeyUp = false;
				line.addEventListener('keyup',() => {
					if(isFirstKeyUp == false){
						isFirstKeyUp = true;
						line.style.minHeight = '';
					}
				})
			}
		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
		this.contentEditable = false;
    }

}
