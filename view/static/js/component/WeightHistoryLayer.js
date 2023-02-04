/**
 * 가중치 관리 화면의 변경 이력 layer에 관한 클래스
 * @author mou123
 * @constructor
 */
class WeightHistoryLayer extends HTMLElement{
	
	/**
	 * 저장 이력의 데이터를 불러오기 할 때의 콜백 함수
	 */
	#historyDataLoadButtonClickCallBack = '';
	
	/**
	 * 저장 이력 정보를 불러오기 전에 실행 할 콜백 함수
	 */
	#historyDataLoadBeforeCallBack = '';
	
	/**
	 * 저장 이력 정보를 불러온 후 실행 할 콜백 함수
	 */
	#historyDataLoadAfterCallBack = '';

	/**
	 * 이 레이어의 부모 (이 레이어를 실행시킨 주체)
	 */
	#layerParent = document.body;
	
	/**
	 * private 페이지 num 변수
	 */
	#pageNum = 1;
	
	/**
	 * private 페이지 size 변수
	 */
	#pageSize = 5;

	/**
	 * 무한 스크롤 구현을 위한 마지막 요소에 등록되는 옵저버
	 */
	#LastTempObserver;

	/**
	 * 저장 이력 데이터를 재사용하기 위한 변수
	 */
	#trList = [];

	/**
	 * 생성자
	 * @author mozu123
	 */
	constructor(){
		
		super();
		this.className = 'layer_dim';
		
		this.onmousedown = (event) => event.composedPath()[0] == this ? this.removeAttribute('open') : ''
		
		this.innerHTML = `
			<div class="layer_wrapper" 
				style="width: 70vw;height: 42vh;background-color: white;display: flex;font-size: 1vmax;flex-direction: column;row-gap: 1vh;margin-top: 5vh;outline: none;overflow-y: scroll;"
				tabindex="0">
				<div style="display: flex;align-items: center;justify-content: flex-end;margin-top: 1vh;">
					<button type="button" class="btn-sm btn-func" id="close_layer_btn">닫기</button>
				</div>
				<table class="tbl-row">
					<thead>
						<tr>
							<th col="">No</th>
							<th style="width: 25%;">이름</th>
							<th>전시여부</th>
							<th>언어</th>
							<th>작성자</th>
							<th>작성 일시</th>
							<th>수정자</th>
							<th>수정 일시</th>
							<th></th>
						</tr>
						</thead>
					<tbody>
					</tbody>
				</table>
			</div>
		`
			
		new MutationObserver( (mutationList)=> {
			mutationList.forEach( (mutation) => {
				if( ! mutation.target.hasAttribute('open')){
					this.reset();
					this.remove();
					this.#layerParent.focus();
				}else{
					this.landingHistory();
					document.body.append(this);
					this.children[0].focus();
				}
			});
		}).observe(this, {
			attributeFilter:['open'],
			attributeOldValue:true
		});
		
		this.querySelector('.layer_wrapper').onkeyup = (event)=> {
			if(event.key == 'Escape'){
				this.close();
			}
		}
		
		this.querySelector('#close_layer_btn').onclick = (event) =>{
			this.close();
		}
		
	}
	
	/**
	 * historyDataLoadButtonClickCallBack의 setter
	 * @author mozu123
	 * @param {Function} callBackFun : 저장 이력의 데이터를 불러오기 할 때의 콜백 함수
	 */
	set historyDataLoadButtonClickCallBack(callBackFun){
		this.#historyDataLoadButtonClickCallBack = callBackFun;
	}
	/**
	 * historyDataLoadBeforeCallBack의 setter
	 * @author mozu123
	 * @param {Function} callBackFun : 저장 이력 정보를 불러오기 전에 실행 할 콜백 함수
	 */
	set historyDataLoadBeforeCallBack(callBackFun){
		this.#historyDataLoadBeforeCallBack = callBackFun;
	}
	/**
	 * historyDataLoadAfterCallBack의 setter
	 * @author mozu123
	 * @param {Function} callBackFun : 저장 이력 정보를 불러온 후 실행 할 콜백 함수
	 */
	set historyDataLoadAfterCallBack(callBackFun){
		this.#historyDataLoadAfterCallBack = callBackFun;
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
	 * pageNum의 setter
	 * @author mozu123
	 * @param {Number} num : 페이지 num
	 */
	set pageNum(num){
		this.#pageNum = num;
	}
	/**
	 * pageSize의 setter
	 * @author mozu123
	 * @param {Number} size : 페이지 size
	 */
	set pageSize(size){
		this.#pageSize = size;
	}

	/**
	 * layerParent의 getter
	 * @author mozu123
	 * @return {HTMLElement}
	 */
	get layerParent(){
		return this.#layerParent;
	}
	/**
	 * pageNum의 getter
	 * @author mozu123
	 * @return {Number}
	 */
	get pageNum(){
		return this.#pageNum;
	}
	/**
	 * pageSize의 getter
	 * @author mozu123
	 * @return {Number}
	 */
	get pageSize(){
		return this.#pageSize;
	}
	
	/**
	 * 저장 이력을 불러와서 이 레이어에 그려주는 함수
	 * @author mozu123
	 * @returns {Object} 서버로부터 받은 queryMst 객체
	 */
	landingHistory(){
		return new Promise(resolve=>{
			if(this.#historyDataLoadBeforeCallBack instanceof Function){
				this.#historyDataLoadBeforeCallBack();
			}
            $.ajax({
                dataType:'json',
                url:'/display/search-word/weight/search-change-query-history',
                contentType : 'application/json; charset=utf-8',
                data: JSON.stringify({
                    pageNum:this.#pageNum, 
                    rowsPerPage:this.#pageSize
                }),
                async: false,
            }).done((data)=>{
                this.#trList.push(...data.map(queryMst=>{
                    let tr = document.createElement('tr')
                    
                    let noTd = Object.assign(document.createElement('td'),{textContent:queryMst.srchQueryNo});
                    let nameTd = Object.assign(document.createElement('td'),{textContent:queryMst.hisName});
                    let dispYnTd = Object.assign(document.createElement('td'),{textContent:queryMst.dispYn});
                    let langCodeTd = Object.assign(document.createElement('td'),{textContent:queryMst.langCode});
                    let rgstIdTd = Object.assign(document.createElement('td'),{textContent:queryMst.rgstId});
                    let rgstDtmTd = Object.assign(document.createElement('td'),{textContent:queryMst.rgstDtm});
                    let modIdTd = Object.assign(document.createElement('td'),{textContent:queryMst.modId})
                    let modDtmTd = Object.assign(document.createElement('td'),{textContent:queryMst.modDtm});
                    let loadTd = document.createElement('td');

                    let loadBtn = Object.assign(document.createElement('button'),{
                        type:'button',
                        className:'btn-sm btn-func',
                        textContent:'불러오기',
                        onclick:()=>{
                            if(this.#historyDataLoadButtonClickCallBack instanceof Function){
                                this.#historyDataLoadButtonClickCallBack(queryMst);
                            }
                            //진짜 리무브가 아니라 document에서만 리무브하는 것이므로 주의할 것
                            this.remove();
                        }
                    });

                    loadTd.append(loadBtn);
                    tr.dataset.no_id = queryMst.srchQueryNo;
                    tr.dataset.lang_code = queryMst.langCode;
                    tr.dataset.aces_cntry_code = queryMst.acesCntryCode;
                    tr.append( noTd, nameTd, dispYnTd, langCodeTd, rgstIdTd, rgstDtmTd, modIdTd, modDtmTd, loadTd );
                    return tr;
                }));
                this.querySelector('table.tbl-row tbody').append(...this.#trList);
                //this.tempItemLength += this.#trList.length;
                if(this.#LastTempObserver){
                    this.#LastTempObserver.disconnect()
                }
                this.#LastTempObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry =>{
                        if (entry.isIntersecting && data.length != 0) {
                            this.pageNum += 1;
                            this.landingHistory()
                        }
                    });
                }, {
                    threshold: 0.1,
                    root: this.querySelector('.layer_wrapper')
                });
                if(this.#trList[this.#trList.length -1]){
                    this.#LastTempObserver.observe(this.#trList[this.#trList.length -1]);
                }
                
                if(this.#historyDataLoadAfterCallBack instanceof Function){
                    return this.#historyDataLoadAfterCallBack();
                }
            });
            return setTimeout(resolve(this.prevQueryMst), 0);
		}).catch(e=>console.log(e));
	}
	
	/**
	 * 이 레이어에 그려진 데이터를 리셋한다.
	 * @author mozu123
	 */
	reset(){
		this.querySelector('table.tbl-row tbody').replaceChildren();
		this.#pageNum = 1;
		this.#trList = [];
	};
	
	/**
	 * 이 레이어를 닫는 함수
	 * @param {Function} callBackFunction : 이 레이어를 닫은 후 실행 할 콜백 함수 
	 * @returns {Function} callBakcFunction
	 */
	close(callBackFunction){
		this.removeAttribute('open');
		if(callBackFunction instanceof Function){
			return callBackFunction();
		}
	}

	/**
	 * 이 레이어를 여는 함수
	 * @param {Function} callBackFunction : 이 레이어를 연 후 실행 할 콜백 함수
	 * @returns {Function} callBackFunction
	 */
	open(callBackFunction){
		this.setAttribute('open', '')
		if(callBackFunction instanceof Function){
			return callBackFunction();
		}
	}
}

window.customElements.define('weight-history-layer', WeightHistoryLayer);

/*
class WeightHistoryLayer extends HTMLElement{
    #isLoadEnd = false;
    constructor(){
        super();
    }
    connectedCallback(){
        if( ! this.#isLoadEnd){
            this.innerHTML = `
                <div>
                    <span>i'm layer</span>
                </div>
            `
            this.#isLoadEnd = true;
        }
    }
}
window.customElements.define('weight-history-layer', WeightHistoryLayer);
document.body.append( document.createElement('weight-history-layer') )
*/