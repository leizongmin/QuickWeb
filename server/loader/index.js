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


var debug;
if (process.env.QUICKWEB_DEBUG && /loader/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('loader %s: %s', process.pid, x); };
else
  debug = function() { };


// global.QuickWeb.loader.applist           应用列表
// global.QuickWeb.loader.config            服务器配置
// global.QuickWeb.loader.connector         Connector对象
// global.QuickWeb.loader.listen            监听的httpServer对象
// global.QuickWeb.loader.loadApp           载入指定应用
// global.QuickWeb.loader.unloadApp         卸载指定应用


// 设置全局变量
global.QuickWeb.loader = {applist: {}}

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
        loadApp(path.resolve('./app', a));
        console.log('loaded app ' + a);
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
  if (appname in global.QuickWeb.loader.applist) {
    /*debug debug('load app ignore: ' + appname + ' has in loaded.'); */
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
        if (path.basename(p) === 'index.html') {
          connector.addFile( appname
                           , (path.dirname('/' + p) + '/').replace('//', '/')
                           , path.resolve(appconf.appdir, 'html', p));
        }
        break;
        
      // 注册nsp程序路由
      case 'code':
        var m = tool.requireFile(dir + '/code/' + line[1], appconf.global);
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
  global.QuickWeb.loader.applist[appname] = dir;
}
global.QuickWeb.loader.loadApp = loadApp;

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
  delete global.QuickWeb.loader.applist[appname];
}
global.QuickWeb.loader.unloadApp = unloadApp;
