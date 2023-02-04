
class DBConfig{
	static #columnInfo;
	static #columnRegex = /[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g;
	static sqlite3 =  require('sqlite3').verbose();
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
		console.log('test')
		this.#columnInfo = {
			PATH_TABLE : {
				clone : JSON.stringify({
					DIR_PATH : {default : '', type : this.#type.TEXT.name},
					IS_DRI : {default : this.#type.BOOLEAN[false], type : this.#type.BOOLEAN.name},
					IS_FILE : {default : this.#type.BOOLEAN[false], type : this.#type.BOOLEAN.name},
					LAST_NAME : {default : '', type : this.#type.TEXT.name},
					EXTENSION : {default : '', type : this.#type.TEXT.name},
					ERROR_NO : {default : '', type : this.#type.TEXT.name},
					ERROR_CODE : {default : '', type : this.#type.TEXT.name},
					ERROR_NAME : {default : '', type : this.#type.TEXT.name}
				}), 
				name : 'PATH_TABLE'
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
				name : 'PATH_INFO_TABLE'
			}
		}
		//CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (${COLUMN_NAME_1} ${COLUMN_TYPE_1}, ${COLUMN_NAME_2} ${COLUMN_TYPE_2})
		let db = this.getDB();
		db.serialize(() => {
			Object.entries(this.#columnInfo).forEach( ([tableName, value]) => {
				db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (
					${
						Object.entries(JSON.parse(value.clone)).map( ([colName, value]) => {
							return colName + ' ' + value.type
						}).join(', ')
					}
				)`)
			});
		})
		db.close((err) => {
			if(err){
				console.error(err.message)
			}
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

	static getDB(mode = this.#sqlite3.OPEN_READWRITE | this.#sqlite3.OPEN_CREATE){
		let db = new this.#sqlite3.Database(path.join(__project_path, 'DB/a-simple-desktop.db'), mode, (err) => {
            if(err){
                console.error(err.message);
            }
        });
		return db;
	}
}

module.exports = DBConfig;