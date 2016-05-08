var runTests = require('./framework.js').runTests;

var tests = [
  ['#a', "this text overwrote what was just there"],
];

runTests("update-src.html", tests);