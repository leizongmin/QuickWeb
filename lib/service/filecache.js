//@jsdev(qwdebug) debug

/**
 * QuickWeb Service filecache
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
var fs = require('fs');
var Service = require('../Service');
var waitForQueue = Service.import('queue').wait;
 
var debug;
if (process.env.QUICKWEB_DEBUG && /service/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Filecache: %s', x); };
else
  debug = function() { };
  
  
/** 文件缓存 */
exports.cache = {}

/** 缓存生存时间 */
exports.expire = 60000;   // 60秒

/** 监视文件改动 */
var watchList = {}

/** 请求队列，避免当文件不在缓存中，瞬间大并发来读取同一个文件时的导致崩溃 */
var readFileQueue = {}
var statQueue = {}


/**
 * 读文件内容
 *
 * @param {string} filename 文件名
 * @param {string} encoding 编码
 * @param {function} callback 回调函数，参数：err, data
 */
exports.readFile = function (filename, encoding, callback) {
  filename = path.resolve(filename);
  if (typeof encoding == 'function') {
    callback = encoding;
    encoding = null;
  }
  
  // 检查是否在缓存中
  if (exports.cache[filename] && exports.cache[filename].data) {
    var file = exports.cache[filename];
    file.timestamp.data = new Date().getTime();  // 更新时间戳
    var data = file.data;
    callback(null, encoding === null
                 ? data
                 : new Buffer(data).toString(encoding)
                 );
  }
  // 如果不在缓存中，则先读取文件，再返回
  else {
    /*debug debug('read file ' + filename); */
    
    // 读取文件之前，先检查是否已有程序在等待读取该文件，如果有则将其添加到队列中
    // 不需要重复调用fs.readFile来读取
    var cb1 = function () {
      exports.readFile(filename, encoding, callback);
    }
    // 注意：此callback为 queue.wait()生成的参数，必须要加上参数，否则将导致其他线程无法返回
    var cb2 = function (callback) {
             
      fs.readFile(filename, function (err, data) {
        if (err) {
          callback(err);
        }
        else {
          // 缓存文件内容
          if (!exports.cache[filename])
            exports.cache[filename] = {timestamp: {}}
          var file = exports.cache[filename];
          file.timestamp.data = new Date().getTime();  // 更新时间戳
          file.data = data;                            // 保存数据
          exports.readFile(filename, encoding, callback);
          
          // 监视文件改动，删除缓存
          watchFile(filename);
        }
      });
    }
    waitForQueue(readFileQueue, filename, cb1, cb2, callback);
  }
}

/**
 * 取文件属性
 *
 * @param {string} filename 文件名
 * @param {function} callback 回调函数，参数 err, stats
 */
exports.stat = function (filename, callback) {
  filename = path.resolve(filename);
  
  // 检查是否在缓存中
  if (exports.cache[filename] && exports.cache[filename].stats) {
    var file = exports.cache[filename];
    file.timestamp.stats = new Date().getTime();  // 更新时间戳
    callback(null, file.stats);
  }
  // 如果不在缓存中，则先读取文件，再返回
  else {
    /*debug debug('get stat ' + filename); */
    
    // 读取文件之前，先检查是否已有程序在等待读取该文件，如果有则将其添加到队列中
    // 不需要重复调用fs.readFile来读取
    var cb1 = function () {
      exports.stat(filename, callback);
    }
    // 注意：此callback为 queue.wait()生成的参数，必须要加上参数，否则将导致其他线程无法返回
    var cb2 = function (callback) {     
             
      fs.stat(filename, function (err, stats) {
        if (err) {
          callback(err);
        }
        else {
          // 缓存文件状态
          if (!exports.cache[filename])
            exports.cache[filename] = {timestamp: {}}
          var file = exports.cache[filename];
          file.timestamp.stats = new Date().getTime();  // 更新时间戳
          file.stats = stats;                           // 保存数据
          callback(null, stats);
          
          // 监视文件改动，删除缓存
          watchFile(filename);
        }
      });
    }
    waitForQueue(statQueue, filename, cb1, cb2, callback);
  }
}

/**
 * 监视文件改动，自动删除其缓存
 *
 * @param {string} filename 文件名
 */
var watchFile = function (filename) {
  // 监视文件改动
  var fileChanged = function (e) {
    if (!e)
      e = 'delete';
    /*debug debug('delete cache ' + filename + ' -- ' + e); */
    // 删除文件数据
    delete exports.cache[filename];
    // 停止监视
    if (watchList[filename])
      watchList[filename].close();
  }
  try {
    watchList[filename] = fs.watch(filename, fileChanged);
    /*debug debug('watch file ' + filename); */
  }
  catch (err) {
    /*debug debug('watch file error: ' + err.stack); */
    fileChanged();
  }
}

/** 清理过期的缓存 */
var clearCache = function () {
  var min = new Date().getTime() - exports.expire;
  /*debug debug('clear file cache start...' + min); */
  
  var cache = exports.cache;
  for (var i in cache) {
    var file = cache[i];
    var timestamp = file.timestamp;
    if (isNaN(timestamp.data) || timestamp.data <= min) {
      delete cache[i].data;
      delete cache[i].timestamp.data;
      /*debug debug('clear file cache ' + i); */
    }
    if (isNaN(timestamp.stats) || timestamp.stats <= min) {
      delete cache[i].stats;
      delete cache[i].timestamp.stats;
      /*debug debug('clear stats cache ' + i); */
    }
  }
}
setInterval(clearCache, exports.expire / 2);
