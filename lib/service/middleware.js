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
 * 创建一个异步中间件代理
 *
 * @return {object}
 */
exports.createAsync = exports.create = function () {
  return new AsyncMiddleWareProxy();
}

/**
 * 创建一个阻塞中间件代理
 *
 * @return {object}
 */
exports.createSync = function () {
  return new SyncMiddleWareProxy();
}

/**
 * 异步中间件代理
 */
var AsyncMiddleWareProxy = function () {
  this.list = [];
}

/**
 * 加入中间件
 *
 * @param {function} func  可在参数中放入多个中间件，如 use(a, b, c,d)
 */
AsyncMiddleWareProxy.prototype.use = function (func) {
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
 * @param {function} arg 参数
 * @param {function} next
 */
AsyncMiddleWareProxy.prototype.start = function () {
  var args = parseArguments(arguments);
  var funcArgs = args.args;
  var next = args.next;
  
  var i = 0;
  var list = this.list;
  var nextMiddleWare = function () {
    // 最后一个调用参数next()
    if (i >= list.length) {
      funcArgs.splice(funcArgs.length - 1, 1);
      return next.apply(this, funcArgs);
    }
      
    // 依次调用各个中间件
    var middleWare = list[i++];
    middleWare.apply(this, funcArgs);
  }
  funcArgs.push(nextMiddleWare);
  nextMiddleWare();
}

/**
 * 返回快捷执行函数
 *
 * @return {function}
 */
AsyncMiddleWareProxy.prototype.handler = function () {
  return this.start.bind(this);
}

/**
 * 解析参数
 *
 * @param {object} args
 * @return {object} 包括{args: 前几个参数, next: 最后一个参数
 */
var parseArguments = function (args) {
  var len = args.length;
  var ret = {args: [], next: args[len - 1]}
  var retargs = ret.args;
  var end = len - 1;
  for (var i = 0; i < end; i++) {
    retargs.push(args[i]);
  }
  if (typeof args[i] !== 'function') {
    retargs.push(args[i]);
    ret.next = function () {};
  }
  
  return ret;
}

/**
 * 阻塞中间件代理
 */
var SyncMiddleWareProxy = function () {
  this.list = [];
}

/**
 * 加入中间件
 *
 * @param {function} func  可在参数中放入多个中间件，如 use(a, b, c,d)
 */
SyncMiddleWareProxy.prototype.use = function (func) {
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
 * @param {function} arg 参数
 */
SyncMiddleWareProxy.prototype.start = function () {
  var list = this.list;
  var length = list.length;
  
  // 依次调用各个中间件
  for (var i = 0; i < length; i++) {
    var func = list[i];
    func.apply(this, arguments);
  }
  
  return true;
}

/**
 * 返回快捷执行函数
 *
 * @return {function}
 */
SyncMiddleWareProxy.prototype.handler = function () {
  return this.start.bind(this);
}
