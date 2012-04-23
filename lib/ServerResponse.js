//@jsdev(qwdebug) debug

/**
 * QuickWeb ServerResponse
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
var util = require('util');
var Service = require('./Service'); 
var filecache = Service.import('filecache');
var renderer = Service.import('renderer');
var mimetype = Service.import('mimetype');
var cookie = Service.import('cookie');
var tool = Service.import('tool');
var zlib = require('zlib');
var liquid = require('tinyliquid');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /response/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('ServerResponse: %s', x); };
else
  debug = function() { };

 
/** 默认配置 */
var defaultConfig = 
  { 'template path':   '.'      // 模板目录
  , 'home path':        '.'     // 网站根目录
  , 'http cache age':   31536000// HTTP静态文件缓存时间，秒
  , 'enable gzip':      false   // 是否开启gzip压缩输出
  , 'gzip min size':    256     // 开启gzip压缩输出的最小长度
  // 开启的方法列表
  , 'enable methods': [ 'send'          // 发送文本
                      , 'sendJSON'      // 返回JSON数据
                      , 'sendFile'      // 返回文件内容
                      , 'sendStaticFile'// 返回文件内容，自动判断文件是否被修改
                      , 'sendError'     // 返回出错信息
                      , 'renderFile'    // 返回渲染后的文件
                      , 'render'        // 返回渲染后的文本
                      , 'redirect'      // 重定向
                      , 'authFail'      // 返回Auth认证失败
                      , 'setEtag'       // 设置ETag
                      , 'setCookie'     // 设置Cookie
                      , 'clearCookie'   // 清除Cookie
                      , 'header'        // 检查是否已设置某header或者设置header值
                      
                      , 'json'          // 兼容express sendJSON
                      , 'status'        // 兼容express 设置statusCode
                      , 'contentType'   // 兼容express 设置Content-Type
                      
                      , 'config'        // 获取或设置配置当前实例的配置信息
                      
                      , 'mvcRender'     // MVC渲染模式
                      ]
  // 文件后缀对应的模板引擎，*为默认的引擎
  , 'render': { '*':  ['ejs', 'text/html']
              }
  // 出错页面模板
  , 'error page':     '<div style="max-width:500px; margin:auto;">'
                    + '<h1>{{status}}</h1><pre>{{message}}</pre>'
                    + '<hr><h3>QuickWeb</h3></div>'
  }
 
/**
 * 包装http.ServerResponse
 *
 * @param {object} res ServerResponse实例
 * @param {object} conf 配置 
 * @return {object}
 */
exports.extend = function (res, conf) {
  // 配置，如果没有设置则使用默认的，否则覆盖默认的设置
  conf = res._qw_config = tool.merge(defaultConfig, conf);
  
  // 自动注册事件
  if (typeof conf.event === 'object') {
    for (var i in conf.event)
      res.on(i, conf.event[i]);
  }
  
  // 替换end(), writeHead, 使得可以收到 header before, header after 和 end 事件
  // 必要的
  res._qw_writeHead = res.writeHead;    // 原来的writeHead方法
  res._qw_end = res.end;                // 原来的end方法
  res._qw_write = res.write;            // 原来的write方法
  // 选择相应的输出方法
  if (conf['enable gzip'] === true) {
    res.writeHead = wrap.gzip_writeHead;
    res.write = wrap.gzip_write;
    res.end = wrap.gzip_end;
    res._qw_output = [];
    res._qw_output_length = 0;
  }
  else {
    res.writeHead = wrap.writeHead;     // 新的writeHead方法
    res.end = wrap.end; 
  }
  
  // 增加扩展的方法，可根据实际情况扩充
  var mets = conf['enable methods'];
  for (var i in mets) {
    var name = mets[i];
    res[name] = methods[name];
  }
  
  return res;
}


/** 替换ServerResponse的方法 */
var wrap = exports.wrap = {}
wrap.end = function () {
  this._qw_end.apply(this, arguments);
  this.emit('end');
}
wrap.writeHead = function () {
  this.emit('header before');
  
  // 输出预定义的header
  if (this._qw_config['header']) {
    var headers = this._qw_config['header'];
    for (var i in headers)
      this.setHeader(i, headers[i]);
  }
  else {
    this.setHeader('X-Powered-By', 'QuickWeb');
  }
  
  this._qw_writeHead.apply(this, arguments);
  this._qw_writeHeaded = true;  // 此标志用于检查是否已输出过header了
  this.emit('header after');
}
wrap.gzip_writeHead = function () {
  if (this._qw_accept_gzip !== false)
    this.setHeader('Content-Encoding', 'gzip');
  wrap.writeHead.apply(this, arguments);
}
wrap.gzip_write = function (data) {
  if (!Buffer.isBuffer(data))
    var buff = new Buffer(data);
  else
    var buff = data;
  this._qw_output.push(buff);
  this._qw_output_length += buff.length;
}
wrap.gzip_end = function (data) {
  var self = this;
   
  // 组合缓冲区中的数据
  if (data)
    this.write(data);
  var buff = new Buffer(this._qw_output_length);
  var offset = 0;
  for (var i in this._qw_output) {
    this._qw_output[i].copy(buff, offset, 0);
    offset += this._qw_output[i].length;
  }
  
  // 替换end方法
  this.end = wrap.end;
   
  // 如果客户端接受gzip压缩及输出长度大于一定值
  if (this._qw_accept_gzip !== false 
  && this._qw_output_length >= this._qw_config['gzip min size']) {
    // 压缩内容并发送
    zlib.gzip(buff, function (err, data) {
      self.write = self._qw_write;  // 替换回原来的write()方法
      self.end(data);
    });
  }
  else {
    /*debug debug('not support gzip'); */
    // 删除Content-Encoding头
    if (self._qw_writeHeaded !== true) {
      self.removeHeader('Content-Encoding');
      self._qw_accept_gzip = false;
    }
    
    self.write = self._qw_write;  // 替换回原来的write()方法
    if (buff.length > 0)
      self.end(buff);
    else
      self.end();
    /*debug debug('end length=' + buff.length); */
  }
}


/** ServerResponse 方法列表 */
var methods = exports.methods = {}

/**
 * sendJSON 返回JSON格式数据
 *
 * @param {object} data 要输出的数据对象
 * @param {bool} writeOnly 是否使用write()方法输出
 */
methods.sendJSON = function (data, writeOnly) {
  try {
    var out = JSON.stringify(data);
    if (this._qw_writeHeaded !== true)
      this.setHeader('Content-Type', 'application/json');
    if (writeOnly === true)
      this.write(out);
    else
      this.end(out);
    /*debug debug('sendJSON length=' + out.length); */
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/** 别名 */
methods.json = methods.sendJSON;

/**
 * send 返回数据并关闭输出
 *
 * @param {object} data 要输出的信息
 * @param {bool} writeOnly 是否使用write()方法输出
 */
methods.send = function (data, writeOnly) {
  try {
    if (!Buffer.isBuffer(data) && typeof data !== 'string')
      data = util.format(data);
    
    if (writeOnly === true)
      this.write(data);
    else
      this.end(data);
    /*debug debug('send length=' + data.length); */
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/**
 * sendError 发送出错信息并关闭输出
 *
 * @param {int} status 状态码
 * @param {string} msg 出错信息
 */
methods.sendError = function (status, msg) {
  // 触发send error事件
  this.emit('send error', status, msg);
  
  // 输出出错信息
  if (this._qw_writeHeaded !== true)
    this.writeHead(status, {'Content-Type': 'text/html'});
    
  // 渲染要输出的文本
  var text = this._qw_config['error page']
            .replace(/\{\{status\}\}/ig, status)
            .replace(/\{\{message\}\}/ig, msg);
   
  this.end(text);
  /*debug debug('sendError status=' + status + ', msg=' + msg); */
}

/**
 * sendFile 发送文件并关闭输出
 *
 * @param {string} filename 文件名
 * @param {bool} writeOnly 是否使用write()方法输出
 */
methods.sendFile = function (filename, writeOnly) {
  try {
    var self = this;
    
    // 获取绝对文件名及扩展名
    filename = path.resolve(this._qw_config['home path'], filename);
    var extname = path.extname(filename);
    
    /*debug debug('sendFile ' + filename); */
    
    // 读取文件并发送
    filecache.readFile(filename, function (err, data) {
      if (err)
        methods.sendError.apply(self, [500, err.stack]);
      else {
        // 输出文件内容
        if (self._qw_writeHeaded !== true)
          self.setHeader('Content-Type', mimetype.get(extname));
        if (writeOnly === true)
          self.write(data);
        else
          self.end(data);
      }
    });
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/**
 * sendStaticFile 发送静态文件
 *
 * @param {string} filename 文件名
 * @param {object} headers 请求头
 */
methods.sendStaticFile = function (filename, headers) {
  try {
    var self = this;
    if (this._qw_request)
      headers = this._qw_request.headers;
    else
      headers = headers || {}
    
    // 获取绝对文件名及扩展名
    filename = path.resolve(this._qw_config['home path'], filename);
    
    // 取文件最后修改时间，判断是否已修改过，并使用sendFile()来发送文件
    filecache.stat(filename, function (err, stats) {
      if (err) {
        methods.sendError.apply(self, [500, err.stack]);
      }
      else {
        var isModified = true;
        var maxAge = self._qw_config['http cache age'];
        
        // 判断是否已修改
        if (typeof headers['if-modified-since'] == 'string') {
          var t1 = new Date(stats.mtime).getTime();
          var t2 = new Date(headers['if-modified-since']).getTime();
          if (t1 >=0 && t2 >= 0 && t1 > t2)
            isModified = true;
          else
            isModified = false;
        }
        
        // 发送文件
        if (isModified) {
          self.setHeader('Last-Modified', new Date(stats.mtime).toUTCString());
          self.setHeader('Cache-Control', 'public, max-age=' + maxAge);
          methods.sendFile.apply(self, [filename]);
        }
        // 发送304
        else {
          self.writeHead(304, { 'Cache-Control': 'public, max-age=' + maxAge});
          self.end();
        }
      }
    });
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/**
 * renderFile 渲染文件并关闭输出
 *
 * @param {string} filename 文件名
 * @param {object} data 数据
 * @param {bool} writeOnly 是否使用write()方法输出
 */
methods.renderFile = function (filename, data, writeOnly) {
  try {
    var self = this;
    
    // 使用默认的文件名 renderFile(data)
    if (typeof filename != 'string' && arguments.length < 3) {
      writeOnly = data;
      data = filename;
      filename = this._qw_template_file;
    }
    data = data || {}
    
    // 获取绝对文件名及扩展名
    filename = path.resolve(this._qw_config['template path'], filename);
    var extname = path.extname(filename).substr(1).toLowerCase();
    
    // 获取合适的模板引擎名称
    var eng = this._qw_config['render'][extname]
           || this._qw_config['render']['*'];
    
    /*debug debug('render file ' + filename); */
    
    // 渲染文件
    renderer.renderFile(eng[0], filename, data, function (err, text) {
      if (err)
        methods.sendError.apply(self, [500, err.stack]);
      else {
        
        if (self._qw_writeHeaded !== true)
            self.setHeader('Content-Type', eng[1] || mimetype.get(extname));
        if (writeOnly === true)
          self.write(text);
        else
          self.end(text);
      }
    });
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/**
 * 渲染文本并输出
 *
 * @param {string} tpl 模板内容
 * @param {object} data 数据
 * @param {string} eng 模板引擎
 * @param {bool} writeOnly 是否使用write()方法输出
 */
methods.render = function (tpl, data, eng, writeOnly) {
  try {
    // render(tpl, eng, writeOnly)
    if (typeof data == 'string') {
      writeOnly = eng;
      eng = data;
      data = {}
    }
    // render(tpl, data, writeOnly)
    else if (typeof eng != 'string') {
      writeOnly = eng;
      eng = this._qw_config['render']['*'][0];  // 获取默认的模板引擎名称
    }
    
    // 渲染模板
    var text = renderer.render(eng, tpl, data);
    
    // 输出
    if (writeOnly === true)
      this.write(text);
    else
      this.end(text);
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/**
 * 重定向
 *
 * @param {string} url
 * @param {int} status
 */
methods.redirect = function (url, status) {
  if (isNaN(status) || status < 300 || status > 399)
    status = 302;
    
  if (this._qw_writeHeaded === true)
    throw Error('Cannot redirect after response header.');
   
  try {   
    this.writeHead(status, {'location': url});
    this.end();
    /*debug debug(status + ' redirect=' + url); */
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/**
 * http auth认证失败
 */
methods.authFail = function () {
  try {
    this.writeHead(401, {'WWW-Authenticate': 'Basic realm="."'});
    this.end();
    /*debug debug('auth fail'); */
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/**
 * 设置ETag
 *
 * @param {string} tag ETag字符串
 */
methods.setEtag = function (tag) {
  try {
    if (typeof tag === 'string')
      tag = '"' + tag + '"';
    this.setHeader('Etag', tag);
    /*debug debug('set etag=' + tag); */
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/**
 * 设置Cookie
 *
 * @param {string} name Cookie名称
 * @param {string} val Cookie值
 * @param {object} options 选项，包含 path, maxAge, expires, domain, secure
 */
methods.setCookie = function (name, val, options) {
  try {
    if (typeof options != 'object')
      options = {}
    if (typeof options.path != 'string')
      options.path = '/';
    if (!(options.expires instanceof Date))
      options.expires = new Date();
    if (isNaN(options.maxAge))
      options.maxAge = 0;
    options.expires.setTime(options.expires.getTime() + options.maxAge * 1000);
    
    var newcookie = cookie.stringify(name, val, options);
    
    var oldcookie = this.getHeader('Set-Cookie');
    if (typeof oldcookie != 'undefined')
      newcookie = oldcookie + '\r\nSet-Cookie: ' + newcookie;
      
    this.setHeader('Set-Cookie', newcookie);
    /*debug debug('set cookie ' + name + '=' + val); */
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/**
 * 清除Cookie
 *
 * @param {string} name Cookie名称
 * @param {object} options 选项
 */
methods.clearCookie = function (name, options) {
  try {
    this.setCookie(name, '', options);
    /*debug debug('clear cookie: ' + name); */
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/**
 * 检查或设置header
 *
 * @param {string} name header名称
 * @param {string} value header值
 * @return {bool}
 */
methods.header = function (name, value) {
  try {
    if (value)
      return this.setHeader(name, value);
    else
      return this.getHeader(name);
  }
  catch (err) {
    methods.sendError.apply(this, [500, err.stack]);
  }
}

/**
 * 检查或设置status code
 *
 * @param {int} code 响应代码
 * @return {int}
 */
methods.status = function (code) {
  if (code)
    this.statusCode = code;
  return this.statusCode;
}

/**
 * 检查或设置Content-Type
 *
 * @param {string} type 
 * @return {string}
 */
methods.contentType = function (type) {
  if (typeof type === 'string')
    this.setHeader('Content-Type', type);
  return this.getHeader('Content-Type');
}

/**
 * 获取或设置配置当前实例的配置信息
 *
 * @param {string} name 配置项
 * @param {object} value 值，如果没有设置，则表示获取该项的值
 * @return {object}
 */
methods.config = function (name, value) {
  if (arguments.length > 1)
    this._qw_config[name] = value;
    
  return this._qw_config[name];
}

/**
 * MVC渲染
 *
 * @param {string} name 模板名
 * @param {object} data 可变数据
 * @param {object} models 基本数据，可选
 * @param {function} callback 回调函数
 */
methods.mvcRender = function (name, data, models, callback) {
  var self = this;
  if (!callback) {
    callback = models;
    models = {};
  }
  
  var appname = this._qw_config.appname;
  
  if (global.QuickWeb.app[appname].template) {
    var globalmodels = global.QuickWeb.app[appname].models || {};
    var template = global.QuickWeb.app[appname].template;
    
    if (typeof template[name] !== 'function')
      return self.sendError(500, 'MVC render fail: template "' + name + '" not exists.');
    
    for (var i in data)
      models[i] = data[i];
    for (var i in globalmodels)
      if (!models[i])
        models[i] = globalmodels[i];
    
    liquid.advRender(template[name], models, {env: data}, function (err, text) {
      if (err)
        self.sendError(500, err.stack);
      
      self.setHeader('Content-Type', 'text/html');
      self.send(text);
    });
  }
  else {
    return self.sendError(500, 'Please enable MVC render mode.');
  }
}