/**
 * QuickWeb Command -start
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var path = require('path');
var quickweb = require('../../');
var cluster = quickweb.Cluster;


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
  // Master进程
  if (cluster.isMaster) {
    
    // 默认使用当前目录
    if (typeof serverdir != 'string')
      serverdir = process.cwd();
    else {
      serverdir = path.resolve(serverdir);
      if (!path.existsSync(serverdir)) {
        console.error('path ' + serverdir + ' is not exists!');
        return -1;
      }
      process.chdir(serverdir);
    }
    debug('start server on path ' + serverdir);
    
    // 载入服务器配置
    try {
      var conf = require(path.resolve(serverdir, 'config'));
    }
    catch (err) {
      console.error('Cannot find config file "config.js" on "' + serverdir + '"');
      return 0;
    }
    
    require('../../server/master');
  }
  
  // Worker进程
  else {
    debug('start worker ' + process.pid);
    require('../../server/worker');
  }
  
  return 0;
}

