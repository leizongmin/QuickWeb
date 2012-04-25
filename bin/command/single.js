/**
 * QuickWeb Command -single
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var path = require('path');
var quickweb = require('../../');
var cluster = quickweb.Cluster;
var utils = require('./__utils');


var debug;
if (process.env.QUICKWEB_DEBUG && /command/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-single: %s', x); };
else
  debug = function() { };
 


/**
 * 启动服务器
 *
 * @param {string} serverdir 服务器目录
 * @return {int}
 */
exports.run = function (serverdir) {

  // 切换工作目录
  utils.chdir(serverdir);
  serverdir = process.cwd();
  utils.log('start server on path "' + serverdir + '"');
    
  // 载入服务器配置
  try {
    var conf = require(path.resolve(serverdir, 'config'));
  }
  catch (err) {
    utils.die('Cannot find config file "config.js" on "' + serverdir + '"');
  }
    
  require('../../server/loader');
  
  
  return 0;
}

/**
 * 帮助信息
 */
exports.help = function () {
  var L = function (t) { console.log('  ' + t); }
  L('start a single process QuickWeb server on specified directory.');
  L('');
  L('Examples:');
  L('  quickweb -single            start server on current path');
  L('  quickweb -single /server    start server on path /server');
}
