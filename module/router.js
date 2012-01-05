/**
 * QuickWeb router
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var web = global.QuickWeb;


/** 初始化 */
exports.init = function () {
	// web.router命名空间
	if (typeof web.router == 'undefined')
		web.router = {}
	// 路由表
	web.router.handlers = {
		get: [], post: [], put: [], delete: [], head: [], options: []
	}
}

/** 开启 */
exports.enable = function () {
	var registerRouter = function (m) {
		m = m.toLowerCase();
		return function (p, h) {
			register(m, p, h);
		}
	}
	// 注册GET请求
	web.router.get = registerRouter('get');
	// 注册POST请求
	web.router.post = registerRouter('post');
	// 注册PUT请求
	web.router.put = registerRouter('put');
	// 注册DELETE请求
	web.router.delete = web.router.del = registerRouter('delete');
	// 注册HEAD请求
	web.router.head = registerRouter('head');
	// 注册OPTIONS请求
	web.router.options = registerRouter('options');
	// 删除路由
	web.router.remove = removeHandler;
	// 删除所有请求方法的路由
	web.router.removeAll = removeAllHandler;
	// 取匹配的处理函数
	web.router.handler = getHandler;
	
	// 添加监听器
	// 如果开启了自动启动session选项，则用 listenerAutoStartSession
	if (web.get('enable session') && web.get('auto start session'))
		web.ServerInstance.addListener(listenerAutoStartSession);
	else	
		web.ServerInstance.addListener(listener);
}

/** 关闭 */
exports.disable = function () {
	var noMethod = function (m) {
		return function () {
			web.logger.warn('router disable! web.router has no method "' + m + '"');
		}
	}
	web.router.get = noMethod('get');
	web.router.post = noMethod('post');
	web.router.put = noMethod('put');
	web.router.del = noMethod('del');
	web.router.delete = noMethod('delete');
	web.router.head = noMethod('head');
	web.router.remove = noMethod('remove');
	web.router.removeAll = noMethod('removeAll');
}


/**
 * 注册路由路径
 *
 * @param {string} method 请求类型(CET|POST|DELETE|PUT|HEAD)
 * @param {string|RegExp} paths 路径正则文本或正则表达式
 * @param {function} handler 处理函数，接收三个个参数：server，request，response
 * @return {bool}
 */
var register = function (method, paths, handler) {
	// 参数检查
	if (typeof method != 'string' || (typeof paths != 'string' && !(paths instanceof RegExp)) || typeof handler != 'function') {
		web.logger.error('register router error: argument data type error.');
		return false;
	}
	method = method.toLowerCase().trim();
	
	// 如果路径是文本类型，则先进行预处理
	if (typeof paths == 'string') {
		paths = paths.trim();
		if (paths == '') {
			web.logger.error('register router error: argument paths could not be empty.');
			return false;
		}
		
		/* 处理paths */
		// 获取名称
		var names = paths.match(/:[\w\d_$]+/g);
		if (!names)
			names = [];
		names.forEach(function (v, i) {
			names[i] = v.substr(1);
		});
		// 替换正则表达式
		var paths = paths.replace(/:[\w\d_$]+/g, '([^/]+)');
		paths = '^' + paths + '$';
		var pathreg = new RegExp(paths);
	}
	else {
		var pathreg = paths;
		var names = [];
	}
	
	// 注册处理函数
	var p = {
		path:		pathreg,	// RegExp实例
		names:		names,		// 变量名称
		handler:	handler		// 处理函数
	}
	// 查找是否有重复的路径处理函数，有则先将其删除
	var routerHandlers = web.router.handlers;
	var _is_splice = false;
	for (var i in routerHandlers[method]) {
		var v  = routerHandlers[method][i];
		if (v.path.toString() == p.path.toString()) {
			routerHandlers[method].splice(i, 1, p);
			_is_splice = true;
			break;
		}
	}
	if (!_is_splice) {
		routerHandlers[method].push(p);
	}
	
	web.logger.info('register ' + method + ' router: ' + paths);
	return true;
}

/**
 * 获取处理函数
 *
 * @param {string} method 请求类型(CET|POST|DELETE|PUT|HEAD)
 * @param {string} paths 请求路径
 * @param {int} index 开始的位置
 * @return {object} 返回格式：{handler:处理函数, value:解析处理的键值} 
 */
getHandler = function (method, paths, index) {
	// 参数检查
	if (typeof method != 'string' || typeof paths != 'string') {
		web.logger.error('get router handler error: arguments data type error.');
		return false;
	}
	method = method.toLowerCase().trim();
	paths = paths.trim();
	if (paths == '') {
		web.logger.error('get router handler error: argument paths could not be empty.');
		return false;
	}
	
	// 测试符合条件的处理函数
	if (isNaN(index) || index < 0)
		index = 0;
	// web.logger.log('test router: ' + paths + '  ' + index);
	var handlers = web.router.handlers[method];
	if (handlers) {
		for (var i = index, r; r = handlers[i]; i++) {
			var pv = r.path.exec(paths);
			if (pv == null)
				continue;
			
			// 填充匹配的PATH值
			var ret = {
				index:		i,				// 索引位置
				handler: 	r.handler,		// 处理句柄
				value:		{}				// PATH参数值
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

/**
 * 删除指定路由
 *
 * @param {string} method 请求类型(CET|POST|DELETE|PUT|HEAD)
 * @param {string} paths 路径正则文本
 * @param {bool} 
 */
var removeHandler = function (method, paths) {
	// 参数检查
	if (typeof method != 'string' || typeof paths != 'string') {
		web.logger.error('remove router handler error: arguments data type error.');
		return false;
	}
	method = method.toLowerCase().trim();
	paths = paths.trim();
	if (paths == '') {
		web.logger.error('remove router handler error: argument paths could not be empty.');
		return false;
	}
	
	var handlers = web.router.handlers[method];
	if (typeof handlers == 'undefined') {
		web.logger.warn('remove router handler warning: not support method "' + method + '"');
		return false;
	}
	
	// 查找指定正则文本
	var testpaths = paths + '$/';
	if (testpaths.substr(0, 1) != '/')
		testpaths = '/^/' + testpaths;
	else
		testpaths = '/^' + testpaths;
	for (var i in handlers) {
		// web.logger.debug(handlers[i].path.toString() + ' => ' + testpaths);
		if (handlers[i].path.toString() == testpaths) {
			handlers.splice(i, 1);
			web.logger.info('remove router handler: [' + method + '] ' + paths);
			return true;
		}
	}
	return false;
}

/**
 * 删除所有方法的路由
 *
 * @param {string} paths 路径正则文本
 * @param {bool} 
 */
var removeAllHandler = function (paths) {
	var ok = 0;
	ok += removeHandler('get', paths) ? 1 : 0;
	ok += removeHandler('post', paths) ? 1 : 0;
	ok += removeHandler('put', paths) ? 1 : 0;
	ok += removeHandler('head', paths) ? 1 : 0;
	ok += removeHandler('delete', paths) ? 1 : 0;
	ok += removeHandler('options', paths) ? 1 : 0;
	return ok > 0 ? true : false;
}

/**
 * 监听器
 */
var listener = function (server, request, response, index) {
	var h = getHandler(request.method, request.filename, index);
	if (h) {
		// 获取PATH中的参数值
		request.path = h.value;
		for (var i in request.path)
			request.path[i] = decodeURI(request.path[i]);
		// 调用下一个处理程序
		request.next = function () {
			web.logger.info('next router');
			listener(server, request, response, h.index + 1);
		}
		// 调用处理程序
		try {
			h.handler(request, response, request.next);
		}
		catch (err) {
			response.sendError(500, err);
			web.logger.error(err);
		}
	}
	else {
		// 如果没有匹配的处理模块，则由下一个监听器处理
		server.next();
	}
}

/**
 * 自动开启Session的监听器
 */
var listenerAutoStartSession = function (server, request, response, index) {
	request.sessionStart(function () {
		listener(server, request, response, index);
	});
}