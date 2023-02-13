/**
 * indexed db에서 사용 할 임시저장 기능의 임시저장 layer 관련 클래스
 */
class TempQueryLayer extends HTMLElement{

	/**
	 * 이 레이어와 연결 될 indexedDB 객체
	 */
	#indexedDBHandler;
	
	/**
	 * 임시 저장 이력의 데이터를 불러오기 버튼을 클릭 할 때의 콜백 함수
	 */
	#tempDataLoadButtonClickCallBack = '';
	
	/**
	 * 임시 저장 이력 정보를 불러오기 전에 실행 할 콜백 함수
	 */
	#tempDataLoadBeforeCallBack = '';
	
	/**
	 * 임시 저장 이력 정보를 불러온 후 실행 할 콜백 함수
	 */
	#tempDataLoadAfterCallBack = '';
	
	/**
	 * 이 레이어를 띄우는 부모 element (레이어를 띄우는 주체)
	 */
	#layerParent = document.body;
	
	/**
	 * private page num
	 */
	#pageNum = 1;

	/**
	 * private page size
	 */
	#pageSize = 5;

	/**
	 * 무한 스크롤 구현을 위한 마지막 요소에 등록되는 옵저버
	 */
	#LastTempObserver;

	/**
	 * 임시 저장 이력 데이터를 재사용하기 위한 변수
	 */
	#trList = [];

	/**
	 * TempQueryLayer의 생성자
	 * @param {IndexedDBHandler} indexedDBHandler 
	 */
	constructor(indexedDBHandler){
		super();
		this.#indexedDBHandler = indexedDBHandler;
		this.className = 'layer_dim';
		
		this.onmousedown = (event) => event.composedPath()[0] == this ? this.removeAttribute('open') : ''
		
		this.innerHTML = `
			<div class="layer_wrapper" 
				style="width: 60vw;height: 37vh;background-color: white;display: flex;font-size: 1vmax;flex-direction: column;row-gap: 1vh;margin-top: 5vh;outline: none;overflow-y: scroll;"
				tabindex="0">
				<div style="display: flex;align-items: center;justify-content: flex-end;margin-top: 1vh;">
					<button type="button" class="btn-sm btn-func" id="select_delete_btn">선택 삭제</button>
					<button type="button" class="btn-sm btn-func" id="close_layer_btn" onclick = "">닫기</button>
				</div>
				<table class="tbl-row">
					<thead>
						<tr>
							<th>
								<input type="checkbox" id="all_delete"/>
							</th>
							<th col="">No</th>
							<th style="width: 50%;">이름</th>
							<th>저장 일시</th>
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
					this.landingTempData();
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
		
		this.querySelector('#select_delete_btn').onclick = (event) => this.deleteButtonClickEvent();
		
		this.querySelector('#all_delete').onchange = (event) => this.#trList.forEach(e=>e.querySelector('.delete_checkbox').checked = event.currentTarget.checked);
		
	}
	
	/**
	 * tempDataLoadButtonClickCallBack setter
	 * @author mozu123
	 * @param {Function} callBackFun : 임시 저장 이력의 데이터를 불러오기 할 때의 콜백 함수
	 */
	set tempDataLoadButtonClickCallBack(callBackFun){
		this.#tempDataLoadButtonClickCallBack = callBackFun;
	}
	/**
	 * tempDataLoadBeforeCallBack setter
	 * @author mozu123
	 * @param {Function} callBackFun : 임시 저장 이력 정보를 불러오기 전에 실행 할 콜백 함수
	 */
	set tempDataLoadBeforeCallBack(callBackFun){
		this.#tempDataLoadBeforeCallBack = callBackFun;
	}
	/**
	 * tempDataLoadAfterCallBack setter
	 * @author mozu123
	 * @param {Function} callBackFun : 임시 저장 이력 정보를 불러온 후 실행 할 콜백 함수
	 */
	set tempDataLoadAfterCallBack(callBackFun){
		this.#tempDataLoadAfterCallBack = callBackFun;
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
	 * tempDataLoadButtonClickCallBack getter
	 * @author mozu123
	 * @return {Function} tempDataLoadButtonClickCallBack
	 */
	get tempDataLoadButtonClickCallBack(){
		return this.#tempDataLoadButtonClickCallBack;
	}
	/**
	 * tempDataLoadBeforeCallBack getter
	 * @author mozu123
	 * @return {Function} tempDataLoadBeforeCallBack
	 */
	get tempDataLoadBeforeCallBack(){
		return this.#tempDataLoadBeforeCallBack;
	}
	/**
	 * tempDataLoadAfterCallBack getter
	 * @author mozu123
	 * @return {Function} tempDataLoadAfterCallBack
	 */
	get tempDataLoadAfterCallBack(){
		return this.#tempDataLoadAfterCallBack;
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
	 * 임시 저장 이력을 불러와서 이 레이어에 그려주는 함수
	 * @author mozu123
	 */
	landingTempData(){
		return this.#indexedDBHandler.getTempList(this).then(result=>{
			if(this.#tempDataLoadBeforeCallBack instanceof Function){
				this.#tempDataLoadBeforeCallBack();
			}
			this.#trList.push(...result.data.map(temp=>{
				let tr = document.createElement('tr')
				
				let inputDeleteBox = document.createElement('input');
				Object.assign( inputDeleteBox, {
					type:'checkbox', 
					className:'delete_checkbox', 
					onchange : ()=>{
						let allDeleteElement = this.querySelector('#all_delete');
						if(this.querySelectorAll('input.delete_checkbox:checked').length == this.#trList.length){
							allDeleteElement.checked = true;
						}else{
							allDeleteElement.checked = false;
						}
					}
				});
				let checkboxTd = document.createElement('td');
				checkboxTd.append(inputDeleteBox);
				
				let noTd = Object.assign(document.createElement('td'),{textContent:temp.boTempId});
				let nameTd = Object.assign(document.createElement('td'),{textContent:temp.boTempName});
				let insertDtmTd = Object.assign(document.createElement('td'),{textContent:new Date(temp.boTempInsertTime).toLocaleString()});
				let loadTd = document.createElement('td');

				let loadBtn = Object.assign(document.createElement('button'),{
					type:'button',
					className:'btn-sm btn-func',
					textContent:'불러오기',
					onclick:()=>{
						if(this.#tempDataLoadButtonClickCallBack instanceof Function){
							this.#tempDataLoadButtonClickCallBack(temp.boTempData);
						}
						//진짜 리무브가 아니라 document에서만 리무브하는 것이므로 주의할 것, (제이쿼리 리무브와는 다르다. 제이쿼리와는...)
						this.remove();
					}
				});

				loadTd.append(loadBtn);
				tr.dataset.temp_id = temp.boTempId;
				tr.append( checkboxTd, noTd, nameTd, insertDtmTd, loadTd );
				return tr;
			}));
			this.querySelector('table.tbl-row tbody').append(...this.#trList);
			//this.tempItemLength += this.#trList.length;
			if(this.#LastTempObserver){
				this.#LastTempObserver.disconnect()
			}
			this.#LastTempObserver = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry =>{
					if (entry.isIntersecting && result.data.length != 0) {
						this.pageNum += 1;
						this.landingTempData()
					}
				});
			}, {
				threshold: 0.1,
				root: this.querySelector('.layer_wrapper')
			});
			if(this.#trList[this.#trList.length -1]){
				this.#LastTempObserver.observe(this.#trList[this.#trList.length -1]);
			}
			
			if(this.#tempDataLoadAfterCallBack instanceof Function){
				return this.#tempDataLoadAfterCallBack();
			}
			return true;
		}).catch(e=>console.log(e));
	}
	
	/**
	 * 삭제 버튼을 누를시 동작하는 함수
	 * @author mozu123
	 * @returns 
	 */
	deleteButtonClickEvent(){
		let deleteTrList = this.#trList.filter(e=>e.querySelector('.delete_checkbox').checked);
		if(deleteTrList.length == 0){
			alert('선택된 행이 없습니다.');
			return;
		}
		this.#indexedDBHandler.deleteTempItem(...deleteTrList.map(e=>e.dataset.temp_id)).then(result=>{
			alert(result.successCount + '건 삭제 완료')
			deleteTrList.forEach(e=>{
				e.remove()
			});
			this.#trList = this.#trList.filter(e=> ! e.querySelector('.delete_checkbox').checked)
		});
	}

	/**
	 * 이 레이어에 그려진 데이터를 리셋한다.
	 * @author mozu123
	 */
	reset(){
		this.querySelector('table.tbl-row tbody').replaceChildren();
		this.querySelector('#all_delete').checked = false;
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

window.customElements.define('temp-query-layer', TempQueryLayer);