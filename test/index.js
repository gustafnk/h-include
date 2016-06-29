var fs = require('fs');
var framework = require('./framework.js');
var testName = process.env.TEST
var browserName = process.env.BROWSER_NAME;

function readJSON(filename) {
	var text = fs.readFileSync(filename, 'utf8');
	var data = JSON.parse(text);
	return data;
}

var allBrowsers = readJSON('./browsers.json');
if (browserName) {
	allBrowsers = [{ browserName: browserName }];
}

var allTests = readJSON('./index.json');
if (testName) allTests = allTests.filter(function(test) {
	return (test.file === testName + '.html') 
});

var totalFails = 0;
var totalErrors = 0;

testAllBrowsers()
.then(function() {
	console.info('\n\n');
	if (totalFails <= 0) console.info('Looks good');
	else console.info('Some problems were found. ' + totalErrors + ' errors on ' + totalFails + ' different browsers.');
	process.exit(totalFails ? 1 : 0);
},
function(err) {
	console.error(
		'\n\n' +
		'Somewhere an unhandled exception screams'
	);
	console.error(err);
	process.exit(1);
});

// FINISHED. The following is hoisted

function testAllBrowsers() {
	return allBrowsers.reduce(function(promise, browser) {
		return promise
		.then(function() { 
			return testBrowser(browser); 
		})
		.then(function(errors) { 
			totalErrors += errors;
			if (errors) totalFails++; 
		});
	}, Promise.resolve());
}	

function testBrowser(browser) {
	var errors;
	console.info(
		'\n' + 
		'Starting browser ' + browser.browserName + 
		(browser.version ? ' ' + browser.version : '') +
		(browser.platform ? ' on ' +  browser.platform : '') +
		'\n'
	);
	return framework.start(browser)
	.then(runAllTests)
	.then(function(errCount) {
		errors = errCount;
		return framework.stop();
	})
	.then(function() {
		return errors;
	});
}

function runAllTests() {
	var errors = 0;
	return allTests.reduce(function(promise, test) {
		return promise
		.then(function() { 
			console.info(
				'Testing ' + test.file +
				(test.viewport ? ' @ ' + test.viewport.width + 'x' + test.viewport.height : '')
			);
			return framework.runTests(test.file, test.expect, test.viewport); 
		})
		.then(function(errCount) { 
			errors += errCount; 
		});
	}, Promise.resolve())
	.then(function() { 
		return errors; 
	});
}


