const CopyWebpackPlugin = require('copy-webpack-plugin');
const TSConfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

module.exports = {
	entry: './src/app.ts',
	output: {
		filename: 'script.js'
	},
	resolve: {
		extensions: ['.ts', '.js'],
		plugins: [new TSConfigPathsWebpackPlugin()]
	},
	devServer:{
		contentBase: 'src',
		watchContentBase: true,
		stats: 'errors-only'
	},
	watchOptions: {
		aggregateTimeout: 1000,
		poll: 1000,
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
	stats: {
		assets: false,
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [{
				from: 'src/index.html'
			}, {
				from: 'src/config.js',
				noErrorOnMissing: true
			}, {
				from: 'src/favicon.*',
				noErrorOnMissing: true
			}, {
				from: 'src/assets',
				to: 'assets',
				noErrorOnMissing: true
			}]
		})
	]
};
