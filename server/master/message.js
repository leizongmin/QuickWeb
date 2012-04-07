//@jsdev(qwdebug) debug

/**
 * QuickWeb Master Message Center
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 

var quickweb = require('../../');
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
// global.QuickWeb.master.workerStatusHistory 进程请求统计信息历史数据
// global.QuickWeb.master.connector       管理服务器Connector对象
// global.QuickWeb.master.path            服务器路径
// global.QuickWeb.master.checkAuth       验证管理权限
// global.QuickWeb.master.processMonitor  系统资源占用监视器
// global.QuickWeb.master.onlineAdmin     登录的管理员列表
var master = global.QuickWeb.master;

  
// worker进程启动/结束消息
cluster.on('online', function (w) {
  // 添加到资源占用监视器
  master.processMonitor.watch(w.pid);
  // 加载应用
  for (var i in master.applist) {
    cluster.send(w.pid, {cmd: 'load app', dir: master.applist[i]});
  }
});
cluster.on('death', function (w) {
  // 取消资源占用监视
  master.processMonitor.unwatch(w.pid);
  // 删除活动连接数统计
  delete master.workerStatus.connectionPid[w.pid];
});

  
// 处理worker消息
cluster.on('message', function (pid, msg) {
  
  // 进程异常
  if (msg.cmd == 'uncaughtException') {
    master.pushExceptions(pid, msg.data);
  }
  
  // Worker进程请求统计信息
  else if (msg.cmd == 'connector status') {
    var ms = master.workerStatus;
    var ws = msg.data;
    ms.request += ws.request;
    ms.response += ws.response;
    ms.error += ws.error;
    ms.connectionPid[pid] = ws.connection;
    ms.connection = 0;
    for (var i in ms.connectionPid)
      ms.connection += ms.connectionPid[i];
  }
  
});
