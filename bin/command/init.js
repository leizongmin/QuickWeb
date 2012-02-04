/**
 * QuickWeb Command -init
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
  debug = function(x) { console.error('-init: %s', x); };
else
  debug = function() { };
 


/**
 * 生成服务器目录结构
 *
 * @param {string} appdir 应用目录
 * @return {int}
 */
exports.run = function (appdir) {
  // 切换工作目录
  utils.chdir(appdir);
  
  // 创建app目录
  utils.mkdir('app');
  
  // 创建配置文件
  utils.cpfile(path.resolve(__dirname, '__server_config.js'), 'config.js');
  
  utils.exit('OK.');
  return 1;
}

/**
 * 帮助信息
 */
exports.help = function () {
  var L = function (t) { console.log('  ' + t); }
  L('create a QuickWeb server on specified directory.');
  L('includes an directory "app", a config file "config.js".');
  L('');
  L('Examples:');
  L('  quickweb -init            create server on current path');
  L('  quickweb -init /server    create server on path /server');
}
