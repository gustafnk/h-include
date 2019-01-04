const fs = require('fs');
var prependFile = require('prepend-file');

fs.copyFileSync('./lib/h-include.js', './h-include.js');
prependFile.sync('./h-include.js', "\nconsole.warn('Using h-include.js from the root folder is deprecated, please use lib/h-include.js instead');\n\n");
