//@jsdev(qwdebug) debug

/**
 * QuickWeb Service session
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
var Service = require('../Service');
var filecache = Service.import('filecache');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /session/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Session: %s', x); };
else
  debug = function() { };
  

/**
 * 创建一个Session实例
 *
 * @param {string} id session名称
 * @param {string} type 类型
 * @param {object} conf 配置
 * @param {function} cb 回调函数：err, session
 */
exports.create = function (id, type, conf, cb) {
  // session模块名称全部为小写
  type = type.toLowerCase().trim();
  if (!conf)
    conf = {}
  
  // 加载session存储指定模块
  var sessionObj = Service.import('session.' + type);
  
  // 初始化配置
  if (typeof sessionObj.config === 'function')
    conf = sessionObj.config(conf);
  
  // 生成session实例
  var session = new SessionInstance(sessionObj, conf);
  
  // 获取数据并返回
  session.id = id;
  session.get(function (err, data) {
    cb(err, session);
  });
}

/**
 * 根据指定session模块创建一个Session实例
 *
 * @param {object} sessionObj session模块，提供config, get, set, destory, hold方法
 * @param {object} conf session配置
 */
var SessionInstance = function (sessionObj, conf) {
  this.session = sessionObj;    // session操作模块
  this.config = conf;           // 配置信息
  this.data = {};               // 数据
}

/**
 * 取值
 *
 * @param {function} cb 回调函数：err, data
 */
SessionInstance.prototype.get = function (cb) {
  var self = this;
  this.session.get(this.id, this.config, function (err, data) {
    // 如果出错，返回空对象
    if (err)
      data = {}
    self.data = data;
    cb(null, self.data);
  });
}

/**
 * 保存
 *
 * @param {object} data 值
 * @param {function} cb 回调函数：err
 */
SessionInstance.prototype.set = function (data, cb) {
  this.data = data;
  this.session.set(this.id, this.config, data, cb);
}

/**
 * 销毁
 *
 * @param {function} cb 回调函数：err
 */
SessionInstance.prototype.destory = function (cb) {
  if (typeof this.session.destory === 'function')
    this.session.destory(this.id, this.config, cb);
  else
    cb(null);
}

/**
 * 保持
 *
 * @param {function} cb 回调函数：err
 */
SessionInstance.prototype.hold = function (cb) {
  if (typeof this.session.hold === 'function')
    this.session.hold(this.id, this.config, cb);
  else
    cb(null);
}

