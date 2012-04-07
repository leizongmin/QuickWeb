//@jsdev(qwdebug) debug

/**
 * QuickWeb Service
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */
 
var path = require('path'); 
 
var debug;
if (process.env.QUICKWEB_DEBUG && /service/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('Service: %s', x); };
else
  debug = function() { };

  
// QuickWeb.Service 命名空间
if (!global.QuickWeb)
  global.QuickWeb = {}
if (!global.QuickWeb.Service)
  global.QuickWeb.Service = {}

// 用于存储服务对象
var allServices = {}


/**
 * 注册服务命名空间，获取服务对象的引用
 *
 * @param {string} name 服务名
 * @param {object} obj 服务对象
 */
exports.register = function (name, obj) {
  // 如果不存在，则注册
  if (!allServices[name]) {
    allServices[name] = obj || {};
    global.QuickWeb.Service[name] = allServices[name];
  }
  // 如果存在，则抛出异常
  else {
    throw Error('Cannot repeat registered service "' + name + '"!');
  }
  
  return allServices[name];
}

/**
 * 取指定名称的服务，只读
 *
 * @param {string} name 服务名
 * @return {object}
 */
exports.import = function (name) {
  // 如果服务不存在，则认为其为内置服务，自动载入
  var s = allServices[name];
  if (!s)
    return exports.load(name);
  else
    return s;
}

/**
 * 载入指定内置服务
 *
 * @param {string} name 服务名
 * @return {object}
 */
exports.load = function (name) {
  var filename = path.resolve(__dirname, 'service', name + '.js');
  try {
    var s = require(filename);
    exports.register(name, s);
    return exports.import(name);
  }
  catch (err) {
    /*debug debug(err.stack); */
    throw Error('Cannot load service "' + name + '"! (' + filename + '): ' + err.stack);
  }
}
