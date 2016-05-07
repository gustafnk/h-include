var runTests = require('./framework.js').runTests;

// TODO: How to test that container was extracted?
var tests = [
  ['#a', "Paragraph in fragment"]
];

runTests("fragment.html", tests);
