var readFile = require('fs').readFile;
var framework = require('./framework.js');
var testName = process.env.TEST

readFile('./index.json', 'utf8', function(err, data) {
	if (err) throw err;
	var tests = JSON.parse(data);
	if (testName) tests = tests.filter(function(test) {
		return (test.file === testName + '.html') 
	});
	framework.start();
	var totalErrors = 0;
	setTimeout(run, 1000);
	function run(errorCount) {
		totalErrors += errorCount;
		var test = tests.shift();
		if (test) {
			framework.runTests(test.file, test.expect, test.viewport)
			.then(run);
		}
		else {
			framework.stop();
			process.exit(errorCount ? 1 : 0);
		}
	}
});
