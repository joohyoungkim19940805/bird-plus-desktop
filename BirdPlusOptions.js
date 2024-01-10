
const path = require('path');
const DBConfig = require(path.join(__project_path, 'DB/DBConfig.js'));
const { screen, remote } = require('electron');
const log = require('electron-log');
class OptionTemplate{
	/**
	 * @type {string}
	 */
	#optionName;
	/**
	 * @type {string}
	 */
	#optionValue;
	/**
	 * @type {number}
	 */
	#createAt;
	/**
	 * @type {number}
	 */
	#updateAt;
	/**
	 *
	 * @type {optionName = string, optionValue = string, createAt = number, updateAt = number} 
	 */
	constructor({optionName, optionValue, createAt = new Date().getTime(), updateAt = new Date().getTime()} = {}){
		this.#optionName = optionName;
		this.#optionValue = optionValue;
		this.#createAt = createAt || new Date().getTime();
		this.#updateAt = updateAt || new Date().getTime();
	}
	set optionName(optionName){this.#optionName = optionName}
	get optionName(){return this.#optionName}
	
	set optionValue(optionValue){this.#optionValue = optionValue}
	get optionValue(){return this.#optionValue}

	set createAt(createAt){this.#createAt = createAt}
	get createAt(){return this.#createAt}

	set updateAt(updateAt){this.#updateAt = updateAt}
	get updateAt(){return this.#updateAt}

}
const birdPlusOptions = new class BirdPlusOptions{
	#size = {w : 1024, h : 768};
	#position = {x : undefined, y : undefined};
	#componentOption = 'responsive'

	#upsertSizeDelay = 50;
	#isUpsertSizeDelay = false;

	#upsertPositionDelay = 50;
	#isUpsertPositionDelay = false;

	#optionLoadEndResolve;
	optionLoadEnd = new Promise(resolve=>{
		this.#optionLoadEndResolve = resolve;
	});
	
	constructor(){
		let db = DBConfig.getDB(DBConfig.sqlite3.OPEN_READONLY)
		db.serialize(() => {
			db.all(`
				SELECT
					OPTION_NAME,
					OPTION_VALUE,
					CREATE_AT,
					UPDATE_AT
				FROM
					BIRD_PLUS_OPTIONS
			`, [], (err, rows) => {
				if(err){
					log.error(err);
					return;
				}
				//console.log('rows>>>',rows);
				rows.forEach(e=>{
					let firstChar = e.OPTION_VALUE.charAt(0);
					let lastChar = e.OPTION_VALUE.charAt(e.OPTION_VALUE.length - 1);
					if( 
						(firstChar == '{' && lastChar == '}') || 
						(firstChar == '[' && lastChar == ']')
					){
						this[e.OPTION_NAME] = JSON.parse(e.OPTION_VALUE)
					}else {
						this[e.OPTION_NAME] = e.OPTION_VALUE;
					}
				})
				this.#optionLoadEndResolve();
				db.close((err)=>{
					if(err){
						log.error(err.message);
					}
				})
			})
		});
		/*db.serialize(() => {
			// 각 쿼리는 비동기로 동작하니 순서 주의 \
			let loadSizePromise = new Promise(resolve => {
				db.all(`
					SELECT
						OPTION_NAME,
						OPTION_VALUE,
						CREATE_AT,
						UPDATE_AT
					FROM
						BIRD_PLUS_OPTIONS
					WHERE
						OPTION_NAME = 'size'
				`, [], (err, rows) => {
					if(err){
						log.error(err);
						return;
					}

					if(rows[0]){
						this.#size = JSON.parse(rows[0].OPTION_VALUE)
					}
					resolve();
				})
			});

			let loadPositionPromise = new Promise(resolve => {
				db.all(`
				SELECT
					OPTION_NAME,
					OPTION_VALUE,
					CREATE_AT,
					UPDATE_AT
				FROM
					BIRD_PLUS_OPTIONS
				WHERE
					OPTION_NAME = 'position'
				`, [], (err, rows) => {
					if(err){
						log.error(err);
						return;
					}

					if(rows[0]){
						this.#position = JSON.parse(rows[0].OPTION_VALUE);
					}
					resolve();
				})
			});

			Promise.all([loadSizePromise, loadPositionPromise]).then(()=>{
				db.close((err)=>{
					if(err){
						log.error(err.message);
					}
				})
			})
		});*/
	}
	
	setLastWindowSize(window){
		let rect = {
			x: this.#position.x, 
			y: this.#position.y, 
			width: this.#size.w, 
			height: this.#size.h
		}
		if( this.isSize && ! Object.entries(rect).some(([k,v]) => v == undefined) ){

			//log.log('getAllDisplays',screen.getAllDisplays());
			//log.log('getPrimaryDisplay', screen.getPrimaryDisplay())
			//log.log('getPrimaryDisplay', screen.getDisplayNearestPoint(this.#position))
			/*
				getAllDisplays [
					{
						id: 917481049,
						label: 'S24F350',
						bounds: { x: -1920, y: 1, width: 1920, height: 1080 },
						workArea: { x: -1920, y: 1, width: 1920, height: 1032 },
						accelerometerSupport: 'unknown',
						monochrome: false,
						colorDepth: 24,
						colorSpace: '{primaries:BT709, transfer:SRGB, matrix:RGB, range:FULL}',
						depthPerComponent: 8,
						size: { width: 1920, height: 1080 },
						displayFrequency: 60,
						workAreaSize: { width: 1920, height: 1032 },
						scaleFactor: 1,
						rotation: 0,
						internal: false,
						touchSupport: 'unknown'
					},
					{
						id: 1133551107,
						label: 'LG ULTRAWIDE',
						bounds: { x: 0, y: 0, width: 2560, height: 1080 },
						workArea: { x: 0, y: 0, width: 2560, height: 1032 },
						accelerometerSupport: 'unknown',
						monochrome: false,
						colorDepth: 24,
						colorSpace: '{primaries:BT709, transfer:SRGB, matrix:RGB, range:FULL}',
						depthPerComponent: 8,
						size: { width: 2560, height: 1080 },
						displayFrequency: 60,
						workAreaSize: { width: 2560, height: 1032 },
						scaleFactor: 1,
						rotation: 0,
						internal: false,
						touchSupport: 'unknown'
					},
					{
						id: 2528732444,
						label: '',
						bounds: { x: -1280, y: -720, width: 1280, height: 721 },
						workArea: { x: -1280, y: -720, width: 1280, height: 673 },
						accelerometerSupport: 'unknown',
						monochrome: false,
						colorDepth: 24,
						colorSpace: '{primaries:BT709, transfer:SRGB, matrix:RGB, range:FULL}',
						depthPerComponent: 8,
						size: { width: 1280, height: 721 },
						displayFrequency: 144,
						workAreaSize: { width: 1280, height: 673 },
						scaleFactor: 1.5,
						rotation: 0,
						internal: true,
						touchSupport: 'unknown'
					}
				]
			*/
			let matchingMonitor = screen.getDisplayMatching(rect);

			let isWidthFullSize = this.#size.w / matchingMonitor.size.width >= 0.95;
			let isHeightFuulSize = this.#size.h / matchingMonitor.size.height >= 0.95;
			//log.log('isWidthFullSize',isWidthFullSize)
			//log.log('isHeightFuulSize',isHeightFuulSize)
			
			if(isWidthFullSize && isHeightFuulSize){
				window.maximize();
			}else{
				window.setSize(this.#size.w, this.#size.h, true /* maxOS 전용애니메이션 true*/);
			}
		}else{
			window.setSize(1024, 768, true /* maxOS 전용애니메이션 true*/);
		}
	}

	setLastWindowPosition(window){
		if(this.isPosition){
			window.setPosition(this.#position.x, this.#position.y);
		}else{
			window.center();
		}
	}

	set size({w,h}){
		this.#size.w = w, this.#size.h = h;
		if(this.#isUpsertSizeDelay){
			return;
		}
		let option = new OptionTemplate({
			optionName: 'size',
			optionValue: JSON.stringify(this.#size),
		})
		this.setOption = option;
		setTimeout(() => {
			this.#isUpsertSizeDelay = false;
		}, this.#upsertSizeDelay)
		
	}
	get size(){return this.#size;}

	get isSize(){
		if (
			this.#size &&
			this.#size.w &&
			this.#size.h
		){
			return true;
		}else{
			return false;
		}
	}

	set position({x,y}){
		this.#position.x = x; this.#position.y = y;
		if(this.#isUpsertPositionDelay){
			return;
		}
		this.#isUpsertPositionDelay = true;
		let option = new OptionTemplate({
			optionName: 'position',
			optionValue: JSON.stringify(this.#position),
		})
		this.setOption = option;
		setTimeout(()=>{
			this.#isUpsertPositionDelay = false;
		}, this.#upsertPositionDelay)
	}
	get position(){return this.#position;}

	set componentOption(componentOption){
		this.#componentOption = componentOption;
		let option = new OptionTemplate({
			optionName : 'componentOption',
			optionValue : componentOption
		})
		this.setOption = option;
	}
	get componentOption(){return this.#componentOption;}

	get isPosition(){
		if(
			this.#position &&
			this.#position.x &&
			this.#position.y
		){
			return true;
		}else{
			return false;
		}
	}

	/**
	 * @param {OptionTemplate} option 
	 */
	set setOption(option){
		if(option.constructor != OptionTemplate){
			throw new Error(`option type is ${option.constructor.name}, option type require OptionTemplate`)
		}
		let db = DBConfig.getDB();
		db.serialize(() => {
			db.run(`
				INSERT INTO 
					BIRD_PLUS_OPTIONS(
						OPTION_NAME,
						OPTION_VALUE,
						CREATE_AT,
						UPDATE_AT
					) 
				VALUES 
					(
						'${option.optionName}',
						'${option.optionValue}',
						${option.createAt || new Date().getTime()},
						${option.updateAt || new Date().getTime()}
					)
				ON CONFLICT (OPTION_NAME)
				DO UPDATE SET	
					OPTION_VALUE = '${option.optionValue}',
					UPDATE_AT = ${option.updateAt || new Date().getTime()}
			`, (err) => {
				if(err){
					log.error(err);
				}
				db.close((err)=>{
					if(err){
						log.error(err.message);
					}
				})
			})
		})
	}
	getOption(optionName){
		return new Promise((resolve, reject)=>{
			let db = DBConfig.getDB(DBConfig.sqlite3.OPEN_READONLY)
			db.serialize(() => {
				db.all(`
					SELECT
						OPTION_NAME,
						OPTION_VALUE,
						CREATE_AT,
						UPDATE_AT
					FROM
						BIRD_PLUS_OPTIONS
					WHERE
						OPTION_NAME = '${optionName}'
				`, [], (err, rows) => {
					if(err){
						log.error('getOptuon error', err);
						reject(err);
					}
					resolve(rows[0])
					db.close((err)=>{
						if(err){
							log.error(err.message);
						}
					})
				})
			})
		})
	}
	
}

module.exports = {
	birdPlusOptions,
	OptionTemplate
};