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
 

// 是否继续
var next = true; 
 
// 执行命令
if (typeof process.argv[2] == 'string' && process.argv[2].charAt(0) == '-') {
  var command = process.argv[2].substr(1).toLowerCase().trim()
                              .replace('-', '_');
  try {
    var m = require('./command/' + command + '.js');
    var argv = [];
    for (var i = 3; i < process.argv.length; i++)
      argv.push(process.argv[i]);
    next = !m.run.apply(null, argv);
    if (next === false)
      process.exit();
  }
  catch (err) {
    debug(err.stack);
    next = true;
  }
}

if (next) {
  console.log('run quickweb -help for help.');
}