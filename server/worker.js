/**
 * QuickWeb Worker
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var fs = require('fs');
var path = require('path');
var msgbus = require('msgbus');
var quickweb = require('quickweb');
var tool = quickweb.import('tool');


var debug;
var isDebug;
if (process.env.QUICKWEB_DEBUG && /worker/.test(process.env.QUICKWEB_DEBUG)) {
  debug = function(x) { console.error('worker %s: %s', process.pid, x); };
  isDebug = true;
}
else {
  debug = function() { };
  isDebug = false;
}


// 设置全局变量
global.QuickWeb.worker = {}

// 载入服务器配置
var serverConfig = require(path.resolve('./config.json'));
global.QuickWeb.worker.config = serverConfig;

// 全局路由
var connector = quickweb.Connector.create();
global.QuickWeb.worker.connector = connector;

// ----------------------------------------------------------------------------
// 监听端口
var listenHttp = {}
for (var i in serverConfig['listen http']) {
  var port = parseInt(serverConfig['listen http'][i]);
  var server = http.createServer(connector.listener());
  server.listen(port);
  listenHttp[port] = server;
  console.log('listen on port ' + port + '...');
}
global.QuickWeb.worker.listen = listenHttp;

// ----------------------------------------------------------------------------
// 启动消息客户端
var msgclient = msgbus.createClient({debug: isDebug});
global.QuickWeb.worker.msgclient = msgclient;
msgclient.connect(serverConfig.message, function (err) {
  if (err)
    throw err;
  else {
    msgclient.identify('' + process.pid);
  }
});

msgclient.on('broadcast', function (client_id, msg) {
  debug('on broadcast');
  // 载入应用
  if (msg.cmd === 'load app') {
    debug('load app path: ' + msg.dir);
    loadApp(msg.dir);
  }
  // 卸载应用
  else if (msg.cmd === 'unload app') {
    debug('unload app path: ' + msg.dir);
    unloadApp(msg.dir);
  }
  // 提交请求信息
  else if (msg.cmd === 'connector status') {
    debug('update connector status');
    msgclient.send('connector_status', connector.status);
  }
});

// 发送心跳信息 默认30秒
if (isNaN(serverConfig['status update']['worker heartbeat']))
  serverConfig['status update']['worker heartbeat'] = 30000;
setInterval(function () {
  msgclient.send('heartbeat', process.pid);
}, serverConfig['status update']['worker heartbeat']);
  


// ----------------------------------------------------------------------------
// 进程异常  
process.on('uncaughtException', function (err) {
  debug(err.stack);
  // 发送出错信息
  msgclient.send('uncaughtException', err.stack);
});

  
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
  
  // 载入应用配置及路由表
  var appconf = require(dir + '/config.json');
  var approute = fs.readFileSync(dir + '/route.txt', 'utf8').split(/\r?\n/);
  console.log(appconf, approute);
  
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
}

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
}
