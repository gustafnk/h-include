import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		input: 'lib/h-include.js',
		output: {
			name: 'HInclude',
			file: pkg.browser,
			format: 'umd'
		}
	},
	{
		input: 'lib/h-include.js',
		output: {
			file: pkg.module, format: 'es'
		}
	}
];