var path = require('path');
var quickweb = require('quickweb');
var tool = quickweb.import('tool');

debugger;
var filebame = path.resolve(__dirname, 'lib/rm.js');
var a = tool.requireWithContext(filebame, {debug: console.log}, module);
