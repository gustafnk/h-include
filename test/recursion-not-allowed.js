var runTests = require('./framework.js').runTests;

var tests = [
  ['#a', "Saw nested h-include with same src as ancestor (recursion)."]
];

runTests("recursion-not-allowed.html", tests);
