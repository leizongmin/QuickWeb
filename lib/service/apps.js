//@jsdev(qwdebug) debug

/**
 * QuickWeb Load/Unload App
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var http = require('http');
var fs = require('fs');
var path = require('path');
var quickweb = require('../../');
var tool = quickweb.import('tool');
var cluster = quickweb.Cluster;
var liquid = require('tinyliquid'); 
var AsyncMiddleWare = quickweb.import('middleware').createAsync; 


var debug;
if (process.env.QUICKWEB_DEBUG && /app/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('worker %s: %s', process.pid, x); };
else
  debug = function() { };


/** 已加载的应用列表 */
var applist = exports.applist = {}

  
/**
 * 载入指定应用目录
 *
 * @param {Connector} connector
 * @param {string} dir
 */
exports.load = function (connector, dir) {
  dir = path.resolve(dir);
  // 应用名称
  var appname = path.basename(dir);
  
  // 检查应用是否已加载过
  if (appname in applist) {
    /*debug debug('load app ignore: ' + appname + ' has in loaded.'); */
    return;
  }
  
  // 初始化应用数据存储位置
  global.QuickWeb.app[appname] = {};
  
  // 载入应用配置及路由表
  var appconf = tool.requireFile(dir + '/config.js');
  var approute = fs.readFileSync(dir + '/route.txt', 'utf8').split(/\r?\n/);
  
  //-------------------------- X-Powered-By响应头 ------------------------------
  if (!appconf.response)
    appconf.response = {}
  if (!appconf.response.header)
    appconf.response.header = {}
  var servername = 'QuickWeb';
  if (/pre|beta|alpha/img.test(quickweb.version))
    servername += '(' + quickweb.version + ')';
  appconf.response.header['X-Powered-By'] = servername;
  //----------------------------------------------------------------------------
  
  //---------------------------- 添加应用 --------------------------------------
  appconf.appdir = dir;
  connector.addApp(appname, appconf);
  //----------------------------------------------------------------------------
  
  // 目录转向
  var dirRedirect = function (p) {
    var h = function (req, res) {
      res.redirect(req.url + '/');
    }
    return {path: p, get: h, head: p}
  }
  
  //---------------------------- 载入所有中间件 --------------------------------
  var middlewares = {};
  for (var i in approute) {
    var line = approute[i].split('\t');
    if (line.length < 2)
      continue;
    if (line[0].toLowerCase() === 'middleware') {
      var filename = path.resolve(dir, 'middleware', line[1]);
      var mwname = line[1].replace(/\.[a-zA-Z0-9]+$/,'').replace(/[\/\\]/img, '.');
      middlewares[mwname] = tool.requireFile(filename);
    }
  }
  // 保存到 QuickWeb.app['name'].template中
  global.QuickWeb.app[appname].middleware = middlewares;
  //----------------------------------------------------------------------------
  
  // 取middlware句柄
  var useMiddleWares = function (list, next) {
    var mw = new AsyncMiddleWare();
    for (var i in list) {
      if (typeof list[i] === 'function') {
        var m = list[i];
      }
      else {
        var m = middlewares[list[i]];
        if (typeof m !== 'function')
          throw Error('Cannot use middleware "' + list[i] + '".');
      }
      mw.use(m);
    }
    if (typeof next === 'function')
      mw.use(next);
    return mw.handler();
  }
  
  // 为code文件封装middleware
  var HTTP_METHOD = ['GET', 'POST', 'HEAD', 'DELETE', 'OPTIONS'];
  var codeFileWrap = function (m) {
    
    // 用于等待post complete触发
    var waitPostComplete = function (req, res, next) {
      if (req._qw_post_completed)
        return next(req, res);
      else
        req.on('post complete', next);
    }
    
    // 封装middlwWare
    if (Array.isArray(m.use)) {
      var normalUse = m.use.slice();
      // 对于post|put方法，code文件不再需要监听post complete事件
      var postUse = m.use.slice();
      postUse.push(waitPostComplete);
      
      for (var i in m) {
        var method = i.toUpperCase();
        if (typeof m[i] != 'function')
          continue;
        if (HTTP_METHOD.indexOf(method) < 0)
          continue;
        if (method === 'POST' || method === 'PUT')
          m[i] = useMiddleWares(postUse, m[i]);
        else
          m[i] = useMiddleWares(normalUse, m[i]);
      }
    }
    else {
      // 对于post|put方法，code文件不再需要监听post complete事件
      for (var i in m) {
        var method = i.toUpperCase();
        if (typeof m[i] != 'function')
          continue;
        if (method === 'POST' || method === 'PUT')
          m[i] = useMiddleWares([waitPostComplete], m[i]);
      }
    }
    
    return m;
  }
  
  //----------------------- 处理配置文件中的middleWare选项 ---------------------
  if (Array.isArray(appconf.middleWare)) {
    appconf.onRequest = useMiddleWares(appconf.middleWare, appconf.onRequest);
  }
  
  //-------------------------------- 注册路由 ----------------------------------
  for (var i in approute) {
    var line = approute[i].split('\t');
    if (line.length < 2)
      continue;
      
    switch (line[0].toLowerCase()) {
      
      //--------------------------- 注册目录路由 -------------------------------
      case 'dir':
        var p = '/' + line[1];
        connector.addCode(appname, dirRedirect(p));
        break;
      
      //--------------------------- 注册文件路由 -------------------------------
      case 'file':
        var p = line[1];
        connector.addFile(appname, p);
        // 默认首页文件
        if (p.substr(p.length - 10) === 'index.html') {
          connector.addFile( appname
                           , (path.dirname('/' + p) + '/').replace('//', '/')
                           , path.resolve(appconf.appdir, 'html', p));
        }
        break;
        
      //---------------------------- 注册nsp程序路由 ---------------------------
      case 'code':
        var m = tool.requireFile(dir + '/code/' + line[1], appconf.global);
        var m = codeFileWrap(m);
        var mp = '/' + line[1].substr(0, line[1].length - 3) + '.nsp';
        if (typeof m.path === 'string' || m.path instanceof RegExp)
          connector.addCode(appname, m);
        m.path = mp;
        connector.addCode(appname, m);
        // 默认首页文件
        if (mp.substr(mp.length - 9) === 'index.nsp') {
          m.path = path.dirname(mp);
          connector.addCode(appname, m);
        }
        break;
    }
  }
  //----------------------------------------------------------------------------
  
  //-------------------------------- 是否开启MVC模式 ---------------------------
  if (appconf.enableMVC == true) {
    // 读取文件内容
    var tplfiles = {};
    for (var i in approute) {
      var line = approute[i].split('\t');
      if (line.length < 2)
        continue;
      if (line[0].toLowerCase() === 'tpl') {
        var filename = line[1];
        var realfilename = path.resolve(dir, 'tpl', filename);
        tplfiles[filename] = fs.readFileSync(realfilename, 'utf8');
      }
    }
    
    // 编译
    var tplfuns = liquid.compileAll(tplfiles);
    // 保存到 QuickWeb.app['name'].template中
    global.QuickWeb.app[appname].template = tplfuns;
    
    // 保存MVC专用的models
    if (typeof appconf.MVCModels === 'object')
      global.QuickWeb.app[appname].models = appconf.MVCModels;
  }
  else {
    global.QuickWeb.app[appname].template = null;
    global.QuickWeb.app[appname].models = null;
  }
  //----------------------------------------------------------------------------
  
  //-------------------------------- 是否开启调试模式 --------------------------
  if (Array.isArray(appconf.debug)) {
    var watchers = {};
    var appChange = function (f) {
      console.log('[debug mode] path: ' + f);
      return function (event, filename) {
        watchers[f].close();
        console.log('[debug mode] change: ' + f);
        exports.unload(connector, dir);
        exports.load(connector, dir);
      };
    };
    // 监视应用目录，如果被更改，则重载应用
    for (var i in appconf.debug) {
      var f = path.resolve(dir, appconf.debug[i]);
      watchers[f] = fs.watch(f, appChange(f));
    };
  }
  //----------------------------------------------------------------------------
  
  // 保存到应用列表
  applist[appname] = dir;
  /*debug debug('load app ' + dir); */
}


/**
 * 卸载指定应用
 *
 * @param {Connector} connector
 * @param {string} dir
 */
exports.unload = function (connector, dir) {
  dir = path.resolve(dir);
  // 应用名称
  var appname = path.basename(dir);
  
  // 删除应用
  connector.removeApp(appname);
  
  // 删除应用列表
  delete applist[appname];
  /*debug debug('unload app ' + dir); */
}
