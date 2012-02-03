/**
 * QuickWeb Master Message Center
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 

var quickweb = require('quickweb');
var cluster = quickweb.Cluster;

var debug;
if (process.env.QUICKWEB_DEBUG && /master/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('master: %s', x); };
else
  debug = function() { };
  
  
// global.QuickWeb.master.applist         应用列表 
// global.QuickWeb.master.config          服务器配置信息 
// global.QuickWeb.master.pushExceptions  记录进程异常信息
// global.QuickWeb.master.workerException 进程异常数组
// global.QuickWeb.master.workerStatus    进程请求统计信息
// global.QuickWeb.master.connector       管理服务器Connector对象
// global.QuickWeb.master.path            服务器路径
// global.QuickWeb.master.checkAuth       验证管理权限
var master = global.QuickWeb.master;
  
  
// 处理worker消息
cluster.on('message', function (pid, msg) {
  
  // 进程异常
  if (msg.cmd == 'uncaughtException') {
    master.pushExceptions(pid, msg.data);
  }
  
  // Worker进程请求统计信息
  else if (msg.cmd == 'connector status') {
    master.workerStatus[pid] = msg.data;
  }
  
});
