import pkg from './package.json';
import commonjs from 'rollup-plugin-commonjs';

export default [
	// browser-friendly UMD build
	{
		input: 'lib/h-include.js',
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
		input: 'lib/h-include.js',
		output: {
			file: pkg.module, format: 'es'
		}
	}
];