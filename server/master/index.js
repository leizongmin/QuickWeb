/**
 * QuickWeb Master
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var fs = require('fs');
var path = require('path');
var os = require('os');
var quickweb = require('quickweb');
var tool = quickweb.import('tool');
var cluster = quickweb.Cluster;
var ProcessMonitor = quickweb.import('monitor.process');


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


// 设置全局变量
global.QuickWeb.master = {applist: {}}


// 载入服务器配置
var serverConfig = tool.requireFile(path.resolve('./config.js'));
global.QuickWeb.master.config = serverConfig;

  
// Worker进程异常信息
var exceptions = global.QuickWeb.master.workerException = [];

// 记录的进程异常信息数量 默认50条
if (isNaN(serverConfig['exception log size']))
  serverConfig['exception log size'] = 50;

// 记录异常信息
var pushExceptions = function (pid, err) {
  exceptions.push({ pid:        pid
                  , timestamp:  new Date().getTime()
                  , error:      err
                  });
  if (exceptions.length > serverConfig['exception log size'])
    exceptions.shift();
}
global.QuickWeb.master.pushExceptions = pushExceptions;


// ----------------------------------------------------------------------------
// Worker进程请求统计信息
var workerStatus = global.QuickWeb.master.workerStatus = {
  request: 0, response: 0, error: 0, url: {}
}

// 更新Worker进程请求统计信息历史数据
var workerStatusHistory = global.QuickWeb.master.workerStatusHistory = [];
var workerStatusLast = global.QuickWeb.master.workerStatusLast = {
  request: 0, response: 0, error: 0
}
// 默认每隔1分钟更新一次提交请求统计信息
if (isNaN(serverConfig['status update']['connector']))
  serverConfig['status update']['connector'] = 60000;
// 默认保存200个历史数据
if (isNaN(serverConfig['status update']['connector size']))
  serverConfig['status update']['connector size'] = 200;
var workerStatusHistorySize = serverConfig['status update']['connector size'];
setInterval(function () {
  // 计算新增的请求数
  var plus = { request:   workerStatus.request - workerStatusLast.request
             , response:  workerStatus.response - workerStatusLast.response
             , error:     workerStatus.error - workerStatusLast.error
             , timestamp: new Date().getTime()
             }
  workerStatusHistory.push(plus);
  if (workerStatusHistory.length > workerStatusHistorySize)
    workerStatusHistory.shift();
  // 保存最后一次计算的状态
  workerStatusLast.request = workerStatus.request;
  workerStatusLast.response = workerStatus.response;
  workerStatusLast.error = workerStatus.error;
  workerStatusLast.error = workerStatusLast.error;
}, serverConfig['status update']['connector']);

// 资源占用监视器采集周期
if (isNaN(serverConfig['status update']['load line']))
  serverConfig['status update']['load line'] = 20000;
// 资源占用监视器采集数据个数
if (isNaN(serverConfig['status update']['load line size']))
  serverConfig['status update']['load line size'] = 20;
  
// 更新资源占用统计
var processMonitor = ProcessMonitor.create({
    cycle: serverConfig['status update']['load line']
  , count: serverConfig['status update']['load line size']
  });
global.QuickWeb.master.processMonitor = processMonitor;


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
  var m = tool.requireFile(codefiles[i]);
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


// ----------------------------------------------------------------------------
// 消息处理
require('./message'); 

// 启动Worker进程
if (isNaN(serverConfig.cluster) || serverConfig.cluster < 1)
    serverConfig.cluster = os.cpus().length;
for (var i = 0; i < serverConfig.cluster; i++)
  cluster.fork(true);
   
  

// ----------------------------------------------------------------------------
// 进程异常  
process.on('uncaughtException', function (err) {
  debug(err.stack);
  pushExceptions(process.pid, err.stack);
});
