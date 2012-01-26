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
 * @param {string} appdir 应用目录
 * @return {bool}
 */
exports.run = function (appdir) {
  // 默认使用当前目录
  if (typeof appdir != 'string')
    appdir = process.cwd();
  
  // 载入服务器配置
  var conf = require(path.resolve(appdir, 'config.json'));
  
  // 启动进程
  if (cluster.isMaster)
    startMaster(conf);
  else
    startWorker(conf);
    
  return false;
}

/**
 * 启动Master进程
 *
 * @param {object} conf 配置信息
 */
var startMaster = function (conf) {
  // 启动服务器管理器
  require('../master')(conf);
  
  // 创建子进程
  for (var i = 0; i < conf.cluster; i++)
    cluster.fork();
}

/**
 * 启动Worker进程
 *
 * @param {object} conf 配置信息
 */
var startWorker = function (conf) {
  require('../worker')(conf);
}
