var runTests = require('./framework.js').runTests;

var tests = [
  ['#a', "This text is set by the onSuccess callback"],
];

runTests("success-callback.html", tests);