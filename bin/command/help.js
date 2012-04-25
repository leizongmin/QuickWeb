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
var utils = require('./__utils');


var debug;
if (process.env.QUICKWEB_DEBUG && /command/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-help: %s', x); };
else
  debug = function() { };
 


/**
 * 显示帮助信息
 *
 * @program {string} cmd 命令名称
 * @return {int}
 */
exports.run = function (cmd) {
  
  var L = console.log;
  L('');
  
  if (typeof cmd !== 'string') {
    L('Usage: quickweb <option>');
    L('');
    L('option:');
    L('  -init-app [path]           create an app');
    L('  -init [path]               create a server');
    L('  -update-route [path]       update app route info');
    L('  -update-compress [path]    update compress file');
    L('  -benchmark [c=client_size] [n=request_num] [u=URL]');
    L('                             a simple benchmark test program');
    L('  -start [path]              start server');
    L('  -stop [path]               stop server');
    L('  -single [path]             start a single process server');
    L('  -unzip [file]              extract a specified zip file');
    L('  -password [password]       encrypt a password string');
    L('  -help [option]             show this information');
  }
  // 查看指定命令的用法
  else {
    if (cmd.charAt(0) === '-')
      cmd = cmd.substr(1);
    var mn = cmd.toLowerCase().trim().replace('-', '_');
    try {
      var m = require('./' + mn + '.js');
      if (typeof m.help === 'function') {
        m.help();
      }
      else {
        L('No more information for option "' + cmd + '".');
      }
    }
    catch (err) {
      debug(err.stack);
      L('Try "quickweb -help" for more information.');
    }
  }
  
  // 结尾
  L('');
  L('For more information, please visit http://leizongmin.github.com/QuickWeb/');
  
  return 1;
}

/**
 * 帮助信息
 */
exports.help = function () {
  exports.run();
}
