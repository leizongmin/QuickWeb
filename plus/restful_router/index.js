/**
 * 插件：REST风格路径解析
 *
 */
 
var router = require('./router');
var web = require('../../core/web');
 
var fs = require('fs');
var path = require('path'); 
 
exports.init_server = function (web, server) {
	
	/** 加载path模块 */
	var code_path =  web.get('code_path');
	var files = scanCodeFiles(code_path);
	files.forEach(function (v) {
		web.log('router', 'Load code file [' + v + ']', 'debug');
		var m = require(v);
		if (typeof m.paths != 'string')
			return;
		
		// 注册处理程序
		registerCodeFile(m);
		
		// 监视文件改动
		watchCodeFile(v);
	});
	
	
	/** 注册监听器 */
	server.addListener(function (svr, req, res) {
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
		web.log('router', 'read code file error: ' + err, 'error');
		return [];
	}
}

/**
 * 注册程序文件
 *
 * @param {object} m 模块
 */
var registerCodeFile = function (m) {
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
}

/**
 * 监视已注册的程序文件，有修改自动重新载入
 *
 * @param {string} filename 文件名
 */
var watchCodeFile = function (filename) {
	fs.unwatchFile(filename);
	fs.watchFile(filename, function () {
		try {
			// 删除之前的缓存
			if (filename in require.cache)
				delete require.cache[filename];
			// 重新载入模块
			var m = require(filename);
			web.log('reload code file', filename, 'info');
			// 注册
			if (typeof m.paths != 'string')
				return;
			registerCodeFile(m);
			watchCodeFile(filename);
		}
		catch (err) {
			web.log('reload code file', err, 'error');
		}
	});
}