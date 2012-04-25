//@jsdev(qwdebug) debug

/**
 * QuickWeb Loader
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var fs = require('fs');
var path = require('path');
var quickweb = require('quickweb');
var tool = quickweb.import('tool');
var apps = quickweb.import('apps');


var debug;
if (process.env.QUICKWEB_DEBUG && /loader/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('loader %s: %s', process.pid, x); };
else
  debug = function() { };


// global.QuickWeb.loader.applist           应用列表
// global.QuickWeb.app                      应用数据
// global.QuickWeb.loader.config            服务器配置
// global.QuickWeb.loader.connector         Connector对象
// global.QuickWeb.loader.listen            监听的httpServer对象
// global.QuickWeb.loader.loadApp           载入指定应用
// global.QuickWeb.loader.unloadApp         卸载指定应用


// 设置全局变量
global.QuickWeb.loader = {applist: apps.applist};

// 应用数据
global.QuickWeb.app = {};

// 载入服务器配置
var serverConfig = tool.requireFile(path.resolve('./config.js'));
global.QuickWeb.loader.config = serverConfig;

// 全局路由
var connector = quickweb.Connector.create();
global.QuickWeb.loader.connector = connector;

// Connector插件
if (typeof serverConfig.onExtend === 'function')
  connector.onExtend = serverConfig.onExtend;
if (typeof serverConfig.onRequest === 'function')
  connector.onRequest = serverConfig.onRequest;

// ----------------------------------------------------------------------------
// 监听端口
var listenHttp = {}
for (var i in serverConfig['listen http']) {
  var port = parseInt(serverConfig['listen http'][i]);
  var server = http.createServer(connector.listener());
  server.listen(port);
  listenHttp[port] = server;
  /*debug debug('listen on port ' + port + '...'); */
}
global.QuickWeb.loader.listen = listenHttp;


// 读取当前目录下的app目录，并尝试载入里面的应用
fs.readdir('./app', function (err, apps) {
  if (err) {
    console.error('Cannot find app dir.');
    process.exit(-1);
  }
  else {
    for (var i in apps) {
      var a = apps[i];
      try {
        if (path.existsSync(path.resolve('./app', a, 'config.js'))) {
          loadApp(path.resolve('./app', a));
          console.log('loaded app ' + a);
        }
      }
      catch (err) {
        console.log('load app ' + a + ' fail: ' + err.stack);
      }
    }
  }
});


// ----------------------------------------------------------------------------
// 进程异常  
process.on('uncaughtException', function (err) {
  /*debug debug(err.stack); */
  console.error(err.stack);
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
}, serverConfig['status update']['connector']);


  
// ----------------------------------------------------------------------------
/** 载入指定应用目录 */
var loadApp = global.QuickWeb.loader.loadApp = function (dir) {
  return apps.load(connector, dir);
}

/** 卸载指定应用 */
var unloadApp = global.QuickWeb.loader.unloadApp = function (dir) {
  return apps.unload(connector, dir);
}

