//@jsdev(qwdebug) debug

/**
 * QuickWeb Service renderer
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
var fs = require('fs');
var Service = require('../Service');
var waitForQueue = Service.import('queue').wait;
var template = Service.import('template');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /service/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Renderer: %s', x); };
else
  debug = function() { };
  
  
/** 已编译的模板缓存 */
exports.cache = {}

/** 缓存生存时间 */
exports.expire = 60000;   // 60秒

/** 监视文件改动 */
var watchList = {}

/** 请求队列，避免当文件不在缓存中，瞬间大并发来读取同一个文件时导致崩溃 */
var compileQueue = {}

  
/**
 * 载入并配置指定的模板引擎
 *
 * @param {string} eng 模板引擎名称
 * @param {object} options 编译选项
 */
exports.config = function (eng, options) {
  var renderer = Service.import('renderer.' + eng);
  return renderer.config(options);
}

/**
 * 对模板内容进行预处理  仅当开启preprocess选项时
 *
 * @param {string} text 模板内容
 * @param {string} filename 文件名
 * @return {string}
 */
exports.preprocess = function (text, filename) {
  return template.compile(text, {filename: filename});
}

/**
 * 使用指定的模板引擎来渲染
 *
 * @param {string} eng 模板引擎名称
 * @param {string} text 模板内容
 * @param {object} data 数据
 * @return {string}
 */
exports.render = function (eng, text, data) {
  var reng = Service.import('renderer.' + eng);
  // 预处理
  if (reng.config().preprocess !== false) {
    text = exports.preprocess(text);
  }
  // 使用相应的模板引擎渲染
  return reng.render(text, data);
}

/**
 * 使用指定模板引擎来编译
 *
 * @param {string} eng 模板引擎名称
 * @param {string} text 模板内容
 * @param {string} filename 文件名
 * @return {function}
 */
exports.compile = function (eng, text, filename) {
  var reng = Service.import('renderer.' + eng);
  // 预处理
  if (reng.config().preprocess !== false) {
    text = exports.preprocess(text, filename);
  }
  // 使用相应的模板引擎渲染
  return reng.compile(text);
}

/**
 * 使用指定的模板引擎来编译模板文件
 *
 * @param {string} eng 模板引擎名称
 * @param {string} filename 文件名
 * @param {function} callback 回调函数，格式：err, renderFunc
 */
exports.compileFile = function (eng, filename, callback) {
  // 获取绝对文件名
  filename = path.resolve(filename);
  
  // 读取文件内容并编译
  Service.import('filecache').readFile(filename, 'utf8', function (err, data) {
    if (err)
      callback(err);
    // 开始编译
    else {
      try {
        var render = exports.compile(eng, data, filename);
        callback(null, render);
      }
      catch (err) {
        /*debug debug('Compile template ' + filename + ' error: ' + err.stack); */
        callback(err);
      }
      
      // 监视文件改动，删除缓存
      watchFile(filename);
    }
  });
}

/**
 * 使用指定的模板引擎来渲染
 *
 * @param {string} eng 模板引擎名称
 * @param {string} filename 文件名
 * @param {object} data 数据
 * @param {function} callback 回调函数，格式：err, text
 */
exports.renderFile = function (eng, filename, data, callback) {
  // 获取绝对文件名
  filename = path.resolve(filename);
  
  // 检查是否在缓存中，如果存在则直接渲染
  if (exports.cache[filename] && exports.cache[filename].engine == eng) {
    exports.cache[filename].timestamp = new Date().getTime(); // 更新时间戳
    callback(null, exports.cache[filename].render(data));
  }
  // 否则，先调用compileFile()编译之后再返回
  else {
  
    // 编译模板之前，先检查是否已有程序在编译该模板，如果有则将其添加到队列中
    // 不需要重复编译
    var cb1 = function () {
      exports.renderFile(eng, filename, data, callback);
    }
    // 注意：此callback为 queue.wait()生成的参数，必须要加上参数，否则将导致其他线程无法返回
    var cb2 = function (callback) {
      exports.compileFile(eng, filename, function (err, render) {
        if (err)
          callback(err);
        else {
          // 保存到缓存中
          debugger;
          exports.cache[filename] = { render:     render            // 已编译的渲染器
                                    , engine:     eng                   // 模板引擎
                                    , timestamp:  new Date().getTime()  // 时间戳
                                    }
          // 回调
          callback(null, render(data));
        }
      });
    }
    waitForQueue(compileQueue, filename, cb1, cb2, callback);
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
  /*debug debug('clear render cache start...' + min); */
  
  var cache = exports.cache;
  for (var i in exports.cache) {
    if (isNaN(cache[i].timestamp) || cache[i].timestamp <= min) {
      delete cache[i];
      /*debug debug('clear render cache ' + i); */
    }
  }
}
setInterval(clearCache, exports.expire / 2);