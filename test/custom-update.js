var runTests = require('./framework.js').runTests;

var tests = [
  ['#a', "this text is included"],
];

runTests("custom-update.html", tests);