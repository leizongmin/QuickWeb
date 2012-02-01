/**
 * QuickWeb Command -start
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var path = require('path');
var cluster = require('cluster');


var debug;
if (process.env.QUICKWEB_DEBUG && /command/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-start: %s', x); };
else
  debug = function() { };
 


/**
 * 生成服务器目录结构
 *
 * @param {string} serverdir 服务器目录
 * @return {int}
 */
exports.run = function (serverdir) {
  // 默认使用当前目录
  if (typeof serverdir != 'string')
    serverdir = process.cwd();
  else {
    process.chdir(serverdir);
    serverdir = path.resolve(serverdir);
  }
  debug('start server on path ' + serverdir);
  
  // 载入服务器配置
  var conf = require(path.resolve(serverdir, 'config.json'));
  
  // 启动进程
  if (cluster.isMaster) {
    require('../../server/master');
  }
  else {
    require('../../server/worker');
  }
  
  return 0;
}

