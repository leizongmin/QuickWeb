/**
 * QuickWeb 路由管理器
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.1
 */
 
var router = module.exports;

var logger = require('./logger');
var debug = router.logger = function (msg) {
	logger.log('router', msg);
}

/** 允许注册的请求类型 */
router.limitMethods = ['get', 'post', 'delete', 'put', 'head'];

/** 注册的处理函数 */
router.handlers = {}
for (var i in router.limitMethods)
	router.handlers[i] = {}
	
/** 正则表达式缓存 */
router.regexpCache = {}


/**
 * 注册路由路径
 *
 * @param {string} method 请求类型(CET|POST|DELETE|PUT|HEAD)
 * @param {string} paths 路径正则文本
 * @param {function} handler 处理函数，接收三个个参数：server，request，response
 * @return {bool}
 */
router.register = function (method, paths, handler) {
	// 参数检查
	if (typeof method != 'string' || typeof paths != 'string' || typeof handler != 'function') {
		debug('register fail: arguments data type error.');
		return false;
	}
	method = method.toLowerCase().trim();
	if (!(method in router.limitMethods)) {
		debug('Method [' + method + '] not limited.');
		return false;
	}
	paths = paths.trim();
	if (paths == '') {
		debug('Paths could not be empty.');
		return false;
	}
	
	// 注册处理函数
	router.handlers[method][paths] = handler;
	
	// 缓存正则表达式
	router.regexpCache[paths]
}

/**
 * 获取处理