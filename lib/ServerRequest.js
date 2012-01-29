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
 
var debug;
if (process.env.QUICKWEB_DEBUG && /response/.test(process.env.QUICKWEB_DEBUG))
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
                      ]
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
  req._qw_config = conf;
  
  // 自动解析POST数据
  if (conf['decode post'] === true 
  && (req.method == 'POST' || req.method == 'PUT')) {
    decode.decodePOST(req, { uploadDir: conf['upload dir']
                           , maxSize: conf['upload max size']
                           }, function (err, fields, file) {
      if (err) {
        req.post = null;
        req.file = null;
        req.emit('post error', err);    // 如果出错，触发post error事件
      }
      else {
        req.post = fields;
        req.file = file;
        req.emit('post complete');      // 如果成功，触发post complete事件
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
  if (typeof callback == 'function')
    callback();
}

/**
 * 关闭Session
 *
 * @param {function} callback
 */
methods.sessionEnd = function (callback) {
  if (typeof callback == 'function')
    callback();
}