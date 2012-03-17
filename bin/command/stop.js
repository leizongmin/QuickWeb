/**
 * QuickWeb Command -stop
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var path = require('path');
var fs = require('fs');
var quickweb = require('../../');
var cluster = quickweb.Cluster;
var utils = require('./__utils');


var debug;
if (process.env.QUICKWEB_DEBUG && /command/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('-stop: %s', x); };
else
  debug = function() { };
 


/**
 * 停止服务器
 *
 * @param {string} serverdir 服务器目录
 * @return {int}
 */
exports.run = function (serverdir) {
  // 切换工作目录
  utils.chdir(serverdir);
  serverdir = process.cwd();
  utils.log('stop server on path "' + serverdir + '"');
  
  // 读取server.pid文件
  try {
    var pid = parseInt(fs.readFileSync('server.pid', 'utf8'));
    if (isNaN(pid) || pid < 1)
      return utils.die('Bad process PID: ' + pid);
  }
  catch (err) {
    utils.log(err);
    return utils.die('Cannot read file "server.pid", maybe the server is stoped.');
  }
  
  // 结束进程
  try {
    process.kill(pid);
    return utils.exit('The server PID ' + pid + ' has stoped.');
  }
  catch (err) {
    return utils.die(err);
  }
  
  return 1;
}

/**
 * 帮助信息
 */
exports.help = function () {
  var L = function (t) { console.log('  ' + t); }
  L('stop a QuickWeb server on specified directory.');
  L('');
  L('Examples:');
  L('  quickweb -stop            stop server on current path');
  L('  quickweb -stop /server    stop server on path /server');
}
