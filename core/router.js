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
	router.handlers[router.limitMethods[i]] = []


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
	if (!(method in router.handlers)) {
		debug('Method [' + method + '] not limited.');
		return false;
	}
	paths = paths.trim();
	if (paths == '') {
		debug('Paths could not be empty.');
		return false;
	}
	
	/* 处理paths */
	// 获取名称
	var names = paths.match(/\/:[\w\d_$]+/g);
	if (!names)
		names = [];
	names.forEach(function (v, i) {
		names[i] = v.substr(2);
	});
	// 替换正则表达式
	var paths = paths.replace(/\/:[\w\d_$]+/g, '/([^/]+)');
	paths = '^' + paths + '$';
	var pathreg = new RegExp(paths);
	
	// 注册处理函数
	router.handlers[method].push({
		path:		pathreg,	// RegExp实例
		names:		names,		// 变量名称
		handler:	handler		// 处理函数
	});
	
	return true;
}

/**
 * 获取处理函数
 *
 * @param {string} method 请求类型(CET|POST|DELETE|PUT|HEAD)
 * @param {string} paths 请求路径
 * @return {object} 返回格式：{handler:处理函数, value:解析处理的键值} 
 */
router.handler = function (method, paths) {
	// 参数检查
	if (typeof method != 'string' || typeof paths != 'string') {
		debug('get handler fail: arguments data type error.');
		return false;
	}
	method = method.toLowerCase().trim();
	if (!(method in router.handlers)) {
		debug('Method [' + method + '] not limited.');
		return false;
	}
	paths = paths.trim();
	if (paths == '') {
		debug('Paths could not be empty.');
		return false;
	}
	
	// 测试符合条件的处理函数
	var handlers = router.handlers[method];
	for (i in handlers) {
		var r = handlers[i];
		var pv = r.path.exec(paths);
		if (pv) {
			debug('match ' + paths);	// debug(pv);
			// 填充匹配的PATH值
			var ret = {
				handler: r.handler,
				value:	{}
			}
			r.names.forEach(function (v, i) {
				ret.value[v] = pv[i + 1];
			});
			
			return ret;
		}
	}
	
	// 没有符合条件的处理函数
	return false;
}
