/**
 * c,d 등 드라이버 정보를 불러오기 위해 모듈 호출 
 */
const exec = require('child_process').exec;

/**
 * 모든 디렉토리 패스를 가져오기 위해 파일 시스템 모듈 호출
 */
const fs = require('fs');

/**
 * path 모듈 호출
 */
const path = require('path');

const DBConfig = require(path.join(__project_path, 'browser/window/main/MainWindow.js'))

/**
 * 모든 디렉토리 패스를 스캐닝하는 클래스
 * @author mozu123
 * @constructor
 */
class AllDirectoryPathScanning{
    /**
     * 각 디렉토리 경로 패스의 구분자
     */
    #PATH_SEPARATOR = '/';
    /**
     * 유저의 디렉토리 정보를 이곳에 넣는다.
     */
    userDirtoryList = [];

    /**
     * 유저의 디렉토리 정보에 대한 맵퍼
     * 키값이 디렉토리이며, 값이 해당 디렉토리에 있는 파일 값들 (List)
     * ex) {dir : [ fileName_1, fileName_2 ]}
     */
    userDirtoryMapper = {};

	/**
	 * 유저 파일 명이 키값이고 벨류가 디렉토리 path인 List
     * ex) [ {fileName : dirPath} ]
	 */
	userFileList = [];

    /**
     * 파일 확장자 맵퍼
     * 확장자가 키값이고 벨류가 파일 이름 list인 맵퍼
     * ex) {exe : [ fileName_1.exe, fileName_2.exe ]}
     */
    userFileExtensionMapper = {
        unknown:[]
    };

    //statsList = [];

    /**
     * 유저의 c, d, e... 등 드라이브 정보를 이곳에 넣는다.
     */
    #driveNameList = [];

    maxLength = 0;
    
    #db;

    /**
     * AllDirectoryPathScaning의 생성자
     */
    constructor(){
        
    }

    async allDriveScaninng(){
        return this.getAllDriveName().then(driveList => {
                return Promise.all(driveList.flatMap( driveName => this.allDirtoryScaninng(driveName) ))
        })
    }

    /**
     * 재귀호출을 통해 dirPath로부터 출발하여 하위 디렉토리 전부를 탐색하는 함수
     * @param {String} dirPath : 탐색을 시작 할 파일 경로 
     * @param {Array} pending : 재귀 호출시 then을 명확하게 동기화 시키기 위한 플래그 장치
     * @returns 
     */
	allDirtoryScaninng(dirPath, pending = []){
		return new Promise( (resolve) => {
			return fs.promises.readdir(dirPath).then(files=>{
				return files.flatMap( async name => {
					let newDirPath = dirPath + this.#PATH_SEPARATOR + name;
					return await this.getFileStat(newDirPath).then(stats => {
                        let lastName = stats.lastName
						this.userDirtoryList.push(newDirPath);
                        this.maxLength += 1;
						//console.log(stats.lastName);
						if(stats.isFile()){
                            let fileExtension = path.extname(stats.lastName);

                            //파일 멥퍼에 저장
                            this.userFileList.push({ [lastName] : newDirPath.replace(lastName, '') });

                            //디텍토리 맵퍼에 저장 = {경로:[파일명들]}
                            let parentDir = newDirPath.replace(lastName, ''); 
                            if(this.userDirtoryMapper[parentDir]){
                                this.userDirtoryMapper[parentDir].push(lastName);
                            }else{
                                this.userDirtoryMapper[parentDir] = [lastName];
                            }

                            //파일 확장자 맵퍼에 저장 = {확장자:[파일명들]}
                            if(this.#isNotIgnoreFile(fileExtension)){
                                //this.statsList.push(stats);
                                if(fileExtension === ''){
                                    this.userFileExtensionMapper.unknown.push(lastName);
                                }else if(this.userFileExtensionMapper[fileExtension]){
                                    this.userFileExtensionMapper[fileExtension].push(lastName);
                                }else{
                                    this.userFileExtensionMapper[fileExtension] = [lastName];
                                }
                            }
                            
                            return resolve();
						}else if(stats.isDirectory() && this.#isNotIgnoreDir(stats)){
                            //this.statsList.push(stats);
						    return this.allDirtoryScaninng(newDirPath, pending);
                        }else{
                            return resolve();
                        }
					})
				})
			}).then((promiseList)=>{
				return resolve(Promise.all(promiseList.flatMap(e=>e)));
			}).catch(err => {
				//console.error(err)
				resolve();
			})
		})
	}

    /**
     * 
     * @param {fs.Stats} stats 
     * @returns 
     */
    #isNotIgnoreDir(stats){
        return (
            stats.lastName.charAt(0) !== '.' 
            //&& stats.lastName !== 'AppData'
        )
    }

    /**
     * 
     * @param {String} fileExtension 
     */
    #isNotIgnoreFile(fileExtension){
        return (
            fileExtension !== '.policy'
        )
    }

    /**
     * dirPath에 대한 정보를 가져온다. (디렉토리든 파일이든)
     * @param {String} dirPath 
     * @returns {fs.Stats}
     */
    getFileStat(dirPath){
        return new Promise( (resolve, rejects) => {
            fs.stat(dirPath, (error, stats) => {
                let lastName = '';
                if(dirPath){
                    let pathList = dirPath.split('/');
                    lastName = pathList[pathList.length - 1];
                }

				if(stats && ! error){
                    stats.statsType = 'complete',
					stats.dirPath = dirPath;
					stats.lastName = lastName;
                    stats._isDirectory = stats.isDirectory();
                    stats._isFile = stats.isFile();
                    stats.errrorNo = null;
                    stats.errorCode = null;
                    stats.errorName = null;
					return resolve(stats)
				}else if (error){
					return resolve(
                        new fs.Stats({
                            statsType: 'error',
                            dirPath: dirPath,
                            lastName: lastName,
                            isDirectory: ()=>false,
                            _isDirectory: false,
                            isFile: ()=>false,
                            _isFile: false,
                            errorNo: error.errno,
                            errorCode: error.code,
                            errorName: error.message
                        })
                    );
				}else{
                    return resolve(
                        new fs.Stats({
                            statsType:'unknown',
                            dirPath:dirPath,
                            lastName:'',
                            isDirectory: ()=>false,
                            _isDirectory: false,
                            isFile: ()=>false,
                            _isFile: false,
                            errorNo: 0,
                            errorCode: 0,
                            errorName:'may be operation not permitted'

                        })
                    );
                }
            })
        });
    }
    
    /**
     * 
     * @returns {Promise<Array>} : c, d, e 등 드라이버 정보를 가져오는 함수
     */
	getAllDriveName(){
        return new Promise( (resolve, rejects) => {
            exec('wmic logicaldisk get caption', (err, stdout, stderr) => {
                if(err){
                    return rejects(err);
                }
                
                this.#driveNameList = stdout.replaceAll(/[\r \t]|Caption/gi,'')
                    .split('\n')
                    .filter(e=> e !== '')
                    .map( (e, i) => {
                        this.getFileStat(e).then(stat=>{
                            stat.dirPath = e;
                            //this.statsList.push(stat)
						});
                        this.userDirtoryList.push(e);
                        this.maxLength += 1;
                        return e + '/';
                    })
                return resolve(this.#driveNameList);
            });
        });
	}

    /**
     * 디버깅용으로, 변수에 어떤 값이 있는지 눈으로 보기 위해 만듬
     * 추후 파일 쓰기 작업에 이용될 수도 있다.
     * @param {Object || Arry} data 
     * @param {String} fileName 
     * @param {Boolean} prettyJson 
     * @returns {Promise} 
     */
    dataWrite(data, fileName, prettyJson = true){
        return new Promise( (resolve, rejects) => {
            let callback = (error) => {
                if(error){
                    rejects(error)
                    console.log(error)
                }else{
                    resolve('done')
                }
            }
            if(prettyJson){
                fs.writeFile(`${fileName}.json`, JSON.stringify(data, null, 4), 'utf8', callback )
            }else{
                fs.writeFile(`${fileName}.json`, JSON.stringify(data), 'utf8', callback )
            }
        })
    }

    /**
     * 이 코드는 메모리 누수 문제로 주석처리
     * @param {} data 
     * @param {*} fileName 
     */
    /*
    manyDataWrite(data, fileName){
        new Promise((resolve, rejects) =>{
            let jsonText;
            if(data instanceof Array){
                //Array
                jsonText = `[${data.map( e => JSON.stringify(e) ).join(',')}]`
            }else if(data instanceof Object){
                //Object
                jsonText = `{${Object.entries(data).map( ([k,v]) => `"${k}":${JSON.stringify(v)}` ).join(',')}}`
            }else{
                rejects(new Error('this is not suppurt type'))
            }
            
            fs.writeFile(`${fileName}.json`, jsonText, 'utf8', (error)=>{
                if(error){
                    rejects(error)
                    console.log(error)
                }else{
                    resolve('done')
                }
            })
        });
    }
    */

	filesRead(files){

    }
    
}
const allDirectoryPathScanning = new AllDirectoryPathScanning();
module.exports = allDirectoryPathScanning