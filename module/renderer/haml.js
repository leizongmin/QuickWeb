/**
 * QuickWeb renderer with Haml
 *
 * @author leizongmin<leizongmin@gmail.com>
 * @version 0.2.0
 */
 
var haml = require('haml');
var fs = require('fs');

/** 模板缓存 */
exports.cache = {}

/**
 * 渲染文件
 *
 * @param {string} tpl 模板内容
 * @param {object} view 数据
 * @param {object} options 选项
 * @return {string}
 */
exports.render = function (tpl, view, options) {
	// 如果没有设置文件名，则直接编译并返回
	if (!options || options.filename)
		return haml(tpl)(view);
		
	// 如果设置了文件名，则检查是否有缓存
	var fn = exports.cache[options.filename];
	if (typeof fn == 'function')
		return fn(view);
		
	// 如果还没有缓存，则先编译，并缓存，再返回渲染结果
	var fn = haml(tpl);
	fs.watchFile(options.filename, function () {
		delete exports.cache[options.filename];
	});
	return fn(view);
}
