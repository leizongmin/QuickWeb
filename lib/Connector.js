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
  // 应用表
  this.apps = {}
  // 虚拟主机表
  this.vhost = Vhost.create();
  // 默认虚拟主机
  this.addHost('default');
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
 * 取主机路由表
 *
 * @param {string} hostname 主机名称
 * @param {string} method 请求方法
 */
Connector.prototype.getHostRoute = function (hostname, method) {
  if (typeof hostname != 'string')
    hostname = 'default';
  if (typeof method != 'string')
    method = 'GET';
  method = method.toUpperCase().trim();
  
  // 去掉端口号
  var i = hostname.lastIndexOf(':');
  if (i >= 0)
      hostname = hostname.substr(0, i);
  
  debug('get host route: ' + hostname + ' ' + method);
  
  var routeTable = this.vhost.query(hostname);
  if (method in routeTable)
    return routeTable[method];
  else
    return null;
}

/**
 * 添加应用
 *
 * @param {string} name 应用名称
 * @param {object} conf 配置，至少包含path, host, appdir, request, response
 */
Connector.prototype.addApp = function (name, conf) {
  // 虚拟路径
  if (typeof conf.path != 'string')
    conf.path = '/';
  if (conf.path.substr(-1) != '/')
    conf.path += '/';
  
  // 主机名
  if (!Array.isArray(conf.host))
    conf.host = [conf.host];
  var hosts = conf.host;
  // 检查如果没有该主机，则先添加
  for (var i in hosts) {
    if (!this.vhost.exists(hosts[i]))
      this.addHost(hosts[i]);
  }
  
  // ServerRequest，ServerResponse配置
  if (!conf.request)
    conf.request = {}
  if (!conf.response)
    conf.response = {}
  conf.response['home path'] = path.resolve(conf.appdir, 'html');
  conf.response['template path'] = path.resolve(conf.appdir, 'tpl');
  
  // 保存到应用列表
  this.apps[name] = conf;
}

/**
 * 添加静态文件
 *
 * @param {string} appname 应用名称
 * @param {string} filename 文件名
 * @param {string} realname 真实文件名（当与文件名不同时指定）
 */
Connector.prototype.addFile = function (appname, filename, realname) {
  if (!realname)
    realname = filename;
  
  // 当应用不存在时，则当作为默认应用default
  if (!this.apps[appname])
    appname = 'default'
  var app = this.apps[appname];
  
  // 计算虚拟路径和实际文件名
  var vp = resolveVirtualPath(app.path, filename);
  var rf = path.resolve(app.appdir, 'html', realname);
  debug('[' + app.host + '] add file: ' + vp + ' => ' + rf);
  
  // 注册路由表
  for (var i in app.host) {
    var handle = sendFile.bind({filename: rf});
    this.getHostRoute(app.host[i], 'GET').add(vp, handle, app);
    this.getHostRoute(app.host[i], 'HEAD').add(vp, handle, app);
  }
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
  debug('[' + app.host + '] add code: ' + vp);
  
  // 注册路由
  for (var i in app.host) {
    // 小写
    if (typeof code.get === 'function')
      this.getHostRoute(app.host[i], 'GET').add(vp, code.get, app);
    if (typeof code.head === 'function')
      this.getHostRoute(app.host[i], 'HEAD').add(vp, code.head, app);
    if (typeof code.post === 'function')
      this.getHostRoute(app.host[i], 'POST').add(vp, code.post, app);
    if (typeof code.put === 'function')
      this.getHostRoute(app.host[i], 'PUT').add(vp, code.put, app);
    if (typeof code.delete === 'function')
      this.getHostRoute(app.host[i], 'DELETE').add(vp, code.delete, app);
    if (typeof code.options === 'function')
      this.getHostRoute(app.host[i], 'OPTIONS').add(vp, code.options, app);
    // 大写
    if (typeof code.GET === 'function')
      this.getHostRoute(app.host[i], 'GET').add(vp, code.GET, app);
    if (typeof code.HEAD === 'function')
      this.getHostRoute(app.host[i], 'HEAD').add(vp, code.HEAD, app);
    if (typeof code.POST === 'function')
      this.getHostRoute(app.host[i], 'POST').add(vp, code.POST, app);
    if (typeof code.PUT === 'function')
      this.getHostRoute(app.host[i], 'PUT').add(vp, code.PUT, app);
    if (typeof code.DELETE === 'function')
      this.getHostRoute(app.host[i], 'DELETE').add(vp, code.DELETE, app);
    if (typeof code.OPTIONS === 'function')
      this.getHostRoute(app.host[i], 'OPTIONS').add(vp, code.OPTIONS, app);
  }
}

/**
 * 返回监听器
 */
Connector.prototype.listener = function () {
  return this._listener.bind(this);
}

/**
 * 监听函数
 *
 * @param {object} req
 * @param {object} res
 */
Connector.prototype._listener = function (req, res) {
  // 查找相应的路由表
  var route = this.getHostRoute(req.headers['host'], req.method);
  
  // 如果找不到对应的应用，则返回错误信息
  if (route === null) {
    res = quickweb.extend(res);
    res.sendError(500, 'Not support method \'' + req.method + '\'');
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
      res = quickweb.extend(res);
      res.sendError(404, 'File not found!');
    }
    else {
      // 封装request, response对象
      req = quickweb.extend(req, h.info.request);
      res = quickweb.extend(res, h.info.response);
      // 互相链接
      req._qw_response = res;
      res._qw_request = req;
      // path参数
      req.path = h.value;
      // 检查客户端是否支持GZip压缩
      if (req.headers['accept-encoding']
      && req.headers['accept-encoding'].toLowerCase().indexOf('gzip') > -1)
        res._qw_accept_gzip = true;
      else
        res._qw_accept_gzip = false;
      
      // 执行
      h.handle(req, res);
    }
  }
}

/**
 * 计算虚拟路径
 *
 * @param {string} basepath
 * @param {string|RegExp} filename
 * @return {string|RegExp}
 */
var resolveVirtualPath = function (basepath, filename) {
  if (basepath.charAt(0) !== '/')
    basepath = '/' + basepath;
  if (basepath.substr(-1) !== '/')
    basepath += '/';
  
  // 如果文件名是RegExp实例，则返回RegExp
  if (filename instanceof RegExp) {
    filename = filename.toString();
    filename = filename.substr(1, filename.length - 2);
    if (filename.charAt(0) == '/')
      filename = filename.substr(1);
    var vp = basepath + filename;
    return new RegExp(vp);
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
 * @param {object} req 
 * @param {object} res
 * @param {function} next
 */
var sendFile = function (req, res, next) {
  var filename = this.filename;
  debug('send file: ' + filename);
  res.sendStaticFile(filename);
}
