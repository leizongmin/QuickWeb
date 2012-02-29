//@jsdev(qwdebug) debug

/**
 * QuickWeb Worker Message Center
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 

var quickweb = require('../../');
var cluster = quickweb.Cluster;


var debug;
if (process.env.QUICKWEB_DEBUG && /worker/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('worker %s: %s', process.pid, x); };
else
  debug = function() { };
  
  
// global.QuickWeb.worker.applist           应用列表
// global.QuickWeb.worker.config            服务器配置
// global.QuickWeb.worker.connector         Connector对象
// global.QuickWeb.worker.listen            监听的httpServer对象
// global.QuickWeb.worker.loadApp           载入指定应用
// global.QuickWeb.worker.unloadApp         卸载指定应用
var worker = global.QuickWeb.worker;


// 处理消息
var messageListener = function (pid, msg) {
  /*debug debug('on broadcast'); */
  
  // 只接受master的消息
  if (pid != 0)
    return;
    
  // 载入应用
  if (msg.cmd === 'load app') {
    /*debug debug('load app path: ' + msg.dir); */
    worker.loadApp(msg.dir);
  }
  // 卸载应用
  else if (msg.cmd === 'unload app') {
    /*debug debug('unload app path: ' + msg.dir); */
    worker.unloadApp(msg.dir);
  }
  
}
cluster.on('broadcast', messageListener);
cluster.on('message', messageListener);
