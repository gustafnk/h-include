var runTests = require('./framework.js').runTests;

var tests = [
  ['#a', "this text is included"],
  ["#b", "this text overwrote what was just there."]
];

// TODO: Find cleaner solution
setTimeout(function(){
  runTests("basic.html", tests);
}, 1000);
