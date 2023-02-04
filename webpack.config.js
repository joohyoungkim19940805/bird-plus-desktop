const path = require('path');
//console.log('test2===',__dirname)
/**
 * 프로덕션 배포시 = 
 * mdoe : production
 * devtool 제거
 */
module.exports = {
	mode: 'development',
	devtool: 'cheap-module-source-map',
	entry: {
		openingRenderer: "./view/static/js/renderer/openingRenderer.js"
	},
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, './view/static/js/dist')
	}
}