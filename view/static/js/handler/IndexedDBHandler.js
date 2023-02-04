/**
 * indexedDB 템플릿 (미완성)
 * @author mou123
 * @constructor
 */
export default class IndexedDBHandler{
	/**
	 * indexed db에서 사용할 db 식별 명칭
	 */
	#dbName;

	/**
	 * indexed db의 store에서 사용 할 컬럼 정보
	 */
	#columnInfo;

	/**
	 * store 식별 명칭
	 */
	#storeName;

	#db;

	isOpen = false;

	#container;

	/**
	 * 생성자
	 * @author mozu123
	 */
	constructor({
		dbName = undefined,
		columnInfo = undefined,
		storeName = undefined
	}){
		if( ! dbName || ! columnInfo || ! storeName ){
			throw new Error('dbName is undefined');
		}else if( ! columnInfo ){
			throw new Error('columnInfo is undefined');
		}else if( ! storeName ){
			throw new Error('storeName is ubdefined')
		}else{
			this.#dbName = dbName;
			this.#columnInfo = columnInfo;
			this.#storeName = storeName;	
			this.#container = JSON.stringify(
				Object.entries(columnInfo).reduce((obj, [k,v], idx) => {
					obj[k] = undefined;
					return obj;
				}, {})
			)
		}
	}

	open(){
		return new Promise( (resolve, reject) => {

			const dbOpenRequest = indexedDB.open(this.DB_NAME);
			/**
			 * db open시 기존 버전 정보를 비교하였을 때, 업그레이드가 필요한 경우 동작하는 이벤트를 정의한다.
			 * @author mozu123
			 * @param {Event} e 
			 * @returns 
			 * @see this.upgradeneeded()
			 */
			dbOpenRequest.onupgradeneeded = (e) => this.upgradeneeded(e,{});
			
			/**
			 * db open시 동작하는 이벤트를 정의한다.
			 * @param {Event} e 
			 */
			dbOpenRequest.onsuccess = (e) => {
				this.isOpen = true;
				this.#db = e.target.result;
				let storeName = Object.entries(this.#db.objectStoreNames).find(([idx, storeName]) => storeName == this.DB_STORE_NAME)
				let isNewAddStore = ! storeName;
				let isNeedChangeIndex = false;

				if( ! isNewAddStore){
					let store = this.#db.transaction(this.DB_STORE_NAME, 'readwrite').objectStore(this.DB_STORE_NAME);
					let indexNamesMapper = Object.entries(store.indexNames).reduce((t,[idx,indexName])=>{
						t[indexName]=idx
						return t;
					},{});
					isNeedChangeIndex = 
						Object.entries(indexNamesMapper).findIndex(([name,idx]) => ! this.#columnInfo[name] ) != -1 ||
						Object.entries(this.#columnInfo).findIndex(([k,v])=> ! indexNamesMapper[k] ) != -1
				}

				if( isNewAddStore || isNeedChangeIndex ){
					let newVersion = Number(this.#db.version) + 1;
					// 기존 버전과 비교하였을 때 변경사항이 있어서 업그레이드(기존 정보 마이그레이션)가 필요 한 경우
					this.close().then( closeResult => {
						const secondOpenRequest = indexedDB.open(this.DB_NAME, newVersion);
					
						/**
						 * DB에 변동사항이 생겨 업그레이드가 필요하다면, 기존 db를 닫은 후 다시 열어서 신규 정보를 업그레이드 하는 이벤트가 동작하도록 한다.
						 * @author mozu123
						 * @param {Event} event 
						 * @returns 
						 */
						secondOpenRequest.onupgradeneeded = (event) => this.upgradeneeded(event, {isNewAddStore:isNewAddStore});
						
						/**
						 * 위에 입력된 로직에 따라 업그레이드가 완료된 경우 이 이벤트가 동작한다.
						 * @author mozu123
						 * @param {Event} event 
						 */
						secondOpenRequest.onsuccess = (event) => {
							this.isOpen = true;
							this.#db = event.target.result;
							resolve(this.isOpen);
						}
					});
					
				}else{
					resolve(this.isOpen);
				}
			}
			/**
			 * db open시 어떤 이유로 인해 오류가 발생할 때 동작하는 이벤트
			 * @param {Event} e 
			 */
			dbOpenRequest.onerror = (e) => {
				console.log(e);
				this.isOpen = false;
				if(e.target.error.name == 'VersionError'){
					//error code
					reject(new Error('VersionError: DB 버전을 수동으로 입력해선 안됩니다.'));
				}else{
					//error code
					reject(new Error(`unknownError ${e}`))
				}
			}
		})
	}

	close(){
		return new Promise( resolve => {
			if( ! this.#db || ! this.isOpen){
				resolve(false)
			}
			this.#db.close();
			this.#db.onclose = (event) => {
				console.log(event)
				this.isOpen = false;
				resolve(true)
			}
			
		})
	}

	/**
	 * DB NAME을 가져오는 getter
	 * @author mou123
	 */
	get DB_NAME(){
		return this.#dbName;
	}

	/**
	 * @author mou123
	 */
	get DB_STORE_NAME(){
		return this.#storeName;
	}

	get COLUMN_INFO(){
		return this.#columnInfo;
	}

	get columnContainer(){
		return JSON.parse(this.#container);
	}

	/**
	 * indexed DB를 open 할 때 업그레이드 필요 여부에 따라 동작하는 함수를 정의한다.
	 * @author mou123
	 * @param {Event} event 
	 * @param {Object} isNewAddStore : 새롭게 등록되어야 할 store인지 여부 
	 */
	upgradeneeded(event,{isNewAddStore=false}){

		let objectStore;
		// newVersion이 oldVersion과 같지 않고 && oldVersion이 0이 아니며 *(최초 오픈시 0임) && 신규 store를 등록하는 것이 아니라면
		if(event.newVersion != event.oldVersion && event.oldVersion != 0 && ! isNewAddStore){
			objectStore = event.target.transaction.objectStore(this.DB_STORE_NAME);
			let indexNameList = Object.entries(objectStore.indexNames);
			let oldIndexCheckMapper = indexNameList.reduce((t,[idx,indexName])=>{
				t[indexName]=idx
				return t;
			},{});

			Object.entries(this.#columnInfo).forEach(([indexName, column])=>{
				if( ! oldIndexCheckMapper[ column[0] ]){
					objectStore.createIndex(...column);
				}
			});

			indexNameList.forEach(([k,indexName])=>{
				if( ! this.#columnInfo[indexName]){
					objectStore.deleteIndex(indexName);
				}
			})
		}else{
			objectStore = event.target.result.createObjectStore(this.DB_STORE_NAME,{keyPath : 'id', autoIncrement : true});
			Object.entries(this.#columnInfo).forEach( ([indexName, column]) => objectStore.createIndex(...column) );
		}
	}

	/**
	 * indexed db에 데이터를 저장하는 함수
	 * @param {Object} data : indexed db에 저장할 데이터 
	 * @returns {Promise}
	 */
	addItem(data = this.container){
		return new Promise( (resolve, reject ) => {
			if( ! this.isOpen || ! this.#db){
				reject(new Error('indexedDB가 열려있지 않습니다.'));
			}
			let transaction = this.#db.transaction(this.DB_STORE_NAME, 'readwrite')
			let store = transaction.objectStore(this.DB_STORE_NAME);
			let request = store.put(data);
			request.onsuccess = (e) => {
				transaction.commit();
			}
			request.onerror = (e) => {
				console.log(e)
			}
			transaction.oncomplete = (e)=>{
				if(e.type == 'complete'){
					//alert('임시 저장을 완료하였습니다.');
					//console.log(e.type);
				}
				resolve(e.type);
			}
			transaction.onerror = (e)=>{
				//error code
				console.log(e)
				reject(new Error('commit error'))
			}
			//return resolve();
		});
	}

	/**
	 * 임시 저장 버튼 클릭시 동작할 함수
	 * @author mozu123
	 * @param {Object} data 
	 */
	tempSaveButtonClickEvent(data){
		if( ! data){
			throw new Error('임시 저장 할 데이터가 비어 있습니다.');
		}
		let boTempName = window.prompt('임시 저장 내용을 식별할 명칭을 지정해주세요.\n입력하지 않을시 현재 시간으로 저장됩니다.', new Date().toLocaleString());
		this.addTempItem(data, boTempName);
	}

	/**
	 * 임시 저장 목록에서 특정 조건을 만족하는 데이터만 추출할 떄 사용 할 함수 -> 미완성 (안만듬)
	 * @param {Object} param0 : 필터 검색 조건 데이터 
	 * @returns 
	 */
	//getTempFilterList({boTempId, boTempName, boTempInsertTime, pageNum=1, pageSize=5, startDateTime, endDateTime}){}
	
	/**
	 * 임시 저장 목록을 불러오는 함수 pageNum의 기본값은 1, pageSize의 기본값은 5
	 * @author mozu123
	 * @param {Object} param0 : 페이지 정보를 가지고 있는 객체
	 */
	getTempList({pageNum=1, pageSize=5}){
		return new Promise((resolve, reject) => {

			let start = (pageSize * (pageNum - 1));
			let isEnableAdvanced = start != 0; 
			let count = 0;
			let transaction = this.#db.transaction(this.DB_STORE_NAME, 'readonly')
			let store = transaction.objectStore(this.DB_STORE_NAME);
			let result = {
				data:[],
				event:undefined
			};
			let cursorRequest = store.openCursor()
			cursorRequest.onsuccess = (event) => {
				const cursor = event.target.result;
				if( ! cursor ){
					return ;
				}else if(isEnableAdvanced){
					isEnableAdvanced = ! isEnableAdvanced
					cursor.advance(start);
					return;
				}
				let value = cursor.value;
				result.data.push(value);
				count += 1;
				
				if(count >= pageSize){
					return;
				}else{
					cursor.continue();
				}
			};
			transaction.oncomplete = (event) => {
				result.event = event;
				return resolve(result);
			}
			transaction.onerror = (e) => reject(e);
			transaction.onabort = (e) => reject(e);
		});
	}

	/**
	 * 임시 저장 목록 중 특정 row를 삭제하는 함수
	 * @author mozu123
	 * @param  {...String} idList : 삭제 할 id 목록
	 * @returns {Promise} result : 삭제 몇건 했는지 count 한 정보를 담은 Object
	 */
	deleteTempItem(...idList){
		return new Promise((resolve, reject) => {
			let transaction = this.#db.transaction(this.DB_STORE_NAME, 'readwrite')
			let store = transaction.objectStore(this.DB_STORE_NAME);
			let result = {successCount:0, failedCount:0};
			idList.forEach(id=>{
				let request = store.delete(Number(id));
				request.onsuccess = (e)=>{
					result.successCount += 1;
					transaction = e.target.transaction;
				}
				request.onerror = (e)=>{
					result.failedCount += 1;
				}
			});
			transaction.commit();
			transaction.oncomplete = (event) => {
				result.event = event;
				return resolve(result);
			}
			transaction.onerror = (e) => reject(e);
			transaction.onabort = (e) => reject(e);
		})
	}
}