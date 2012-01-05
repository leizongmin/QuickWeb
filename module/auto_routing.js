/**
 * QuickWeb router
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var web = global.QuickWeb;

var fs = require('fs');
var path = require('path'); 

/** 初始化 */
exports.init = function () {
	// web.router命名空间
	if (typeof web.router == 'undefined')
		web.router = {}
	// 存放被自动加载的文件列表
	web.router.codefiles = []
	web.router.codefilesInfo = {}
	// 扫描指定目录的.js文件，并自动注册路由
	web.loadCode = loadCode;
}

/** 开启 */
exports.enable = function () {
	web.logger.info('auto routing ...');
	// 自动加载 code path 参数中设置的代码目录
	var code_path = web.get('code path');
	if (typeof code_path == 'object') {
		for (var i in code_path)
			loadCode(code_path[i]);
	}
	else {
		loadCode(code_path);
	}
}

/** 关闭 */
exports.disable = function () {
	
}


/**
 * 自动注册路由
 *
 * @param {string} code_path 目录
 */
var loadCode = function (code_path) {
	// 扫描文件
	var files = scanCodeFiles(code_path);
	// 载入代码
	loadCodeFiles(files);
	// 监视该目录的更新
	watchCodePath(code_path);
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
		web.logger.error('read code file error: ' + err);
		return [];
	}
}

/**
 * 注册程序文件
 *
 * @param {object} m 模块
 * @return {object}
 */
var registerCodeFile = function (m) {
	// 注册
	var methods = [];
	if (typeof m.get == 'function') {
		web.router.get(m.path, m.get);
		methods.push('get');
	}
	if (typeof m.post == 'function') {
		web.router.post(m.path, m.post);
		methods.push('post');
	}
	if (typeof m.delete == 'function') {
		web.router.delete(m.path, m.delete);
		methods.push('delete');
	}
	if (typeof m.put == 'function') {
		web.router.put(m.path, m.put);
		methods.push('put');
	}
	if (typeof m.head == 'function') {
		web.router.head(m.path, m.head);
		methods.push('head');
	}
	if (typeof m.options == 'function') {
		web.router.options(m.path, m.options);
		methods.push('options');
	}
	return {path: m.path, method: methods};
}

/**
 * 监视已注册的程序文件，有修改自动重新载入
 *
 * @param {string} filename 文件名
 * @param {object} info 注册的方法数组
 */
var watchCodeFile = function (filename, info) {
	fs.unwatchFile(filename);
	fs.watchFile(filename, function () {
		try {
			// 删除之前的缓存
			if (filename in require.cache)
				delete require.cache[filename];
			// 删除之前的路由信息
			var oldinfo = web.router.codefilesInfo[filename];
			if (oldinfo) {
				for (var i in oldinfo.method)
					web.router.remove(oldinfo.method[i], oldinfo.path);
			}
			for (var i in web.router.codefiles)
			if (web.router.codefiles[i] == filename)
				delete web.router.codefiles[i];
			
			// 重新载入模块
			var m = require(filename);
			web.logger.info('reload code file: ' + filename);
			// 注册
			if (typeof m.path != 'string' && !(m.path instanceof RegExp))
				return;
			var info = registerCodeFile(m);
			watchCodeFile(filename, info);
		}
		catch (err) {
			web.logger.error('reload code file error: ' + err);
		}
	});
	
	// 将文件名加入到代码文件名列表
	web.router.codefilesInfo[filename] = info;
	var _isInList = false;
	for (var i in web.router.codefiles)
		if (web.router.codefiles[i] == filename)
			_isInList = true;
	if (_isInList === false)
		web.router.codefiles.push(filename);
}

/**
 * 载入一组程序文件，并注册
 *
 * @param {array} files 文件名数组
 */
var loadCodeFiles = function (files) {
	files.forEach(function (v) {
		web.logger.info('load code file: ' + v);
		try {
			// 载入模块
			var m = require(v);
			if (typeof m.path != 'string' && !(m.path instanceof RegExp))
				return;
			
			// 注册处理程序
			var info = registerCodeFile(m);
			
			// 监视文件改动
			watchCodeFile(v, info);
		}
		catch (err) {
			web.logger.error('load code file error: ' + err);
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
		web.logger.info('code path has changed: ' + code_path);
		
		// 重新扫描目录的文件
		var files = scanCodeFiles(code_path);
		
		// 过滤，只保留新增的文件名
		files = subArray(files, web.router.codefiles);
		
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