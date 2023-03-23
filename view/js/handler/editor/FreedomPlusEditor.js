import ProcessModule from "./module/ProcessModule";
import Line from "./component/Line"
import Bold from "./tools/bold"

export default class FreedomEditorPlus extends HTMLDivElement {
	#isLoaded = false;
	#prevParent;
	onActCallback = (event) => {};
	static Component = class Component {
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
	/**
	 * HTMLElement을 상속 받고 extendsElement를 아래 중 하나로 하면 적용 가능 할 것입니다.
	 */
	static Tools = class Tools {		
		static #Bold = Bold;

		/**
		 * @param {Bold} newBold
		 */
		static set Bold(newBold){
			ProcessModule.checkSuperClass(this.#Bold, newBold);
			this.#Bold = newBold; 
		}
		/**
		 * @param {Bold} newBold
		 */
		static get Bold(){
			return this.#Bold; 
		}


		// 사용 할 거 각각 class로 만들기
		// 차후 과제 - 중첩 인 경우 어떻게 대응할 것인지?
		/**
		 * b보다 강력한 강조 표시 심각성 또는 중요성 표시 (좀더 진한듯?)
		 * %% 쓴다. %%
		 */
		static strongTag = document.createElement('strong');
		
		/**
		 * 하이퍼링크 표시
		 * %% 쓴다. %%
		 */
		static aTag = document.createElement('a');
		/**
		 * 강세가 강조 된 표시 (살짝 기우는 텍스트)
		 * %% 쓴다. %%
		 */
		static emTag = document.createElement('em');
		/**
		 * q보다 긴 인용문에는 이 요소를 사용하십시오.
		 * %% 쓴다. %%
		 */
		static blockquoteTag = document.createElement('blockquote');
		/**
		 * 텍스트가 컴퓨터 코드 의 짧은 조각임을 나타내기 위한 스타일로 내용을 표시합니다.
		 * %% 쓴다. %%
		 */
		static codeTag = document.createElement('code');
		/**
		 * 키보드, 음성 입력 또는 기타 텍스트 입력 장치의 텍스트 사용자 입력을 나타내는 인라인 텍스트 범위를 나타냅니다 . 
		 * 규칙에 따라 사용자 에이전트는 기본 고정 폭 글꼴을 사용하여 요소 의 내용을 렌더링하도록 기본 설정되어 있지만 HTML 표준에서 요구하는 사항은 아닙니다.
		 * 별도의 css가 있어야 하는듯, mdn 예제에서 css를 지우면 그냥 텍스트랑 차이가 안 남
		 * %% 쓴다. mdn css 따라 갈 거 %%
		 */
		static kbdTag = document.createElement('kbd'); 
		/**
		 * 인쇄상의 이유로 아래 첨자로 표시되어야 하는 인라인 텍스트를 지정합니다 .
		 * %% 쓴다. %%
		 */
		static subTag = document.createElement('sub');
		/**
		 * 인쇄상의 이유로 위 첨자 로 표시되는 인라인 텍스트를 지정합니다. 위 첨자는 일반적으로 더 작은 텍스트를 사용하여 기준선을 올려 렌더링합니다.
		 * %% 쓴다. %%
		 */
		static supTag = document.createElement('sup');
		/**
		 * 특정 글자 하이라이트
		 * 기본적으로 노란색 하이라이트
		 * %% 쓴다. %%
		 */
		static markTag = document.createElement('mark');
		/**
		 * 질적 으로 아무 것도 나타내지 않는 구문 콘텐츠를 위한 일반적인 인라인 컨테이너입니다. 스타일을 지정하기 위해( 또는 속성 사용) 또는 와 같은 속성 값을 공유하기 때문에 요소를 그룹화하는 데 사용할 수 있습니다
		 */
		static spanTag = document.createElement('span');

				/**
		 * 약어 또는 두문자어를 나타냅니다. 
		 * 별도의 css가 있는 것은 아니고 따로 강조표시 해줘야함
		 * %% 보류. %%
		 */
		//static abbrTag = document.createElement('abbr'); 
		
		/**
		 * 특정 기간을 나타냅니다. 날짜를 기계가 읽을 수 있는 형식으로 변환하는 속성을 포함하여 더 나은 검색 엔진 결과 또는 미리 알림과 같은 사용자 정의 기능을 허용할 수 있습니다 .<time> datetime
		 * 별도의 css가 있어야 하는듯
		 * %% 보류. %%
		 */
		//static timeTag = document.createElement('time');
		
		/**
		 * 수학적 표현이나 프로그래밍 컨텍스트에서 변수의 이름을 나타냅니다. 동작은 브라우저에 따라 다르지만 일반적으로 현재 서체의 이탤릭체 버전을 사용하여 표시됩니다.
		 * 별도의 css가 있어야 하는 듯?
		 * %% 보류. 단 안 쓸 가능성 높음 %%
		 */
		//static varTag = document.createElement('var'); 
		
		/**
		 * 컴퓨터 프로그램의 샘플(또는 인용된) 출력을 나타내는 인라인 텍스트를 묶는 데 사용됩니다.
		 * 별도의 css가 있어야 하는듯 겉보기에 큰 차이가 안느껴짐 (약간만 느껴짐)
		 * %% 보류. 단 안 쓸 가능성 높음 %%
		 */
		//static sampTag = document.createElement('samp');

		/**
		 * 강조 표시
		 */
		//static bTag = document.createElement('b'); 
		
		/**
		 * 저작권 및 법적 텍스트와 같은 보조 주석 및 작은 글씨를 나타냅니다
		 */
		//static smallTag = document.createElement('small'); 
		
		/**
		 * 인용된 창작물의 제목을 표시하는 데 사용됩니다 
		 * em처럼 기우는 텍스트인데 좀 더 많이 기우는 건가? 차이를 모르겠음
		 */
		//static citeTag = document.createElement('cite'); 
		
		/**
		 * 텍스트가 짧은 인라인 따옴표임을 나타냅니다. 
		 */
		//static qTag = document.createElement('q'); 
		
		/**
		 * 정의 구 또는 문장의 컨텍스트 내에서 정의되는 용어를 나타내는 데 사용됩니다 . 조상 요소, / 쌍 또는 요소의 가장 가까운 조상은 용어의 정의로 간주됩니다.
		 * 별도의 css가 있어야 하는듯, 그냥 시멘틱 태그 같은 것처럼 보임.
		 */
		//static dfnTag = document.createElement('dfn'); 

		/**
		 * 관용적 텍스트, 기술 용어, 분류학적 지정과 같은 어떤 이유로 일반 텍스트와 구분되는 텍스트 범위를 나타냅니다.
		 * 별도의 css가 있어야 하는듯 차이가 안남 (살짝 기우는듯)
		 * %% 기우는 거 em 쓸 거, 즉 안 쓸 거 %%
		 */
		//static iTag = document.createElement('i'); 
		
		/**
		 * <ruby>
		 * 明日 <rp>(</rp><rt>Ashita</rt><rp>)</rp>
		 * </ruby>
		 * 일반적으로 동아시아 문자의 발음을 표시하는 데 사용되는 기본 텍스트 위, 아래 또는 옆에 렌더링되는 작은 주석을 나타냅니다 . 다른 종류의 텍스트에 주석을 추가하는 데에도 사용할 수 있지만 이 사용법은 덜 일반적입니다
		 * 明日 <rt>Ashita</rt> 해도 됨
		 * 한자 위에 설명이 들어가는 형태로 노출됨
		 */
		//static rubyTag = document.createElement('ruby');
		
		/**
		 * 루비 주석 표시를 지원하지 않는 브라우저 에 대체 괄호를 제공하는 데 사용됩니다 .
		 */
		//static rpTag = document.createElement('rp');
		/**
		 * 동아시아 타이포그래피에 대한 발음, 번역 또는 음역 정보를 제공하는 데 사용되는 루비 주석의 루비 텍스트 구성 요소를 지정합니다 . 요소 는 항상 요소 내에 포함되어야 합니다 .<rt> <rt><ruby>
		 */
		//static rtTag = document.createElement('rt');
		/**
		 * 텍스트의 현재 방향성을 재정의하여 내부 텍스트가 다른 방향으로 렌더링되도록 합니다.
		 */
		//static bdoTag = document.createElement('bdo');

	}
	/**
	 * 
	 * @param {Object} component 
	 * @param {*} option 
	 */
	constructor(component={
		'freedom-line' : FreedomEditorPlus.Component.Line
	},tools={}){
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
			line.abcd = this;
			line.onkeyup = (event)=>console.log(event)
			console.log(line.abcd);
			this.append(line);
			console.log(window.getComputedStyle(line).height)
			// 최초에 첫번째 Line 엘레멘탈의 height 값이 0인 경우 최소 사이즈 지정
			if(parseInt(window.getComputedStyle(line).height) == 0 || window.getComputedStyle(line).height == 'auto'){
				line.style.minHeight = '1rem';
				let isFirstKeyUp = false;
				line.addEventListener('keyup',() => {
					if(isFirstKeyUp == false){
						isFirstKeyUp = true;
						line.style.minHeight = '';
					}
				})
			}
			// 온키업인 경우 엔터로 얻는 엘레멘탈을 이어받나? = 아니었음
			this.onkeyup = Object.freeze( (event) => {
				console.log(event)
				console.log(window.getSelection());
				console.log(window.getSelection().toString())
				console.log(window.getSelection().getRangeAt(0))
				//console.log(window.getSelection().getRangeAt(1))
			});
			this.onselectstart  = Object.freeze( (event) => {
				console.log(event)
				console.log(window.getSelection())
				console.log(window.getSelection().toString())
			});
			this.onmouseup = Object.freeze( (event) => {
				console.log(event);
				console.log(window.getSelection())
				console.log(window.getSelection().toString())
			});
			// getSelection - isCollapsed이 true인 경우 선택 된 텍스트가 없음, false = 있음
		}
	}
	disconnectedCallback(){
        this.#isLoaded = false;
		this.contentEditable = false;
    }

}
