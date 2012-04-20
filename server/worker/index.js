//@jsdev(qwdebug) debug

/**
 * QuickWeb Worker
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var quickweb = require('../../');
var tool = quickweb.import('tool');
var cluster = quickweb.Cluster;
var apps = quickweb.import('apps');


var debug;
if (process.env.QUICKWEB_DEBUG && /worker/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('worker %s: %s', process.pid, x); };
else
  debug = function() { };


// global.QuickWeb.worker.applist           应用列表
// global.QuickWeb.app                      应用数据
// global.QuickWeb.worker.config            服务器配置
// global.QuickWeb.worker.connector         Connector对象
// global.QuickWeb.worker.listen            监听的httpServer对象
// global.QuickWeb.worker.loadApp           载入指定应用
// global.QuickWeb.worker.unloadApp         卸载指定应用

// 设置全局变量
global.QuickWeb.worker = {applist: apps.applist};

// 应用数据
global.QuickWeb.app = {};

// 载入服务器配置
var serverConfig = tool.requireFile(path.resolve('./config.js'));
global.QuickWeb.worker.config = serverConfig;

// 全局路由
var connector = quickweb.Connector.create();
global.QuickWeb.worker.connector = connector;

// Connector插件
if (typeof serverConfig.onExtend === 'function')
  connector.onExtend = serverConfig.onExtend;
if (typeof serverConfig.onRequest === 'function')
  connector.onRequest = serverConfig.onRequest;

// ----------------------------------------------------------------------------
// 监听端口
var listenHttp = {}
// 监听http端口
for (var i in serverConfig['listen http']) {
  var port = parseInt(serverConfig['listen http'][i]);
  var server = http.createServer(connector.listener());
  server.listen(port);
  listenHttp[port] = server;
  /*debug debug('listen on port ' + port + '...'); */
}
if (serverConfig['listen https']) {
  try {
    // 读取证书,如果没有设置证书则使用默认的证书
    var opt = {}
    if (serverConfig.https && serverConfig.https.key) {
      opt.key = fs.readFileSync(serverConfig.https.key);
    }
    else {
      opt.key = fs.readFileSync(path.resolve(__dirname, './cert/ca-key.pem'));
      console.log('use default https key.');
    }
    if (serverConfig.https && serverConfig.https.cert) {
      opt.cert = fs.readFileSync(serverConfig.https.cert);
    }
    else {
      opt.cert = fs.readFileSync(path.resolve(__dirname, './cert/ca-cert.pem'));
      console.log('use default https cert.');
    }
  }
  catch (err) {
    console.error('Read cert file fail: ' + err);
  }
}
// 监听https端口
for (var i in serverConfig['listen https']) {
  var port = parseInt(serverConfig['listen https'][i]);
  var server = https.createServer(opt, connector.listener());
  server.listen(port);
  listenHttp[port] = server;
  /*debug debug('listen on https port ' + port + '...'); */
}
global.QuickWeb.worker.listen = listenHttp;

// 消息处理
require('./message');


// ----------------------------------------------------------------------------
// 进程异常  
process.on('uncaughtException', function (err) {
  /*debug debug(err.stack); */
  // 如果是主进程意外终止，则退出本程序
  if (err.toString().indexOf('channel closed') >= 0) {
    console.error('Master process is death.');
    process.exit(-1);
    return;
  }
  // 发送出错信息
  cluster.send({cmd: 'uncaughtException', data: err.stack});
});

// 默认每隔1分钟更新一次提交请求统计信息
if (isNaN(serverConfig['status update']['connector']))
  serverConfig['status update']['connector'] = 60000;
setInterval(function () {
  /*debug debug('update connector status'); */
  // 获取请求统计
  var data = connector.resetStatus();
  // 获取活动连接数
  data.connection = 0;
  for (var i in listenHttp)
    data.connection += listenHttp[i].connections;
  // 发送给Master
  cluster.send({cmd: 'connector status', data: data});
}, serverConfig['status update']['connector']);


  
// ----------------------------------------------------------------------------
/** 载入指定应用目录 */
var loadApp = global.QuickWeb.worker.loadApp = function (dir) {
  return apps.load(connector, dir);
}

/** 卸载指定应用 */
var unloadApp = global.QuickWeb.worker.unloadApp = function (dir) {
  return apps.unload(connector, dir);
}

