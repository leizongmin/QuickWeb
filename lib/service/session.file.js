//@jsdev(qwdebug) debug

/**
 * QuickWeb Service session.file
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var fs = require('fs');
var path = require('path'); 
var Service = require('../Service');
var filecache = Service.import('filecache');

 
var debug;
if (process.env.QUICKWEB_DEBUG && /session/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Session.file: %s', x); };
else
  debug = function() { };
  

/**
 * 配置
 *
 * @param {object} conf
 * @return {object}
 */
exports.config = function (conf) {
  // 文件存储路径，默认为 /tmp
  if (typeof conf.path !== 'string')
    conf.path = '/tmp';
    
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
  // 文件名为 /tmp/qws_$SESSION_ID
  var filename = path.resolve(conf.path, 'qws_' + sessid);
  
  filecache.readFile(filename, 'utf8', function (err, data) {
    // 读取问出错，如果文件不存在，返回空对象
    if (err) {
      if (err.toString().indexOf('ENOENT') >= 0)
        callback(null, {});
      else
        callback(err);
    }
    else {
      try {
        var ret = JSON.parse(data);
        callback(null, ret);
      }
      catch (err) {
        // 解析session文件出错
        /*debug debug('parse session file ' + filename + ' error: ' + err.stack); */
        callback(err);
      }
    }
  });
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
  // 文件名为 /tmp/qws_$SESSION_ID
  var filename = path.resolve(conf.path, 'qws_' + sessid);
  
  // JSON序列化
  try {
    var save = JSON.stringify(data);
    
    // 保存
    fs.writeFile(filename, save, callback);
  }
  catch (err) {
    // 序列化时出错
    /*debug debug('stringify session file ' + filename + ' error: ' + err.stack); */
    callback(err);
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
  // 文件名为 /tmp/qws_$SESSION_ID
  var filename = path.resolve(conf.path, 'qws_' + sessid);
  
  // 删除文件
  try {
    fs.unlink(filename, callback);
  }
  catch (err) {
    /*debug debug('destory session file ' + filename + ' error: ' + err.stack); */
    callback(err);
  }
}
