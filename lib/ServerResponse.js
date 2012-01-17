/**
 * QuickWeb ServerResponse
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
var Service = require('./Service'); 
var filecache = Service.import('filecache');
var renderer = Service.import('renderer');
var mimetype = Service.import('mimetype');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /response/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('ServerResponse: %s', x); };
else
  debug = function() { };

 
/** 默认配置 */
var defaultConfig = 
  { 'template  path':   '.'     // 模板目录
  , 'home path':        '.'     // 网站跟目录
  // 开启的方法列表
  , 'enable methods': [ 'send'          // 发送文本
                      , 'sendJSON'      // 返回JSON数据
                      , 'sendFile'      // 返回文件内容
                      , 'sendError'     // 返回出错信息
                      , 'renderFile'    // 返回渲染后的文件
                      , 'render'        // 返回渲染后的文本
                      , 'redirect'      // 重定向
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
  if (!conf)
    conf = Object.freeze(defaultConfig);
  else {
    var _conf = {}
    for (var i in defaultConfig)
      _conf[i] = defaultConfig[i];
    for (var i in conf)
      _conf[i] = conf[i];
    conf = Object.freeze(_conf);
  }
  res._qw_config = conf;
  
  // 替换end(), writeHead, 使得可以收到 header before, header after 和 end 事件
  // 必要的
  res._qw_end = res.end;
  res._qw_writeHead = res.writeHead;
  res.end = warp.end;
  res.writeHead = warp.writeHead;
  
  // 增加扩展的方法，可根据实际情况扩充
  var mets = conf['enable methods'];
  for (var i in mets) {
    var name = mets[i];
    res[name] = methods[name];
  }
  
  return res;
}


/** 替换ServerResponse的方法 */
var warp = exports.warp = {}
warp.end = function () {
  this._qw_end.apply(this, arguments);
  this.emit('end');
}
warp.writeHead = function () {
  this.setHeader('X-Power-By', 'quickweb');
  this.emit('header before');
  this._qw_writeHead.apply(this, arguments);
  this._qw_writeHeaded = true;  // 此标志用于检查是否已输出过header了
  this.emit('header after');
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
      this.write(data);
    else
      this.end(out);
    debug('sendJSON data=' + out);
  }
  catch (err) {
    methods.sendError.bind(this)(500, err.stack);
  }
}

/**
 * send 返回数据并关闭输出
 *
 * @param {object} data 要输出的信息
 * @param {bool} writeOnly 是否使用write()方法输出
 */
methods.send = function (data, writeOnly) {
  try {
    if (writeOnly === true)
      this.write(data);
    else
      this.end(data);
    debug('send data=' + data);
  }
  catch (err) {
    methods.sendError.bind(this)(500, err.stack);
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
  debug('sendError status=' + status + ', msg=' + msg);
}

/**
 * sendFile 发送文件并关闭输出
 *
 * @param {string} filename 文件名
 * @param {bool} writeOnly 是否使用write()方法输出
 */
methods.sendFile = function (filename, writeOnly) {
  var self = this;
  
  // 获取绝对文件名及扩展名
  filename = path.resolve(this._qw_config['home path'], filename);
  var extname = path.extname(filename);
  
  debug('sendFile ' + filename);
  
  // 读取文件并发送，如果出错，则调用sendError()来返回出错信息
  try {
    filecache.readFile(filename, function (err, data) {
      if (err)
        self.sendError(500, err.stack);
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
    methods.sendError.bind(this)(500, err.stack);
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
    data = data || {}
    
    // 获取绝对文件名及扩展名
    filename = path.resolve(this._qw_config['home path'], filename);
    var extname = path.extname(filename).substr(1).toLowerCase();
    
    // 获取合适的模板引擎名称
    var eng = this._qw_config['render'][extname]
           || this._qw_config['render']['*'];
    
    debug('render file ' + filename);
    
    // 渲染文件
    renderer.renderFile(eng[0], filename, data, function (err, text) {
      if (err)
        self.sendError(500, err.stack);
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
    methods.sendError.bind(this)(500, err.stack);
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
    methods.sendError.bind(this)(500, err.stack);
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
    status = 301;
    
  if (this._qw_writeHeaded === true)
    throw Error('Cannot redirect after response header.');
    
  this.writeHead(status, {'location': url});
  this.end();
}

