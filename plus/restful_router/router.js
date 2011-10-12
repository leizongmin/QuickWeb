/**
 * QuickWeb 路由管理器
 *
 * @author leizongmin<leizongmin@gmail.com>
 */
 
var web = QuickWeb;
 
var router = module.exports;

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
	web.log('router register', '[' + method + '] ' + paths, 'debug');
	
	// 参数检查
	if (typeof method != 'string' || typeof paths != 'string' || typeof handler != 'function') {
		web.log('router register', 'argument data type error.', 'error');
		return false;
	}
	method = method.toLowerCase().trim();
	if (!(method in router.handlers)) {
		web.log('router register', 'method [' + method + '] not limited.', 'error');
		return false;
	}
	paths = paths.trim();
	if (paths == '') {
		web.log('router register', 'argument paths could not be empty.', 'error');
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
	var p = {
		path:		pathreg,	// RegExp实例
		names:		names,		// 变量名称
		handler:	handler		// 处理函数
	}
	// 查找是否有重复的路径处理函数，有则先将其删除
	var _is_splice = false;
	for (var i in router.handlers[method]) {
		var v  = router.handlers[method][i];
		if (v.path.toString() == p.path.toString()) {
			router.handlers[method].splice(i, 1, p);
			_is_splice = true;
			break;
		}
	}
	if (!_is_splice) {
		router.handlers[method].push(p);
	}
	
	web.log('router register', '\t' + paths, 'debug');
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
	// web.log('router handler', '[' + method + '] ' + paths, 'debug');
	
	// 参数检查
	if (typeof method != 'string' || typeof paths != 'string') {
		web.log('router handler', 'arguments data type error.', 'error');
		return false;
	}
	method = method.toLowerCase().trim();
	if (!(method in router.handlers)) {
		web.log('router handler', 'method [' + method + '] not limited.', 'error');
		return false;
	}
	paths = paths.trim();
	if (paths == '') {
		web.log('router handler', 'argument paths could not be empty.', 'error');
		return false;
	}
	
	// 测试符合条件的处理函数
	var handlers = router.handlers[method];
	for (i in handlers) {
		var r = handlers[i];
		var pv = r.path.exec(paths);
		if (pv) {
			// web.log('router match', r.path, 'debug');
			// 填充匹配的PATH值
			var ret = {
				handler: r.handler,
				value:	{}
			}
			r.names.forEach(function (v, i) {
				ret.value[v] = pv[i + 1];
			});
			//console.log(ret.handler.toString());
			return ret;
		}
	}
	
	// 没有符合条件的处理函数
	// web.log('router handler', 'not match.', 'debug');
	return false;
}
