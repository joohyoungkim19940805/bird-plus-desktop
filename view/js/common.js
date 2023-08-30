export default new class Common{
	constructor(){

	}
	
	/**
	 * @returns {Promise<String>}
	 */
	async getProjectPathPromise(){
		return await window.myAPI.getProjectPath().then((data) => {
			console.log('???',data);
			return data;
		}).catch(error=>{
			console.error(error);
			return '';
		})
	}
}