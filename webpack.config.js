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
		openingRenderer: "./view/js/renderer/openingRenderer.js",
		temp3DHandler : "./view/js/handler/Temp3DHandler.ts"
	},
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, './view/js/dist')
	},
	module: {
		rules: [
		  	{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	}
}