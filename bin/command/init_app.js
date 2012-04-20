/**
 * QuickWeb Command -init-app
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
  debug = function(x) { console.error('-init-app: %s', x); };
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
  
  // 创建目录
  utils.mkdir('code');
  utils.mkdir('html');
  utils.mkdir('tpl');
  utils.mkdir('middleware');
  
  // 创建配置文件
  utils.cpfile(path.resolve(__dirname, '__app_config.js'), 'config.js');
  
  // 空白的路由信息文件
  utils.mkfile('route.txt', 'code\tindex.js');
  
  // 测试页面
  utils.cpfile(path.resolve(__dirname, '__app_index.js'), 'code/index.js');
  
  utils.exit('OK.');
  return 1;
}

/**
 * 帮助信息
 */
exports.help = function () {
  var L = function (t) { console.log('  ' + t); }
  L('create a QuickWeb server app on specified directory.');
  L('includes there directory "code", "html" and "tpl", a config file "config.js".');
  L('');
  L('Examples:');
  L('  quickweb -init-app               create server app on current path');
  L('  quickweb -init-app ./app/test1   create server app on path ./app/test1');
}
