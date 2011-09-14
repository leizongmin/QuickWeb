/**
 * 插件：渲染模板
 *
 * 需要安装 mustache 模块
 * 程序默认会以web参数中的 template_path 作为模板的目录
 */
 
var mustache = require('mustache');
var fs = require('fs');
var path = require('path');

exports.init_server = function (web, server, debug) {

	/**
	 * 渲染模板
	 *
	 * @param {string} template 模板内容
	 * @param {object} view 视图
	 */
	server.ServerInstance.prototype.render = function (template, view) {
		return mustache.to_html(template, view);
	}
	
	/**
	 * 渲染文件
	 *
	 * @param {string} filename 文件名
	 * @param {object} view 视图
	 * @param {function} callback
	 */
	server.ServerInstance.prototype.renderFile = function (filename, view, callback) {
		var template_path = web.get('template_path');
		if (typeof template_path == 'undefined')
			template_path = '.';
		try {
			fs.readFile(path.resolve(template_path, filename), function (err, data) {
				if (err) {
					debug('renderFile error:' + err);
					callback();
				}
				else {
					var ret = mustache.to_html(data.toString(), view);
					callback(ret);
				}
			});
		}
		catch (err) {
			debug('renderFile error:' + err);
			callback();
		}
	}
}