//@jsdev(qwdebug) debug

/**
 * QuickWeb ServerRequest
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
var Service = require('./Service');
var decode = Service.import('decode');
var cookie = Service.import('cookie');
var tool = Service.import('tool');
var sessionManager = Service.import('session');

 
var debug;
if (process.env.QUICKWEB_DEBUG && /request/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('ServerRequest: %s', x); };
else
  debug = function() { };

 
/** 默认配置 */
var defaultConfig = 
  { 'decode get':       true          // 自动解析GET数据
  , 'decode post':      true          // 自动解析POST数据
  , 'decode cookie':    true          // 自动解析Cookie数据
  , 'upload dir':       '/tmp'        // 上传文件目录
  , 'upload max size':  10485760      // 上传文件最大尺寸
  // 开启的方法列表
  , 'enable methods': [ 'sessionStart'    // 开启Session
                      , 'sessionEnd'      // 关闭Session
                      , 'sessionUpdate'   // 保存当前Session
                      , 'header'          // 请求的header
                      , 'accepts'         // 是否接受指定类型
                      , 'auth'            // Auth认证信息
                      , 'config'          // 获取或设置配置当前实例的配置信息
                      ]
  // session配置
  , 'session type':     'file'        // 使用默认的文件存储引擎
  , 'session tag':      'SESSID'      // session标识符
  , 'session cookie maxage': 31536000 // Cookie 保存时间
  , 'session config': {               // 针对该session引擎的配置
                        'path': '/tmp'
                      }
  }
 
/**
 * 包装http.ServerRequest
 *
 * @param {object} req ServerRequest实例
 * @param {object} conf 配置 
 * @return {object}
 */
exports.extend = function (req, conf) {
  // 配置，如果没有设置则使用默认的，否则覆盖默认的设置
  conf = req._qw_config = tool.merge(defaultConfig, conf);
  
  // 自动注册事件
  if (typeof conf.event === 'object') {
    for (var i in conf.event)
      req.on(i, conf.event[i]);
  }
  
  // 自动解析POST数据
  if (conf['decode post'] === true 
  && (req.method == 'POST' || req.method == 'PUT')) {
    decode.decodePOST(req, { uploadDir: conf['upload dir']
                           , maxSize: conf['upload max size']
                           }, function (err, fields, file) {
      // 设置post结束标志
      req._qw_post_completed = true;
      
      if (err) {
        req.post = null;
        req.file = null;
        // 如果出错
        var ecb = req._events ? req._events['post error'] : [];
        if (!ecb)
          ecb = [];
        // 当没有监听post error事件时，自动返回出错信息
        if (req._qw_response && ecb.length < 1) {
          var res = req._qw_response;
          return res.sendError(500, 'Decode POST data fail: ' + err);
        }
        // 触发post error事件
        else {
          return req.emit('post error', err);
        }
      }
      else {
        req.post = fields;
        req.file = file;
        // 如果成功，触发post complete事件
        return req.emit('post complete', req, req._qw_response);
      }
    });
  }
  
  // 自动解析GET数据
  if (conf['decode get'] === true) {
    var data = decode.decodeGET(req.url);
    req.filename = data.pathname;           // 请求路径
    req.get = data.query;                   // GET参数
  }
  
  // 自动解析Cookie数据
  if (conf['decode cookie'] === true) {
    req.cookie = cookie.parse(req.headers['cookie']);
  }
  
  // 增加扩展的方法，可根据实际情况扩充
  var mets = conf['enable methods'];
  for (var i in mets) {
    var name = mets[i];
    req[name] = methods[name];
  }
  
  return req;
}


/** ServerRequest 方法列表 */
var methods = exports.methods = {}

/**
 * 开启Session
 *
 * @param {function} callback
 */
methods.sessionStart = function (callback) {
  var self = this;
  var type = this._qw_config['session type'];
  var tag = this._qw_config['session tag']
  var conf = this._qw_config['session config'];
  
  // 获取session ID   优先使用GET参数中的session id
  var id;
  if (self.get && self.get[tag]) {
    id = self.get[tag];
  }
  else if (self.cookie && self.cookie[tag]) {
    id = self.cookie[tag];
  }
  else {
    // 没有指定session id，则分配一个
    id = tool.md5('SESSION_' + Math.random() + Math.random());
  }
  /*debug debug('start session: id=' + id); */
  
  // 创建session对象
  sessionManager.create(id, type, conf, function (err, sessionObj) {
    if (err) {
      throw err;
    }
    
    // 保存到request对象
    self.session = sessionObj.data;
    self.session_id = sessionObj.id;
    self.sessionObj = sessionObj;
    
    // 设置cookie   需要配合QuickWeb的ServerResponse对象使用
    var response = self._qw_response;
    if (response) {
      response.setCookie( tag, sessionObj.id
                        , {maxAge: self._qw_config['session cookie maxage']});
    }
    
    // 回调
    if (typeof callback == 'function')
      callback();
    // 触发 session start 事件
    self.emit('session start', sessionObj);
  });
}

/**
 * 清除当前Session
 *
 * @param {function} callback
 */
methods.sessionEnd = function (callback) {
  var self = this;
  
  if (self.sessionObj) {
  
    if (typeof callback !== 'function')
      callback = function () {}
      
    // 销毁该session
    self.sessionObj.destory(callback);
    
    // 清除cookie
    if (self._qw_response) {
      self._qw_response.clearCookie(self.sessionObj.id);
    }
  }
}

/**
 * 保存当前Session
 *
 * @param {function} callback
 */
methods.sessionUpdate = function (callback) {
  var self = this;
  if (self.sessionObj) {
  
    if (typeof callback !== 'function')
      callback = function () {}
      
    // 保存 request.session 上的数据
    self.sessionObj.set(self.session, callback);
  }
}

/**
 * 获取header
 *
 * @param {string} name 名称
 * @param {string} defaultValue 默认值
 * @return {string}
 */
methods.header = function(name, defaultValue) {
  name = name.toLowerCase();
  
  if (name === 'referer' || name === 'referrer')
    return this.headers.referrer || this.headers.referer || defaultValue;
  else
    return this.headers[name] || defaultValue;
}

/**
 * 是否接受指定类型
 *
 * @param {string} type
 * @return {bool}
 */
methods.accepts = function(type) {
  type = type.toLowerCase().trim();
  var accept = this.header('accept');
  
  // 没有设置 Accept 请求头或者接受所有类型
  if (!accept || accept === '*/*')
    return true;

  if (accept.toLowerCase().indexOf(type) >= 0)
    return true;
  else
    return false;
}

/**
 * Auth认证信息
 *
 * @return {object}
 */
methods.auth = function () {
  return decode.decodeAuth(this.headers['authorization']);
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
