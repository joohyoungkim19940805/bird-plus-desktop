import IndexedDBHandler from "./IndexedDBHandler.js"

export default class UserDirtoryListDBHandler extends IndexedDBHandler{
	openPromise;
	constructor(){
		super({
			dbName : 'file-dictionary-db',
			storeName : 'path-info',
			columnInfo : {
				id :['id', 'id', {unique : true}],
				path:['path', 'path']
			}
		});
		this.openPromise = super.open().then(isOpen => {
			if( ! isOpen){
				//error code
				//alert('error')
			}
			return Promise.resolve(isOpen);
		}).catch(error=>{
			alert(error.message)
		})
	}
}