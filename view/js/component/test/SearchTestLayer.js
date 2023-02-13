/**
 * 가중치 관리 화면의 테스트 레이어 화면 관련 클래스
 * @author mozu123
 * @constructor
 */
class SearchTestLayer extends HTMLElement {
	
	/**
	 * 서버에 전송할 파라미터 값을 생성 할 콜백 함수
	 */
	#createParameterFunction = '';
	
	/**
	 * private pageNum 변수 
	 */
	#prdtPageNum = 1;

	/**
	 * private PageSize 변수
	 */
	#prdtPageSize = 24; 
	
	/**
	 * 상품 정보를 그려주고 난 후 재사용 목적의 history list, 여기에 상품 리스트별 li 태그가 들어간다.
	 */
	#prdtHistoryList = [];

	/**
	 * 이전에 호출 한 상품 정보의 raw 데이터로 재사용 목적의 object
	 */
	#prevPrdtData;
	
	/**
	 * 무한 스크롤 구현을 위한 마지막 li 태그에 등록되는 옵저버
	 */
	#LastPrdtObserver;

	/**
	 * 테스트 화면에서 특정 필드 값 보기 셀렉트 박스의 key-value 값들
	 */
	#fieldFilterMapper = {};
	
	/**
	 * 이 레이어의 부모(이 레이어를 띄우는 부모)
	 */
	#layerParent = document.body;

	/**
	 * 이미지 경로
	 */
	#imgPath;
	
	/**
	 * SearchTestLayer의 생성자
	 * @author mozu123
	 * @param {Function} createParameterFunction : 서버에 전송할 파라미터 값을 생성 할 콜백 함수
	 * @param {String} imgPath : 이미지 경로
	 */
	constructor(createParameterFunction, imgPath){
		super();
		this.#createParameterFunction = createParameterFunction;
		this.#imgPath = imgPath;
		this.onmousedown = (event) => event.composedPath()[0] == event.currentTarget ? this.close() : '';
		this.className = 'layer_dim';
		this.innerHTML = `
			<div class="layer_wrapper" style="width: 85vw;height: 90vh;background-color: white;display: flex;font-size: 1vmax;flex-direction: column;row-gap: 1.5vh;margin-top: 5vh;outline: none;" tabindex="0">
				<div calss="top_wrapper" style="display: flex;justify-content: space-between;margin-top: 1.5vh;padding-left: 1%;padding-right: 1%;">
					<div>
						<button type="button" class="btn-lg btn-link" id="set_query_fo_btn" style="font-weight: bold;">FO 반영</button>
					</div>
					<div style="display: flex;column-gap: 1vw;">
						<select id="search_field" class="ui-sel" style="width: 15vw;">
							
						</select>
						<label style="font-size: 0.5vmax;width: 15vw;align-self: center;line-height: 1.6vh;">
							강조 표시는 브랜드리스트, 카테고리리스트, 상품명, 연관검색, 속성리스트만 됩니다.
						</label>
					</div>
					<div class="button_wrapper" style="background-color: white;display: flex;font-size: 1vmax;column-gap: 3vw;height: auto;">
						<button type="button" class="btn-lg btn-func" id="search_test_layer_close">닫기</button>
					</div>
				</div>
				<div class="select_wrapper" style="display: flex;align-items: center;column-gap: 1vw;justify-content: space-between;padding-left: 1%;padding-right: 1%;">
					<div style="display: grid;">
						<span class="prdt_found" style="border: inset;"></span>
						<span class="view_prdt_count" style="border: inset; text-align: center;"></span>
					</div>
					<div class="search_wrapper" style="display: grid;gap: 20%;">
						<input type="text" class="input_search_keyword ui-input" placeholder="고객이 입력 할 키워드 (엔터 검색)" style="width:25vw;"/>
					</div>
				</div>
				<div class="select_view_icon_wrapper">
					<ul style="display: flex;">
						<li>
							<button type="button" class="field_filter_button" data-field_name="_score">스코어</button>
						</li>
						<li>
							<button type="button" class="field_filter_button" data-field_name="sell_popular">판매 인기도</button>
						</li>
					</ul>
				</div>
				<div class="prdt_wrapper" style="border: inset;margin: 0.2vmax; overflow-y: auto;">
					<ul style="display: flex;flex-wrap: wrap;">
					</ul>
				</div>
			</div>
		`
		new MutationObserver( (mutationList)=> {
			mutationList.forEach( (mutation) => {
				if( ! mutation.target.hasAttribute('open')){
					this.reset();
					this.remove();
					this.#layerParent.focus();
				}else{
					this.#createParameterFunction(this.querySelector('.input_search_keyword').value)
						.then( parameter => this.checkValidationParameter(parameter) )
						.then( parameter => this.callSearchTestViewData(parameter, {isReset: true}) )
						.then( () => {
							document.body.append(this);
							this.children[0].focus();
						})
					.catch(errorMessage => alert(errorMessage));
				}
			});
		}).observe(this, {
			attributeFilter:['open'],
			attributeOldValue:true
		});
		
		this.querySelector('.layer_wrapper').onkeyup = (event) => {
			if(event.key=='Enter'){
				this.#createParameterFunction(this.querySelector('.input_search_keyword').value)
					.then( parameter => {
						if(this.sortSelect){
							parameter.sortCode = this.sortSelect.value;
						}
						return this.checkValidationParameter(parameter);
					})
					.then( parameter => this.callSearchTestViewData(parameter, {isReset: true}) )
				.catch(errorMessage => alert(errorMessage));
			}else if(event.key =='Escape'){
				this.close();
			}
		}
		
		this.querySelector('#set_query_fo_btn').onclick = (event) => this.updateQuery();
		
		this.querySelector('#search_field').onchange = (event) => this.addFieldFilterItem(event.target);
		
		this.querySelector('#search_test_layer_close').onclick = (event) => this.close();
		
		this.querySelectorAll('.select_view_icon_wrapper > ul > li button.field_filter_button').forEach(e=>{
			e.onclick = (event) =>{
				event.target.parentElement.remove();
				this.reset();
				this.landingPrdtView(this.#prevPrdtData);
			}
		});
		
		// 서버로부터 aws에 등록된 필드 정보를 가져와서 레이어 화면에 그려준다.
		$.ajax({
			dataType:'json',
			url:'/display/search-word/weight/search-sort-info',
			contentType : 'application/json; charset=utf-8'
		}).done((data)=>{
			let sortSelect = Object.assign(document.createElement('select'),{
				className : 'sort_select ui-sel',
				innerHTML : `${data.map( e => `<option value="${e.codeDtlNo}">${e.codeDtlName}</option>`)}`,
				onchange : () => {
					this.#createParameterFunction(this.querySelector('.input_search_keyword').value)
					.then( parameter => {
						if(this.sortSelect){
							parameter.sortCode = this.sortSelect.value;
						}
						return this.checkValidationParameter(parameter);
					})
					.then( parameter => this.callSearchTestViewData(parameter, {isReset: true}) )
					.catch(errorMessage => alert(errorMessage));
				}
			});
			Object.assign(sortSelect.style, {width:'8vw',marginLeft:'auto'});
			this.sortSelect = sortSelect;
			this.querySelector('.search_wrapper').append(this.sortSelect);
			
		}).fail((data)=>{
			alert('테스트 실패\n에러 원인 :::\n'+data.responseText);
			console.log(data);
			this.close();
			this.remove();
		});
	}
	
	/**
	 * layerParent의 setter
	 * @author mozu123
	 * @param {HTMLElement} parent : 이 레이어를 띄운 주체
	 */
	set layerParent(parent){
		this.#layerParent = parent;
	}
	
	/**
	 * 서버에 쿼리 정보를 던지기 전에 벨리데이션해서 얼럿 띄우는 용도의 함수
 	 * @author mou123
 	 * @returns {Promise} parameter : error가 발생하지 않을 경우 서버로 전송 할 request body (parameter)를 리턴하며, error 발생시 서버에서 던져준 error message alert이 발생
	 * @see shop.display.searchword.weight.js PageHandler.createParameter()
	 */
	checkValidationParameter(parameter){
		return new Promise(resolve=>{
			parameter.pageNum = this.#prdtPageNum;
			parameter.rowsPerPage = this.#prdtPageSize;
			let findFirstEmptyErrorMessage = undefined;
			let targetFindNames = {
				'compoundOptionCode':'검색 옵션이 비어있습니다.',
				'fieldName':'필드 이름이 비어있습니다.',
				'logicOptionCode':'논리 조건이 비어있습니다.'
			}
			for(let item of parameter.queryDtlList){
				if(item.compoundOptionCode == '40' && (item.staticKeyword == '' || item.staticKeyword == '[,]')){
					findFirstEmptyErrorMessage = 'range 검색 옵션은 숫자 필수 입력입니다.'
					break;
				}else if( ! findFirstEmptyErrorMessage){
					for(let [k,v] of Object.entries(item)){
						if(v == '' && ! findFirstEmptyErrorMessage && k != 'staticKeyword'){
							findFirstEmptyErrorMessage = targetFindNames[k]
							break;
						}else if(k == 'boostOption' && v === '0'){
							findFirstEmptyErrorMessage = '부스트 옵션은 0이 될 수 없습니다.'
						}
					}
				}else{
					break;
				}
			}
			if(parameter.srchQueryTypeCode == ''){
				throw new Error('페이지 코드를 선택해주세요');
			}else if( ! parameter.hasOwnProperty('parentLogicCode') || parameter.parentLogicCode == ''){
				throw new Error('부모 논리 선택해주세요');
			}else if(document.querySelectorAll('.search_options').length == 0){
				throw new Error('검색 필드가 비어 있습니다.');
			}else if(findFirstEmptyErrorMessage){
				throw new Error(findFirstEmptyErrorMessage)
			}else{
				return setTimeout(resolve(parameter), 0);
			}
		});
	}
	
	/**
	 * 매개변수로 받아온 파라미터를 서버로 전송하여 상품 정보를 가져와서 landingPrdtView 함수를 실행하는 함수 
	 * @author mozu123
	 * @param {Object} parameter : 서버에 전송 할 parameter
	 * @param {Object} isReset : 상품 정보를 화면에 그려줄 때, 화면을 리셋 한 후 다시 그릴지 여부, 무한 스크롤에 의해 데이터가 추가로 인입된 경우 isRest은 false, 새로운 검색어로 검색 할 경우 화면을 초기화 후 해당 검색어의 상품 결과를 뿌려줄 때 true 
	 * @returns {Promise} parameter
	 * @see this.landingPrdtView()
	 */
	callSearchTestViewData(parameter, {isReset = false}){
		return new Promise(resolve=>{
			parameter.isHighlightList = [...this.querySelector('#search_field').options].filter(e=>e.dataset.highlightenabled == 'true').map(e=>{
				let obj = {};
				obj[e.value] = Boolean(e.dataset.highlightenabled);
				return obj
			});
			$.ajax({
				dataType:'json',
				url:'/display/search-word/weight/search-test-weight',
				contentType : 'application/json; charset=utf-8',
				data: JSON.stringify(parameter),
				async: false
			}).done((data)=>{
				if(isReset){
					this.reset();
				}
				this.#prevPrdtData = data;
				this.landingPrdtView(this.#prevPrdtData);
				this.children[0].focus();
			}).fail((data)=>{
				alert('테스트 실패\n에러 원인 :::\n'+data.responseText);
				console.log(data);
				throw Error();
			});
			return setTimeout(resolve(parameter), 0);
			
		});
	}
	
	/**
	 * 서버로부터 반환받은 queryMst 정보를 화면에 그려준다.
	 * @author mozu123
	 * @param {Object} queryMst 
	 * @see this.callPageQuery
	 */
	landingPrdtView({hits = undefined}){
		return new Promise(resolve=>{
			let {found, hit, start} = hits
			this.#fieldFilterMapper = [...this.querySelectorAll('.select_view_icon_wrapper ul li button')].reduce((t,e,i)=>{
				t[e.dataset.field_name] = e.textContent;
				return t;
			},{});
			let prdtViewportCountElement = this.querySelector('.select_wrapper span.view_prdt_count');
			this.#prdtHistoryList.push( ...hit.map(hitItem=>{
				let fields = this.getAllField(hitItem);
				let li = Object.assign(document.createElement('li'),{
					className:'prdt_item',
					innerHTML:`
						<div class="image_wrapper">
							<img src=${this.#imgPath + fields.image_path} alt="이미지 경로가 잘못된듯"/>
						</div>
						<div>
							${
								Object.entries(this.#fieldFilterMapper).map(([k,v])=> {
									if(fields[k] && fields[k] instanceof Array){
										return `<div style="display: flex;justify-content: center;column-gap: 0.5vw;">
													<span style="color: #0000005e;">${v} : </span>
													<span>${fields[k].join(', ')}</span>
												</div>`;
									}else if(fields[k]){
										return `<div style="display: flex;justify-content: center;column-gap: 0.5vw;">
													<span style="color: #0000005e;">${v} : </span>
													<span>${fields[k]}</span>
												</div>`;
									}else{
										return '';
									}
								}).join('')
							}
						</div>
					`
				});
				this.addPrdtInnerViewportEvent(li,found,prdtViewportCountElement)
				return li
			}) );

			this.querySelector('.select_wrapper span.prdt_found').textContent = '상품 수 '+ found + ' 개';
			if(found == 0){
				prdtViewportCountElement.textContent = 0 + ' / ' + 0	
			}
			this.dataset.max_prdt_count = found;
			this.querySelector('.prdt_wrapper ul').replaceChildren(...this.#prdtHistoryList);
			
			if(this.#LastPrdtObserver){
				this.#LastPrdtObserver.disconnect()
			}

			this.#LastPrdtObserver = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry =>{
					if (entry.isIntersecting && hit.length != 0) {
						this.#prdtPageNum += 1;
						this.#createParameterFunction(this.querySelector('.input_search_keyword').value)
							.then( parameter => this.checkValidationParameter(parameter) )
							.then( parameter => this.callSearchTestViewData(parameter,{}) )
						.catch(errorMessage => alert(errorMessage));
					}
				});
			}, {
				threshold: 0.1,
				root: this.querySelector('.prdt_wrapper')
			});
			
			if(this.#prdtHistoryList[this.#prdtHistoryList.length -1] && hit.length >= this.#prdtPageSize){
				this.#LastPrdtObserver.observe(this.#prdtHistoryList[this.#prdtHistoryList.length -1]);
			}
			
			return setTimeout(resolve(), 0);
		});
	}
	
	/**
	 * 변경 된 쿼리문을 검색 가중치 테이블에 업데이트 요청을 날리는 함수, FO쪽이 검색 가중치 테이블을 바라보고 있다.
	 * @returns {Promise} 
	 * @see shop.display.searchword.weight.js PageHandler.createParameter()
	 * @author mou123
	 */
	updateQuery(){
		let prompt = window.prompt('확인을 누를시 FO 화면에 즉시 반영됩니다.\n저장 이력을 식별 할 명칭을 정해주십시오.\n반영하시겠습니까?')
		if(prompt && prompt.length != 0){
			return this.#createParameterFunction().then(parameter=>{
				parameter.hisName = prompt;
				$.ajax({
					dataType:'json',
					url:'/display/search-word/weight/update-weight',
					contentType : 'application/json; charset=utf-8',
					data: JSON.stringify(parameter),
					async: false
				}).done((data)=>{
					console.log(data);
					document.forms.query_mst.elements.langCode.selectedOptions[0].dataset.query_mst_no = data.resultQueryMst.srchQueryNo;
					alert(data.updateResult + '건 저장 성공');
					
				}).fail((data)=>{
					alert('저장 실패')
					console.log(data);
				})
			});
		}else if(prompt == ''){
			alert('저장 이력을 식별 할 명칭을 정해주십시오.');
			return;
		}else{
			return;
		}
	}
	
	/**
	 * 검색결과 화면의 각 상품 항목에 viewport 바깥과 안쪽에 위치할 때를 감지하는 이벤트를 정의하는 함수
	 * @author mozu123
	 * @param {HTMLLIElement} prdtItem
	 * @param {Number} maxCount
	 * @param {HTMLSpanElement} nowCountElement
	 */
	addPrdtInnerViewportEvent(prdtItem, maxCount, nowCountElement){
		let intersectionObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry =>{
				if (entry.isIntersecting) {
					entry.target.style.visibility= '';
					entry.target.style.opacity = '';
				}else{
					entry.target.style.visibility = 'hidden';
					entry.target.style.opacity = 0;
				}
				nowCountElement.textContent = this.#prdtHistoryList.length + ' / ' + maxCount
			});
		}, {
			threshold: 0.1,
			root: this.querySelector('.prdt_wrapper')
		});
		if(prdtItem){
			intersectionObserver.observe(prdtItem);
			prdtItem['_prdtItemIntersectionObserver'] = intersectionObserver;
		}
	}

	/**
	 * 레이어 화면에서 셀렉트 박스를 변경하면 검색 결과 화면 상단에 필드 아이템을 추가해주고(필터가 아님 필드 값 확인용임), 검색결과 화면에 추가된 필드 명칭과 값을 append 한다. 
	 * @author mozu123
	 * @param {HTMLSelectElement} element
	 */
	addFieldFilterItem(element){
		return new Promise(resolve=>{
			if( ! this.#fieldFilterMapper.hasOwnProperty(element.value)){
				this.reset();
				let li = document.createElement('li');
				let fieldItemButton = Object.assign(document.createElement('button'),{
					className:'field_filter_button',
					type:'button',
					textContent: element.selectedOptions[0].textContent,
					onclick: (event)=>{
						li.remove();
						this.reset();
						this.landingPrdtView(this.#prevPrdtData);
					}
				});
				fieldItemButton.dataset.field_name = element.value;
				li.append(fieldItemButton);
				this.querySelector('.select_view_icon_wrapper > ul').append(li);
				
				this.landingPrdtView(this.#prevPrdtData, false);
				return setTimeout(resolve(''), 1);
			}
		});						
	}
	
	/**
	 * hits.hit 객체 안에 있는 exprs, fields, highlights를 합친다. fields와 highlights가 키값이 겹칠 경우 highlights의 값을 기준으로 덮어씌우도록 한다.
	 * @author mozu123
	 * @param {Object} param0 : exprs, fields, highlights라는 키값을 가지고 있는 Object
	 * @return Object
	 */
	getAllField({exprs={}, fields={}, highlights={}}){
		return Object.assign(
			{}, exprs, fields, Object.entries(highlights).reduce((t,[k,v],i)=>{
				if(v!=''){
					t[k]=v
				}
				return t;
			},{})
		);
	}
	
	/**
	 * 검색 결과 화면을 리셋하는 함수로, 검색 결과 화면을 그려줄 때, 다음 페이지를 이어서 그려주는 경우가 아닌 재검색에 의한 신규 검색 결과 화면이 필요한 경우 이 함수를 먼저 실행시킨다.
	 * @author mozu123
	 */
	reset(){
		this.#prdtHistoryList.forEach(e=>{
			e._prdtItemIntersectionObserver.disconnect();
		})
		this.#prdtHistoryList = []; 
		this.#prdtPageNum = 1; 
	}
	close(callBackFunction){
		this.removeAttribute('open');
		if(callBackFunction instanceof Function){
			return callBackFunction();
		}
	}
	open(callBackFunction){
		this.setAttribute('open', '')
		if(callBackFunction instanceof Function){
			return callBackFunction();
		}

	}
}
window.customElements.define('search-test-layer', SearchTestLayer);
