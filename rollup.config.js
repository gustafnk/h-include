import pkg from './package.json';
import commonjs from 'rollup-plugin-commonjs';

export default [
	// browser-friendly UMD build
	{
		input: 'src/h-include.js',
		output: {
			name: 'HInclude',
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
			commonjs()
		]
	},
	{
		input: 'src/h-include-extensions.js',
		output: {
			name: 'HIncludeExtensions',
			file: pkg.browserExtensions,
			format: 'umd'
		},
		plugins: [
			commonjs()
		]
	},
	{
		input: 'src/h-include.js',
		output: {
			file: pkg.module, format: 'es'
		}
	}
];