/**
 * QuickWeb Command -start
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
  debug = function(x) { console.error('-start: %s', x); };
else
  debug = function() { };
 


/**
 * 启动服务器
 *
 * @param {string} serverdir 服务器目录
 * @return {int}
 */
exports.run = function (serverdir) {
  // Master进程
  if (cluster.isMaster) {
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
    
    require('../../server/master');
  }
  // Worker进程
  else {
    utils.log('start worker ' + process.pid);
    require('../../server/worker');
  }
  
  return 0;
}

/**
 * 帮助信息
 */
exports.help = function () {
  var L = function (t) { console.log('  ' + t); }
  L('start a QuickWeb server on specified directory.');
  L('');
  L('Examples:');
  L('  quickweb -start            start server on current path');
  L('  quickweb -start /server    start server on path /server');
}
