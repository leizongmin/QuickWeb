//@jsdev(qwdebug) debug

/**
 * QuickWeb Service MiddleWare
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.3.0
 */

var Service = require('../Service');
 
var debug;
if (process.env.QUICKWEB_DEBUG && /middleware/.test(process.env.QUICKWEB_DEBUG))
  debug = function(x) { console.error('MiddleWare: %s', x); };
else
  debug = function() { };
  
  
  
/**
 * 创建一个MiddleWare中间件代理
 *
 * @return {object}
 */
exports.create = function () {
  return new MiddleWareProxy();
}


/**
 * 中间件代理
 */
var MiddleWareProxy = function () {
  this.list = [];
}

/**
 * 加入中间件
 *
 * @param {function} func
 */
MiddleWareProxy.prototype.use = function (func) {
  if (arguments.length > 1) {
    for (var i in arguments)
      this.use(arguments[i]);
  }
  else {
    this.list.push(func);
  }
}

/**
 * 开始执行中间件列表
 *
 * @param {function} req
 * @param {function} res
 * @param {function} next
 */
MiddleWareProxy.prototype.start = function (req, res, next) {
  var i = 0;
  var list = this.list;
  var nextMiddleWare = function () {
    if (i >= list.length)
      return next(req, res);
      
    var middleWare = list[i++];
    middleWare(req, res, nextMiddleWare);
  }
  nextMiddleWare();
}
