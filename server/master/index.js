/**
 * QuickWeb Master
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');
var os = require('os');
var msgbus = require('msgbus');
var quickweb = require('quickweb');
var tool = quickweb.import('tool');


var debug;
var isDebug;
if (process.env.QUICKWEB_DEBUG && /master/.test(process.env.QUICKWEB_DEBUG)) {
  debug = function(x) { console.error('master: %s', x); };
  isDebug = true;
}
else {
  debug = function() { };
  isDebug = false;
}


// 设置全局变量
global.QuickWeb.master = {applist: {}}

  
// 载入服务器配置
var serverConfig = require(path.resolve('./config.json'));
global.QuickWeb.master.config = serverConfig;

// ----------------------------------------------------------------------------
// 启动消息服务端
var msgserver = msgbus.createServer({debug: isDebug});
global.QuickWeb.master.msgserver = msgserver;
msgserver.bind(serverConfig.message, function (err) {
  if (err)
    throw err;
});

// 客户端连接成功
msgserver.on('online', function (id) {
  debug('worker ' + id + ' online');
});

// 客户端断开连接
msgserver.on('offline', function (id) {
  killWorker(parseInt(id), false);
});


// ----------------------------------------------------------------------------
// 启动Worker
var workers = global.QuickWeb.master.workers = [];

// 启动Worker进程
var forkWorker = function () {
  var worker = cluster.fork();
  msgserver.addAccount('' + worker.pid);
  workers.push(worker.pid);
  debug('fork pid=' + worker.pid);
}
global.QuickWeb.master.forkWorker = forkWorker;

// 杀死Worker进程
var killWorker = function (pid, donotKill) {
  if (donotKill !== false)
    process.kill(pid);
  var i = workers.indexOf(pid);
  delete workers[i];
  delete workerStatus[pid];
  debug('kill pid=' + pid);
}
global.QuickWeb.master.killWorker = killWorker;

if (isNaN(serverConfig.cluster) || serverConfig.cluster < 1)
    serverConfig.cluster = os.cpus().length;
for (var i = 0; i < serverConfig.cluster; i++)
  forkWorker();

  
// ----------------------------------------------------------------------------
// Worker进程请求统计信息
var workerStatus = global.QuickWeb.master.workerStatus = {}
msgserver.on('message', function (client_id, to, msg) {
    if (to !== 'connector_status')
      return;
      
    workerStatus[client_id] = msg;
});

// 默认每隔1分钟更新一次
if (isNaN(serverConfig['status update']['connector']))
  serverConfig['status update']['connector'] = 60000;
setInterval(function () {
  msgserver.broadcast({cmd: 'connector status'});
}, serverConfig['status update']['connector']);


// ----------------------------------------------------------------------------
// 启动管理服务器
var connector = quickweb.Connector.create();
global.QuickWeb.master.connector = connector;

var server = http.createServer(connector.listener());
server.listen(serverConfig.master.port, serverConfig.master.host);
debug('listen master server: ' + serverConfig.master.host + ':'
      + serverConfig.master.port);

var masterPath = path.resolve(__dirname);
global.QuickWeb.master.path = masterPath;

connector.addApp('default', {appdir: masterPath});

// 载入code目录里面的所有js文件
var codefiles = tool.listdir(masterPath + '/code', '.js').file;
for (var i in codefiles) {
  var m = require(codefiles[i]);
  connector.addCode('default', m);
}

// 载入html目录里面的所有文件
var htmlfiles = tool.listdir(masterPath + '/html').file;
for (var i in htmlfiles) {
  var file = tool.relativePath(masterPath + '/html', htmlfiles[i]);
  connector.addFile('default', file);
}

// 管理权限验证
var checkAuth = function (info) {
  if (!info)
    return false;
    
  // 如果没有设置密码，则直接返回true
  if (!(serverConfig.master && serverConfig.master.admin
      && serverConfig.master.password))
    return true;
    
  if (info.username == serverConfig.master.admin
      && info.password == serverConfig.master.password)
    return true;
  else
    return false;
}
global.QuickWeb.master.checkAuth = checkAuth;