//@jsdev(qwdebug) debug

/**
 * QuickWeb Service session.redis
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
  
var redis = require('redis');
var Service = require('../Service');

 
var debug;
if (process.env.QUICKWEB_DEBUG && /session/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Session.redis: %s', x); };
else
  debug = function() { };
  

// 连接池
var connections = exports.connections = {};


/**
 * 取连接
 *
 * @param {object} conf
 * @return {object}
 */
var getConnection = function (conf) {
  var id = conf['host'] + ':' + conf['port'];
  return connections[id] || null;
}

/**
 * 取键名
 *
 * @param {object} conf
 * @param {string} sessid
 * @return {string}
 */
var getKey = function (conf, sessid) {
  return (conf['prefix'] || 'SESSION:') + sessid;
}
  
/**
 * 配置
 *
 * @param {object} conf
 * @return {object}
 */
exports.config = function (conf) {
  // 服务器地址 host，默认为127.0.0.1
  // 服务器端口 port，默认为6379
  // SESSION ID前缀 prefix，默认为 SESSION:
  // 存活时间 maxage，默认为3600*24*30秒
  if (typeof conf['host'] !== 'string')
    conf['host'] = '127.0.0.1';
  if (isNaN(conf['port']))
    conf['port'] = 6379;
  conf['port'] = parseInt(conf['port']);
  if (typeof conf['prefix'] !== 'string')
    conf['prefix'] = 'SESSION:';
  if (isNaN(conf['maxage']))
    conf['maxage'] = 3600 * 24 * 30;
  else
    conf['maxage'] = parseInt(conf['maxage']);
  
  // 添加到连接池中
  var client = redis.createClient(conf['port'], conf['host'])
  var id = conf['host'] + ':' + conf['port'];
  connections[id] = client;
  client.on('error', function (err) {
    throw err;
  });
  
  return conf;
}

/**
 * 读取session
 *
 * @param {string} sessid session名称
 * @param {object} conf 配置
 * @param {function} callback 回调函数：err, data
 */
exports.get = function (sessid, conf, callback) {
  var client = getConnection(conf);
  var key = getKey(conf, sessid);
  if (!client)
    return callback(Error('Miss redis connection.'));
    
  try {
    client.get(key, function (err, data) {
      if (err)
        return callback(err);
      try {
        var d = JSON.parse(data);
        return callback(null, d);
      }
      catch (err) {
        return callback(err);
      }
    });
  }
  catch (err) {
    return callback(err);
  }
}

/**
 * 保存session
 *
 * @param {string} sessid session名称
 * @param {object} conf 配置
 * @param {object} data 数据
 * @param {function} callback 回调函数：err
 */
exports.set = function (sessid, conf, data, callback) {
  var client = getConnection(conf);
  var key = getKey(conf, sessid);
  if (!client)
    return callback(Error('Miss redis connection.'));
    
  try {
    var d = JSON.stringify(data);
    return client.set(key, d, function (err) {
      if (err)
        return callback(err);
        
      return client.expire(key, conf['maxage'], callback);
    });
  }
  catch (err) {
    return callback(err);
  }
}

/**
 * 删除session
 *
 * @param {string} sessid session名称
 * @param {object} conf 配置
 * @param {function} callback 回调函数：err
 */
exports.destory = function (sessid, conf, callback) {
  var client = getConnection(conf);
  var key = getKey(conf, sessid);
  if (!client)
    return callback(Error('Miss redis connection.'));
    
  try {
    return client.del(key, callback);
  }
  catch (err) {
    return callback(err);
  }
}
