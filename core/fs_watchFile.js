/**
 * QuickWeb fs_watchFile
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var path = require('path'); 
var fs = require('fs');
var debug = console.log;
 
/** 监视列表 */
exports.list = {} 

/** 监视检查周期 */
exports.interval = 1000;
 
/**
 * 监视文件改动
 *
 * @param {string} filename 文件名
 * @param {function} listener 回调函数 function (curr, prev)
 */
exports.watchFile = function (filename, options, listener) {
	if (arguments.length < 3)
		listener = options;
	filename = path.resolve(filename);
	// 取文件属性
	fs.stat(filename, function (err, stats) {
		if (err)
			throw err;
		else
			addToList(filename, stats, listener);
	});
}

/**
 * 取消监视
 *
 * @param {string} filename 文件名
 */
exports.unwatchFile = function (filename) {
	if (exports.list[filename]) {
		clearInterval(exports.list[filename].tid);
		delete exports.list[filename];
	}
}

/**
 * 将文件添加到监视列表
 *
 * @param {string} filename 文件名
 * @param {object} stats 属性
 * @param {function} listener
 */
var addToList = function (filename, stats, listener) {
	exports.list[filename] = {
		stats: 		stats,
		callback: 	listener,
		tid:		setInterval(function () {
						checkUpdate(filename);
		}, exports.interval)
	}
}

/**
 * 检查文件更新
 *
 * @param {string} filename 文件名
 */
var checkUpdate = function (filename) {
	var f = exports.list[filename];
	if (!f)
		return;
	try {
		fs.stat(filename, function (err, stats) {
			if (err) {
				exports.unwatchFile(filename);
				f.callback(stats, f.stats);
			}
			else if (f.stats.mtime.getTime() < stats.mtime.getTime()) {
				f.callback(stats, f.stats);
				debug(f.stats.mtime, stats.mtime);
				f.stats = stats;
			}
		});
	}
	catch (err) {
		exports.unwatchFile(filename);
		f.callback(undefined, f.stats);
	}
}