const fs = require('fs');
const { app } = require('electron');
/**
 * sql Lite3 관련 코드
 */
//db.run("INSERT INTO Foo (name) VALUES ('bar')");
/*db.each("SELECT id, name FROM Foo", function(err, row) {
	console.log(row.id + ": " + row.name);
});*/
class DBConfig{
	static #loadEndPromiseResolve;
	static loadEndPromise = new Promise(resolve => {
		this.#loadEndPromiseResolve = resolve;
	});
	static #columnInfo;
	static #columnRegex = /[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g;
	/**
	 * @returns {sqlite3}
	 */
	static sqlite3 =  require('sqlite3').verbose();
	static #dbDir = app.getPath('home') + '\\.bird-plus\\DB\\';
	static #dbName = 'a-simple-desktop.db'
	static #type = {
		NULL : {name : 'NULL'},
		INTEGER : {name : 'INTEGER'},
		REAL : {name : 'REAL'},
		TEXT : {name : 'TEXT'},
		BLOB : {name : 'BLOB'},
		BOOLEAN : {
			name : 'INTEGER',
			true : 1, 
			1 : true, 
			false : 0, 
			0 : false
		} 
	}
	static Column = class Column{
		constructor(info, tableName){
			this.info = info;
			this.tableName = tableName;
		}
	};
	static{
		this.#columnInfo = {
			PATH_TABLE : {
				clone : JSON.stringify({
					DIR_PATH : {default : '', type : this.#type.TEXT.name},
					IS_DRI : {default : this.#type.BOOLEAN.false, type : this.#type.BOOLEAN.name},
					IS_FILE : {default : this.#type.BOOLEAN.false, type : this.#type.BOOLEAN.name},
					LAST_NAME : {default : '', type : this.#type.TEXT.name},
					EXTENSION : {default : '', type : this.#type.TEXT.name},
					ERROR_NO : {default : '', type : this.#type.TEXT.name},
					ERROR_CODE : {default : '', type : this.#type.TEXT.name},
					ERROR_NAME : {default : '', type : this.#type.TEXT.name}
				}), 
			},
			PATH_INFO_TABLE : {
				clone : JSON.stringify({
					DEV : {default : -1, type : this.#type.INTEGER.name},
					MODE : {default : -1, type : this.#type.INTEGER.name},
					NLINK : {default : -1, type : this.#type.INTEGER.name},
					UID : {default : -1, type : this.#type.INTEGER.name},
					GID : {default : -1, type : this.#type.INTEGER.name},
					RDEV : {default : -1, type : this.#type.INTEGER.name},
					BLKSIZE : {default : -1, type : this.#type.INTEGER.name},
					INO : {default : -1, type : this.#type.INTEGER.name},
					SIZE : {default : -1, type : this.#type.INTEGER.name},
					BLOCKS : {default : -1, type : this.#type.INTEGER.name},
					ATIME_MS : {default : -1, type : this.#type.INTEGER.name},
					MTIME_MS : {default : -1, type : this.#type.INTEGER.name},
					CTIME_MS : {default : -1, type : this.#type.INTEGER.name},
					BIRTHTIME_MS : {default : -1, type : this.#type.INTEGER.name},
					ATIME : {default : '', type : this.#type.TEXT.name},
					MTIME : {default : '', type : this.#type.TEXT.name},
					CTIME : {default : '', type : this.#type.TEXT.name}
				}), 
			},
			ACCOUNT_LOG : {
				clone : JSON.stringify({
					TOKEN : {default : '', type : this.#type.TEXT.name},
					ISSUED_AT : {default : 0, type : this.#type.INTEGER.name},
					EXPIRES_AT : {default : 0, type : this.#type.INTEGER.name}
				}),
			},
			BIRD_PLUS_OPTIONS : {
				clone : JSON.stringify({
					OPTION_NAME : {default : '', type : this.#type.TEXT.name},
					OPTION_VALUE : {default : '', type : this.#type.TEXT.name},
					CREATE_AT : {default : -1, type : this.#type.INTEGER.name},
					UPDATE_AT : {default : -1, type: this.#type.INTEGER.name}
				}),
				pk : '(OPTION_NAME)'
			}
		}
		
		if(!fs.existsSync(this.#dbDir)){
			fs.mkdirSync(this.#dbDir, {recursive: true})
		}

		try{
			fs.writeFileSync(this.#dbDir + this.#dbName, '', {flag:'wx'});
		}catch(err){
			if(err.code !=='EEXIST'){
				console.error('db open error', err);
			} 
		}
		

		//CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (${COLUMN_NAME_1} ${COLUMN_TYPE_1}, ${COLUMN_NAME_2} ${COLUMN_TYPE_2})
		let db = this.getDB();
		db.serialize(() => {

			Object.entries(this.#columnInfo).forEach( ([tableName, value]) => {
				/**
				 * 존재하지 않는 테이블이라면 신규 테이블 추가
				 */
				let createTablePromise = new Promise(resolve=>{
					db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (
						${
							Object.entries(JSON.parse(value.clone)).map( ([colName, value]) => {
								return `${colName} ${value.type} DEFAULT '${value.default ? value.default : ''}'`
							}).join(', ') + (this.#columnInfo[tableName].pk ? ', PRIMARY KEY' + this.#columnInfo[tableName].pk : '')
						}
					)`, () =>{
						resolve();
					})
				})
				let column = this.getColumnInfo(tableName);
				let dbPragmaPromise = new Promise(resolve => {
					console.log(111111111111111)
					createTablePromise.then(() => {
						db.all(`PRAGMA table_info(${tableName})`, (err, dataList) => {
							if(err){
								console.error(err);
							}
							resolve(dataList);
						})
					})
				})
				let promise = new Promise(resolve => {
					console.log(22222222222)
					let dbColumnMapper = {};
					dbPragmaPromise.then(dataList => {
						let alterTablePromiseList = dataList.map( async data=>{
							return new Promise(res => {
								dbColumnMapper[data.name] = data.name;
								//해당하는 컬럼이 columnInfo에 정의되지 않았다면 제거
								if( ! column.info[data.name]){
									db.run(`ALTER TABLE ${tableName} DROP COLUMN ${data.name}`, (err)=>{
										if(err){
											console.error('column delete trying but failed', err)
										}
									})
								}
								res()
							})
						})
						Promise.all(alterTablePromiseList).then(()=>{
							resolve(dbColumnMapper)
						})
					})

				});
				
				promise.then(dbColumnMapper => {
					/**
					 * columnInfo로 정의되었으나 테이블에는 없는 컬럼은 추가
					 */
					return Promise.all(Object.entries(column.info).map(([key,value])=>{
						let allPormise = new Promise(res=>{
							if( ! dbColumnMapper[key]){
								db.run(`ALTER TABLE ${tableName} ADD COLUMN ${key} ${value.type} DEFAULT '${value.default}'`, (err)=>{
									if(err){
										console.error('add column trying but failed', err)
									}
									res();
								})
							}
							res();
						})
						return allPormise;
					}))
				}).then(()=>{
					return new Promise(res=>{
						db.close((err) => {
							if(err){
								console.error(err.message)
							}
							this.#loadEndPromiseResolve();
							res();
						})
					})
				})
				
				
			});
		})
		
	}

	static getColumnInfo(tableName){
		return new this.Column( JSON.parse(this.#columnInfo[tableName].clone), tableName  )
        //return JSON.parse(this.#columnInfo[tableName]);
    }

	/**
	 * 
	 * @param {Object} obj 
	 * @param {DBConfig.Column} column 
	 * @returns 
	 */
	static assignColumn(obj, column){
		if( ! column instanceof this.Column ){
			console.error('type error')
			throw new Error('type error')
		}

		let newColumnInfo = Object.entries(obj).reduce((result, [columnName, value], idx) =>{
			let processColumnName = this.#processingColumn(columnName);
			let targetColumnInfo = this.#columnInfo[column.tableName][processColumnName]
			if( ! targetColumnInfo){
				console.error('not found column name')
				throw new Error('not found column name')
			}

			if( ! value){
				value = targetColumnInfo.default
			}
			result[ processColumnName ].default = value;
			return result;
		},{})

		column.info = Object.assign( column.info, newColumnInfo )
		
		return column
	}

	static #processingColumn(columnName){
		return columnName.match(this.#columnRegex).join('_');
	}

	/**
	 * 
	 * @param  {number} mode 
	 * @returns {sqlite3.Databases}
	 */
	static getDB(mode){
		if(! mode){
			mode = this.sqlite3.OPEN_READWRITE | this.sqlite3.OPEN_CREATE;
		}
		let db = new this.sqlite3.Database(this.#dbDir + this.#dbName, mode, (err) => {
            if(err){
                console.error(err.message);
            }
        });
		return db;
	}

	static closeDB(db){
		db.close((err) => {
			if(err){
				console.error(err.message)
			}
		})
	}
}

module.exports = DBConfig;