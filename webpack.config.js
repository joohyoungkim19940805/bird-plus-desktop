const path = require('path');

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
		workspacePageRenderer: "./view/js/renderer/workspacePageRenderer.js",
		mainPageRenderer: "./view/js/renderer/mainPageRenderer.js",
		temp3DHandler : "./view/js/handler/Temp3DHandler.ts"
	},
	output: {
		filename: "[name].js",
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