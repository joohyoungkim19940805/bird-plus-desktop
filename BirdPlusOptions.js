
const path = require('path');
const DBConfig = require(path.join(__project_path, 'DB/DBConfig.js'));
const { screen } = require('electron');
class BirdPlusOptions{

	#size = {w : 1024, h : 768};

	#position = {x : undefined, y : undefined};

	#upsertSizeDelay = 500;
	#isUpsertSizeDelay = false;

	#upsertPositionDelay = 500;
	#isUpsertPositionDelay = false;

	constructor(){
		let db = DBConfig.getDB(DBConfig.sqlite3.OPEN_READONLY)
		db.serialize(() => {
			// 각 쿼리는 비동기로 동작하니 순서 주의 
			// (DBConfig.js에서는 프로미스 객체로 핸들링 하였었음)
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
						console.error(err);
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
						console.error(err);
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
						console.error(err.message);
					}
				})
			})

		});
	}
	
	setLastWindowSize(window){
		let rect = {
			x: this.#position.x, 
			y: this.#position.y, 
			width: this.#size.w, 
			height: this.#size.h
		}
		if( this.isSize && ! Object.entries(rect).some(([k,v]) => v == undefined) ){

			//console.log('getAllDisplays',screen.getAllDisplays());
			//console.log('getPrimaryDisplay', screen.getPrimaryDisplay())
			//console.log('getPrimaryDisplay', screen.getDisplayNearestPoint(this.#position))
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
			console.log('isWidthFullSize',isWidthFullSize)
			console.log('isHeightFuulSize',isHeightFuulSize)
			
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

	set size([w,h]){
		this.#size.w = w, this.#size.h = h;
		
		if(this.#isUpsertSizeDelay){
			return;
		}
		this.#isUpsertSizeDelay = true;
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
						'size',
						'${JSON.stringify(this.#size)}',
						${new Date().getTime()},
						${new Date().getTime()}
					)
				ON CONFLICT (OPTION_NAME)
				DO UPDATE SET	
					OPTION_VALUE = '${JSON.stringify(this.#size)}',
					UPDATE_AT = ${new Date().getTime()}
			`, (err) => {
				if(err){
					console.error(err);
				}
				setTimeout(() => {
					this.#isUpsertSizeDelay = false;
				}, this.#upsertSizeDelay)
				db.close((err)=>{
					if(err){
						console.error(err.message);
					}
				})
			})
		})
	}

	get size(){
		return this.#size;
	}

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

	set position([x,y]){
		this.#position.x = x; this.#position.y = y;
		if(this.#isUpsertPositionDelay){
			return;
		}
		this.#isUpsertPositionDelay = true;
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
						'position',
						'${JSON.stringify(this.#position)}',
						${new Date().getTime()},
						${new Date().getTime()}
					)
				ON CONFLICT (OPTION_NAME)
				DO UPDATE SET	
					OPTION_VALUE = '${JSON.stringify(this.#position)}',
					UPDATE_AT = ${new Date().getTime()}
			`, (err) => {
				if(err){
					console.error(err);
				}
				setTimeout(()=>{
					this.#isUpsertPositionDelay = false;
				}, this.#upsertPositionDelay)
				db.close((err)=>{
					if(err){
						console.error(err.message);
					}
				})
			})
		})
	}

	get position(){
		return this.#position;
	}

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
}
const birdPlusOptions = new BirdPlusOptions();
module.exports = birdPlusOptions;