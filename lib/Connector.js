//@jsdev(qwdebug) debug

/**
 * QuickWeb Connector
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var quickweb = require('../');
var path = require('path'); 
var Service = require('./Service'); 
var Vhost = Service.import('vhost');
var Route = Service.import('route');
var filecache = Service.import('filecache');

 
var debug;
if (process.env.QUICKWEB_DEBUG && /connector/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Connector: %s', x); };
else
  debug = function() { };

  

/**
 * 创建一个Connector实例
 */
exports.create = function () {
  return new Connector();
}
  
/**
 * Connector对象
 *
 */
var Connector = function () {
  // 状态表
  this.resetStatus();
  // 应用表
  this.apps = {}
  // 应用注册路由表
  this.appPathTable = {}
  // 虚拟主机表
  this.vhost = Vhost.create();
  // 默认虚拟主机
  this.addHost('default');
  // 默认的应用
  this.addApp('default', {});
}

/**
 * 重置请求状态表
 */
Connector.prototype.resetStatus = function () {
  var ret = this.status;
  this.status = { request: 0      // 累计请求数量
                , response: 0     // 累计响应数量
                , error: 0        // 无法响应的数量
                //, url: {}         // 各URL请求统计
                }
  return ret;
}

/**
 * 添加主机
 *
 * @param {string} hostname 主机名称
 */
Connector.prototype.addHost = function (hostname) {
  hostname = hostname.toLowerCase().trim();
  // 初始化路由表
  this.vhost.add(hostname, { GET:     Route.create()
                           , HEAD:    Route.create()
                           , POST:    Route.create()
                           , PUT:     Route.create()
                           , DELETE:  Route.create()
                           , OPTIONS: Route.create()
                           });
}

/**
 * 根据主机名和请求方法取路由表
 *
 * @param {string} hostname 主机名称
 * @param {string} method 请求方法
 */
Connector.prototype.getHostRoute = function (hostname, method) {
  if (typeof hostname !== 'string')
    hostname = 'default';
  if (typeof method !== 'string')
    method = 'GET';
  method = method.toUpperCase().trim();
  
  // 去掉端口号
  var i = hostname.lastIndexOf(':');
  if (i >= 0)
    hostname = hostname.substr(0, i);
  
  /*debug debug('get host route: ' + hostname + ' ' + method); */
  
  var routeTable = this.vhost.query(hostname);

  return routeTable[method] || null;
}

/**
 * 添加应用
 *
 * @param {string} name 应用名称
 * @param {object} conf 配置，至少包含path, host, appdir, request, response, field
 */
Connector.prototype.addApp = function (name, conf) {
  // 基本路径，默认为/ path
  if (typeof conf.path != 'string')
    conf.path = '/';
  if (conf.path.substr(-1) != '/')
    conf.path += '/';
  
  // 主机名，默认为default host
  if (!Array.isArray(conf.host))
    conf.host = [conf.host || 'default'];
  var hosts = conf.host;
  // 检查如果没有该主机，则先添加
  for (var i in hosts) {
    if (!this.vhost.exists(hosts[i]))
      this.addHost(hosts[i]);
  }
  
  // ServerRequest，ServerResponse配置，默认为{} request, response
  if (!conf.request)
    conf.request = {}
  if (!conf.response)
    conf.response = {}
    
  // 应用名
  conf.name = name;
  conf.request.appname = name;
  conf.response.appname = name;
    
  // 静态文件目录及模板目录，默认为当前目录 appdir
  if (!conf.field)
    conf.field = {html: 'html', tpl: 'tpl'}
  conf.response['home path'] = path.resolve(conf.appdir
                                           , conf.field.html || 'html');
  conf.response['template path'] = path.resolve(conf.appdir
                                           , conf.field.tpl || 'tpl');
  
  // 保存到应用列表
  this.apps[name] = conf;
  this.appPathTable[name] = [];
}

/**
 * 卸载应用
 *
 * @param {string} name 应用名称
 * @return {bool}
 */
Connector.prototype.removeApp = function (name) {
  name = name.toLowerCase().trim();
  
  if (!(name in this.apps && name in this.appPathTable))
    return false;
    
  var p = this.appPathTable[name];
  var app = this.apps[name];
  
  // 删除该应用所有的路由信息
  for (var i in p) {
    var method = p[i].method;
    var vpath = p[i].path;
    /*debug debug('remove [' + name + '] route: ' + method + ' ' + vpath); */
    
    for (var i in app.host) {
      var route = this.getHostRoute(app.host[i], method);
      if (route === null)
        continue;
        
      route.remove(vpath);
    }
  }
  
  // 删除应用信息
  delete this.appPathTable[name];
  delete this.apps[name];
  
  return true;
}

/**
 * 添加静态文件
 *
 * @param {string} appname 应用名称
 * @param {string} filename 文件名
 * @param {string} realname 真实文件名（当与文件名不同时指定）
 */
Connector.prototype.addFile = function (appname, filename, realname) {
  if (!realname) {
    if (filename.charAt(0) === '/')
      realname = filename.substr(1);
    else
      realname = filename;
  }
  
  // 当应用不存在时，则当作为默认应用default
  if (!this.apps[appname])
    appname = 'default'
  var app = this.apps[appname];
  
  // 计算虚拟路径和实际文件名
  var vp = resolveVirtualPath(app.path, filename);
  var rf = path.resolve(app.appdir, 'html', realname);
  /*debug debug('[' + app.host + '] add file: ' + vp + ' => ' + rf); */
  
  // 注册路由表
  for (var i in app.host) {
    var handle = sendFileHandle(rf, app.response['home path']);
    this.getHostRoute(app.host[i], 'GET').add(vp, handle, app);
    this.getHostRoute(app.host[i], 'HEAD').add(vp, handle, app);
  }
  
  // 保存该路径，在卸载应用时需要用到
  this.appPathTable[appname].push({method: 'GET', path: vp});
  this.appPathTable[appname].push({method: 'HEAD', path: vp});
}

/**
 * 添加处理程序
 *
 * @param {string} appname 应用名称
 * @param {object} code 输出模块
 */
Connector.prototype.addCode = function (appname, code) {
  // 当应用不存在时，则当作为默认应用default
  if (!this.apps[appname])
    appname = 'default'
  var app = this.apps[appname];
  
  // 计算虚拟路径
  var vp = resolveVirtualPath(app.path, code.path);
  /*debug debug('[' + app.host + '] add code: ' + vp); */
  
  // 注册路由
  for (var i in app.host) {
    // 小写
    if (typeof code.get === 'function') {
      this.getHostRoute(app.host[i], 'GET').add(vp, code.get, app);
      this.appPathTable[appname].push({method: 'GET', path: vp});
    }
    if (typeof code.head === 'function') {
      this.getHostRoute(app.host[i], 'HEAD').add(vp, code.head, app);
      this.appPathTable[appname].push({method: 'HEAD', path: vp});
    }
    if (typeof code.post === 'function') {
      this.getHostRoute(app.host[i], 'POST').add(vp, code.post, app);
      this.appPathTable[appname].push({method: 'POST', path: vp});
    }
    if (typeof code.put === 'function') {
      this.getHostRoute(app.host[i], 'PUT').add(vp, code.put, app);
      this.appPathTable[appname].push({method: 'PUT', path: vp});
    }
    if (typeof code.delete === 'function') {
      this.getHostRoute(app.host[i], 'DELETE').add(vp, code.delete, app);
      this.appPathTable[appname].push({method: 'DELETE', path: vp});
    }
    if (typeof code.options === 'function') {
      this.getHostRoute(app.host[i], 'OPTIONS').add(vp, code.options, app);
      this.appPathTable[appname].push({method: 'OPTIONS', path: vp});
    }
    // 大写
    if (typeof code.GET === 'function') {
      this.getHostRoute(app.host[i], 'GET').add(vp, code.GET, app);
      this.appPathTable[appname].push({method: 'GET', path: vp});
    }
    if (typeof code.HEAD === 'function') {
      this.getHostRoute(app.host[i], 'HEAD').add(vp, code.HEAD, app);
      this.appPathTable[appname].push({method: 'HEAD', path: vp});
    }
    if (typeof code.POST === 'function') {
      this.getHostRoute(app.host[i], 'POST').add(vp, code.POST, app);
      this.appPathTable[appname].push({method: 'POST', path: vp});
    }
    if (typeof code.PUT === 'function') {
      this.getHostRoute(app.host[i], 'PUT').add(vp, code.PUT, app);
      this.appPathTable[appname].push({method: 'PUT', path: vp});
    }
    if (typeof code.DELETE === 'function') {
      this.getHostRoute(app.host[i], 'DELETE').add(vp, code.DELETE, app);
      this.appPathTable[appname].push({method: 'DELETE', path: vp});
    }
    if (typeof code.OPTIONS === 'function') {
      this.getHostRoute(app.host[i], 'OPTIONS').add(vp, code.OPTIONS, app);
      this.appPathTable[appname].push({method: 'OPTIONS', path: vp});
    }
  }
}

/**
 * 返回监听器
 */
Connector.prototype.listener = function () {
  return this._listener.bind(this);
}

/**
 * 插件 处理onRequest事件
 *
 * @param {object} req
 * @param {object} res
 */
Connector.prototype._listener = function (req, res) {
  var self = this;
  if (typeof this.onRequest === 'function') {
    this.onRequest(req, res, function () {
      self._listener_next(req, res);
    });
  }
  else {
    this._listener_next(req, res);
  }
}

/**
 * 监听函数
 *
 * @param {object} req
 * @param {object} res
 */
Connector.prototype._listener_next = function (req, res) {
  var self = this;
  
  // 查找相应的路由表
  var host = req.headers['host'];
  var route = this.getHostRoute(host, req.method);
  
  // 访问统计
  this.status.request++;
  
  // 如果找不到对应的应用，则返回错误信息
  if (route === null) {
    res = quickweb.extendResponse(res);
    res.sendError(500, 'Not support method \'' + req.method + '\'');
    this.status.error++;
    return;
  }
  else {
    // 查询相应的路由处理程序
    var i = req.url.indexOf('?');
    if (i >= 0)
      var p = req.url.substr(0, i);
    else
      var p = req.url;
    var h = route.query(p);
    
    // 如果没有对应的路由处理程序，则返回错误信息
    if (h === null) {
      res = quickweb.extendResponse(res);
      res.sendError(404, 'Not found!');
      this.status.error++;
      return;
    }
    else {
      // 封装request, response对象
      quickweb.extend(req, res, h.info);
      // path参数
      req.path = h.value;
      // 检查客户端是否支持GZip压缩
      if (req.headers['accept-encoding']
      && req.headers['accept-encoding'].toLowerCase().indexOf('gzip') > -1)
        res._qw_accept_gzip = true;
      else
        res._qw_accept_gzip = false;
      
      // 插件 onExtend
      if (typeof this.onExtend === 'function')
        this.onExtend(req, res);
      
      // 执行
      var callFunc = function () {
        try {
          var isError = false;
          res.on('end', function () {
            if (isError === false)
              self.status.response++;
          });
          res.on('send error', function () {
            isError = true;
            self.status.error++;
          });
          
          h.handle(req, res);
        }
        catch (err) {
          res.sendError(500, err.stack);
        }
      }
      
      // 如果该应用有 onRequest 插件，则执行该插件
      if (typeof h.info.onRequest === 'function')
        h.info.onRequest(req, res, callFunc);
      else
        callFunc();
    }
  }
}

/**
 * 计算虚拟路径
 *
 * @param {string} basepath 基本路径
 * @param {string|RegExp} filename 文件名
 * @return {string|RegExp}
 */
var resolveVirtualPath = function (basepath, filename) {
  if (basepath.charAt(0) !== '/')
    basepath = '/' + basepath;
  if (basepath.substr(-1) !== '/')
    basepath += '/';
  
  // 如果文件名是RegExp实例，则返回RegExp
  if (filename instanceof RegExp) {
     filename = filename.toString().substr(1);   
    // 检查正则表达式是否带选项
    var _opi = filename.lastIndexOf('/');
    if (filename[_opi - 1] !== '\\') {
      var options = filename.substr(_opi + 1);
      filename = filename.substr(0, _opi);
    }
    else {
      var options = '';
    } 
    // 替换\和/字符
    filename = filename.replace(/\\\\/ig, '')
                       .replace(/\\\//ig, '/');
    // 拼接
    if (filename.charAt(0) == '/')
      filename = filename.substr(1);
    var vp = '^' + basepath + filename + '$';
    return new RegExp(vp, options);
  }
  else {
    if (filename.charAt(0) == '/')
      filename = filename.substr(1);
    var vp = basepath + filename;
    return vp;
  }
}

/**
 * 发送文件处理函数
 *
 * @param {string} filename 文件名
 * @param {string} homepath html目录
 */
var sendFileHandle = function (filename, homepath) {
  return function (req, res, next) {
    // 如果存在 .gzip/filename 文件，且客户端接受gzip压缩则发送该文件
    var vfile = filename.substr(homepath.length + 1)
    var gzipfile = path.resolve(homepath , '.gzip', vfile);
    
    // 如果客户端支持gzip压缩，则尝试发送已压缩的gzip文件
    if (res._qw_accept_gzip === true) {
      filecache.stat(gzipfile, function (err, stats) {
        if (err || !stats.isFile()) {
          /*debug debug('send file: ' + filename); */
          res.sendStaticFile(filename);
        }
        else {
          // 发送已压缩的文件
          /*debug debug('send compress file: ' + gzipfile); */
          // 发送已压缩的文件，要避免默认的动态gzip压缩
          res._qw_accept_gzip = false;
          res.on('header before', function () {
            res.setHeader('Content-Encoding', 'gzip');
          });
          res.sendStaticFile(gzipfile);
        }
      });
    }
    // 如果客户端不支持gzip压缩，则直接发送原文件
    else {
      /*debug debug('send file: ' + filename); */
      res.sendStaticFile(filename);
    }
  }
}
