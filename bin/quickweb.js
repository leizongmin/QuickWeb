#!/usr/bin/env node

/**
 * QuickWeb Command
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */



var debug;
if (process.env.QUICKWEB_DEBUG && /command/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('quickweb: %s', x); };
else
  debug = function() { };
 

// 是否继续 0: 不结束  1: 结束  -1: 出错
var ret = -1; 
 
// 执行命令
if (typeof process.argv[2] == 'string' && process.argv[2].charAt(0) == '-') {
  var command = process.argv[2].substr(1).toLowerCase().trim()
                              .replace('-', '_');
  try {
    var m = require('./command/' + command + '.js');
    var argv = [];
    for (var i = 3; i < process.argv.length; i++)
      argv.push(process.argv[i]);
    ret = m.run.apply(null, argv);
    if (ret === 1)
      process.exit();
  }
  catch (err) {
    console.error(err.stack);
    ret = -1;
  }
}

if (ret === -1) {
  console.log('Try "quickweb -help" for help.');
  process.exit();
}