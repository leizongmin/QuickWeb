/**
 * 插件：REST风格路径解析
 *
 */
 
var logger;

var router = require('./router');
 
var fs = require('fs');
var path = require('path'); 
 
exports.init_server = function (web, server, debug) {
	logger = debug;
	
	/** 加载path模块 */
	var code_path =  web.get('code_path');
	var files = scanCodeFiles(code_path);
	files.forEach(function (v) {
		debug('Load code file [' + v + ']');
		var m = require(v);
		if (typeof m.paths != 'string')
			return;
			
		if (typeof m.get == 'function')
			router.register('get', m.paths, m.get);
		if (typeof m.post == 'function')
			router.register('post', m.paths, m.post);
		if (typeof m.delete == 'function')
			router.register('delete', m.paths, m.delete);
		if (typeof m.put == 'function')
			router.register('put', m.paths, m.put);
		if (typeof m.head == 'function')
			router.register('head', m.paths, m.head);
	});
	debug(router.handlers);
	
	/** 注册监听器 */
	server.addListener(function (svr, req, res) {
		debug(req.method + '  ' + req.filename);
		var h = router.handler(req.method, req.filename);
		if (h) {
			req.path = h.value;
			h.handler(svr, req, res);
		}
		else {
			// 如果没有匹配的处理模块，则由下一个监听器处理
			svr.next();
		}
	});
}



/**
 * 扫描程序文件
 *
 * @param {string} code_path 目录
 * @return {array}
 */
var scanCodeFiles = function (code_path) {
	var ret = [];
	try {
		var files = fs.readdirSync(code_path);
		files.forEach(function (v) {
			if (path.extname(v))
				ret.push(path.resolve(code_path, v));
		});
		return ret;
	}
	catch (err) {
		logger('Read code file error: ' + err);
		return [];
	}
}