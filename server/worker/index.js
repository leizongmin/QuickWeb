/**
 * QuickWeb Worker
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var fs = require('fs');
var path = require('path');
var quickweb = require('quickweb');
var tool = quickweb.import('tool');
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

// 设置全局变量
global.QuickWeb.worker = {applist: {}}

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
for (var i in serverConfig['listen http']) {
  var port = parseInt(serverConfig['listen http'][i]);
  var server = http.createServer(connector.listener());
  server.listen(port);
  listenHttp[port] = server;
  debug('listen on port ' + port + '...');
}
global.QuickWeb.worker.listen = listenHttp;

// 消息处理
require('./message');


// ----------------------------------------------------------------------------
// 进程异常  
process.on('uncaughtException', function (err) {
  debug(err.stack);
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
  debug('update connector status');
  cluster.send({cmd: 'connector status', data: connector.resetStatus()});
}, serverConfig['status update']['connector']);


  
// ----------------------------------------------------------------------------
/**
 * 载入指定应用目录
 *
 * @param {string} dir
 */
var loadApp = function (dir) {
  dir = path.resolve(dir);
  // 应用名称
  var appname = path.basename(dir);
  
  // 检查应用是否已加载过
  if (appname in global.QuickWeb.worker.applist) {
    debug('load app ignore: ' + appname + ' has in loaded.');
    return;
  }
  
  // 载入应用配置及路由表
  var appconf = tool.requireFile(dir + '/config.js');
  var approute = fs.readFileSync(dir + '/route.txt', 'utf8').split(/\r?\n/);
  
  // X-Powered-By响应头
  if (!appconf.response)
    appconf.response = {}
  if (!appconf.response.header)
    appconf.response.header = {}
  appconf.response.header['X-Powered-By'] = 'QuickWeb/NSP';
  
  // 添加应用
  appconf.appdir = dir;
  connector.addApp(appname, appconf);
  
  // 目录转向
  var dirRedirect = function (p) {
    var h = function (req, res) {
      res.redirect(req.url + '/');
    }
    return {path: p, get: h, head: p}
  }
  
  // 注册路由
  for (var i in approute) {
    var line = approute[i].split('\t');
    if (line.length < 2)
      continue;
      
    switch (line[0].toLowerCase()) {
      
      // 注册目录路由
      case 'dir':
        var p = '/' + line[1];
        connector.addCode(appname, dirRedirect(p));
        break;
      
      // 注册文件路由
      case 'file':
        var p = line[1];
        connector.addFile(appname, p);
        // 默认首页文件
        if (path.basename(p) === 'index.html')
          connector.addFile(appname, path.dirname('/' + p) + '/'
                           , path.resolve(appconf.appdir, 'html', p));
        break;
        
      // 注册nsp程序路由
      case 'code':
        var m = tool.requireFile(dir + '/code/' + line[1]);
        var mp = '/' + line[1].substr(0, line[1].length - 3) + '.nsp';
        if (typeof m.path === 'string' || m.path instanceof RegExp)
          connector.addCode(appname, m);
        m.path = mp;
        connector.addCode(appname, m);
        // 默认首页文件
        if (path.basename(mp) === 'index.nsp') {
          m.path = path.dirname(mp);
          connector.addCode(appname, m);
        }
        break;
    }
  }
  
  // 保存到应用列表
  global.QuickWeb.worker.applist[appname] = dir;
}
global.QuickWeb.worker.loadApp = loadApp;

/**
 * 卸载指定应用
 *
 * @param {string} dir
 */
var unloadApp = function (dir) {
  dir = path.resolve(dir);
  // 应用名称
  var appname = path.basename(dir);
  
  // 删除应用
  connector.removeApp(appname);
  
  // 删除应用列表
  delete global.QuickWeb.worker.applist[appname];
}
global.QuickWeb.worker.unloadApp = unloadApp;
