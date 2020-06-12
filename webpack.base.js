const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	output: {
		filename: 'script.js'
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [{
			test: /\.ts$/,
			loader: 'ts-loader'
		}, {
			test: /\.(css|svg|html)$/,
			use: 'raw-loader'
		}]
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [{
				from: 'src/index.html'
			}, {
				from: 'src/config.js',
				noErrorOnMissing: true
			}, {
				from: 'src/assets',
				to: 'assets',
				noErrorOnMissing: true
			}]
		})
	]
};
