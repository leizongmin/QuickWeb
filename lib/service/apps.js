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
        if (mp.substr(mp.length - 9) === 'index.nsp') {
          m.path = path.dirname(mp);
          connector.addCode(appname, m);
        }
        break;
    }
  }
  
  // 保存到应用列表
  applist[appname] = dir;
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
}
