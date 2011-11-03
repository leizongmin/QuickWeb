/**
 * QuickWeb File Cache
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var fs = require('fs');
var path = require('path'); 

var web = global.QuickWeb; 

/** 初始化 */
exports.init = function () {
	// web.file 命名空间
	if (typeof web.file == 'undefined')
		web.file = {}
	// 缓存
	web.file.cache = {}
	// 虚拟目录
	web.file.path = {}
	web.file.link = linkPath;
}
 
/** 开启 */ 
exports.enable = function () {
	// 取文件状态
	web.file.stat = fileStat;
	// 读文件内容
	web.file.read = readFile;
	// 解算文件实际路径
	web.file.resolve = resolveFileName;
	// 启动缓存回收任务
	var rc = parseInt(web.get('file cache recover'));
	if (isNaN(rc) || rc < 1)
		rc = 60000;
	web.task.add('file cache', fileCacheRecover, rc);
}

/** 关闭 */
exports.disable = function () {
	web.file.stat = fileStat;	// fs.stat;
	web.file.read = readFile;	// fs.readFile;
	web.file.resolve = resolveFileName;
}


/**
 * 解算文件的实际路径
 *
 * @param {string} configName 配置名
 * @param {string} filename 文件名
 * @return {string} 实际文件名
 */
var resolveFileName = function (configName, filename) {
	var cpath = web.get(configName);
	var paths = web.file.path[configName];
	// 如果没有找到对应的配置名，则直接返回原文件名
	if (typeof cpath != 'string' || typeof paths != 'object') {
		return path.resolve(cpath, filename);
	}
	// 要查询的路径（作为文件）
	filename = path.resolve(cpath, filename);
	// 要查询的路径（作为目录）
	filename2 = filename + '/';
	var vpl = filename.length;
	for (var i in paths) {
		var rpath = paths[i];
		// 虚拟路径与查询的路径刚好相等，则直接返回其实际路径
		if (i == filename) {
			return rpath;
		}
		// 否则，将虚拟路径作为一个目录处理，替换其前面部分
		if (i == filename2.substr(0, i.length)) {
			var filename3 = filename2.substr(i.length + 1);
			return path.resolve(rpath, filename3);
		}
	}
	// 如果没有匹配，直接返回原文件名
	return filename;
}

/**
 * 取文件状态
 *
 * @param {string} filename 文件名
 * @param {function} callback 回调函数 function (err, stat)
 */
var fileStat = function (filename, callback) {
	// 检查文件是否在缓存， 有则直接返回
	var file = web.file.cache[filename];
	if (file && file.stat) {
		callback(undefined, file.stat, file.filename);
		file.timestamp = new Date().getTime();
		return;
	}
	// 如果不在缓存中，则载入该文件，完成后返回其状态
	loadFile(filename, 'stat', callback);
}

/**
 * 读取文件内容
 *
 * @param {string} filename 文件名
 * @param {function} callback 回调函数 function (err, data)
 */
var readFile = function (filename, callback) {
	// 检查文件是否在缓存， 有则直接返回
	var file = web.file.cache[filename];
	if (file && file.data) {
		callback(undefined, file.data, file.filename);
		file.timestamp = new Date().getTime();
		return;
	}
	// 如果不在缓存中，则载入该文件，完成后返回其内容
	loadFile(filename, 'data', callback);
}

/**
 * 载入文件
 *
 * @param {string} filename 文件名
 * @param {string} attrname 返回的属性名
 * @param {function} callback 回调函数
 * @param {bool} use_default_file 是否加上了默认文件名（内部使用）
 */
var loadFile = function (filename, attrname, callback, use_default_file) {
	// try_filename为尝试读取的文件名，如果设置了加上默认文件名，则其与filename的值不同
	if (use_default_file)
		var try_filename = path.resolve(filename, web.get('default file'));
	else
		var try_filename = filename;
	try {
		// 取文件属性
		fs.stat(try_filename, function (err, stat) {
			if (err) {
				callback(err);
				return;
			}
			// 如果是目录，则尝试加上默认文件名
			if (stat.isDirectory()) {
				loadFile(try_filename, attrname, callback, true);
				return;
			}
			// 监视文件改动，有改动则删除其缓存
			watchFile(try_filename);
			// 如果是读取文件状态，则不自动加载文件内容
			if (attrname == 'stat') {
				var file = { stat: stat, timestamp: new Date().getTime(), filename: try_filename}
				web.file.cache[filename] = web.file.cache[try_filename] = file;
				callback(undefined, stat, try_filename);
				return;
			}
			// 读取文件内容
			fs.readFile(try_filename, function (err, data) {
				if (err) {
					callback(err);
					return;
				}
				var file = { stat: stat, timestamp: new Date().getTime(), filename: try_filename}
				var maxsize = web.get('file cache maxsize');
				if (stat.size <= maxsize)
					file.data = data;
				web.file.cache[filename] = web.file.cache[try_filename] = file;
				callback(undefined, data, try_filename);
			});
		});
	}
	// 此错误表示文件不存在
	catch (err) {
		callback(err);
	}
}

/**
 * 注册虚拟目录
 * 
 * @param {string} configName 配置名
 * @param {string} vpath 虚拟路径
 * @param {string} rpath 实际路径
 */
var linkPath = function (configName, vpath, rpath) {
	if (typeof web.file.path[configName] != 'object')
		web.file.path[configName] = {}
	vpath = path.resolve(web.get(configName), vpath);
	rpath = path.resolve(rpath);
	web.file.path[configName][vpath] = rpath;
}

/**
 * 文件缓存回收
 */
var fileCacheRecover = function () {
	web.logger.log('file cache recover ...');
	var cache = web.file.cache;
	var timestamp = new Date().getTime();
	var maxage = parseInt(web.get('file cache maxage'));
	if (isNaN(maxage) || maxage < 0)
		maxage = 0;
	// 计算应该回收的缓存最后访问的时间戳
	// 小于该时间戳表示过期
	var t = timestamp - maxage;
	for (var i in cache) {
		if (cache[i].timestamp < t)
			delete cache[i];
	}
}

/**
 * 监视文件改动，有改动即删除其缓存
 *
 * @param {string} filename 文件名
 */
var watchFile = function (filename) {
	try {
		fs.unwatchFile(filename);
		fs.watchFile(filename, function () {
			delete web.file.cache[filename];
			web.logger.debug('remove file cache: ' + filename);
		});
	}
	catch (err) {
		web.logger.error(err);
	}
}