/**
 * QuickWeb Command -help
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var quickweb = require('../../');
var tool = quickweb.import('tool');
var path = require('path');
var fs = require('fs');


var debug;
if (process.env.QUICKWEB_DEBUG && /command/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-help: %s', x); };
else
  debug = function() { };
 


/**
 * 显示帮助信息
 *
 * @return {int}
 */
exports.run = function () {
  
  var L = console.log;
  
  L('[Usage]');
  L('');
  L('quickweb [option]');
  L('');
  L('option:');
  L('  -init-app          create an app');
  L('  -init              create an server');
  L('  -update-route      update app route');
  L('  -update-compress   update compress file');
  L('  -benchmark         ');
  L('  -start             start server');
  L('  -help              show this information');
  L('');
  L('For more information, please visit http://github.com/leizongmin/QuickWeb');
  
  return 1;
}
