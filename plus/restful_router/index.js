/**
 * 插件：REST风格路径解析
 *
 */
 
var router = require('./router');
var web = QuickWeb;
 
var fs = require('fs');
var path = require('path'); 

/* 代码文件列表 */
var code_file_array = [];
 
exports.init_server = function (web, server) {
	
	/** 加载路由处理程序 */
	var code_path =  web.get('code_path');
	// 如果为数组，则加载多个目录
	if (code_path instanceof Array) {
		var files = [];
		code_path.forEach(function (v) {
			files = files.concat(scanCodeFiles(v));
		});
	}
	else
		var files = scanCodeFiles(code_path);
		
	loadCodeFiles(files);		// 载入代码
	watchCodePath(code_path);	// 监视该目录的更新
	
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
			if (path.extname(v) == '.js')
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
	
	// 将文件名加入到代码文件名列表
	for (var i in code_file_array)
		if (code_file_array[i] == filename)
			return;
	code_file_array.push(filename);
}

/**
 * 载入一组程序文件，并注册
 *
 * @param {array} files 文件名数组
 */
var loadCodeFiles = function (files) {
	files.forEach(function (v) {
		web.log('router', 'Load code file [' + v + ']', 'debug');
		try {
			// 载入模块
			var m = require(v);
			if (typeof m.paths != 'string')
				return;
			
			// 注册处理程序
			registerCodeFile(m);
			
			// 监视文件改动
			watchCodeFile(v);
		}
		catch (err) {
			web.log('load code file', err, 'error');
		}
	});
}

/**
 * 监视指定代码目录，如果有新文件，则自动载入
 *
 * @param {string} code_path 代码目录
 */
var watchCodePath = function (code_path) {
	code_path = path.resolve(code_path);
	fs.unwatchFile(code_path);
	fs.watchFile(code_path, function () {
		web.log('code path changed', code_path, 'info');
		
		// 重新扫描目录的文件
		var files = scanCodeFiles(code_path);
		
		// 过滤，只保留新增的文件名
		files = subArray(files, code_file_array);
		
		// 加载
		loadCodeFiles(files);
	});
}

/**
 * 如果元素A在数组中，则删除它
 *
 * @param {array} arr 数组
 * @param {string} v 元素
 * @return {array}
 */
var delFromArray = function (arr, v) {
	for (var i in arr)
		if (arr[i] == v) {
			arr.splice(i, 1);
			break;
		}
	return arr;
}

/**
 * 数组A - B
 *
 * @param {array} a 数组A
 * @param {array} b 数组B
 * @return {array}
 */
var subArray = function (a, b) {
	for (var i in b)
		a = delFromArray(a, b[i]);
	return a;
}
