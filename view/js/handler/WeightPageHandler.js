
/**
 * 가중치 관리화면 이벤트 관련 클래스
 * @author mou123
 * @constructor
 */
class PageHandler {
	
	/**
	 * 현재 queryMst의 no
	 */
	#srchQueryNo;
	
	/**
	 * 생성자
	 */
	constructor(){
		
		this.main = document.querySelector('main.container');
		this.content = this.main.querySelector('div#content_wrapper');
		this.queryDtlWrapper = this.content.querySelector('div.query_dtl_wrapper')
		this.nearOptionInput = this.content.querySelector('.near_option_input_wrapper > .distance_option');

		this.staticKeywordText = this.content.querySelector('.static_keyword_text');
		this.staticKeywordRange = this.content.querySelectorAll('.static_keyword_range');
		this.content.querySelector('.static_keyword_wrapper').replaceChildren();
		this.content.querySelector('.near_option_input_wrapper').replaceChildren();

		this.contentItem = this.content.querySelector('section.search_options').cloneNode(true);
		
		this.grouppingViewWrapper = this.content.querySelector('div.groupping_view_wrapper');

		this.prevQueryMst;
	}

	/**
	 * 서버로부터 queryMst 정보를 받아서 화면에 그려주는 함수
	 * @author mozu123
	 * @param {HTMLSelectElement} element : 페이지 코드 셀렉트 박스 element
	 */
	callPageQuery(element){
		if(element.classList.contains('select_default_text')){
			return;
		}
		let targetElement = element.selectedOptions[0];

		$.ajax({
			dataType:'json',
			url:'/display/search-word/weight/search-weight',
			contentType : 'application/json; charset=utf-8',
			data: JSON.stringify({
				langCode : targetElement.dataset.lang_code,
				acesCntryCode : targetElement.dataset.cntry_code
			}),
		}).done((data)=>{
			this.landingQueryMst(data);
			this.#srchQueryNo = data.srchQueryNo
		})
	}

	/**
	 * dom을 파싱해서 서버로 날릴 body를 만드는 함수
	 * @author mozu123
	 * @param {String} inputUserKeywod : 검색 할 키워드 
	 * @returns {Promise} this.prevQueryMst 
	 */
	createParameter(inputUserKeywod = ''){
		return new Promise(resolve=>{
			let defOprLogic = document.forms.query_mst.elements.defOprLogic.value;
			if(defOprLogic == '' || ! defOprLogic){
				defOprLogic = 'and';
			}
			let queryMstInfo = document.forms.query_mst.elements.langCode.selectedOptions[0]
			this.prevQueryMst = {
				srchQueryNo : this.#srchQueryNo,
				langCode : queryMstInfo.dataset.lang_code,
				acesCntryCode : queryMstInfo.dataset.cntry_code,
				srchQueryTypeCode : queryMstInfo.value,
				parentLogicCode : document.forms.query_mst.elements.parentLogicCode.value,
				'defOprLogic' : defOprLogic
			}
			this.prevQueryMst.queryDtlList = [...document.querySelectorAll('.search_options')].map(e=>{
				let queryDtl = {};
				queryDtl.fieldName = e.querySelector('[name=fieldName]').value
				queryDtl.logicOptionCode = e.querySelector('[name=logicOptionCode]').value
				queryDtl.compoundOptionCode = e.querySelector('[name=compoundOptionCode]').value
				if(queryDtl.compoundOptionCode == 10){
					queryDtl.distanceOption = e.querySelector('[name=distanceOption]').value
					queryDtl.distanceOption = queryDtl.distanceOption == '' ? undefined : queryDtl.distanceOption;
				}
				queryDtl.staticKeyword = e.querySelector('[name=staticKeyword]').value;
				if(queryDtl.staticKeyword == ''){
					queryDtl.staticKeyword = inputUserKeywod;
				}
				queryDtl.boostOption = e.querySelector('[name=boostOption]').value;
				return queryDtl
			});
			return setTimeout(resolve(this.prevQueryMst), 0);
		});
	}

	/**
	 * 서버로부터 반환받은 queryMst 정보를 화면에 그려준다.
	 * @author mozu123
	 * @param {Object} queryMst 
	 * @see this.callPageQuery
	 */
	landingQueryMst(queryMst){
		this.queryDtlWrapper.replaceChildren();
		this.grouppingViewWrapper.querySelectorAll('div.groupping_view').forEach(e=>e.replaceChildren())
		if(queryMst.langCode){
			this.content.querySelector(`#langCode option[data-lang_code=${queryMst.langCode}]`).selected = true;
		}
		this.content.querySelector('[name=parentLogicCode]').value = queryMst.parentLogicCode;
		this.content.querySelector('[name=defOprLogic]').value = queryMst.defOprLogic;
		
		queryMst.queryDtlList.forEach(queryDtl=>{

			let contentItem = this.addContentItem();
			let compoundOption = contentItem.querySelector('[name=compoundOptionCode]'); 
			compoundOption.value = queryDtl.compoundOptionCode;
			let staticKeyword = queryDtl.staticKeyword;
			
			this.compoundOptionOnChange(compoundOption, staticKeyword)
			
			if(compoundOption.value == 10){
				contentItem.querySelector('[name=distanceOption]').value = queryDtl.distanceOption
				contentItem.querySelector('.static_keyword_text').value = staticKeyword
				contentItem.querySelector('[name=staticKeyword]').value = staticKeyword
			}else if(compoundOption.value == 40){
				let rangeValue = staticKeyword.split(',');
				contentItem.querySelectorAll('.static_keyword_range').forEach(e=> e.dataset.index == 1 ? e.value = parseInt(rangeValue[0]) : e.value = parseInt(rangeValue[1]));
			}else{
				contentItem.querySelector('.static_keyword_text').value = staticKeyword
				contentItem.querySelector('[name=staticKeyword]').value = staticKeyword
			}
			
			contentItem.querySelector('[name=fieldName]').value = queryDtl.fieldName;
			contentItem.querySelector('[name=logicOptionCode]').value = queryDtl.logicOptionCode;
			contentItem.querySelector('[name=boostOption]').value = queryDtl.boostOption
			this.changeParentLogicEvent(document.forms.query_mst.elements.parentLogicCode).then(()=>this.grouppingView());
		});
	}

	/**
	 * 셀렉트 박스를 사용자가 변경 후 포커싱을 벗어날 때 디폴트 값을 자동으로 없애주는 함수로 onblur에 걸어야 제대로 동작한다.
	 * 추후 기능을 확장하거나 변경하고 싶다면(on이벤트가 겹친다면) 매개변수에 콜백 함수를 추가해서 이용, ex) onchange=selectDefaultHandler(); / 해당 함수 동작 후 => onchange=callbackFunction();으로 변경하는 식으로
	 * @author mozu123
	 * @param {HTMLSelectElement} element 
	 */
	selectDefaultHandler(element){
		if(element.onblur == ''){
			return;
		}
		let defaultOption = element.options[0]; 
		if( defaultOption.classList.contains('select_default_text') && !element.selectedOptions[0].classList.contains('select_default_text')){
			defaultOption.remove();
		}
		element.onblur = '';
	}

	/**
	 * compound 옵션인 셀렉트 박스의 체인지 이벤트를 정의, 컴파운드 옵션에 따라 화면이 변경된다.
	 * range일 경우 => range 관련 input type=number으로 변경, near일 경우 문장 거리를 입력하는 input type=text를 추가
	 * @author mozu123
	 * @param {HTMLSelectElement} element 
	 */
	compoundOptionOnChange(element, staticKeyword){
		let searchOptions = element.closest('.search_options');
		
		//고정 검색어 사용 여부 확인
		let usingStaticKeyword = searchOptions.querySelector('[name=using_static_keyword]');
		usingStaticKeyword.style.display = '';
		// 고정 검색어를 사용할 시 인풋 텍스트 박스 생성과 인풋 텍스트 박스 옆의 X버튼을 재정의
		if(usingStaticKeyword.hasAttribute('data-open_static_keyword') || (staticKeyword && staticKeyword != '')){
			usingStaticKeyword.removeAttribute('data-open_static_keyword');
			usingStaticKeyword.classList.add('btn-close');
			usingStaticKeyword.textContent = 'Ⅹ';
			usingStaticKeyword.onclick = (event) =>{
				//X 버튼으로 변한 usingStaticKeyword 버튼 클릭시 이곳에 있는 이벤트로 트리거 된다.
				event.target.textContent = usingStaticKeyword.dataset.origin_text;
				event.target.classList.remove('btn-close');
				searchOptions.querySelector('.static_keyword_wrapper').style.display = 'none';
				event.target.onclick = (eve) => {
					//고정 검색어 사용하기 버튼을 누를시 이곳에 있는 이벤트로 트리거 된다.
					eve.target.setAttribute('data-open_static_keyword','');
					this.compoundOptionOnChange(element);
					searchOptions.querySelector('.static_keyword_wrapper').style.display = 'flex';
				}
			}
		// 고정 검색어 여부와 상관없이 term, range 등 검색 옵션 변경시의 초기화
		}else{
			usingStaticKeyword.textContent = usingStaticKeyword.dataset.origin_text;
			usingStaticKeyword.classList.remove('btn-close');
			searchOptions.querySelector('.static_keyword_wrapper').style.display = 'none';
			usingStaticKeyword.onclick = (e) => {
				//term,range 등 검색 옵션 변경 후에는 usingStaticKeyword 버튼 클릭시 이곳에 있는 이벤트로 트리거 된다.
				e.target.setAttribute('data-open_static_keyword','');;
				this.compoundOptionOnChange(element);
				searchOptions.querySelector('.static_keyword_wrapper').style.display = 'flex';
			}
		}

		searchOptions.querySelector('[name=staticKeyword]').value = '';
		
		if(element.value == 10){
			// 검색 옵션이 10일 경우 (near)
			searchOptions.querySelector('.near_option_input_wrapper').replaceChildren(this.nearOptionInput.cloneNode(true));
			searchOptions.querySelector('.static_keyword_wrapper').replaceChildren(this.staticKeywordText.cloneNode(true));
		}else if(element.value == 40){
			// 검색 옵션이 40일 경우 (range)
			searchOptions.querySelector('.static_keyword_wrapper').replaceChildren(...[...this.staticKeywordRange].map(e=>e.cloneNode(true)));
		}else{
			searchOptions.querySelector('.near_option_input_wrapper').replaceChildren();
			searchOptions.querySelector('.static_keyword_wrapper').replaceChildren(this.staticKeywordText.cloneNode(true));
		}
	}

	/**
	 * 필드 추가 버튼을 누를시 필드 정보를 복사해서 화면에 그려주고 복사된 노드를 리턴한다.
	 * @author mozu123
	 * @returns {HTMLElement} : 20221128 현재 section 태그임
	 */
	addContentItem(){
		let contentItem = this.contentItem.cloneNode(true)
		this.queryDtlWrapper.append(contentItem);
		contentItem.style.top = contentItem.getBoundingClientRect().y + 'px';
		return contentItem;
	}

	/**
	 * list가 datalist인 input type=text에 사용자가 입력한 값이 datalist에 포함되어 있는지 체크하고, 포함되어 있지 않다면 얼럿을 띄우는 함수로 테스트 버튼을 누를시 동작한다.
	 * @author mozu123
	 * @param {HTMLInputElement} element
	 */
	checkFieldName(element){
		let isEmpty = [...element.list.options].filter(e=>e.value==element.value).length == 0;
		if(isEmpty){
			element.value = '';
			alert('존재하지 않는 필드입니다.');
			this.main.focus();
		}
	}
	
	/**
	 * 사용자가 input type=number에 입력 한 값이 element.max(100)을 초과하는지 확인하고 초과할 시 얼럿읠 띄우는 함수로 테스트 버튼을 누를시 동작한다.
	 * @author mozu123
	 * @param {HTMLInputElement} element
	 */
	checkBoostOption(element){
		if(parseFloat(element.value) > parseFloat(element.max) && ! element.dataset.alert_complete){
			element.value = ''
			alert('현재 가중치는 100 이상 줄 수 없습니다.\n특정 필드에 너무 높은 가중치가 부여될 경우\n검색어가 다른 필드에는 매칭이 안될 수 있습니다.');
			this.main.focus();
		}
	}
	
	/**
	 * 부모 로직 논리 select 박스 변경시 각 하위 로직간 관계를 명시적으로 말해주는 텍스트 영역 변경 (and, or, not)
	 * @param {HTMLSelectElement} element 
	 * @returns {Promise}
	 */
	changeParentLogicEvent(element){
		return new Promise(resolve=>{
			let parentLogic = element.selectedOptions[0];
			this.grouppingViewWrapper.querySelectorAll('label.logic_text').forEach(e=>e.textContent = parentLogic.dataset.select_kor_text);
			return setTimeout(resolve(''), 0);
		});
	}

	/**
	 * 선택된 논리 조건을 그룹화하는 함수, 상하 이동 애니메이션 내용을 포함 
	 * @param {HTMLSelectElement} element 
	 * @returns {Promise}
	 */
	grouppingView(element = undefined){
		return new Promise(resolve=>{
			if(element){
			
				let mappingValue = element.value;
				let grouppingView = this.grouppingViewWrapper.querySelector(`div.groupping_view[data-mapping_value="${mappingValue}"]`)
				grouppingView.style.display = '';
				let searchOptions = element.closest('.search_options');
				let {transition, width, position} = searchOptions.style;
				searchOptions.style.width = '98.5vw'
				searchOptions.style.position = 'fixed';
				searchOptions.style.transition = 'all 0.5s';
				
				let lastChild = grouppingView.lastChild;
				let bottom;
				
				if(lastChild && ! lastChild instanceof Text){
					let bottom = lastChild.getBoundingClientRect().bottom;
					searchOptions.style.top = bottom + 'px';
				}else{
					let bottom = grouppingView.getBoundingClientRect().bottom;
					searchOptions.style.top = bottom + 'px';
				}
				searchOptions.removeAttribute('isTrancsitionEnd','');
				const transitionendEvent = () => {
					grouppingView.appendChild(searchOptions);
					Object.assign(searchOptions.style, {
						'transition':transition,'width':width, 'position':position//, 'top':searchOptions.getBoundingClientRect().y + 'px'
					});
					this.grouppingView();
					this.content.querySelectorAll('.search_options').forEach(e=>e.style.top = e.getBoundingClientRect().y + 'px');
					let newTop = searchOptions.getBoundingClientRect().top
					window.scrollTo(undefined,newTop);
					top.scrollTo(undefined,newTop);
					searchOptions.setAttribute('isTrancsitionEnd','');
				}
				searchOptions.ontransitionend = () =>{
					transitionendEvent();
				}
				
				setTimeout(()=>{
					if(element && ! searchOptions.hasAttribute('isTrancsitionEnd')){
						transitionendEvent();
					}
				}, 1000);
				
			}else{

				this.content.querySelectorAll('.search_options').forEach(e=>{
					//e.style.top = e.getBoundingClientRect().y + 'px'
					let logicOptionElement = e.querySelector('[name=logicOptionCode]');
					let mappingValue = logicOptionElement.value;
					let grouppingView = this.grouppingViewWrapper.querySelector(`div.groupping_view[data-mapping_value="${mappingValue}"]`);
					if(grouppingView){
						grouppingView.append(e);
						grouppingView.style.display = '';
						let label = this.grouppingViewWrapper.querySelector(`label[data-logic_label_mapping="${grouppingView.dataset.logic}"]`);
						if(label){
							label.style.display='';
						}
					}
					
				});
			
			}
			let grouppingViewCount = 0;
			this.grouppingViewWrapper.querySelectorAll('div.groupping_view').forEach(e=>{
				let label = this.grouppingViewWrapper.querySelector(`label[data-logic_label_mapping="${e.dataset.logic}"]`);
				if(e.children.length == 0){
					if(e.style.display != 'none'){
						e.dataset.origin_display_style = e.style.display;
					}
					e.style.display = 'none';
				}else {
					grouppingViewCount += 1;
					e.style.display = e.dataset.origin_display_style;
				}
				
				if(label){
					if(e.style.display == 'none'){
						label.style.display = e.style.display;
					}else{
						label.style.display = label.dataset.origin_display_style;
					}
					label.style.display = e.style.display;
				}
				
				if(grouppingViewCount <= 1 && label){
					label.dataset.origin_display_style = label.style.display;
					label.style.display = 'none';
				}
			});
			
			return setTimeout(resolve(''), 0);
		});
	}


}